import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; characterId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, characterId } = await params;

    const project = await prisma.project.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const existing = await prisma.character.findFirst({
      where: { id: characterId, projectId: id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      name,
      description,
      referenceImages,
      styleNotes,
      costumeNotes,
      ageGender,
      personalityNotes,
    } = body;

    const character = await prisma.character.update({
      where: { id: characterId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(referenceImages !== undefined && { referenceImages }),
        ...(styleNotes !== undefined && { styleNotes }),
        ...(costumeNotes !== undefined && { costumeNotes }),
        ...(ageGender !== undefined && { ageGender }),
        ...(personalityNotes !== undefined && { personalityNotes }),
      },
    });

    return NextResponse.json(character);
  } catch (error) {
    console.error("Error updating character:", error);
    return NextResponse.json(
      { error: "Failed to update character" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; characterId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, characterId } = await params;

    const project = await prisma.project.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const existing = await prisma.character.findFirst({
      where: { id: characterId, projectId: id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    await prisma.character.delete({ where: { id: characterId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting character:", error);
    return NextResponse.json(
      { error: "Failed to delete character" },
      { status: 500 }
    );
  }
}
