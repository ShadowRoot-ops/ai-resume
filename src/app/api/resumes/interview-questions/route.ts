// src/app/api/resumes/interview-questions/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { resumeText, jobDescription, country } = data;

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Customize system prompt based on country
    let systemPrompt = `You are an expert interviewer and recruiter.`;

    if (country === "india") {
      systemPrompt += ` You're familiar with the Indian job market and hiring practices in India.`;
    }

    systemPrompt += ` Based on this resume and job description, generate 10 likely interview questions the candidate will face, focusing on potential gaps, required skills, and experience validation. Include both technical and behavioral questions.`;

    if (country === "india") {
      systemPrompt += ` Include questions relevant to Indian workplace culture, certifications common in India, and any India-specific industry knowledge if applicable.`;
    }

    systemPrompt += ` Respond with a JSON array of strings, each containing one interview question.`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Generate interview questions based on this resume and job description${
            country ? ` for a position in ${country}` : ""
          }:\n\nRESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0].message.content;
    const parsed = JSON.parse(responseContent || "{}");

    // Handle both array format and {questions: [...]} format
    const questions = Array.isArray(parsed) ? parsed : parsed.questions || [];

    return NextResponse.json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error("Interview questions API error:", error);
    return NextResponse.json(
      {
        error: `Failed to generate interview questions: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
