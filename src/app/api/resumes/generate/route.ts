// src/app/api/resumes/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateResume } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    console.log("=== API ROUTE HIT: /api/resumes/generate ===");

    const { userId } = await auth();
    console.log("Auth check result:", { userId });

    if (!userId) {
      console.log("Unauthorized access attempt - no userId found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the form data
    const formData = await request.formData();
    const resumeFile = formData.get("resume") as File;
    const jobDescription = formData.get("jobDescription") as string;
    const companyName = (formData.get("companyName") as string) || "";
    const templateId = (formData.get("templateId") as string) || "professional";

    console.log("Form data received:", {
      hasResumeFile: !!resumeFile,
      resumeFileName: resumeFile?.name,
      resumeFileSize: resumeFile?.size,
      jobDescriptionLength: jobDescription?.length,
      companyName: companyName || "Not specified",
      templateId,
    });

    if (!resumeFile || !jobDescription) {
      const missingFields = [];
      if (!resumeFile) missingFields.push("resume");
      if (!jobDescription) missingFields.push("jobDescription");

      console.log("Missing required fields:", missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Read the file
    console.log("Reading resume file...");
    const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer());
    console.log("Resume buffer created, size:", resumeBuffer.length);

    // Use AI service to generate an optimized resume
    console.log("Calling generateResume function...");
    const resume = await generateResume(
      resumeBuffer,
      resumeFile.name,
      jobDescription,
      companyName,
      templateId
    );

    console.log("Resume generation completed successfully");
    return NextResponse.json({
      success: true,
      resume,
    });
  } catch (error) {
    // Enhanced error logging
    console.error("=== API ROUTE ERROR ===");
    console.error("Error type:", error?.constructor?.name);
    console.error(
      "Error message:",
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : undefined
    );

    // Return more specific error information in development
    const isDevelopment = process.env.NODE_ENV === "development";

    return NextResponse.json(
      {
        error: "Resume generation failed",
        ...(isDevelopment && {
          details: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          type: error?.constructor?.name || "Unknown",
        }),
      },
      { status: 500 }
    );
  }
}
