// src/app/api/ai/extract-resume-data/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// Define interfaces for type safety
interface Experience {
  company: string;
  position: string;
  location: string;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  responsibilities: string[];
}

interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string | null;
  endDate: string | null;
  gpa: string;
}

interface ExtractedData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
  };
  summary: string;
  experience?: Experience[];
  education?: Education[];
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string;
    url: string;
  }>;
}

export async function POST(req: Request) {
  try {
    // Check authentication using Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { prompt, jobTitle, company } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Call OpenAI to extract resume data
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "You are a professional resume writer. Extract structured resume data from the user's input and format it as JSON.",
            },
            {
              role: "user",
              content: `Create a professional resume for the following position: ${jobTitle} at ${company}. 
            
            User input: ${prompt}
            
            Return the data in this exact JSON format:
            {
              "personalInfo": {
                "name": "string",
                "email": "string",
                "phone": "string",
                "location": "string",
                "linkedin": "string"
              },
              "summary": "string",
              "experience": [
                {
                  "company": "string",
                  "position": "string",
                  "location": "string",
                  "startDate": "YYYY-MM-DD",
                  "endDate": "YYYY-MM-DD or null if current",
                  "current": boolean,
                  "responsibilities": ["string"]
                }
              ],
              "education": [
                {
                  "institution": "string",
                  "degree": "string",
                  "fieldOfStudy": "string",
                  "startDate": "YYYY-MM-DD",
                  "endDate": "YYYY-MM-DD",
                  "gpa": "string"
                }
              ],
              "skills": ["string"],
              "projects": [
                {
                  "name": "string",
                  "description": "string",
                  "technologies": "string",
                  "url": "string"
                }
              ]
            }`,
            },
          ],
          temperature: 0.7,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!openaiResponse.ok) {
      throw new Error("Failed to get response from OpenAI");
    }

    const aiData = await openaiResponse.json();
    const extractedData: ExtractedData = JSON.parse(
      aiData.choices[0].message.content
    );

    // Process dates with proper typing
    const processedData = {
      ...extractedData,
      experience: extractedData.experience?.map((exp: Experience) => ({
        ...exp,
        startDate: exp.startDate ? new Date(exp.startDate) : null,
        endDate: exp.endDate ? new Date(exp.endDate) : null,
      })),
      education: extractedData.education?.map((edu: Education) => ({
        ...edu,
        startDate: edu.startDate ? new Date(edu.startDate) : null,
        endDate: edu.endDate ? new Date(edu.endDate) : null,
      })),
    };

    const resumeData = {
      title: `Resume for ${jobTitle || "New Position"}`,
      jobTitle: jobTitle || "",
      companyTargeted: company || "",
      ...processedData,
    };

    // Return the extracted data
    return NextResponse.json({
      success: true,
      resumeData,
    });
  } catch (error) {
    console.error("Error extracting resume data:", error);
    return NextResponse.json(
      { error: "Failed to extract resume data" },
      { status: 500 }
    );
  }
}
