// src/components/resume/DownloadOptions.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, FileJson, Loader2 } from "lucide-react";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { oklchToHex } from "@/lib/color-utils";
import { generateResumePDF } from "@/lib/pdf-generator";

interface DownloadOptionsProps {
  resumeId: string;
  title?: string;
  resumeElementSelector?: string;
}

const DownloadOptions: React.FC<DownloadOptionsProps> = ({
  resumeId,
  title = "resume",
  resumeElementSelector = "#resume-container",
}) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Safe way to handle title processing
  const safeTitle = title ? title.replace(/[^a-zA-Z0-9]/g, "_") : "resume";

  // PDF download using the improved PDF generator
  const handlePdfDownload = async () => {
    setIsLoading("pdf");

    try {
      const response = await fetch(`/api/resumes/${resumeId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch resume data");
      }

      const data = await response.json();
      const resume = data.resume || data;

      console.log("Fetched resume data:", resume); // Debug log

      // Use the improved PDF generator
      const pdfBlob = generateResumePDF(resume);
      saveAs(pdfBlob, `${safeTitle}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);

      // Show user-friendly error message
      alert(
        "Failed to generate PDF. Please try the fallback method or contact support."
      );

      // Optional: Try fallback method
      console.log("Attempting fallback PDF generation...");
      try {
        await handlePdfDownloadFallback();
      } catch (fallbackError) {
        console.error("Fallback PDF generation also failed:", fallbackError);
        alert(
          "All PDF generation methods failed. Please try again later or contact support."
        );
      }
    } finally {
      setIsLoading(null);
    }
  };

  // Fallback PDF generation method using html2canvas (original method)
  const handlePdfDownloadFallback = async () => {
    let overrideStyle: HTMLStyleElement | null = null;
    let originalDisplay: string | null = null;

    try {
      const resumeElement = document.querySelector(resumeElementSelector);
      if (!resumeElement) {
        throw new Error("Resume element not found");
      }

      // Store original display and make sure element is visible
      originalDisplay = (resumeElement as HTMLElement).style.display;
      (resumeElement as HTMLElement).style.display = "block";

      // Create and inject override styles for OKLCH colors
      overrideStyle = createOklchOverrideStyles();
      document.head.appendChild(overrideStyle);

      // Wait for styles to apply
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Configure html2canvas with better options
      const canvas = await html2canvas(resumeElement as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        foreignObjectRendering: false,
        imageTimeout: 15000,
        removeContainer: true,
        onclone: (clonedDoc, clonedElement) => {
          // Apply additional overrides to the cloned document
          const clonedStyle = clonedDoc.createElement("style");
          clonedStyle.textContent = `
            * {
              color: rgb(15, 23, 42) !important;
              background-color: transparent !important;
            }
            h1, h2, h3, .text-primary {
              color: #3b82f6 !important;
            }
            .border-b {
              border-bottom-color: #3b82f6 !important;
            }
            [style*="oklch"] {
              color: #3b82f6 !important;
            }
            /* Fix skills styling in canvas */
            .skills-container span,
            [class*="skill"] {
              background-color: rgba(59, 130, 246, 0.1) !important;
              color: #1e293b !important;
              border: 1px solid rgba(59, 130, 246, 0.2) !important;
            }
          `;
          clonedDoc.head.appendChild(clonedStyle);
          return clonedElement;
        },
        ignoreElements: (element) => {
          return (
            element.tagName === "SCRIPT" ||
            element.tagName === "NOSCRIPT" ||
            element.classList.contains("print-hide") ||
            (element instanceof HTMLElement && element.style.display === "none")
          );
        },
      });

      // Create PDF with proper dimensions
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      // Calculate dimensions to fit A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasRatio = canvas.width / canvas.height;
      const pdfRatio = pdfWidth / pdfHeight;

      let finalWidth, finalHeight;

      if (canvasRatio > pdfRatio) {
        finalWidth = pdfWidth;
        finalHeight = pdfWidth / canvasRatio;
      } else {
        finalHeight = pdfHeight;
        finalWidth = pdfHeight * canvasRatio;
      }

      // Center the image
      const xOffset = (pdfWidth - finalWidth) / 2;
      const yOffset = (pdfHeight - finalHeight) / 2;

      // Add image to PDF
      pdf.addImage(
        imgData,
        "PNG",
        xOffset,
        yOffset,
        finalWidth,
        finalHeight,
        undefined,
        "FAST"
      );

      // Save the PDF
      pdf.save(`${safeTitle}.pdf`);
    } catch (error) {
      console.error("Error generating PDF with fallback method:", error);
      throw error; // Re-throw to be handled by caller
    } finally {
      // Cleanup
      if (overrideStyle && overrideStyle.parentNode) {
        overrideStyle.parentNode.removeChild(overrideStyle);
      }

      // Restore original display
      if (originalDisplay !== null) {
        const resumeElement = document.querySelector(resumeElementSelector);
        if (resumeElement) {
          (resumeElement as HTMLElement).style.display = originalDisplay;
        }
      }
    }
  };

  // Create comprehensive CSS override for OKLCH colors (for fallback method)
  const createOklchOverrideStyles = (): HTMLStyleElement => {
    const style = document.createElement("style");
    style.id = "oklch-override-styles";

    const resumeElement = document.querySelector(resumeElementSelector);
    if (!resumeElement) {
      console.warn("Resume element not found for OKLCH override");
      return style;
    }

    // Get all elements within the resume container
    const allElements = resumeElement.querySelectorAll("*");
    const oklchColors = new Set<string>();

    // Function to extract OKLCH colors from CSS text
    const extractOklchColors = (cssText: string) => {
      const oklchRegex = /oklch\([^)]+\)/gi;
      const matches = cssText.match(oklchRegex);
      if (matches) {
        matches.forEach((match) => oklchColors.add(match));
      }
    };

    // Check all stylesheets
    try {
      Array.from(document.styleSheets).forEach((sheet) => {
        try {
          if (sheet.cssRules) {
            Array.from(sheet.cssRules).forEach((rule) => {
              if (rule instanceof CSSStyleRule) {
                extractOklchColors(rule.cssText);
              }
            });
          }
        } catch (e) {
          console.warn("Could not access stylesheet:", e);
        }
      });
    } catch (e) {
      console.warn("Error accessing stylesheets:", e);
    }

    // Check computed styles of all elements
    allElements.forEach((element) => {
      try {
        const computedStyle = window.getComputedStyle(element);
        const properties = [
          "color",
          "backgroundColor",
          "borderColor",
          "borderTopColor",
          "borderRightColor",
          "borderBottomColor",
          "borderLeftColor",
          "boxShadow",
          "textShadow",
          "fill",
          "stroke",
        ];

        properties.forEach((prop) => {
          const value = computedStyle.getPropertyValue(prop);
          if (value && value.includes("oklch")) {
            extractOklchColors(value);
          }
        });

        if (element instanceof HTMLElement && element.style.cssText) {
          extractOklchColors(element.style.cssText);
        }
      } catch (e) {
        console.warn("Could not access element styles:", e);
      }
    });

    // Create CSS rules to override OKLCH colors
    let cssRules = `
      ${resumeElementSelector} {
        --tw-text-opacity: 1 !important;
        --tw-bg-opacity: 1 !important;
        --tw-border-opacity: 1 !important;
        --primary: #3b82f6 !important;
        --primary-foreground: #ffffff !important;
        --secondary: #f1f5f9 !important;
        --secondary-foreground: #0f172a !important;
        --muted: #f1f5f9 !important;
        --muted-foreground: #64748b !important;
        --accent: #f1f5f9 !important;
        --accent-foreground: #0f172a !important;
        --destructive: #ef4444 !important;
        --destructive-foreground: #ffffff !important;
        --border: #e2e8f0 !important;
        --input: #e2e8f0 !important;
        --ring: #3b82f6 !important;
        --background: #ffffff !important;
        --foreground: #0f172a !important;
        --card: #ffffff !important;
        --card-foreground: #0f172a !important;
        --popover: #ffffff !important;
        --popover-foreground: #0f172a !important;
      }
    `;

    // Convert each found OKLCH color to hex and create override rules
    oklchColors.forEach((oklchColor) => {
      try {
        const hexColor = oklchToHex(oklchColor);
        // Escape special regex characters in the OKLCH color string
        const escapedOklch = oklchColor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        cssRules += `
          ${resumeElementSelector} *[style*="${escapedOklch}"] {
            color: ${hexColor} !important;
            background-color: ${hexColor} !important;
            border-color: ${hexColor} !important;
            fill: ${hexColor} !important;
            stroke: ${hexColor} !important;
          }
        `;
      } catch (e) {
        console.warn(`Failed to convert OKLCH color ${oklchColor}:`, e);
      }
    });

    // Add global fallback rules with improved skills styling
    cssRules += `
      ${resumeElementSelector} * {
        color: rgb(15, 23, 42) !important;
        background-color: transparent !important;
      }
      
      ${resumeElementSelector} h1, 
      ${resumeElementSelector} h2, 
      ${resumeElementSelector} h3,
      ${resumeElementSelector} .text-primary,
      ${resumeElementSelector} [style*="color: oklch"] {
        color: #3b82f6 !important;
      }
      
      ${resumeElementSelector} [style*="border-color: oklch"] {
        border-color: #3b82f6 !important;
      }
      
      ${resumeElementSelector} [style*="background-color: oklch"] {
        background-color: rgba(59, 130, 246, 0.1) !important;
      }

      /* Specific fixes for skills section */
      ${resumeElementSelector} .skills-container span,
      ${resumeElementSelector} [class*="skill"],
      ${resumeElementSelector} .flex.flex-wrap.gap-2 > span {
        background-color: rgba(59, 130, 246, 0.1) !important;
        color: #1e293b !important;
        border: 1px solid rgba(59, 130, 246, 0.2) !important;
      }
    `;

    style.textContent = cssRules;
    return style;
  };

  const handleDocxDownload = async () => {
    setIsLoading("docx");

    try {
      const response = await fetch(`/api/resumes/${resumeId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch resume data");
      }

      const data = await response.json();
      const resume = data.resume || data;

      // Get color palette and convert to hex
      const colorPaletteIndex = resume.colorPaletteIndex || 0;
      let primaryColor = "#4F46E5"; // Default color

      try {
        const colorPalettesModule = await import("@/lib/resume-templates");
        const originalColor =
          colorPalettesModule.colorPalettes[colorPaletteIndex].primary;

        // Convert OKLCH to hex if needed
        primaryColor = originalColor.startsWith("oklch")
          ? oklchToHex(originalColor)
          : originalColor;
      } catch (e) {
        console.warn("Could not load color palettes:", e);
      }

      // Create HTML content for Word document with improved styling
      const htmlContent = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>${resume.title || "Resume"}</title>
<style>
  body {
    font-family: "${resume.fontFamily || "Calibri"}", Arial, sans-serif;
    margin: 1in;
    font-size: 12pt;
    line-height: 1.4;
    color: #333;
  }
  .header {
    text-align: center;
    margin-bottom: 25px;
  }
  .name {
    font-size: 28pt;
    font-weight: bold;
    color: ${primaryColor};
    margin-bottom: 8pt;
    text-transform: uppercase;
  }
  .contact-info {
    font-size: 11pt;
    margin-bottom: 6pt;
    color: #666;
  }
  .section-title {
    font-size: 16pt;
    font-weight: bold;
    color: ${primaryColor};
    border-bottom: 2px solid ${primaryColor};
    margin-top: 20pt;
    margin-bottom: 12pt;
    padding-bottom: 3pt;
    text-transform: uppercase;
  }
  .experience-item, .education-item {
    margin-bottom: 15pt;
  }
  .job-title, .degree {
    font-weight: bold;
    font-size: 13pt;
    color: #222;
  }
  .company-location, .institution {
    margin-top: 3pt;
    color: #666;
  }
  .date {
    float: right;
    font-style: italic;
    color: #666;
  }
  .responsibilities {
    margin-top: 8pt;
    margin-left: 20pt;
  }
  .responsibilities li {
    margin-bottom: 4pt;
    line-height: 1.3;
  }
  .skills-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8pt;
    margin-top: 8pt;
  }
  .skill {
    background-color: ${primaryColor}20;
    color: #1e293b;
    padding: 4pt 8pt;
    border-radius: 4pt;
    font-size: 10pt;
    border: 1px solid ${primaryColor}30;
  }
  .project {
    margin-bottom: 15pt;
  }
  .project-name {
    font-weight: bold;
    font-size: 13pt;
    color: #222;
  }
  .tech-label, .url-label {
    font-weight: bold;
    margin-right: 6pt;
    color: #666;
  }
  li {
    margin-bottom: 4pt;
  }
  .summary-text {
    font-size: 12pt;
    line-height: 1.4;
    color: #444;
    text-align: justify;
  }
  .summary-bullet {
    color: #f43f5e;
    margin-right: 8pt;
  }
</style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="name">${resume.content?.personalInfo?.name || "Your Name"}</div>
    <div class="contact-info">
      ${
        resume.content?.personalInfo?.email
          ? `✉ ${resume.content.personalInfo.email}`
          : ""
      }
      ${
        resume.content?.personalInfo?.phone
          ? ` • 📱 ${resume.content.personalInfo.phone}`
          : ""
      }
      ${
        resume.content?.personalInfo?.location
          ? ` • 📍 ${resume.content.personalInfo.location}`
          : ""
      }
    </div>
    <div class="contact-info">
      ${
        resume.content?.personalInfo?.linkedin
          ? `🔗 ${resume.content.personalInfo.linkedin}`
          : ""
      }
      ${
        resume.content?.personalInfo?.website
          ? ` • 🌐 ${resume.content.personalInfo.website}`
          : ""
      }
    </div>
  </div>
  
  <!-- Summary with bullet -->
  ${
    resume.content?.summary
      ? `
  <div style="margin-bottom: 20pt;">
    <span class="summary-bullet">•</span><span class="summary-text">${resume.content.summary}</span>
  </div>`
      : ""
  }
  
  <!-- Professional Summary -->
  ${
    resume.content?.summary && resume.content.summary.length > 200
      ? `
  <div>
    <div class="section-title">Professional Summary</div>
    <div class="summary-text">${resume.content.summary}</div>
  </div>`
      : ""
  }
  
  <!-- Experience -->
  ${
    resume.content?.experience && resume.content.experience.length > 0
      ? `
  <div>
    <div class="section-title">Experience</div>
    ${resume.content.experience
      .map((exp: any) => {
        const startDate = exp.startDate
          ? new Date(exp.startDate).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })
          : "";
        const endDate = exp.current
          ? "Present"
          : exp.endDate
          ? new Date(exp.endDate).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })
          : "";
        const dateRange = [startDate, endDate].filter(Boolean).join(" - ");

        return `
      <div class="experience-item">
        <div>
          <span class="job-title">${exp.position || ""}</span>
          <span class="date">${dateRange}</span>
        </div>
        <div class="company-location">
          ${exp.company || ""}${exp.location ? `, ${exp.location}` : ""}
        </div>
        ${
          exp.responsibilities && exp.responsibilities.length > 0
            ? `
        <ul class="responsibilities">
          ${exp.responsibilities
            .map((resp: string) => `<li>${resp}</li>`)
            .join("")}
        </ul>`
            : ""
        }
      </div>
    `;
      })
      .join("")}
  </div>`
      : ""
  }
  
  <!-- Education -->
  ${
    resume.content?.education && resume.content.education.length > 0
      ? `
  <div>
    <div class="section-title">Education</div>
    ${resume.content.education
      .map((edu: any) => {
        const startDate = edu.startDate
          ? new Date(edu.startDate).getFullYear().toString()
          : "";
        const endDate = edu.current
          ? "Present"
          : edu.endDate
          ? new Date(edu.endDate).getFullYear().toString()
          : "";
        const dateRange = [startDate, endDate].filter(Boolean).join(" - ");

        return `
      <div class="education-item">
        <div>
          <span class="degree">${edu.degree || ""}${
          edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""
        }</span>
          <span class="date">${dateRange}</span>
        </div>
        <div class="institution">${edu.institution || ""}</div>
        ${
          edu.gpa
            ? `<div style="color: #666; margin-top: 2pt;">GPA: ${edu.gpa}</div>`
            : ""
        }
      </div>
    `;
      })
      .join("")}
  </div>`
      : ""
  }
  
  <!-- Skills -->
  ${
    resume.content?.skills && resume.content.skills.length > 0
      ? `
  <div>
    <div class="section-title">Skills</div>
    <div class="skills-container">
      ${resume.content.skills
        .map((skill: string) => `<span class="skill">${skill}</span>`)
        .join("")}
    </div>
  </div>`
      : ""
  }
  
  <!-- Projects -->
  ${
    resume.content?.projects && resume.content.projects.length > 0
      ? `
  <div>
    <div class="section-title">Projects</div>
    ${resume.content.projects
      .map(
        (project: any) => `
      <div class="project">
        <div class="project-name">${project.name || ""}</div>
        ${
          project.description
            ? `<p style="margin-top: 4pt; color: #444;">${project.description}</p>`
            : ""
        }
        ${
          project.technologies
            ? `<p style="margin-top: 6pt;"><span class="tech-label">Technologies:</span> ${project.technologies}</p>`
            : ""
        }
        ${
          project.url
            ? `<p style="margin-top: 4pt;"><span class="url-label">URL:</span> <a href="${project.url}" style="color: ${primaryColor};">${project.url}</a></p>`
            : ""
        }
      </div>
    `
      )
      .join("")}
  </div>`
      : ""
  }
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: "application/msword" });
      saveAs(blob, `${safeTitle}.doc`);
    } catch (error) {
      console.error("Error generating DOCX:", error);
      alert("Failed to generate DOCX. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleTextDownload = async () => {
    setIsLoading("text");

    try {
      const response = await fetch(`/api/resumes/${resumeId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch resume data");
      }

      const data = await response.json();
      const resume = data.resume || data;

      // Generate text content with better formatting
      let textContent = "";

      // Name and contact info
      if (resume.content?.personalInfo?.name) {
        textContent += resume.content.personalInfo.name.toUpperCase() + "\n";
        textContent +=
          "=".repeat(resume.content.personalInfo.name.length) + "\n\n";
      }

      // Contact info with better formatting
      const contactParts = [];
      if (resume.content?.personalInfo?.email)
        contactParts.push(`Email: ${resume.content.personalInfo.email}`);
      if (resume.content?.personalInfo?.phone)
        contactParts.push(`Phone: ${resume.content.personalInfo.phone}`);
      if (resume.content?.personalInfo?.location)
        contactParts.push(`Location: ${resume.content.personalInfo.location}`);

      if (contactParts.length > 0) {
        textContent += contactParts.join(" | ") + "\n";
      }

      const linkParts = [];
      if (resume.content?.personalInfo?.linkedin)
        linkParts.push(`LinkedIn: ${resume.content.personalInfo.linkedin}`);
      if (resume.content?.personalInfo?.website)
        linkParts.push(`Website: ${resume.content.personalInfo.website}`);

      if (linkParts.length > 0) {
        textContent += linkParts.join(" | ") + "\n";
      }

      textContent += "\n";

      // Summary
      if (resume.content?.summary) {
        textContent += "PROFESSIONAL SUMMARY\n";
        textContent += "====================\n";
        textContent += "• " + resume.content.summary + "\n\n";
      }

      // Experience
      if (resume.content?.experience && resume.content.experience.length > 0) {
        textContent += "EXPERIENCE\n";
        textContent += "==========\n\n";

        resume.content.experience.forEach((exp: any) => {
          textContent += `${exp.position || "Position"}\n`;
          textContent += `${exp.company || "Company"}${
            exp.location ? `, ${exp.location}` : ""
          }\n`;

          const startDate = exp.startDate
            ? new Date(exp.startDate).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })
            : "";
          const endDate = exp.current
            ? "Present"
            : exp.endDate
            ? new Date(exp.endDate).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })
            : "";
          const dateRange = [startDate, endDate].filter(Boolean).join(" - ");

          if (dateRange) {
            textContent += dateRange + "\n";
          }

          if (exp.responsibilities && exp.responsibilities.length > 0) {
            textContent += "\nKey Responsibilities:\n";
            exp.responsibilities.forEach((resp: string) => {
              textContent += `• ${resp}\n`;
            });
          }

          textContent += "\n" + "-".repeat(50) + "\n\n";
        });
      }

      // Education
      if (resume.content?.education && resume.content.education.length > 0) {
        textContent += "EDUCATION\n";
        textContent += "=========\n\n";

        resume.content.education.forEach((edu: any) => {
          textContent += `${edu.degree || "Degree"}${
            edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""
          }\n`;
          textContent += `${edu.institution || "Institution"}\n`;

          const startDate = edu.startDate
            ? new Date(edu.startDate).getFullYear().toString()
            : "";
          const endDate = edu.current
            ? "Present"
            : edu.endDate
            ? new Date(edu.endDate).getFullYear().toString()
            : "";
          const dateRange = [startDate, endDate].filter(Boolean).join(" - ");

          if (dateRange) {
            textContent += dateRange + "\n";
          }

          if (edu.gpa) {
            textContent += `GPA: ${edu.gpa}\n`;
          }

          textContent += "\n" + "-".repeat(30) + "\n\n";
        });
      }

      // Skills
      if (resume.content?.skills && resume.content.skills.length > 0) {
        textContent += "SKILLS\n";
        textContent += "======\n\n";

        // Format skills in columns for better readability
        const skillsPerLine = 4;
        for (let i = 0; i < resume.content.skills.length; i += skillsPerLine) {
          const skillLine = resume.content.skills
            .slice(i, i + skillsPerLine)
            .join(" • ");
          textContent += skillLine + "\n";
        }
        textContent += "\n";
      }

      // Projects
      if (resume.content?.projects && resume.content.projects.length > 0) {
        textContent += "PROJECTS\n";
        textContent += "========\n\n";

        resume.content.projects.forEach((project: any) => {
          textContent += `${project.name || "Project Name"}\n`;

          if (project.description) {
            textContent += `Description: ${project.description}\n`;
          }

          if (project.technologies) {
            textContent += `Technologies: ${project.technologies}\n`;
          }

          if (project.url) {
            textContent += `URL: ${project.url}\n`;
          }

          textContent += "\n" + "-".repeat(30) + "\n\n";
        });
      }

      const blob = new Blob([textContent], {
        type: "text/plain;charset=utf-8",
      });
      saveAs(blob, `${safeTitle}.txt`);
    } catch (error) {
      console.error("Error generating text file:", error);
      alert("Failed to generate text file. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const anyLoading = isLoading !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={anyLoading}>
          {anyLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {anyLoading ? `${isLoading?.toUpperCase()}...` : "Download"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handlePdfDownload} disabled={anyLoading}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Download as PDF</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDocxDownload} disabled={anyLoading}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Download as DOCX</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTextDownload} disabled={anyLoading}>
          <FileJson className="mr-2 h-4 w-4" />
          <span>Download as Text</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DownloadOptions;
