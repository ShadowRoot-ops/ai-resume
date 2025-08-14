// src/lib/pdfParser.ts

// Type definitions for PDF.js
interface TextItem {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[];
  fontName: string;
  hasEOL: boolean;
}

interface TextMarkedContent {
  type: string;
  id: string;
}

type TextContentItem = TextItem | TextMarkedContent;

interface TextContent {
  items: TextContentItem[];
  styles: Record<string, unknown>;
}

interface PDFPageProxy {
  getTextContent(): Promise<TextContent>;
}

interface PDFDocumentProxy {
  numPages: number;
  getPage(pageNumber: number): Promise<PDFPageProxy>;
}

interface PDFParseResult {
  text: string;
  success: boolean;
  error?: string;
}

// Type guard to check if an item is a TextItem
function isTextItem(item: TextContentItem): item is TextItem {
  return "str" in item && typeof (item as TextItem).str === "string";
}

export async function extractTextFromPdf(
  pdfBuffer: Buffer
): Promise<PDFParseResult> {
  try {
    // Try multiple PDF parsing approaches

    // Method 1: Try pdf-parse with proper error handling
    try {
      const pdfParse = await import("pdf-parse");
      const parseFunction = pdfParse.default || pdfParse;

      const data = await parseFunction(pdfBuffer, {
        // Disable any test-related functionality
        max: 0, // Parse all pages
        version: "default" as const,
      });

      return {
        text: data.text || "",
        success: true,
      };
    } catch (pdfParseError) {
      console.warn(
        "pdf-parse failed, trying alternative method:",
        pdfParseError
      );

      // Method 2: Try pdfjs-dist
      try {
        const pdfjsLib = await import("pdfjs-dist");

        // Set worker source to avoid worker issues
        if (typeof window === "undefined") {
          // Server-side
          pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve(
            "pdfjs-dist/build/pdf.worker.js"
          );
        } else {
          // Client-side
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        }

        const pdf: PDFDocumentProxy = await pdfjsLib.getDocument({
          data: pdfBuffer,
          useWorkerFetch: false,
          isEvalSupported: false,
          useSystemFonts: true,
        }).promise;

        let fullText = "";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .filter(isTextItem)
            .map((item) => item.str)
            .join(" ");
          fullText += pageText + "\n";
        }

        return {
          text: fullText.trim(),
          success: true,
        };
      } catch (pdfjsError) {
        console.error("Both PDF parsing methods failed:", {
          pdfParseError,
          pdfjsError,
        });

        return {
          text: "[PDF content could not be extracted - please convert to DOC or TXT format]",
          success: false,
          error: `PDF parsing failed: ${
            pdfjsError instanceof Error ? pdfjsError.message : "Unknown error"
          }`,
        };
      }
    }
  } catch (error) {
    console.error("PDF extraction error:", error);
    return {
      text: "[PDF processing error - please try a different file format]",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Alternative: Simpler PDF parser that avoids test file issues
export async function extractTextFromPdfSimple(
  pdfBuffer: Buffer
): Promise<string> {
  try {
    // Use dynamic import to avoid SSR issues
    const { default: pdfParse } = await import("pdf-parse");

    // Create a clean options object without any test-related properties
    const options = {
      max: 0, // Parse all pages
      version: "default" as const,
      // Explicitly avoid any test configurations
      pagerender: undefined,
    };

    const data = await pdfParse(pdfBuffer, options);
    return data.text || "";
  } catch (error) {
    console.error("Simple PDF extraction failed:", error);
    // Return a clear error message instead of throwing
    return `[Failed to extract PDF content: ${
      error instanceof Error ? error.message : "Unknown error"
    }. Please try converting to DOC or TXT format.]`;
  }
}
