import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { generateResume } from "@/lib/ai";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/user-helpers";

export async function POST(request: NextRequest) {
  try {
    console.log("Resume generation started");

    const { userId } = await auth();
    if (!userId) {
      console.log("No user ID found in auth");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get Clerk user data
    const clerkUser = await currentUser();
    if (!clerkUser) {
      console.log("Could not retrieve current user from Clerk");
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Get or create user in our database
    const user = await getOrCreateUser(
      userId,
      clerkUser.emailAddresses[0]?.emailAddress,
      `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim()
    );

    // Check if user has credits
    if (user.credits <= 0) {
      console.log(`User ${user.id} has no credits`);
      return NextResponse.json(
        { error: "No credits remaining" },
        { status: 402 }
      );
    }

    // Get request data
    const data = await request.json();

    const {
      userData,
      jobDescription,
      jobTitle,
      companyName,
      templateId,
      colorPaletteIndex,
    } = data;

    // Generate resume
    console.log("Calling AI service to generate resume");
    const resumeContent = await generateResume(
      userData,
      jobDescription,
      companyName,
      templateId,
      colorPaletteIndex
    );

    // Parse resume content
    let parsedContent;
    try {
      parsedContent = JSON.parse(resumeContent);
      console.log("Resume content parsed successfully");
    } catch (error) {
      console.error("Failed to parse resume content:", error);
      console.error("Raw content:", resumeContent);
      return NextResponse.json(
        { error: "Invalid resume format returned from AI" },
        { status: 500 }
      );
    }

    // Save resume to database
    console.log("Saving resume to database");
    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        title: `Resume for ${companyName || "Job Application"}`,
        content: parsedContent,
        jobDescription,
        jobTitle: jobTitle || null,
        companyTargeted: companyName || null,
        atsScore: parsedContent.atsScore || 0,
        templateId,
        colorPaletteIndex,
      },
    });

    // Deduct a credit
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: 1 } },
    });

    console.log(
      `Successfully generated resume for user ${user.id}. Credits remaining: ${
        user.credits - 1
      }`
    );

    return NextResponse.json({
      success: true,
      resume: resume,
    });
  } catch (error) {
    console.error("Resume generation error:", error);
    return NextResponse.json(
      {
        error:
          "Resume generation failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}
