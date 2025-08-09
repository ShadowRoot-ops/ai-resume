// src/app/api/resumes/cover-letter/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { extractTextFromResume } from "@/lib/ai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const jobDescription = formData.get("jobDescription") as string;
    const companyName =
      (formData.get("companyName") as string) || "the company";
    const country = (formData.get("country") as string) || undefined;

    if (!file || !jobDescription) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Extract text from resume file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const resumeText = await extractTextFromResume(buffer, file.name);

    // Create system prompt with country context
    let systemPrompt = `You are an expert cover letter writer. Create a compelling, personalized cover letter 
    for this candidate based on their resume and the job description.`;

    if (country === "india") {
      systemPrompt += ` You are familiar with Indian business communication styles and employer expectations in India.`;
    }

    systemPrompt += ` The cover letter should be professional, highlight relevant skills and experiences, and explain why the candidate is a great fit for the role.
    Keep it to one page (300-400 words).`;

    if (country === "india") {
      systemPrompt += `

      For an Indian audience, consider:
      - Appropriate formal salutations and closings
      - Reference to relevant Indian qualifications or certifications
      - Awareness of Indian business context and workplace culture
      - Balance between confidence and respect (avoiding overly casual language)
      - Include all contact details typically expected in Indian business communications`;
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Create a cover letter for a position at ${companyName}${
            country ? ` in ${country}` : ""
          } based on this resume and job description:
          \n\nRESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
        },
      ],
      temperature: 0.7,
    });

    const coverLetter = completion.choices[0].message.content || "";

    return NextResponse.json({
      success: true,
      coverLetter,
    });
  } catch (error) {
    console.error("Cover letter API error:", error);
    return NextResponse.json(
      {
        error: `Failed to generate cover letter: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
