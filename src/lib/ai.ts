// src/lib/ai.ts
import { prisma } from "./db";
import OpenAI from "openai";
import mammoth from "mammoth";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple text extraction for PDFs without external dependencies
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Simple PDF text extraction implementation
    // This won't work for all PDFs, but it's a good starting point
    // that doesn't require external dependencies

    // Convert buffer to string
    const rawText = buffer.toString("utf8");

    // Extract text using simple pattern matching
    // This looks for text between BT (Begin Text) and ET (End Text) markers
    let text = "";
    const textMatches = rawText.match(/BT[\s\S]*?ET/g) || [];

    for (const match of textMatches) {
      // Extract text content from each text block
      // This is a very simplified approach
      const cleaned = match
        .replace(/BT|ET/g, "")
        .replace(/\[\(([^\)]+)\)\]/g, "$1")
        .replace(/\(([^\)]+)\)/g, "$1")
        .replace(/Tj|TJ|\*|\'|\"|\d+\s+TC|\d+\s+Tc|\d+\s+TL/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (cleaned) {
        text += cleaned + " ";
      }
    }

    // Fallback: If we couldn't extract text blocks, try looking for plain text
    if (!text.trim()) {
      // Look for strings in the PDF
      const stringMatches = rawText.match(/\(([^\)]+)\)/g) || [];
      for (const match of stringMatches) {
        // Extract string content
        const cleaned = match.replace(/^\(|\)$/g, "").trim();
        if (cleaned.length > 1) {
          // Ignore single characters
          text += cleaned + " ";
        }
      }
    }

    // Final fallback: Just look for readable ASCII text
    if (!text.trim()) {
      text = rawText
        .replace(/[^\x20-\x7E\n\r\t]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    return text || "Could not extract text from PDF";
  } catch (error) {
    console.error("Simple PDF extraction error:", error);
    return "PDF text extraction failed";
  }
}

export async function hasRemainingCredits(userId: string): Promise<boolean> {
  try {
    // First find the user by Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    // If user exists and has credits, return true
    return user !== null && user.credits > 0;
  } catch (error) {
    console.error("Error checking credits:", error);
    return false;
  }
}

