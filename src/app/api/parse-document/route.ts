// src/app/api/parse-document/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get form data with file
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Read file content
    const buffer = await file.arrayBuffer();
    const fileContent = new TextDecoder().decode(buffer);

    // For PDF files, this is where you'd use a proper PDF parser
    // For Word docs, use a word doc parser
    // This is a simplified implementation - just return the text content

    // In production, you'd use libraries like pdf-parse, pdfjs, or mammoth.js
    const parsedText =
      file.type === "application/pdf"
        ? "This is extracted text from your PDF (simplified)"
        : fileContent;

    return NextResponse.json({
      success: true,
      text: parsedText,
    });
  } catch (error: unknown) {
    console.error("Document parsing error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to parse document",
      },
      { status: 500 }
    );
  }
}
