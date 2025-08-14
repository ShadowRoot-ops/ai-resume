// src/lib/pdfParser.ts
interface PDFParseResult {
  text: string;
  success: boolean;
  error?: string;
}

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

// Type guard to check if an item is a TextItem
function isTextItem(item: TextContentItem): item is TextItem {
  return "str" in item && typeof (item as TextItem).str === "string";
}

export async function extractTextFromPdf(
  pdfBuffer: Buffer
): Promise<PDFParseResult> {
  // Method 1: Try pdfjs-dist first (more reliable for builds)
  try {
    const pdfjsLib = await import("pdfjs-dist");

    // Configure worker for different environments
    if (typeof window === "undefined") {
      // Server-side - try multiple approaches for worker
      try {
        // Try to resolve the worker path
        const workerPath = require.resolve("pdfjs-dist/build/pdf.worker.js");
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
      } catch {
        // Fallback - disable worker for server-side rendering
        pdfjsLib.GlobalWorkerOptions.workerSrc = "";
      }
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
      // Remove disableWorker as it's not a valid property
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
    console.warn("pdfjs-dist failed, trying pdf-parse:", pdfjsError);

    // Method 2: Fallback to pdf-parse with careful error handling
    try {
      // Use dynamic import to prevent build-time issues
      const pdfParseModule = await import("pdf-parse");
      const pdfParse = pdfParseModule.default || pdfParseModule;

      // Use a minimal options object to avoid test file issues
      const data = await pdfParse(pdfBuffer, {
        // Parse all pages
        max: 0,
        // Minimal configuration to avoid test dependencies
        version: "default" as const,
      });

      return {
        text: data.text || "",
        success: true,
      };
    } catch (pdfParseError) {
      console.error("Both PDF parsing methods failed:", {
        pdfjsError,
        pdfParseError,
      });

      return {
        text: "[PDF content could not be extracted - please convert to DOC or TXT format]",
        success: false,
        error: `PDF parsing failed: ${
          pdfParseError instanceof Error
            ? pdfParseError.message
            : "Unknown error"
        }`,
      };
    }
  }
}

// Alternative simpler function for basic PDF extraction
export async function extractTextFromPdfSimple(
  pdfBuffer: Buffer
): Promise<PDFParseResult> {
  try {
    // Try only pdfjs-dist for simpler implementation
    const pdfjsLib = await import("pdfjs-dist");

    // Disable worker for server-side
    pdfjsLib.GlobalWorkerOptions.workerSrc = "";

    const pdf = await pdfjsLib.getDocument({
      data: pdfBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      // Remove disableWorker property
    }).promise;

    let fullText = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      // Fix the any types with proper typing
      const pageText = textContent.items
        .filter((item: TextContentItem): item is TextItem => isTextItem(item))
        .map((item: TextItem) => item.str)
        .join(" ");
      fullText += pageText + "\n";
    }

    return {
      text: fullText.trim(),
      success: true,
    };
  } catch (error) {
    console.error("PDF extraction failed:", error);
    return {
      text: "[Failed to extract PDF content. Please try converting to DOC or TXT format.]",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
