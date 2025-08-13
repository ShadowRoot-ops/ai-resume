// src/app/api/resumes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/user-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before using
    const { id } = await params;

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const user = await getOrCreateUser(userId);

    // Get resume
    const resume = await prisma.resume.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            clerkId: true,
          },
        },
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Check if user owns the resume
    if (resume.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Return the resume
    return NextResponse.json({
      success: true,
      resume: {
        id: resume.id,
        title: resume.title,
        content: resume.content,
        atsScore: resume.atsScore,
        formatScore: resume.formatScore,
        jobDescription: resume.jobDescription,
        jobTitle: resume.jobTitle,
        colorPaletteIndex: resume.colorPaletteIndex,
        fontFamily: resume.fontFamily,
        analysisData: resume.analysisData,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching resume:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before using
    const { id } = await params;

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const user = await getOrCreateUser(userId);

    // Get resume to check ownership
    const resume = await prisma.resume.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Check if user owns the resume
    if (resume.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the resume
    await prisma.resume.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting resume:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before using
    const { id } = await params;

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const user = await getOrCreateUser(userId);

    // Get resume to check ownership
    const existingResume = await prisma.resume.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!existingResume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Check if user owns the resume
    if (existingResume.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get update data from request body
    const updateData = await request.json();

    // Update the resume
    const updatedResume = await prisma.resume.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      resume: updatedResume,
    });
  } catch (error) {
    console.error("Error updating resume:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
