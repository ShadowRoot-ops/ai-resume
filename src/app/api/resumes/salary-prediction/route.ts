// src/app/api/resumes/salary-prediction/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { jobDescription, location, country } = data;

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Missing job description" },
        { status: 400 }
      );
    }

    // Prepare system prompt based on country
    let systemPrompt = `You are an expert in compensation analysis. Based on the job description`;

    if (location) {
      systemPrompt += ` and location (${location})`;
    }

    if (country) {
      systemPrompt += ` in ${country}`;
    }

    systemPrompt += `, estimate a realistic salary range for this position. Consider factors like required skills, experience level, industry standards, and geographic location.`;

    // Add country-specific instructions
    if (country === "india") {
      systemPrompt += ` For jobs in India, provide salary in INR (₹). Consider factors like tier of the city (metro vs non-metro), cost of living, and prevailing industry standards in India. Typically express Indian salaries in lakhs per annum (LPA) for professional jobs or thousands per month for entry-level positions.`;
    }

    systemPrompt += ` Respond in JSON format with: {
      "min": number,
      "max": number,
      "currency": "USD" or "INR" or appropriate currency code,
      "period": "yearly" or "hourly" or "monthly"
    }`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Estimate salary range for this position${
            location ? ` in ${location}` : ""
          }${country ? ` (${country})` : ""}:\n\n${jobDescription}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0].message.content;
    const salaryData = JSON.parse(responseContent || "{}");

    return NextResponse.json({
      success: true,
      salaryData,
    });
  } catch (error) {
    console.error("Salary prediction API error:", error);
    return NextResponse.json(
      {
        error: `Failed to predict salary range: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
