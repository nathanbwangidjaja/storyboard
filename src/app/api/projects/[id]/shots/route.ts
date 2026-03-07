import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const shots = await prisma.shot.findMany({
      where: {
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
      },
      orderBy: [
        { scene: { sceneNumber: "asc" } },
        { shotNumber: "asc" },
      ],
    });

    return NextResponse.json(shots);
  } catch (error) {
    console.error("Error fetching shots:", error);
    return NextResponse.json(
      { error: "Failed to fetch shots" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { sceneId, title, shotType, actionDescription, cameraDirection, dialogueDirection, vfxNotes, audioNotes, continuityNotes, emotionalTone, compositionNotes, environmentId } = body;

    if (!sceneId) {
      return NextResponse.json(
        { error: "sceneId is required" },
        { status: 400 }
      );
    }

    // Verify the scene belongs to this project
    const scene = await prisma.scene.findFirst({
      where: { id: sceneId, projectId: id },
    });

    if (!scene) {
      return NextResponse.json(
        { error: "Scene not found in this project" },
        { status: 404 }
      );
    }

    // Auto-assign next shot number within the scene
    const lastShot = await prisma.shot.findFirst({
      where: { sceneId },
      orderBy: { shotNumber: "desc" },
    });

    const nextShotNumber = (lastShot?.shotNumber ?? 0) + 1;

    const shot = await prisma.shot.create({
      data: {
        shotNumber: nextShotNumber,
        title: title || `Shot ${nextShotNumber}`,
        shotType: shotType || "medium",
        actionDescription: actionDescription || null,
        cameraDirection: cameraDirection || null,
        dialogueDirection: dialogueDirection || null,
        vfxNotes: vfxNotes || null,
        audioNotes: audioNotes || null,
        continuityNotes: continuityNotes || null,
        emotionalTone: emotionalTone || null,
        compositionNotes: compositionNotes || null,
        environmentId: environmentId || null,
        sceneId,
      },
      include: {
        scene: {
          select: { sceneNumber: true, title: true },
        },
      },
    });

    return NextResponse.json(shot, { status: 201 });
  } catch (error) {
    console.error("Error creating shot:", error);
    return NextResponse.json(
      { error: "Failed to create shot" },
      { status: 500 }
    );
  }
}
