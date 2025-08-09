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

  // PDF download that captures the exact layout from the screen
  const handlePdfDownload = async () => {
    setIsLoading("pdf");

    try {
      // Get the resume element to be captured
      const resumeElement = document.querySelector(resumeElementSelector);

      if (!resumeElement) {
        throw new Error("Resume element not found");
      }

      // Use html2canvas to capture the resume as an image
      const canvas = await html2canvas(resumeElement as HTMLElement, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // Create a PDF with the same dimensions as A4
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Calculate the PDF dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate the aspect ratio to fit the image properly
      const canvasRatio = canvas.width / canvas.height;
      const pdfRatio = pdfWidth / pdfHeight;

      let finalWidth, finalHeight;

      if (canvasRatio > pdfRatio) {
        // If canvas is wider than PDF, fit to width
        finalWidth = pdfWidth;
        finalHeight = pdfWidth / canvasRatio;
      } else {
        // If canvas is taller than PDF, fit to height
        finalHeight = pdfHeight;
        finalWidth = pdfHeight * canvasRatio;
      }

      // Center the image
      const xOffset = (pdfWidth - finalWidth) / 2;
      const yOffset = (pdfHeight - finalHeight) / 2;

      // Add the image to the PDF
      pdf.addImage(imgData, "PNG", xOffset, yOffset, finalWidth, finalHeight);

      // Save the PDF
      pdf.save(`${safeTitle}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try another format.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleDocxDownload = async () => {
    setIsLoading("docx");

    try {
      // Fetch resume data first
      const response = await fetch(`/api/resumes/${resumeId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch resume data");
      }

      const data = await response.json();
      const resume = data.resume || data;

      // Get color palette
      const colorPaletteIndex = resume.colorPaletteIndex || 0;
      let primaryColor = "#4F46E5"; // Default color if not found

      try {
        // Try to import the color palettes
        const colorPalettesModule = await import("@/lib/resume-templates");
        primaryColor =
          colorPalettesModule.colorPalettes[colorPaletteIndex].primary;
      } catch (e) {
        console.warn("Could not load color palettes:", e);
      }

      // Create HTML that looks like the preview
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
    font-size: 11pt;
    line-height: 1.3;
  }
  .header {
    text-align: center;
    margin-bottom: 20px;
  }
  .name {
    font-size: 24pt;
    font-weight: bold;
    color: ${primaryColor};
    margin-bottom: 5pt;
  }
  .contact-info {
    font-size: 10pt;
    margin-bottom: 5pt;
  }
  .section-title {
    font-size: 14pt;
    font-weight: bold;
    color: ${primaryColor};
    border-bottom: 1px solid ${primaryColor};
    margin-top: 15pt;
    margin-bottom: 8pt;
    padding-bottom: 2pt;
  }
  .experience-item, .education-item {
    margin-bottom: 10pt;
  }
  .job-title, .degree {
    font-weight: bold;
  }
  .company-location, .institution {
    margin-top: 2pt;
  }
  .date {
    float: right;
    font-style: italic;
  }
  .responsibilities {
    margin-top: 5pt;
    margin-left: 15pt;
  }
  .skills-container {
    display: flex;
    flex-wrap: wrap;
    gap: 5pt;
    margin-top: 5pt;
  }
  .skill {
    background-color: ${primaryColor}20;
    padding: 2pt 5pt;
    border-radius: 3pt;
    font-size: 9pt;
  }
  .project {
    margin-bottom: 10pt;
  }
  .project-name {
    font-weight: bold;
  }
  .tech-label, .url-label {
    font-weight: bold;
    margin-right: 5pt;
  }
  li {
    margin-bottom: 3pt;
  }
</style>
</head>
<body>
  <!-- Header with Name -->
  <div class="header">
    <div class="name">${resume.content?.personalInfo?.name || "Your Name"}</div>
    <div class="contact-info">
      ${
        resume.content?.personalInfo?.email
          ? `📧 ${resume.content.personalInfo.email}`
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
  
  <!-- Summary -->
  ${
    resume.content?.summary
      ? `
  <div>
    <div class="section-title">Professional Summary</div>
    <p>${resume.content.summary}</p>
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
      .map((exp) => {
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
          ${exp.responsibilities.map((resp) => `<li>${resp}</li>`).join("")}
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
      .map((edu) => {
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
        ${edu.gpa ? `<div>GPA: ${edu.gpa}</div>` : ""}
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
        .map((skill) => `<span class="skill">${skill}</span>`)
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
        (project) => `
      <div class="project">
        <div class="project-name">${project.name || ""}</div>
        ${project.description ? `<p>${project.description}</p>` : ""}
        ${
          project.technologies
            ? `<p><span class="tech-label">Technologies:</span> ${project.technologies}</p>`
            : ""
        }
        ${
          project.url
            ? `<p><span class="url-label">URL:</span> <a href="${project.url}">${project.url}</a></p>`
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

      // Create a blob with the Word MIME type
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
      // Fetch resume data
      const response = await fetch(`/api/resumes/${resumeId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch resume data");
      }

      const data = await response.json();
      const resume = data.resume || data;

      // Generate simple text representation
      let textContent = "";

      // Name and contact info
      if (resume.content?.personalInfo?.name) {
        textContent += resume.content.personalInfo.name + "\n";
        textContent +=
          "=".repeat(resume.content.personalInfo.name.length) + "\n\n";
      }

      // Contact info on one line - using standard text format
      const contactParts = [];
      if (resume.content?.personalInfo?.email)
        contactParts.push(`Email: ${resume.content.personalInfo.email}`);
      if (resume.content?.personalInfo?.phone)
        contactParts.push(`Phone: ${resume.content.personalInfo.phone}`);
      if (resume.content?.personalInfo?.location)
        contactParts.push(`Location: ${resume.content.personalInfo.location}`);
      if (resume.content?.personalInfo?.linkedin)
        contactParts.push(`LinkedIn: ${resume.content.personalInfo.linkedin}`);
      if (resume.content?.personalInfo?.website)
        contactParts.push(`Website: ${resume.content.personalInfo.website}`);

      if (contactParts.length > 0) {
        textContent += contactParts.join(" | ") + "\n\n";
      }

      // Summary
      if (resume.content?.summary) {
        textContent += "PROFESSIONAL SUMMARY\n";
        textContent += "--------------------\n";
        textContent += resume.content.summary + "\n\n";
      }

      // Experience
      if (resume.content?.experience && resume.content.experience.length > 0) {
        textContent += "EXPERIENCE\n";
        textContent += "----------\n\n";

        resume.content.experience.forEach((exp) => {
          textContent += `${exp.position || ""}\n`;
          textContent += `${exp.company || ""}${
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
            textContent += "\n";
            exp.responsibilities.forEach((resp) => {
              textContent += `* ${resp}\n`;
            });
          }

          textContent += "\n";
        });
      }

      // Education
      if (resume.content?.education && resume.content.education.length > 0) {
        textContent += "EDUCATION\n";
        textContent += "---------\n\n";

        resume.content.education.forEach((edu) => {
          textContent += `${edu.degree || ""}${
            edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""
          }\n`;
          textContent += `${edu.institution || ""}\n`;

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

          textContent += "\n";
        });
      }

      // Skills
      if (resume.content?.skills && resume.content.skills.length > 0) {
        textContent += "SKILLS\n";
        textContent += "------\n\n";
        textContent += resume.content.skills.join(", ") + "\n\n";
      }

      // Projects
      if (resume.content?.projects && resume.content.projects.length > 0) {
        textContent += "PROJECTS\n";
        textContent += "--------\n\n";

        resume.content.projects.forEach((project) => {
          textContent += `${project.name || ""}\n`;

          if (project.description) {
            textContent += project.description + "\n";
          }

          if (project.technologies) {
            textContent += `Technologies: ${project.technologies}\n`;
          }

          if (project.url) {
            textContent += `URL: ${project.url}\n`;
          }

          textContent += "\n";
        });
      }

      // Create and download the text file
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

  // If any format is loading, show spinner on the main button
  const anyLoading = isLoading !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {anyLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download
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
