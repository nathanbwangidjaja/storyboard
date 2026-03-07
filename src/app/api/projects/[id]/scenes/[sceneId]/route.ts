import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; sceneId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, sceneId } = await params;

    const project = await prisma.project.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const existing = await prisma.scene.findFirst({
      where: { id: sceneId, projectId: id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Scene not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { title, summary, emotionalTone, timeOfDay, environmentId, sceneNumber } = body;

    const scene = await prisma.scene.update({
      where: { id: sceneId },
      data: {
        ...(title !== undefined && { title }),
        ...(summary !== undefined && { summary }),
        ...(emotionalTone !== undefined && { emotionalTone }),
        ...(timeOfDay !== undefined && { timeOfDay }),
        ...(environmentId !== undefined && { environmentId }),
        ...(sceneNumber !== undefined && { sceneNumber }),
      },
    });

    return NextResponse.json(scene);
  } catch (error) {
    console.error("Error updating scene:", error);
    return NextResponse.json(
      { error: "Failed to update scene" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; sceneId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, sceneId } = await params;

    const project = await prisma.project.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const existing = await prisma.scene.findFirst({
      where: { id: sceneId, projectId: id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Scene not found" },
        { status: 404 }
      );
    }

    await prisma.scene.delete({ where: { id: sceneId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting scene:", error);
    return NextResponse.json(
      { error: "Failed to delete scene" },
      { status: 500 }
    );
  }
}
