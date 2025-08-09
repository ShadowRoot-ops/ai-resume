// src/lib/advanced-analysis.ts
import OpenAI from "openai";
import { prisma } from "./db";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AdvancedAnalysisOptions {
  resumeText: string;
  jobDescription: string;
  industry?: string;
  experienceLevel?: "entry" | "mid" | "senior" | "executive";
  targetATS?: string;
}

interface SalaryData {
  min: number;
  max: number;
  currency: string;
  period: string;
}

// ATS-specific compatibility check
export async function checkATSCompatibility(
  resumeText: string,
  atsSystem: string
): Promise<any> {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert in Applicant Tracking Systems, particularly ${atsSystem}. 
          Analyze this resume for compatibility issues specific to ${atsSystem} and provide targeted recommendations.
          Respond in JSON format with: {
            "compatibilityScore": number (0-100),
            "specificIssues": string[],
            "formatRecommendations": string[],
            "keywordRecommendations": string[]
          }`,
        },
        {
          role: "user",
          content: `Analyze this resume for compatibility with ${atsSystem}:\n\n${resumeText}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0].message.content;
    return JSON.parse(responseContent || "{}");
  } catch (error) {
    console.error("ATS compatibility check error:", error);
    throw new Error(
      `Failed to analyze ATS compatibility: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Industry-specific analysis
export async function analyzeForIndustry(
  resumeText: string,
  jobDescription: string,
  industry: string
): Promise<any> {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert resume analyst specializing in the ${industry} industry.
          Analyze this resume against the job description with specific insights for the ${industry} sector.
          Respond in JSON format with: {
            "industryFit": number (0-100),
            "industryCriticalKeywords": string[],
            "missingIndustryKeywords": string[],
            "industryTrendsToHighlight": string[],
            "industryCertificationsToAdd": string[]
          }`,
        },
        {
          role: "user",
          content: `Analyze this resume for the ${industry} industry against this job description:\n\nRESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0].message.content;
    return JSON.parse(responseContent || "{}");
  } catch (error) {
    console.error("Industry analysis error:", error);
    throw new Error(
      `Failed to perform industry analysis: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Experience level optimization
export async function optimizeForExperienceLevel(
  resumeText: string,
  jobDescription: string,
  experienceLevel: string
): Promise<any> {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert resume consultant specializing in ${experienceLevel}-level positions.
          Analyze this resume against the job description and provide targeted advice for a ${experienceLevel}-level candidate.
          Respond in JSON format with: {
            "levelAppropriatenessScore": number (0-100),
            "contentRecommendations": string[],
            "skillEmphasisSuggestions": string[],
            "experienceHighlightTips": string[],
            "careerProgressionAdvice": string[]
          }`,
        },
        {
          role: "user",
          content: `Analyze this ${experienceLevel}-level resume against this job description:\n\nRESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0].message.content;
    return JSON.parse(responseContent || "{}");
  } catch (error) {
    console.error("Experience level optimization error:", error);
    throw new Error(
      `Failed to optimize for experience level: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Generate interview questions
export async function generateInterviewQuestions(
  resumeText: string,
  jobDescription: string
): Promise<string[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert interviewer and recruiter. Based on this resume and job description,
          generate 10 likely interview questions the candidate will face, focusing on potential gaps, required skills,
          and experience validation. Include both technical and behavioral questions.
          Respond with a JSON array of strings, each containing one interview question.`,
        },
        {
          role: "user",
          content: `Generate interview questions based on this resume and job description:\n\nRESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0].message.content;
    const parsed = JSON.parse(responseContent || "{}");
    return Array.isArray(parsed) ? parsed : parsed.questions || [];
  } catch (error) {
    console.error("Interview question generation error:", error);
    return [];
  }
}

// Generate cover letter
export async function generateCoverLetter(
  resumeText: string,
  jobDescription: string,
  companyName: string
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert cover letter writer. Create a compelling, personalized cover letter 
          for this candidate based on their resume and the job description. The cover letter should be professional,
          highlight relevant skills and experiences, and explain why the candidate is a great fit for the role.
          Keep it to one page (300-400 words).`,
        },
        {
          role: "user",
          content: `Create a cover letter for a position at ${companyName} based on this resume and job description:
          \n\nRESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
        },
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content || "";
  } catch (error) {
    console.error("Cover letter generation error:", error);
    throw new Error(
      `Failed to generate cover letter: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Predict salary range
export async function predictSalaryRange(
  jobDescription: string,
  location: string
): Promise<SalaryData | null> {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert in compensation analysis. Based on the job description and location,
          estimate a realistic salary range for this position. Consider factors like required skills,
          experience level, industry standards, and geographic location.
          Respond in JSON format with: {
            "min": number,
            "max": number,
            "currency": string,
            "period": "yearly" or "hourly" or "monthly"
          }`,
        },
        {
          role: "user",
          content: `Estimate salary range for this position in ${location}:\n\n${jobDescription}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0].message.content;
    return JSON.parse(responseContent || "{}") as SalaryData;
  } catch (error) {
    console.error("Salary prediction error:", error);
    return null;
  }
}

// Generate career path suggestions
export async function suggestCareerPath(
  resumeText: string,
  currentRole: string
): Promise<any> {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a career development expert. Based on this resume and current role,
          suggest potential career paths and next steps, including skills to develop and potential future roles.
          Respond in JSON format with: {
            "nextRoles": string[],
            "skillsToAcquire": string[],
            "certificationsSuggestions": string[],
            "timelineEstimate": string,
            "industryTrends": string[]
          }`,
        },
        {
          role: "user",
          content: `Suggest career path options based on this resume for someone currently in the role of ${currentRole}:\n\n${resumeText}`,
        },
      ],
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0].message.content;
    return JSON.parse(responseContent || "{}");
  } catch (error) {
    console.error("Career path suggestion error:", error);
    return {};
  }
}
