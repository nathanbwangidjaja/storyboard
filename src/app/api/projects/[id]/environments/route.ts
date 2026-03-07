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

    const environments = await prisma.environment.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(environments);
  } catch (error) {
    console.error("Error fetching environments:", error);
    return NextResponse.json(
      { error: "Failed to fetch environments" },
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
    const {
      name,
      description,
      referenceImages,
      lightingNotes,
      moodNotes,
      recurringProps,
      locationStyle,
    } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const environment = await prisma.environment.create({
      data: {
        name: name.trim(),
        description: description || null,
        referenceImages: referenceImages || "[]",
        lightingNotes: lightingNotes || null,
        moodNotes: moodNotes || null,
        recurringProps: recurringProps || null,
        locationStyle: locationStyle || null,
        projectId: id,
      },
    });

    return NextResponse.json(environment, { status: 201 });
  } catch (error) {
    console.error("Error creating environment:", error);
    return NextResponse.json(
      { error: "Failed to create environment" },
      { status: 500 }
    );
  }
}
