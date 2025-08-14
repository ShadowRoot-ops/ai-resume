// src/app/api/recruiter/bulk-resume-match/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { z } from "zod";
import mammoth from "mammoth";
import { extractTextFromPdf } from "@/lib/pdfParser";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const bulkResumeMatchSchema = z.object({
  jobDescription: z
    .string()
    .min(50, "Job description must be at least 50 characters"),
  resumes: z
    .array(z.instanceof(File))
    .min(1, "At least one resume is required"),
});

interface ResumeAnalysis {
  fileName: string;
  text: string;
  status: string;
  overallScore?: number;
  keywordMatches?: string[];
  missingKeywords?: string[];
  skillsMatch?: string[];
  missingSkills?: string[];
  experienceMatch?: boolean;
  experienceGap?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  atsScore?: number;
  detailedAnalysis?: {
    technicalSkills: number;
    experience: number;
    education: number;
    keywords: number;
  };
  error?: string;
}

interface BulkAnalysisResult {
  totalResumes: number;
  processedResumes: number;
  failedResumes: number;
  analyses: ResumeAnalysis[];
  topCandidates: ResumeAnalysis[];
  summary: {
    averageScore: number;
    averageAtsScore: number;
    commonMissingSkills: string[];
    topSkillsFound: string[];
  };
}

