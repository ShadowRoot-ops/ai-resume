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

    // Handle resume content based on its type
    let parsedContent;
    try {
      // Check if resumeContent is already an object or if it's a string that needs parsing
      if (typeof resumeContent === "string") {
        parsedContent = JSON.parse(resumeContent);
        console.log("Resume content parsed from string successfully");
      } else {
        // If it's already an object, use it directly
        parsedContent = resumeContent;
        console.log("Resume content used as object successfully");
      }
    } catch (error) {
      console.error("Failed to parse resume content:", error);
      console.error("Raw content:", resumeContent);
      return NextResponse.json(
        { error: "Invalid resume format returned from AI" },
        { status: 500 }
      );
    }

    // Ensure parsedContent has the required structure
    if (!parsedContent || typeof parsedContent !== "object") {
      console.error("Invalid resume content structure");
      return NextResponse.json(
        { error: "Invalid resume format returned from AI" },
        { status: 500 }
      );
    }

    // Create analysis data object with default values if not provided
    const analysisData = {
      keywordMatches: parsedContent.keywordMatches || [],
      missingKeywords: parsedContent.missingKeywords || [],
      skillsMatch: parsedContent.skillsMatch || [],
      missingSkills: parsedContent.missingSkills || [],
      strengths: parsedContent.strengths || [],
      weaknesses: parsedContent.weaknesses || [],
      recommendations: parsedContent.recommendations || [],
      detailedAnalysis: parsedContent.detailedAnalysis || {},
      generatedAt: new Date().toISOString(),
      ...parsedContent.analysisData, // Include any existing analysis data
    };

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
        templateId: templateId || "professional",
        colorPaletteIndex: colorPaletteIndex || 0,
        keywordMatch: parsedContent.keywordMatch || 0,
        formatScore: parsedContent.formatScore || 0,
        analysisData: analysisData, // This is now required by your schema
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
