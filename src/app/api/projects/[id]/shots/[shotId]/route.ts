import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; shotId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, shotId } = await params;

    const project = await prisma.project.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const shot = await prisma.shot.findFirst({
      where: {
        id: shotId,
        scene: { projectId: id },
      },
      include: {
        scene: {
          select: { sceneNumber: true, title: true },
        },
        characters: {
          include: {
            character: true,
          },
        },
        generations: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!shot) {
      return NextResponse.json(
        { error: "Shot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(shot);
  } catch (error) {
    console.error("Error fetching shot:", error);
    return NextResponse.json(
      { error: "Failed to fetch shot" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; shotId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, shotId } = await params;

    const project = await prisma.project.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const existing = await prisma.shot.findFirst({
      where: {
        id: shotId,
        scene: { projectId: id },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Shot not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      title,
      shotType,
      actionDescription,
      cameraDirection,
      dialogueDirection,
      vfxNotes,
      audioNotes,
      continuityNotes,
      sketchImage,
      poseReferenceImage,
      uploadedReferences,
      generatedImages,
      selectedVersion,
      shotDuration,
      emotionalTone,
      compositionNotes,
      status,
      shotNumber,
      sceneId,
      environmentId,
      characterIds,
      characters,
      poseReferenceCharacterId,
    } = body;

    // Handle character associations (characters array supports poseNotes/actionNotes/poseReferenceImage per character)
    const charPayload = characters ?? (Array.isArray(characterIds) ? characterIds.map((cid: string) => ({ characterId: cid })) : undefined);
    if (charPayload !== undefined) {
      await prisma.shotCharacter.deleteMany({ where: { shotId } });
      if (charPayload.length > 0) {
        const charData = charPayload.map((c: { characterId: string; poseNotes?: string; actionNotes?: string; poseReferenceImage?: string } | string) => {
          const entry = typeof c === "string" ? { characterId: c } : c;
          return {
            shotId,
            characterId: entry.characterId,
            poseNotes: entry.poseNotes ?? null,
            actionNotes: entry.actionNotes ?? null,
            poseReferenceImage: entry.poseReferenceImage ?? null,
          };
        });
        await prisma.shotCharacter.createMany({ data: charData });
      }
    }

    const shot = await prisma.shot.update({
      where: { id: shotId },
      data: {
        ...(title !== undefined && { title }),
        ...(shotType !== undefined && { shotType }),
        ...(actionDescription !== undefined && { actionDescription }),
        ...(cameraDirection !== undefined && { cameraDirection }),
        ...(dialogueDirection !== undefined && { dialogueDirection }),
        ...(vfxNotes !== undefined && { vfxNotes }),
        ...(audioNotes !== undefined && { audioNotes }),
        ...(continuityNotes !== undefined && { continuityNotes }),
        ...(sketchImage !== undefined && { sketchImage }),
        ...(poseReferenceImage !== undefined && { poseReferenceImage }),
        ...(poseReferenceCharacterId !== undefined && { poseReferenceCharacterId }),
        ...(uploadedReferences !== undefined && { uploadedReferences }),
        ...(generatedImages !== undefined && { generatedImages }),
        ...(selectedVersion !== undefined && { selectedVersion }),
        ...(shotDuration !== undefined && { shotDuration }),
        ...(emotionalTone !== undefined && { emotionalTone }),
        ...(compositionNotes !== undefined && { compositionNotes }),
        ...(status !== undefined && { status }),
        ...(shotNumber !== undefined && { shotNumber }),
        ...(sceneId !== undefined && { sceneId }),
        ...(environmentId !== undefined && { environmentId }),
      },
    });

    return NextResponse.json(shot);
  } catch (error) {
    console.error("Error updating shot:", error);
    return NextResponse.json(
      { error: "Failed to update shot" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; shotId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, shotId } = await params;

    const project = await prisma.project.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const existing = await prisma.shot.findFirst({
      where: {
        id: shotId,
        scene: { projectId: id },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Shot not found" },
        { status: 404 }
      );
    }

    await prisma.shot.delete({ where: { id: shotId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting shot:", error);
    return NextResponse.json(
      { error: "Failed to delete shot" },
      { status: 500 }
    );
  }
}