async function extractTextFromFile(
  file: File
): Promise<{ text: string; status?: string }> {
  const buffer = await file.arrayBuffer();
  const bufferData = Buffer.from(buffer);

  try {
    if (file.type === "application/pdf") {
      // Use our custom PDF parser that returns PDFParseResult
      const result = await extractTextFromPdf(bufferData);
      if (!result.success) {
        return {
          text: result.text, // This will contain the error message
          status: `PDF extraction failed: ${result.error}`,
        };
      }
      return {
        text: result.text, // Extract the text from PDFParseResult
        status: "success",
      };
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({
        buffer: bufferData,
      });
      return {
        text: result.value,
        status: "success",
      };
    } else if (file.type === "text/plain") {
      return {
        text: new TextDecoder().decode(buffer),
        status: "success",
      };
    } else {
      throw new Error(
        "Unsupported file type. Please upload PDF, DOCX, or TXT files."
      );
    }
  } catch (error) {
    console.error(`Error extracting text from ${file.name}:`, error);
    return {
      text: "[Failed to extract text from file]",
      status: `Extraction failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

async function analyzeResumeMatch(
  jobDescription: string,
  resumeText: string,
  fileName: string
): Promise<Partial<ResumeAnalysis>> {
  if (
    resumeText.includes("[Failed to extract") ||
    resumeText.includes("[PDF content could not be extracted")
  ) {
    return {
      overallScore: 0,
      atsScore: 0,
      error: "Could not extract text from file",
    };
  }

  const prompt = `
    As an expert ATS system and recruiter, analyze how well this resume matches the job description.
    
    Job Description:
    ${jobDescription}
    
    Resume (${fileName}):
    ${resumeText}
    
    Provide a detailed analysis in the following JSON format:
    {
      "overallScore": (0-100 integer score),
      "keywordMatches": ["matched keyword 1", "matched keyword 2"],
      "missingKeywords": ["missing keyword 1", "missing keyword 2"],
      "skillsMatch": ["matched skill 1", "matched skill 2"],
      "missingSkills": ["missing skill 1", "missing skill 2"],
      "experienceMatch": (boolean),
      "experienceGap": "description of experience gap or match",
      "strengths": ["strength 1", "strength 2", "strength 3"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "recommendations": ["recommendation 1", "recommendation 2"],
      "atsScore": (0-100 integer ATS compatibility score),
      "detailedAnalysis": {
        "technicalSkills": (0-100 score),
        "experience": (0-100 score),
        "education": (0-100 score),
        "keywords": (0-100 score)
      }
    }
    
    Be thorough and provide actionable insights. Focus on technical skills, years of experience, education requirements, and keyword matching.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert ATS system and recruiter. Analyze resumes objectively and provide detailed matching scores.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid JSON response from AI");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error(`OpenAI analysis error for ${fileName}:`, error);
    return {
      overallScore: 0,
      atsScore: 0,
      error: "Failed to analyze resume with AI",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const jobDescription = formData.get("jobDescription") as string;
    const resumeFiles = formData.getAll("resumes") as File[];

    if (!jobDescription || !resumeFiles.length) {
      return NextResponse.json(
        { error: "Job description and at least one resume file are required" },
        { status: 400 }
      );
    }

    // Validate input
    const validatedData = bulkResumeMatchSchema.parse({
      jobDescription,
      resumes: resumeFiles,
    });

    const analyses: ResumeAnalysis[] = [];
    let processedCount = 0;
    let failedCount = 0;

    // Process each resume
    for (const file of validatedData.resumes) {
      try {
        // Extract text from resume file
        const extractionResult = await extractTextFromFile(file);

        const baseAnalysis: ResumeAnalysis = {
          fileName: file.name,
          text: extractionResult.text,
          status: extractionResult.status || "success",
        };

        if (extractionResult.status === "success") {
          // Analyze resume match
          const aiAnalysis = await analyzeResumeMatch(
            validatedData.jobDescription,
            extractionResult.text,
            file.name
          );

          analyses.push({
            ...baseAnalysis,
            ...aiAnalysis,
          });
          processedCount++;
        } else {
          analyses.push({
            ...baseAnalysis,
            overallScore: 0,
            atsScore: 0,
            error: extractionResult.status,
          });
          failedCount++;
        }
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        analyses.push({
          fileName: file.name,
          text: "",
          status: "failed",
          overallScore: 0,
          atsScore: 0,
          error: error instanceof Error ? error.message : "Processing failed",
        });
        failedCount++;
      }
    }

    // Calculate summary statistics
    const validAnalyses = analyses.filter(
      (analysis) =>
        analysis.overallScore !== undefined && analysis.overallScore > 0
    );

    const averageScore =
      validAnalyses.length > 0
        ? Math.round(
            validAnalyses.reduce(
              (sum, analysis) => sum + (analysis.overallScore || 0),
              0
            ) / validAnalyses.length
          )
        : 0;

    const averageAtsScore =
      validAnalyses.length > 0
        ? Math.round(
            validAnalyses.reduce(
              (sum, analysis) => sum + (analysis.atsScore || 0),
              0
            ) / validAnalyses.length
          )
        : 0;

    // Get top candidates (sorted by overall score)
    const topCandidates = analyses
      .filter((analysis) => analysis.overallScore !== undefined)
      .sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0))
      .slice(0, 5);

    // Collect common missing skills
    const allMissingSkills: string[] = [];
    const allFoundSkills: string[] = [];

    validAnalyses.forEach((analysis) => {
      if (analysis.missingSkills) {
        allMissingSkills.push(...analysis.missingSkills);
      }
      if (analysis.skillsMatch) {
        allFoundSkills.push(...analysis.skillsMatch);
      }
    });

    const skillCounts = (skills: string[]) => {
      const counts: Record<string, number> = {};
      skills.forEach((skill) => {
        counts[skill] = (counts[skill] || 0) + 1;
      });
      return counts;
    };

    const missingSkillCounts = skillCounts(allMissingSkills);
    const foundSkillCounts = skillCounts(allFoundSkills);

    const commonMissingSkills = Object.entries(missingSkillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([skill]) => skill);

    const topSkillsFound = Object.entries(foundSkillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([skill]) => skill);

    const result: BulkAnalysisResult = {
      totalResumes: resumeFiles.length,
      processedResumes: processedCount,
      failedResumes: failedCount,
      analyses,
      topCandidates,
      summary: {
        averageScore,
        averageAtsScore,
        commonMissingSkills,
        topSkillsFound,
      },
    };

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Bulk resume matching error:", error);

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
