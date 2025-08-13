// src/app/api/resumes/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";

// Mock database operations for testing
const mockDb = {
  user: {
    findUnique: async (query: any) => ({
      id: "user-123",
      clerkId: "user-456",
      credits: 10,
      subscription: { plan: "free" },
      creditUsage: [],
    }),
  },
  $transaction: async (callback: any) => {
    // Mock transaction
    await callback({
      user: {
        update: async () => ({ id: "user-123", credits: 9 }),
      },
      creditUsage: {
        create: async () => ({ id: "usage-123" }),
      },
      resumeAnalysis: {
        create: async () => ({ id: "analysis-123" }),
      },
    });
  },
};

export async function POST(req: NextRequest) {
  try {
    // For testing without Clerk, comment out auth check
    // const { userId } = await auth();
    // if (!userId) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Mock userId for testing
    const userId = "test-user-123";

    console.log("API route hit successfully!");

    // Get user from database (using mock for now)
    const user = await mockDb.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has enough credits
    if (user.credits < 1) {
      return NextResponse.json(
        {
          error: "Insufficient credits. Please purchase more to continue.",
          creditsNeeded: 1,
          creditsAvailable: user.credits,
        },
        { status: 402 }
      );
    }

    // Parse the form data - FIXED: Match the frontend field names
    const formData = await req.formData();
    const resumeFile = formData.get("file") as File; // Changed from "resume" to "file"
    const jobDescription = formData.get("jobDescription") as string;
    const customPrompt = (formData.get("customPrompt") as string) || "";
    const country = formData.get("country") as string;

    console.log("FormData received:");
    console.log("- resumeFile:", resumeFile?.name, resumeFile?.size);
    console.log("- jobDescription length:", jobDescription?.length);
    console.log("- country:", country);

    if (!resumeFile || !jobDescription) {
      return NextResponse.json(
        { error: "Missing resume file or job description" },
        { status: 400 }
      );
    }

    console.log("File received:", resumeFile.name, resumeFile.size);
    console.log("Job description length:", jobDescription.length);

    // Extract text from resume (simplified for testing)
    const resumeText = await extractTextFromFile(resumeFile);

    if (!resumeText) {
      return NextResponse.json(
        { error: "Failed to extract text from resume" },
        { status: 400 }
      );
    }

    // Generate analysis
    const analysis = await analyzeResumeWithAI(
      resumeText,
      jobDescription,
      customPrompt,
      country
    );

    // Mock transaction for testing
    await mockDb.$transaction(async (tx: any) => {
      await tx.user.update({
        where: { id: user.id },
        data: { credits: { decrement: 1 } },
      });

      await tx.creditUsage.create({
        data: {
          userId: user.id,
          amount: 1,
          service: "resume_analyze",
          description: "Resume analysis and optimization",
        },
      });

      if (analysis) {
        await tx.resumeAnalysis.create({
          data: {
            userId: user.id,
            jobDescription,
            atsScore: analysis.atsScore || 0,
            matchScore: analysis.matchScore || 0,
            analysisData: analysis as any,
          },
        });
      }
    });

    console.log("Analysis completed successfully");

    // Return analysis results in the format expected by frontend
    return NextResponse.json({
      success: true,
      atsScore: analysis.atsScore,
      matchScore: analysis.matchScore,
      missingKeywords: analysis.missingKeywords,
      strengths: analysis.strengths,
      recommendations: analysis.recommendations,
      keywordAnalysis: analysis.keywordAnalysis,
      country: analysis.country,
      ...analysis,
    });
  } catch (error: any) {
    console.error("Resume analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze resume" },
      { status: 500 }
    );
  }
}

async function extractTextFromFile(file: File): Promise<string | null> {
  try {
    const arrayBuffer = await file.arrayBuffer();

    // For PDF files, return mock content (since we don't have PDF parsing library)
    if (file.type === "application/pdf") {
      return `Mock PDF content for ${file.name}: 
      
      John Doe
      Software Engineer
      Email: john.doe@email.com
      Phone: (555) 123-4567
      
      EXPERIENCE
      Senior Software Engineer at Tech Corp (2021-Present)
      - Developed scalable web applications using React and Node.js
      - Led a team of 5 developers on multiple projects
      - Improved system performance by 40%
      
      Software Engineer at StartupXYZ (2019-2021)
      - Built RESTful APIs and microservices
      - Worked with cloud technologies including AWS
      - Collaborated with cross-functional teams
      
      SKILLS
      JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, PostgreSQL
      
      EDUCATION
      Bachelor of Science in Computer Science
      State University (2019)`;
    }

    // For Word documents, return mock content
    if (file.type.includes("word") || file.type.includes("officedocument")) {
      return `Mock Word document content for ${file.name}:
      
      Professional with 3+ years experience in software development.
      Skilled in full-stack development with expertise in modern frameworks.
      Strong background in JavaScript, React, Node.js, and cloud technologies.`;
    }

    // For text files, try to decode
    if (file.type === "text/plain") {
      const text = new TextDecoder().decode(arrayBuffer);
      return text || `Mock text content for ${file.name}`;
    }

    // Fallback for other file types
    return `Mock content extracted from ${file.name}: Resume with technical background and relevant experience.`;
  } catch (error) {
    console.error("Error extracting text:", error);
    return `Fallback content for testing: Resume content for ${file.name}`;
  }
}

