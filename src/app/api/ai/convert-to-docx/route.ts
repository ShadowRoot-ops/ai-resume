// src/app/api/convert-to-docx/route.ts
import { NextRequest, NextResponse } from "next/server";
import HTMLtoDOCX from "html-to-docx";

export async function POST(request: NextRequest) {
  try {
    const { html, title } = await request.json();

    if (!html) {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 }
      );
    }

    // Clean the HTML to remove unwanted elements and improve DOCX output
    const cleanHTML = cleanHTMLForDOCX(html);

    // Configure the options for the document - optimized for single page
    const options = {
      title: title || "Resume",
      orientation: "portrait" as const,
      margins: {
        top: 540, // 0.375 inch (smaller margins for more content)
        right: 540,
        bottom: 540,
        left: 540,
      },
      font: {
        family: "Calibri",
        size: 10, // Smaller base font size
      },
      pageSize: {
        width: 12240, // 8.5 inches in twips
        height: 15840, // 11 inches in twips
      },
      // Optimized styling for single page
      styles: {
        default: {
          document: {
            run: {
              font: "Calibri",
              size: 20, // 10pt in half-points (smaller font)
            },
            paragraph: {
              spacing: {
                after: 60, // 3pt spacing (reduced from 6pt)
                before: 0, // No spacing before paragraphs
                line: 240, // 1.2 line spacing (240 = 1.2 * 240)
              },
            },
          },
        },
      },
    };

    // Generate the DOCX file
    const docxBuffer = await HTMLtoDOCX(cleanHTML, null, options);

    // Return the buffer as a blob
    return new NextResponse(docxBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${
          title || "resume"
        }.docx"`,
        "Content-Length": docxBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error converting HTML to DOCX:", error);
    return NextResponse.json(
      { error: "Failed to convert HTML to DOCX" },
      { status: 500 }
    );
  }
}

// Function to clean HTML for better DOCX conversion
function cleanHTMLForDOCX(html: string): string {
  // Remove unwanted classes and elements that don't convert well
  const cleanedHTML = html
    // Remove print-specific classes
    .replace(/class="[^"]*print[^"]*"/g, "")
    // Remove sidebar and navigation elements - using [\s\S]*? instead of .*? with s flag
    .replace(/<div[^>]*class="[^"]*sidebar[^"]*"[^>]*>[\s\S]*?<\/div>/g, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/g, "")
    .replace(/<button[^>]*>[\s\S]*?<\/button>/g, "")
    .replace(/<a[^>]*class="[^"]*button[^"]*"[^>]*>[\s\S]*?<\/a>/g, "")
    // Remove complex CSS that doesn't translate well
    .replace(/style="[^"]*transform[^"]*"/g, "")
    .replace(/style="[^"]*transition[^"]*"/g, "")
    .replace(/style="[^"]*shadow[^"]*"/g, "")
    // Clean up Tailwind classes that don't convert well
    .replace(/class="[^"]*hover:[^"]*"/g, "")
    .replace(/class="[^"]*focus:[^"]*"/g, "")
    .replace(/class="[^"]*active:[^"]*"/g, "")
    // Remove script tags - using [\s\S]*? instead of .*? with s flag
    .replace(/<script[^>]*>[\s\S]*?<\/script>/g, "")
    // Remove style tags with complex CSS - using [\s\S]*? instead of .*? with s flag
    .replace(/<style[^>]*>[\s\S]*?<\/style>/g, "");

  // Add basic styling for better DOCX output - optimized for single page
  const styledHTML = `
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Calibri, Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.1;
            margin: 0;
            padding: 0;
          }
          
          h1 {
            color: #2563eb;
            margin: 0 0 6px 0;
            font-size: 16pt;
            text-align: center;
            font-weight: bold;
          }
          
          h2 {
            color: #2563eb;
            font-size: 12pt;
            border-bottom: 1px solid #2563eb;
            padding-bottom: 1px;
            margin: 8px 0 4px 0;
            font-weight: bold;
          }
          
          h3 {
            font-size: 10pt;
            margin: 4px 0 2px 0;
            font-weight: bold;
          }
          
          .contact-info {
            text-align: center;
            margin: 4px 0 12px 0;
            font-size: 9pt;
          }
          
          .section {
            margin-bottom: 8px;
          }
          
          .experience-item, .education-item, .project-item {
            margin-bottom: 6px;
          }
          
          .experience-header, .education-header {
            margin-bottom: 2px;
          }
          
          .position, .degree {
            font-weight: bold;
            font-size: 10pt;
            margin: 0;
          }
          
          .company, .institution {
            margin: 0 0 2px 0;
            font-size: 9pt;
          }
          
          .date {
            font-style: italic;
            font-size: 9pt;
            float: right;
          }
          
          ul {
            margin: 2px 0 4px 0;
            padding-left: 16px;
          }
          
          li {
            margin-bottom: 1px;
            font-size: 9pt;
            line-height: 1.1;
          }
          
          .skills {
            margin: 4px 0;
          }
          
          .skill-list {
            font-size: 9pt;
            line-height: 1.2;
          }
          
          p {
            margin: 2px 0;
            font-size: 9pt;
            line-height: 1.1;
          }
          
          .summary {
            margin-bottom: 8px;
            text-align: justify;
            font-size: 9pt;
            line-height: 1.1;
          }
          
          /* Ensure content stays compact */
          .compact {
            margin: 0;
            padding: 0;
          }
          
          /* Minimize spacing for single page */
          * {
            margin-top: 0;
          }
          
          .flex-between {
            display: table;
            width: 100%;
          }
          
          .flex-between .left {
            display: table-cell;
            width: 70%;
          }
          
          .flex-between .right {
            display: table-cell;
            width: 30%;
            text-align: right;
            vertical-align: top;
          }
        </style>
      </head>
      <body>
        ${cleanedHTML}
      </body>
    </html>
  `;

  return styledHTML;
}

// Next.js API configuration
export const runtime = "nodejs";
