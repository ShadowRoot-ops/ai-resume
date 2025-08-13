// src/app/api/recruiter/bulk-resume-match/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { z } from "zod";
import mammoth from "mammoth";
import pdf from "pdf-parse";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const bulkMatchSchema = z.object({
  jobDescription: z.string().min(50),
  filters: z
    .object({
      minExperience: z.number().optional(),
      maxExperience: z.number().optional(),
      requiredSkills: z.array(z.string()).optional(),
      location: z.string().optional(),
      education: z.string().optional(),
      minScore: z.number().min(0).max(100).default(70),
      maxCandidates: z.number().min(1).max(50).default(10),
    })
    .optional(),
});

interface BulkResumeAnalysis {
  fileName: string;
  fileSize: number;
  candidateName: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  currentRole: string;
  skills: string[];
  education: string;
  overallScore: number;
  keywordMatches: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  atsScore: number;
  recommendation: "HIRE" | "MAYBE" | "REJECT";
  reasonForRecommendation: string;
}

async function extractTextFromFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();

  if (file.type === "application/pdf") {
    const data = await pdf(Buffer.from(buffer));
    return data.text;
  } else if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      buffer: Buffer.from(buffer),
    });
    return result.value;
  } else if (file.type === "text/plain") {
    return new TextDecoder().decode(buffer);
  } else {
    throw new Error("Unsupported file type");
  }
}

async function analyzeBulkResume(
  jobDescription: string,
  resumeText: string,
  fileName: string,
  filters?: any
): Promise<BulkResumeAnalysis> {
  const prompt = `
    As an expert recruiter and ATS system, analyze this resume against the job description.
    
    Job Description:
    ${jobDescription}
    
    Resume Content:
    ${resumeText}
    
    ${
      filters
        ? `Filters to consider:
    - Minimum Experience: ${filters.minExperience || "Any"}
    - Maximum Experience: ${filters.maxExperience || "Any"}
    - Required Skills: ${filters.requiredSkills?.join(", ") || "None specified"}
    - Location: ${filters.location || "Any"}
    - Education: ${filters.education || "Any"}
    - Minimum Score Required: ${filters.minScore || 70}`
        : ""
    }
    
    Extract information and provide analysis in this exact JSON format:
    {
      "candidateName": "extracted name or 'Not Found'",
      "email": "extracted email or 'Not Found'",
      "phone": "extracted phone or 'Not Found'",
      "location": "extracted location or 'Not Found'",
      "experience": "X years or 'Not specified'",
      "currentRole": "current job title or 'Not Found'",
      "skills": ["skill1", "skill2", "skill3"],
      "education": "highest degree or 'Not Found'",
      "overallScore": (0-100 integer),
      "keywordMatches": ["matched keyword 1", "matched keyword 2"],
      "missingSkills": ["missing skill 1", "missing skill 2"],
      "strengths": ["strength 1", "strength 2", "strength 3"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "atsScore": (0-100 integer),
      "recommendation": "HIRE" or "MAYBE" or "REJECT",
      "reasonForRecommendation": "brief explanation for the recommendation"
    }
    
    Be accurate in extracting personal information and provide honest scoring.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert recruiter and ATS system. Extract accurate information and provide honest assessments.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 1200,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid JSON response from AI");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return {
      fileName,
      fileSize: 0, // Will be set from file
      ...analysis,
    };
  } catch (error) {
    console.error("Analysis error for file:", fileName, error);
    throw new Error(`Failed to analyze ${fileName}`);
  }
}

function applyFilters(
  results: BulkResumeAnalysis[],
  filters: any
): BulkResumeAnalysis[] {
  let filtered = results.filter(
    (result) => result.overallScore >= (filters.minScore || 70)
  );

  if (filters.minExperience !== undefined) {
    filtered = filtered.filter((result) => {
      const experience = parseInt(result.experience);
      return !isNaN(experience) && experience >= filters.minExperience;
    });
  }

  if (filters.maxExperience !== undefined) {
    filtered = filtered.filter((result) => {
      const experience = parseInt(result.experience);
      return !isNaN(experience) && experience <= filters.maxExperience;
    });
  }

  if (filters.location) {
    filtered = filtered.filter((result) =>
      result.location.toLowerCase().includes(filters.location.toLowerCase())
    );
  }

  if (filters.requiredSkills && filters.requiredSkills.length > 0) {
    filtered = filtered.filter((result) => {
      const candidateSkills = result.skills.map((skill) => skill.toLowerCase());
      return filters.requiredSkills.some((skill: string) =>
        candidateSkills.includes(skill.toLowerCase())
      );
    });
  }

  // Sort by overall score (descending)
  filtered.sort((a, b) => b.overallScore - a.overallScore);

  // Limit results
  return filtered.slice(0, filters.maxCandidates || 10);
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const jobDescription = formData.get("jobDescription") as string;
    const filtersString = formData.get("filters") as string;

    const filters = filtersString ? JSON.parse(filtersString) : {};

    // Get all uploaded files
    const files: File[] = [];
    let fileIndex = 0;
    while (true) {
      const file = formData.get(`resumes[${fileIndex}]`) as File;
      if (!file) break;
      files.push(file);
      fileIndex++;
    }

    if (!jobDescription || files.length === 0) {
      return NextResponse.json(
        { error: "Job description and resume files are required" },
        { status: 400 }
      );
    }

    // Validate input
    bulkMatchSchema.parse({ jobDescription, filters });

    // Process all resumes
    const results: BulkResumeAnalysis[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const resumeText = await extractTextFromFile(file);
        const analysis = await analyzeBulkResume(
          jobDescription,
          resumeText,
          file.name,
          filters
        );
        analysis.fileSize = file.size;
        results.push(analysis);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        errors.push(
          `Failed to process ${file.name}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    // Apply filters and sorting
    const filteredResults = applyFilters(results, filters);

    return NextResponse.json({
      success: true,
      totalProcessed: files.length,
      totalMatched: filteredResults.length,
      results: filteredResults,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        hireRecommended: filteredResults.filter(
          (r) => r.recommendation === "HIRE"
        ).length,
        maybeRecommended: filteredResults.filter(
          (r) => r.recommendation === "MAYBE"
        ).length,
        rejected: filteredResults.filter((r) => r.recommendation === "REJECT")
          .length,
        averageScore:
          filteredResults.length > 0
            ? Math.round(
                filteredResults.reduce((sum, r) => sum + r.overallScore, 0) /
                  filteredResults.length
              )
            : 0,
      },
    });
  } catch (error) {
    console.error("Bulk resume analysis error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to analyze resumes",
      },
      { status: 500 }
    );
  }
}
