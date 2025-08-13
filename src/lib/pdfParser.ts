// src/lib/pdfParser.ts

import fs from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid"; // You might need to install this: npm install uuid

export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  try {
    // Import pdf-parse dynamically to avoid issues with Next.js SSR
    const pdfParse = (await import("pdf-parse")).default;

    // Create a temporary file
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `temp-pdf-${uuidv4()}.pdf`);

    // Write the buffer to the temp file
    fs.writeFileSync(tempFilePath, pdfBuffer);

    try {
      // Use pdf-parse with the file path (which seems to be what it expects)
      const dataBuffer = fs.readFileSync(tempFilePath);
      const data = await pdfParse(dataBuffer);
      return data.text || "";
    } finally {
      // Clean up - delete the temp file
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.error("Error deleting temporary PDF file:", cleanupError);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("PDF extraction error:", error);
    return `[Failed to extract text from PDF: ${errorMessage}]`;
  }
}
