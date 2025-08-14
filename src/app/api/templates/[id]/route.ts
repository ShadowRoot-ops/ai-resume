// src/app/api/templates/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

// GET a specific template
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  const params = await context.params;
  const id = params.id;

  try {
    const template = await prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Increment the view count
    await prisma.template.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // Only allow the owner or if the template is public
    if (template.userId !== userId && !template.isPublic) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { error: "Error fetching template" },
      { status: 500 }
    );
  }
}

// PUT to update a template
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  const params = await context.params;
  const id = params.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if the template exists and belongs to the user
    const existingTemplate = await prisma.template.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    if (existingTemplate.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();

    // Extract the fields from the request body
    const {
      companyName,
      jobTitle,
      industry,
      seniorityLevel,
      department,
      resumeContent,
      tipsAndInsights,
      keySkills,
      cultureFitIndicators,
      redFlags,
      sampleInterviewQuestions,
      isPublic,
      isAnonymized,
    } = json;

    // Update the template
    const template = await prisma.template.update({
      where: { id },
      data: {
        companyName,
        jobTitle,
        industry,
        seniorityLevel,
        department,
        resumeContent:
          typeof resumeContent === "string"
            ? resumeContent
            : JSON.stringify(resumeContent),
        tipsAndInsights: tipsAndInsights
          ? typeof tipsAndInsights === "string"
            ? tipsAndInsights
            : JSON.stringify(tipsAndInsights)
          : null,
        keySkills: keySkills
          ? typeof keySkills === "string"
            ? keySkills
            : JSON.stringify(keySkills)
          : null,
        cultureFitIndicators: cultureFitIndicators
          ? typeof cultureFitIndicators === "string"
            ? cultureFitIndicators
            : JSON.stringify(cultureFitIndicators)
          : null,
        redFlags: redFlags
          ? typeof redFlags === "string"
            ? redFlags
            : JSON.stringify(redFlags)
          : null,
        sampleInterviewQuestions: sampleInterviewQuestions
          ? typeof sampleInterviewQuestions === "string"
            ? sampleInterviewQuestions
            : JSON.stringify(sampleInterviewQuestions)
          : null,
        isPublic: isPublic ?? existingTemplate.isPublic,
        isAnonymized: isAnonymized ?? existingTemplate.isAnonymized,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Error updating template" },
      { status: 500 }
    );
  }
}

// DELETE a template
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  const params = await context.params;
  const id = params.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if the template exists and belongs to the user
    const existingTemplate = await prisma.template.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    if (existingTemplate.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the template
    await prisma.template.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Error deleting template" },
      { status: 500 }
    );
  }
}
