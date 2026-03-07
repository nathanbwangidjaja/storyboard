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

    const scenes = await prisma.scene.findMany({
      where: { projectId: id },
      include: {
        shots: {
          orderBy: { shotNumber: "asc" },
        },
      },
      orderBy: { sceneNumber: "asc" },
    });

    return NextResponse.json(scenes);
  } catch (error) {
    console.error("Error fetching scenes:", error);
    return NextResponse.json(
      { error: "Failed to fetch scenes" },
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
    const { title, summary, emotionalTone, timeOfDay, environmentId } = body;

    // Auto-assign next scene number
    const lastScene = await prisma.scene.findFirst({
      where: { projectId: id },
      orderBy: { sceneNumber: "desc" },
    });

    const nextSceneNumber = (lastScene?.sceneNumber ?? 0) + 1;

    const scene = await prisma.scene.create({
      data: {
        sceneNumber: nextSceneNumber,
        title: title || `Scene ${nextSceneNumber}`,
        summary: summary || null,
        emotionalTone: emotionalTone || null,
        timeOfDay: timeOfDay || null,
        environmentId: environmentId || null,
        projectId: id,
      },
      include: {
        shots: true,
      },
    });

    return NextResponse.json(scene, { status: 201 });
  } catch (error) {
    console.error("Error creating scene:", error);
    return NextResponse.json(
      { error: "Failed to create scene" },
      { status: 500 }
    );
  }
}
