import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      include: {
        _count: { select: { scenes: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, description, genre, aspectRatio, style } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        description: description || null,
        genre: genre || null,
        aspectRatio: aspectRatio || "16:9",
        style: style || "cinematic",
        userId: session.user.id,
        scenes: {
          create: {
            sceneNumber: 1,
            title: "Scene 1",
            shots: {
              create: {
                shotNumber: 1,
                title: "Shot 1",
              },
            },
          },
        },
      },
      include: {
        scenes: {
          include: {
            shots: true,
          },
        },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
