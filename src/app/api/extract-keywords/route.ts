// src/app/api/extract-keywords/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { jobDescription, country } = data;

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Missing job description" },
        { status: 400 }
      );
    }

    let systemPrompt = `Extract the most important skills and keywords from this job description that a candidate should include in their resume. 
    Focus on technical skills, tools, platforms, and other specific requirements.`;

    if (country === "india") {
      systemPrompt += ` Consider Indian job market context, including certifications, educational qualifications, and technical skills that are particularly valued in India.`;
    }

    systemPrompt += ` Return only a JSON array of 10-15 keywords/phrases.`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Extract keywords from this job description${
            country ? ` for a position in ${country}` : ""
          }:\n\n${jobDescription}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0].message.content;
    const parsed = JSON.parse(responseContent || "{}");

    // Handle both array format and {keywords: [...]} format
    const keywords = Array.isArray(parsed) ? parsed : parsed.keywords || [];

    return NextResponse.json({ keywords });
  } catch (error) {
    console.error("Keyword extraction error:", error);
    return NextResponse.json(
      {
        error: `Failed to extract keywords: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