async function analyzeResumeWithAI(
  resumeText: string,
  jobDescription: string,
  customPrompt: string,
  country?: string
): Promise<any> {
  try {
    // For testing, return mock analysis
    return generateMockAnalysis(resumeText, jobDescription, country);
  } catch (error) {
    console.error("AI analysis error:", error);
    return generateMockAnalysis(resumeText, jobDescription, country);
  }
}

function generateMockAnalysis(
  resumeText: string,
  jobDescription: string,
  country?: string
) {
  console.log("Generating mock analysis...");

  // Extract keywords from job description
  const jobWords = jobDescription.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const uniqueKeywords = [...new Set(jobWords)]
    .filter(
      (word) =>
        ![
          "the",
          "and",
          "for",
          "you",
          "will",
          "are",
          "with",
          "this",
          "that",
          "have",
          "been",
          "can",
        ].includes(word)
    )
    .slice(0, 15);

  // Extract some keywords from resume
  const resumeWords = resumeText.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const resumeKeywords = [...new Set(resumeWords)].slice(0, 10);

  // Find missing keywords (keywords in job description but not in resume)
  const missingKeywords = uniqueKeywords
    .filter((keyword) => !resumeText.toLowerCase().includes(keyword))
    .slice(0, 6);

  // Find present keywords
  const presentKeywords = uniqueKeywords
    .filter((keyword) => resumeText.toLowerCase().includes(keyword))
    .slice(0, 8);

  // Calculate scores
  const keywordMatchPercentage =
    uniqueKeywords.length > 0
      ? Math.round((presentKeywords.length / uniqueKeywords.length) * 100)
      : 75;

  const atsScore = Math.min(
    90,
    Math.max(45, keywordMatchPercentage + Math.floor(Math.random() * 20) - 10)
  );
  const matchScore = Math.min(
    95,
    Math.max(40, keywordMatchPercentage + Math.floor(Math.random() * 15) - 5)
  );

  // Generate context-aware strengths
  const strengths = [
    presentKeywords.length > 0
      ? `Strong match for key skills: ${presentKeywords.slice(0, 3).join(", ")}`
      : "Professional resume structure",
    resumeText.includes("experience") || resumeText.includes("years")
      ? "Relevant work experience highlighted"
      : "Clear professional background",
    resumeText.includes("education") || resumeText.includes("degree")
      ? "Strong educational background"
      : "Well-organized content",
    resumeText.includes("skills")
      ? "Technical skills clearly presented"
      : "Good resume formatting",
  ];

  // Generate context-aware recommendations
  const recommendations = [
    missingKeywords.length > 0
      ? `Add missing job-relevant keywords: ${missingKeywords
          .slice(0, 4)
          .join(", ")}`
      : "Continue highlighting relevant skills",
    "Quantify achievements with specific metrics (e.g., '40% improvement', '$50k savings')",
    "Tailor your summary section to directly address the job requirements",
    matchScore < 70
      ? "Restructure experience section to better match job requirements"
      : "Consider adding more specific technical accomplishments",
    "Use consistent formatting throughout the document for better ATS scanning",
    country === "india"
      ? "Consider including relevant certifications common in the Indian job market"
      : "Optimize for local job market preferences",
  ];

  const analysis = {
    atsScore,
    matchScore,
    missingKeywords,
    strengths: strengths.slice(0, 4),
    recommendations: recommendations.slice(0, 5),
    keywordAnalysis: {
      missing: missingKeywords,
      present: presentKeywords,
      overused: [
        "responsible for",
        "worked on",
        "assisted with",
        "helped with",
      ],
      total: uniqueKeywords.length,
      matched: presentKeywords.length,
    },
    country: country || "not specified",
    resumeLength: resumeText.length,
    jobDescriptionLength: jobDescription.length,
  };

  console.log("Mock analysis generated:", analysis);
  return analysis;
}
