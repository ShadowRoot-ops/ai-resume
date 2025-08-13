// src/lib/file-parsers.ts

import * as pdfjs from "pdfjs-dist";
import mammoth from "mammoth";
import type {
  TextItem,
  TextMarkedContent,
} from "pdfjs-dist/types/src/display/api";

// Setup PDF.js worker - use dynamic import with proper worker URL
if (typeof window !== "undefined") {
  // For browser environment
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
} else {
  // For Node.js environment
  pdfjs.GlobalWorkerOptions.workerSrc = require.resolve(
    "pdfjs-dist/build/pdf.worker.js"
  );
}

/**
 * Parse text content from a PDF file
 */
export async function parsePdf(buffer: ArrayBuffer): Promise<string> {
  try {
    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: buffer });
    const pdf = await loadingTask.promise;

    let fullText = "";

    // Iterate through each page to extract text
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: TextItem | TextMarkedContent) => {
          // Only TextItem has the 'str' property, TextMarkedContent doesn't
          return "str" in item ? item.str : "";
        })
        .join(" ");

      fullText += pageText + "\n\n";
    }

    return fullText.trim();
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to parse PDF content");
  }
}

/**
 * Parse text content from a DOCX file
 */
export async function parseDocx(buffer: ArrayBuffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value.trim();
  } catch (error) {
    console.error("Error parsing DOCX:", error);
    throw new Error("Failed to parse DOCX content");
  }
}
