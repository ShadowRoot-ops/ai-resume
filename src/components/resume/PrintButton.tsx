// src/components/resume/PrintButton.tsx
"use client";

import React from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrintButtonProps {
  resumeElementId?: string;
}

export default function PrintButton({
  resumeElementId = "resume-container",
}: PrintButtonProps) {
  const handlePrint = () => {
    // Get the resume container element
    const resumeElement = document.getElementById(resumeElementId);

    if (!resumeElement) {
      console.error(`Element with ID "${resumeElementId}" not found`);
      alert("Resume content not found. Please try again.");
      return;
    }

    // Create a new window for printing
    const printWindow = window.open("", "_blank", "width=800,height=600");

    if (!printWindow) {
      alert("Please allow popups to print the resume.");
      return;
    }

    // Get the current page's styles
    const styleSheets = Array.from(document.styleSheets);
    let allStyles = "";

    // Try to extract CSS rules (some may be blocked by CORS)
    styleSheets.forEach((styleSheet) => {
      try {
        if (styleSheet.cssRules) {
          Array.from(styleSheet.cssRules).forEach((rule) => {
            allStyles += rule.cssText + "\n";
          });
        }
      } catch {
        // Handle CORS issues with external stylesheets
        if (styleSheet.href) {
          allStyles += `@import url("${styleSheet.href}");\n`;
        }
      }
    });

    // Add custom print styles
    const printStyles = `
      <style>
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        body {
          margin: 0;
          padding: 20px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
          background: white;
        }
        
        .resume-container {
          max-width: none;
          width: 100%;
          margin: 0;
          padding: 0;
          background: white;
          box-shadow: none;
          border: none;
        }
        
        /* Hide elements that shouldn't print */
        .print-hide,
        .print\\:hidden,
        button,
        .sidebar,
        nav,
        .navigation,
        .no-print {
          display: none !important;
        }
        
        /* Ensure proper page breaks */
        .page-break {
          page-break-before: always;
        }
        
        .avoid-break {
          page-break-inside: avoid;
        }
        
        /* Typography for print */
        h1 {
          font-size: 18px;
          margin-bottom: 8px;
          color: inherit;
        }
        
        h2 {
          font-size: 14px;
          margin-bottom: 6px;
          margin-top: 16px;
          color: inherit;
          border-bottom: 1px solid #333;
          padding-bottom: 2px;
        }
        
        h3 {
          font-size: 12px;
          margin-bottom: 4px;
          margin-top: 8px;
          font-weight: bold;
        }
        
        p {
          margin: 4px 0;
        }
        
        ul {
          margin: 4px 0;
          padding-left: 16px;
        }
        
        li {
          margin-bottom: 2px;
        }
        
        /* Contact info styling */
        .contact-info {
          text-align: center;
          margin-bottom: 16px;
        }
        
        /* Experience and education layout */
        .experience-item,
        .education-item {
          margin-bottom: 12px;
          page-break-inside: avoid;
        }
        
        .flex {
          display: flex;
        }
        
        .justify-between {
          justify-content: space-between;
        }
        
        .items-start {
          align-items: flex-start;
        }
        
        .font-bold {
          font-weight: bold;
        }
        
        .text-right {
          text-align: right;
        }
        
        .whitespace-nowrap {
          white-space: nowrap;
        }
        
        /* Skills styling */
        .skills-container {
          margin: 8px 0;
        }
        
        .skill-item {
          display: inline-block;
          margin-right: 8px;
          margin-bottom: 4px;
          padding: 2px 6px;
          background-color: #f0f0f0;
          border-radius: 3px;
          font-size: 10px;
        }
        
        /* Ensure colors print */
        .text-primary,
        [style*="color"] {
          color: inherit !important;
        }
        
        /* Page settings */
        @page {
          margin: 0.5in;
          size: letter;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          .resume-container {
            padding: 0;
          }
        }
      </style>
    `;

    // Write the HTML content to the print window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Resume - Print</title>
          ${printStyles}
          <style>${allStyles}</style>
        </head>
        <body>
          ${resumeElement.outerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();

        // Close the print window after printing (optional)
        setTimeout(() => {
          printWindow.close();
        }, 100);
      }, 250);
    };
  };

  return (
    <Button
      variant="outline"
      onClick={handlePrint}
      className="flex items-center gap-2"
    >
      <Printer size={16} />
      Print
    </Button>
  );
}
