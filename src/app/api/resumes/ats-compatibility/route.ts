// src/app/api/resumes/ats-compatibility/route.ts
import { NextResponse } from "next/server";
import { checkATSCompatibility } from "@/lib/advanced-analysis";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { resumeText, atsSystem } = data;

    if (!resumeText || !atsSystem) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const results = await checkATSCompatibility(resumeText, atsSystem);
    return NextResponse.json(results);
  } catch (error) {
    console.error("ATS compatibility API error:", error);
    return NextResponse.json(
      {
        error: `Failed to check ATS compatibility: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
