// src/app/api/recruiter/resume-match/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { z } from "zod";
import mammoth from "mammoth";
import { extractTextFromPdf } from "@/lib/pdfParser";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const resumeMatchSchema = z.object({
  jobDescription: z
    .string()
    .min(50, "Job description must be at least 50 characters"),
  resumeText: z
    .string()
    .min(100, "Resume text must be at least 100 characters"),
});

interface MatchAnalysis {
  overallScore: number;
  keywordMatches: string[];
  missingKeywords: string[];
  skillsMatch: string[];
  missingSkills: string[];
  experienceMatch: boolean;
  experienceGap: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  atsScore: number;
  detailedAnalysis: {
    technicalSkills: number;
    experience: number;
    education: number;
    keywords: number;
  };
}

async function extractTextFromFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bufferData = Buffer.from(buffer);

  if (file.type === "application/pdf") {
    // Use our custom PDF parser that handles build issues
    const result = await extractTextFromPdf(bufferData);
    if (!result.success) {
      throw new Error(result.error || "Failed to extract PDF text");
    }
    return result.text;
  } else if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      buffer: bufferData,
    });
    return result.value;
  } else if (file.type === "text/plain") {
    return new TextDecoder().decode(buffer);
  } else {
    throw new Error(
      "Unsupported file type. Please upload PDF, DOCX, or TXT files."
    );
  }
}

async function analyzeResumeMatch(
  jobDescription: string,
  resumeText: string
): Promise<MatchAnalysis> {
  const prompt = `
    As an expert ATS system and recruiter, analyze how well this resume matches the job description.
    
    Job Description:
    ${jobDescription}
    
    Resume:
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
    console.error("OpenAI analysis error:", error);
    throw new Error("Failed to analyze resume");
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
    const resumeFile = formData.get("resume") as File;

    if (!jobDescription || !resumeFile) {
      return NextResponse.json(
        { error: "Job description and resume file are required" },
        { status: 400 }
      );
    }

    // Extract text from resume file
    let resumeText: string;
    try {
      resumeText = await extractTextFromFile(resumeFile);
    } catch (fileError) {
      console.error("File extraction error:", fileError);
      return NextResponse.json(
        {
          error:
            fileError instanceof Error
              ? fileError.message
              : "Failed to process file",
          details: "Please ensure your file is a valid PDF, DOCX, or TXT file.",
        },
        { status: 400 }
      );
    }

    // Validate input
    const validatedData = resumeMatchSchema.parse({
      jobDescription,
      resumeText,
    });

    // Analyze resume match
    const analysis = await analyzeResumeMatch(
      validatedData.jobDescription,
      validatedData.resumeText
    );

    return NextResponse.json({
      success: true,
      analysis,
      fileName: resumeFile.name,
      fileSize: resumeFile.size,
    });
  } catch (error) {
    console.error("Resume matching error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to analyze resume",
      },
      { status: 500 }
    );
  }
}
