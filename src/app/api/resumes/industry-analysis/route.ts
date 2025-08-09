// src/app/api/resumes/industry-analysis/route.ts
import { NextResponse } from "next/server";
import { analyzeForIndustry } from "@/lib/advanced-analysis";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { resumeText, jobDescription, industry } = data;

    if (!resumeText || !jobDescription || !industry) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const results = await analyzeForIndustry(
      resumeText,
      jobDescription,
      industry
    );
    return NextResponse.json(results);
  } catch (error) {
    console.error("Industry analysis API error:", error);
    return NextResponse.json(
      {
        error: `Failed to analyze for industry: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
