// src/app/api/resumes/route.ts
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/user-helpers";

// Create a new resume
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await getOrCreateUser(userId);

    // Check if user has enough credits
    if (user.credits < 1) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    // Parse request body
    const resumeData = await request.json();

    // Calculate ATS score (simplified example)
    const atsScore = calculateAtsScore(resumeData);

    // Create resume in database
    const resume = await prisma.resume.create({
      data: {
        title: resumeData.title,
        userId: user.id,
        jobTitle: resumeData.jobTitle || null,
        jobDescription: resumeData.jobDescription || null,
        companyTargeted: resumeData.companyTargeted || null,
        templateId: resumeData.templateId || "professional",
        colorPaletteIndex: resumeData.colorPaletteIndex || 0,
        fontFamily: resumeData.fontFamily || "Inter",
        atsScore,
        content: {
          personalInfo: resumeData.personalInfo,
          summary: resumeData.summary,
          experience: resumeData.experience,
          education: resumeData.education,
          skills: resumeData.skills,
          projects: resumeData.projects,
        },
        // Add default empty object for analysisData
        analysisData: resumeData.analysisData || {},
      },
    });

    // Deduct credits for resume creation
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: 1 } },
    });

    // Log credit usage
    await prisma.creditUsage.create({
      data: {
        userId: user.id,
        amount: 1,
        service: "resume_create",
        description: "Resume creation",
      },
    });

    return NextResponse.json(resume);
  } catch (error) {
    console.error("Error creating resume:", error);
    return NextResponse.json(
      { error: "Failed to create resume" },
      { status: 500 }
    );
  }
}
export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await getOrCreateUser(userId);

    // Get all resumes for this user
    const resumes = await prisma.resume.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(resumes);
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return NextResponse.json(
      { error: "Failed to fetch resumes" },
      { status: 500 }
    );
  }
}

// Helper function to calculate ATS score
interface ResumeData {
  title: string;
  jobTitle?: string;
  jobDescription?: string;
  companyTargeted?: string;
  templateId?: string;
  colorPaletteIndex?: number;
  fontFamily?: string;
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    [key: string]: unknown;
  };
  summary?: string;
  experience?: {
    company?: string;
    position?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    [key: string]: unknown;
  }[];
  education?: {
    institution?: string;
    degree?: string;
    startDate?: string;
    endDate?: string;
    [key: string]: unknown;
  }[];
  skills?: string[];
  projects?: {
    name?: string;
    description?: string;
    link?: string;
    [key: string]: unknown;
  }[];
  analysisData?: object;
}

function calculateAtsScore(resumeData: ResumeData): number {
  let score = 60; // Base score

  // Check if there's a job description to compare against
  if (resumeData.jobDescription) {
    const jobDesc = resumeData.jobDescription.toLowerCase();
    const skills = resumeData.skills || [];
    const summary = resumeData.summary || "";

    // Increase score based on keyword matches
    const keywords = extractKeywords(jobDesc);
    const matchCount = countMatches(skills, summary, keywords);

    // Adjust score based on matches
    score += Math.min(matchCount * 2, 20);
  }

  // Check for completeness
  if (resumeData.summary && resumeData.summary.length > 50) score += 5;
  if ((resumeData.experience || []).length >= 2) score += 5;
  if ((resumeData.education || []).length >= 1) score += 5;
  if ((resumeData.skills || []).length >= 5) score += 5;

  return Math.min(Math.max(score, 30), 100); // Ensure score is between 30-100
}

// Helper function to extract important keywords from job description
function extractKeywords(jobDesc: string): string[] {
  const commonKeywords = [
    "javascript",
    "react",
    "node",
    "typescript",
    "html",
    "css",
    "aws",
    "sql",
    "nosql",
    "api",
    "rest",
    "graphql",
    "frontend",
    "backend",
    "fullstack",
    "agile",
    "scrum",
    "leadership",
    "communication",
    "teamwork",
  ];

  return commonKeywords.filter((keyword) => jobDesc.includes(keyword));
}

// Count how many keywords match in skills and summary
function countMatches(
  skills: string[],
  summary: string,
  keywords: string[]
): number {
  let count = 0;
  const summaryLower = summary.toLowerCase();

  for (const keyword of keywords) {
    // Check if keyword is in skills
    if (skills.some((skill) => skill.toLowerCase().includes(keyword))) {
      count++;
    }
    // Check if keyword is in summary
    else if (summaryLower.includes(keyword)) {
      count++;
    }
  }

  return count;
}
