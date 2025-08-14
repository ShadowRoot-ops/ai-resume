// src/app/api/resumes/[id]/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params Promise
    const params = await context.params;
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get resume to update
    const resume = await prisma.resume.findUnique({
      where: { id: params.id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Ensure user owns this resume
    if (resume.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get update data
    const data = await request.json();
    const { title, content, templateId, colorPaletteIndex } = data;

    // Update resume
    const updatedResume = await prisma.resume.update({
      where: { id: params.id },
      data: {
        title: title || resume.title,
        content: content || resume.content,
        templateId: templateId || resume.templateId,
        colorPaletteIndex:
          colorPaletteIndex !== undefined
            ? colorPaletteIndex
            : resume.colorPaletteIndex,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      resume: updatedResume,
    });
  } catch (error) {
    console.error("Resume update error:", error);
    return NextResponse.json(
      { error: "Failed to update resume" },
      { status: 500 }
    );
  }
}
