import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; environmentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, environmentId } = await params;

    const project = await prisma.project.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const existing = await prisma.environment.findFirst({
      where: { id: environmentId, projectId: id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Environment not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      name,
      description,
      referenceImages,
      lightingNotes,
      moodNotes,
      recurringProps,
      locationStyle,
    } = body;

    const environment = await prisma.environment.update({
      where: { id: environmentId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(referenceImages !== undefined && { referenceImages }),
        ...(lightingNotes !== undefined && { lightingNotes }),
        ...(moodNotes !== undefined && { moodNotes }),
        ...(recurringProps !== undefined && { recurringProps }),
        ...(locationStyle !== undefined && { locationStyle }),
      },
    });

    return NextResponse.json(environment);
  } catch (error) {
    console.error("Error updating environment:", error);
    return NextResponse.json(
      { error: "Failed to update environment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; environmentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, environmentId } = await params;

    const project = await prisma.project.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const existing = await prisma.environment.findFirst({
      where: { id: environmentId, projectId: id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Environment not found" },
        { status: 404 }
      );
    }

    await prisma.environment.delete({ where: { id: environmentId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting environment:", error);
    return NextResponse.json(
      { error: "Failed to delete environment" },
      { status: 500 }
    );
  }
}
