import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateStoryboardImage } from "@/lib/gemini";
import * as path from "node:path";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { shotId, projectId } = body;

    if (!shotId || !projectId) {
      return NextResponse.json(
        { error: "shotId and projectId are required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Fetch the shot with all related data
    const shot = await prisma.shot.findFirst({
      where: {
        id: shotId,
        scene: { projectId },
      },
      include: {
        scene: {
          include: {
            environment: true,
          },
        },
        characters: {
          include: {
            character: true,
          },
        },
        environment: true,
      },
    });

    if (!shot) {
      return NextResponse.json(
        { error: "Shot not found" },
        { status: 404 }
      );
    }

    // Get the previous shot for continuity (including its generated image for visual consistency)
    const previousShot = await prisma.shot.findFirst({
      where: {
        sceneId: shot.sceneId,
        shotNumber: { lt: shot.shotNumber },
      },
      orderBy: { shotNumber: "desc" },
    });

    // Resolve previous shot's generated image for character/style continuity
    let previousShotImagePath: string | undefined;
    if (previousShot?.generatedImages) {
      try {
        const prevImages: string[] = JSON.parse(previousShot.generatedImages);
        const selIdx = Math.min(
          previousShot.selectedVersion ?? 0,
          Math.max(0, prevImages.length - 1)
        );
        if (prevImages[selIdx]) {
          previousShotImagePath = prevImages[selIdx];
        }
      } catch {
        /* ignore */
      }
    }

    // Build character descriptions
    const characterDescriptions = shot.characters.map((sc) => {
      const c = sc.character;
      const parts: string[] = [c.name];
      if (c.description) parts.push(c.description);
      if (c.ageGender) parts.push(c.ageGender);
      if (c.costumeNotes) parts.push(`Costume: ${c.costumeNotes}`);
      if (c.styleNotes) parts.push(`Style: ${c.styleNotes}`);
      if (sc.poseNotes) parts.push(`Pose: ${sc.poseNotes}`);
      if (sc.actionNotes) parts.push(`Action: ${sc.actionNotes}`);
      return parts.join(" - ");
    });

    // Build environment description
    const env = shot.environment || shot.scene.environment;
    let environmentDescription: string | undefined;
    if (env) {
      const parts: string[] = [env.name];
      if (env.description) parts.push(env.description);
      if (env.lightingNotes) parts.push(`Lighting: ${env.lightingNotes}`);
      if (env.moodNotes) parts.push(`Mood: ${env.moodNotes}`);
      if (env.locationStyle) parts.push(`Style: ${env.locationStyle}`);
      if (env.recurringProps) parts.push(`Props: ${env.recurringProps}`);
      environmentDescription = parts.join(". ");
    }

    // Collect reference image paths from characters and environment
    const referenceImagePaths: string[] = [];
    for (const sc of shot.characters) {
      try {
        const imgs = JSON.parse(sc.character.referenceImages);
        if (Array.isArray(imgs)) referenceImagePaths.push(...imgs);
      } catch {
        // ignore parse errors
      }
    }

    // Parse uploaded references from the shot
    let uploadedRefs: string[] = [];
    try {
      uploadedRefs = JSON.parse(shot.uploadedReferences);
    } catch {
      // ignore parse errors
    }
    referenceImagePaths.push(...uploadedRefs);

    // Resolve sketch image path
    let sketchImagePath: string | undefined;
    if (shot.sketchImage) {
      sketchImagePath = shot.sketchImage.startsWith("/")
        ? shot.sketchImage
        : path.join(process.cwd(), "public", shot.sketchImage);
    }

    // Collect pose references: prefer per-character, fallback to shot-level
    const poseReferences: Array<{ characterName: string; imagePath: string }> = [];
    for (const sc of shot.characters) {
      if (sc.poseReferenceImage) {
        poseReferences.push({
          characterName: sc.character.name,
          imagePath: sc.poseReferenceImage.startsWith("/") ? sc.poseReferenceImage : `/${sc.poseReferenceImage}`,
        });
      }
    }
    const poseReferenceImagePath =
      poseReferences.length === 0 && shot.poseReferenceImage
        ? (shot.poseReferenceImage.startsWith("/") ? shot.poseReferenceImage : shot.poseReferenceImage)
        : undefined;

    // Generate the image
    const result = await generateStoryboardImage({
      shotDescription: shot.actionDescription || shot.title || "",
      cameraDirection: shot.cameraDirection || undefined,
      dialogueDirection: shot.dialogueDirection || undefined,
      vfxNotes: shot.vfxNotes || undefined,
      audioNotes: shot.audioNotes || undefined,
      emotionalTone: shot.emotionalTone || shot.scene.emotionalTone || undefined,
      shotType: shot.shotType || undefined,
      compositionNotes: shot.compositionNotes || undefined,
      characterDescriptions:
        characterDescriptions.length > 0 ? characterDescriptions : undefined,
      environmentDescription,
      continuityNotes: shot.continuityNotes || undefined,
      style: project.style || undefined,
      aspectRatio: project.aspectRatio || undefined,
      sketchImagePath,
      poseReferenceImagePath: poseReferences.length > 0 ? undefined : poseReferenceImagePath,
      poseReferences: poseReferences.length > 0 ? poseReferences : undefined,
      referenceImagePaths:
        referenceImagePaths.length > 0 ? referenceImagePaths : undefined,
      previousShotDescription: previousShot?.actionDescription || undefined,
      previousShotImagePath,
    });

    // Save the Generation record
    const generation = await prisma.generation.create({
      data: {
        shotId: shot.id,
        promptUsed: result.prompt,
        modelUsed: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp",
        imagePath: result.imagePath,
        status: "completed",
      },
    });

    // Update the shot's generatedImages array
    let existingImages: string[] = [];
    try {
      existingImages = JSON.parse(shot.generatedImages);
    } catch {
      // ignore parse errors
    }
    existingImages.push(result.imagePath);

    await prisma.shot.update({
      where: { id: shot.id },
      data: {
        generatedImages: JSON.stringify(existingImages),
        status: "generated",
      },
    });

    return NextResponse.json({
      generation,
      imagePath: result.imagePath,
      prompt: result.prompt,
    });
  } catch (error) {
    console.error("Error generating storyboard image:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate storyboard image",
      },
      { status: 500 }
    );
  }
}