// Function to extract text from different file types
export async function extractTextFromResume(
  resumeBuffer: Buffer,
  fileName: string
): Promise<string> {
  console.log(`Attempting to extract text from ${fileName}`);
  const fileExtension = fileName.toLowerCase().split(".").pop();

  try {
    switch (fileExtension) {
      case "pdf":
        try {
          console.log("Processing PDF using simple extractor...");
          const text = await extractTextFromPDF(resumeBuffer);

          if (!text || text.trim().length === 0) {
            throw new Error("No text extracted from PDF");
          }

          console.log(`Extracted ${text.length} characters from PDF`);
          return text;
        } catch (pdfError) {
          console.error("PDF parsing error:", pdfError);

          // Simple fallback - just get what we can as plain text
          const textContent = resumeBuffer
            .toString("utf-8")
            .replace(/[^\x20-\x7E\n\r\t]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

          if (textContent.length > 100) {
            console.log(`Fallback extracted ${textContent.length} characters`);
            return textContent;
          }

          throw new Error(`Failed to parse PDF: ${pdfError.message}`);
        }

      case "doc":
      case "docx":
        try {
          console.log("Processing Word document using mammoth...");
          const docData = await mammoth.extractRawText({
            buffer: resumeBuffer,
          });
          return docData.value || "";
        } catch (docError) {
          console.error("Word document parsing error:", docError);
          throw new Error(`Failed to parse Word document: ${docError.message}`);
        }

      case "txt":
        console.log("Processing text file...");
        return resumeBuffer.toString("utf-8");

      default:
        throw new Error(
          `Unsupported file type: ${fileExtension}. Please upload a PDF, DOC, DOCX, or TXT file.`
        );
    }
  } catch (error) {
    console.error("Text extraction error:", error);
    throw new Error(
      `Text extraction failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function analyzeResume(
  resumeBuffer: Buffer,
  fileName: string,
  jobDescription: string
): Promise<any> {
  try {
    console.log("=== STARTING RESUME ANALYSIS ===");
    console.log("File name:", fileName);
    console.log("Buffer size:", resumeBuffer.length);
    console.log("Job description length:", jobDescription.length);

    // Extract text from the resume
    let resumeText = "";
    try {
      resumeText = await extractTextFromResume(resumeBuffer, fileName);
      console.log(
        `Successfully extracted ${resumeText.length} characters from resume`
      );

      // Limit text length for API calls
      if (resumeText.length > 50000) {
        resumeText = resumeText.substring(0, 50000) + "... [truncated]";
        console.log("Resume text truncated to 50,000 characters");
      }
    } catch (extractError) {
      console.error("Text extraction failed:", extractError);

      // Return fallback analysis for extraction errors
      return {
        atsScore: 50,
        matchScore: 40,
        missingKeywords: ["Could not extract resume text"],
        recommendations: [
          "Please upload a plain text version of your resume",
          "Ensure your PDF is not scanned or image-based",
          "Try using a .txt or .docx file instead",
        ],
        strengths: ["Resume uploaded successfully"],
        extractedText: `Could not extract text from ${fileName}. The file may be in a format that's not supported or may be password-protected.`,
      };
    }

    // If text extraction failed or resulted in empty text
    if (!resumeText || !resumeText.trim()) {
      console.log("Extracted text is empty, using fallback analysis");
      return {
        atsScore: 50,
        matchScore: 40,
        missingKeywords: ["No readable text found in resume"],
        recommendations: [
          "Please upload a resume with proper text content",
          "Ensure your PDF is not scanned or image-based",
          "Try using a .txt or .docx file instead",
        ],
        strengths: ["Resume file uploaded successfully"],
        extractedText: `No readable text found in ${fileName}. The file may contain images or be formatted in a way that prevents text extraction.`,
      };
    }

    // Check if OpenAI API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is missing");
      throw new Error(
        "OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables."
      );
    }

    // Analyze with OpenAI
    console.log("Calling OpenAI API for resume analysis...");
    const systemPrompt = `You are an expert ATS (Applicant Tracking System) analyzer. Your task is to analyze a resume against a job description and provide feedback on how well it matches and how to improve it.

You must respond with a valid JSON object containing exactly these fields:
{
  "atsScore": number (0-100),
  "matchScore": number (0-100),
  "missingKeywords": string[],
  "recommendations": string[],
  "strengths": string[]
}

The atsScore should represent how well the resume would perform in an ATS system (formatting, keywords, etc.).
The matchScore should represent how well the candidate's qualifications match the job requirements.
Do not include any other text outside the JSON object.`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Please analyze this resume against the job description and provide a detailed analysis.

RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Provide your analysis as a JSON object with:
1. atsScore: ATS compatibility score (0-100)
2. matchScore: Job match percentage (0-100)  
3. missingKeywords: Array of important keywords missing from the resume (max 10)
4. recommendations: Array of specific improvement suggestions (max 8)
5. strengths: Array of current resume strengths (max 5)

Respond only with the JSON object, no additional text.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0].message.content;
    console.log("OpenAI analysis response received");

    if (!responseContent) {
      throw new Error("OpenAI returned empty response");
    }

    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(responseContent);
      console.log("Successfully parsed OpenAI response");
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }

    // Ensure all required fields exist with proper types and bounds
    const result = {
      atsScore: Math.max(0, Math.min(100, Number(analysis.atsScore) || 50)),
      matchScore: Math.max(0, Math.min(100, Number(analysis.matchScore) || 50)),
      missingKeywords: Array.isArray(analysis.missingKeywords)
        ? analysis.missingKeywords
            .slice(0, 10)
            .filter((k) => typeof k === "string" && k.trim())
        : [],
      recommendations: Array.isArray(analysis.recommendations)
        ? analysis.recommendations
            .slice(0, 8)
            .filter((r) => typeof r === "string" && r.trim())
        : [],
      strengths: Array.isArray(analysis.strengths)
        ? analysis.strengths
            .slice(0, 5)
            .filter((s) => typeof s === "string" && s.trim())
        : [],
      extractedText:
        resumeText.substring(0, 1000) + (resumeText.length > 1000 ? "..." : ""),
    };

    console.log("=== ANALYSIS COMPLETED ===");
    return result;
  } catch (error) {
    console.error("=== RESUME ANALYSIS ERROR ===", error);
    throw new Error(
      `Failed to analyze resume: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function generateResumeFromText(
  resumeText: string,
  jobDescription: string,
  companyName: string = "",
  templateId: string = "professional"
): Promise<any> {
  try {
    console.log("=== STARTING RESUME GENERATION ===");
    console.log("Resume text length:", resumeText.length);
    console.log("Job description length:", jobDescription.length);
    console.log("Target company:", companyName || "Not specified");

    // Check if OpenAI API key exists
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables."
      );
    }

    const systemPrompt = `You are an expert resume writer. Your task is to create a highly optimized JSON resume specifically tailored for the job description provided. The resume should be ATS-friendly and highlight relevant skills and experiences.

Output a valid JSON with the following structure:
{
  "personalInfo": {
    "name": "...",
    "email": "...",
    "phone": "...",
    "location": "...",
    "linkedin": "...",
    "website": "..."
  },
  "summary": "...",
  "experience": [
    {
      "company": "...",
      "position": "...",
      "date": "...",
      "location": "...",
      "responsibilities": [
        "...",
        "..."
      ]
    }
  ],
  "education": [
    {
      "institution": "...",
      "degree": "...",
      "date": "...",
      "gpa": "..."
    }
  ],
  "skills": [
    "...",
    "..."
  ],
  "projects": [
    {
      "name": "...",
      "description": "...",
      "technologies": "..."
    }
  ]
}

IMPORTANT: 
1. Use the existing resume information as the source of truth for the person's actual experience, education, etc.
2. Focus on matching relevant keywords from the job description.
3. Use quantifiable achievements where possible, enhancing any that exist in the original resume.
4. Prioritize the most relevant experiences first.
5. Keep it to one page worth of content.
6. Return only a valid JSON object, no other text.`;

    console.log("Calling OpenAI API for resume generation...");
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `
Here is the original resume text:
${resumeText}

Here is the job description:
${jobDescription}

Target company: ${companyName || "Not specified"}

Create an optimized resume that will maximize the chances of getting an interview for this position.
`,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0].message.content;
    console.log("Resume generation completed");

    if (!responseContent) {
      throw new Error("OpenAI returned empty response");
    }

    // Parse the JSON response
    try {
      const resumeData = JSON.parse(responseContent);
      console.log("Successfully parsed generated resume");
      return resumeData;
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error(
        `Failed to parse generated resume: ${parseError.message}`
      );
    }
  } catch (error) {
    console.error("Error generating resume:", error);
    throw new Error(
      `Failed to generate resume: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Main function to handle file upload and generate resume
export async function generateResume(
  resumeBuffer: Buffer,
  fileName: string,
  jobDescription: string,
  companyName: string = "",
  templateId: string = "professional"
): Promise<any> {
  try {
    console.log("=== STARTING RESUME GENERATION PROCESS ===");

    // First extract text from the resume
    let resumeText = "";
    try {
      resumeText = await extractTextFromResume(resumeBuffer, fileName);
      console.log(
        `Successfully extracted ${resumeText.length} characters from resume`
      );

      if (!resumeText.trim()) {
        throw new Error("No text could be extracted from the resume file");
      }

      // Limit text length for API calls
      if (resumeText.length > 50000) {
        resumeText = resumeText.substring(0, 50000) + "... [truncated]";
      }
    } catch (extractError) {
      console.error("Text extraction failed:", extractError);
      throw new Error(
        `Could not extract text from resume: ${extractError.message}`
      );
    }

    // Now generate the optimized resume using the extracted text
    return await generateResumeFromText(
      resumeText,
      jobDescription,
      companyName,
      templateId
    );
  } catch (error) {
    console.error("Error in resume generation process:", error);
    throw new Error(
      `Resume generation failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
