// src/lib/pdf-generator.ts
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { colorPalettes } from "@/lib/resume-templates";
import { format } from "date-fns";

export function generateResumePDF(resumeData: any): Blob {
  // Check if data is properly structured and fix if needed
  if (!resumeData.personalInfo && resumeData.content?.personalInfo) {
    // Restructure the data to match what the function expects
    resumeData = {
      ...resumeData,
      personalInfo: resumeData.content.personalInfo,
      summary: resumeData.content.summary,
      experience: resumeData.content.experience,
      education: resumeData.content.education,
      skills: resumeData.content.skills,
      projects: resumeData.content.projects,
    };
  }

  // Validate that we have the required data
  if (!resumeData.personalInfo) {
    console.error("Resume data doesn't have personalInfo", resumeData);
    throw new Error("Invalid resume data format");
  }

  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Get color palette (matches preview)
  const colorPalette = colorPalettes[resumeData.colorPaletteIndex || 0];
  const primaryColor = hexToRgb(colorPalette.primary);

  // Set font styles to match preview
  const normalFont = "helvetica";
  const boldFont = "helvetica";
  const fontSizeNormal = 10;
  const fontSizeHeading = 18;
  const fontSizeSubheading = 14;
  const fontSizeSmall = 9;

  // Calculate page margins and usable width
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;
  const contentWidth = pageWidth - margin * 2;

  // Current Y position
  let yPos = margin;

  // Helper function to safely format dates (matches preview)
  const formatDate = (
    dateString: string | null | undefined,
    formatPattern: string
  ): string => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), formatPattern);
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  // Add header section (centered like in preview)
  doc.setFont(boldFont, "bold");
  doc.setFontSize(fontSizeHeading);
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);

  const nameText = (resumeData.personalInfo.name || "Your Name").toUpperCase();
  const nameWidth =
    (doc.getStringUnitWidth(nameText) * fontSizeHeading) /
    doc.internal.scaleFactor;
  const nameX = (pageWidth - nameWidth) / 2;
  doc.text(nameText, nameX, yPos);
  yPos += 10;

  // Contact info (centered, no emojis to avoid encoding issues)
  doc.setFont(normalFont, "normal");
  doc.setFontSize(fontSizeNormal);
  doc.setTextColor(0, 0, 0);

  const contactInfoItems = [];
  if (resumeData.personalInfo.email)
    contactInfoItems.push(resumeData.personalInfo.email);
  if (resumeData.personalInfo.phone)
    contactInfoItems.push(resumeData.personalInfo.phone);
  if (resumeData.personalInfo.location)
    contactInfoItems.push(resumeData.personalInfo.location);
  if (resumeData.personalInfo.linkedin)
    contactInfoItems.push(resumeData.personalInfo.linkedin);
  if (resumeData.personalInfo.website)
    contactInfoItems.push(resumeData.personalInfo.website);

  // Join with separator and center
  if (contactInfoItems.length > 0) {
    const separator = " | ";

    // Check if all contact info fits on one line
    const fullContactLine = contactInfoItems.join(separator);
    const fullLineWidth =
      (doc.getStringUnitWidth(fullContactLine) * fontSizeNormal) /
      doc.internal.scaleFactor;

    if (fullLineWidth <= contentWidth) {
      // Single line, centered
      const contactLineX = (pageWidth - fullLineWidth) / 2;
      doc.text(fullContactLine, contactLineX, yPos);
      yPos += 6;
    } else {
      // Split into two lines
      const midPoint = Math.ceil(contactInfoItems.length / 2);
      const firstLine = contactInfoItems.slice(0, midPoint).join(separator);
      const secondLine = contactInfoItems.slice(midPoint).join(separator);

      // First line centered
      const firstLineWidth =
        (doc.getStringUnitWidth(firstLine) * fontSizeNormal) /
        doc.internal.scaleFactor;
      const firstLineX = (pageWidth - firstLineWidth) / 2;
      doc.text(firstLine, firstLineX, yPos);
      yPos += 5;

      // Second line centered
      const secondLineWidth =
        (doc.getStringUnitWidth(secondLine) * fontSizeNormal) /
        doc.internal.scaleFactor;
      const secondLineX = (pageWidth - secondLineWidth) / 2;
      doc.text(secondLine, secondLineX, yPos);
      yPos += 6;
    }
  }
  yPos += 8;

  // Helper function to add section headers (with underline like preview)
  const addSectionHeader = (title: string) => {
    // Add some space before section (except for first section)
    if (yPos > margin + 20) {
      yPos += 3;
    }

    doc.setFont(boldFont, "bold");
    doc.setFontSize(fontSizeSubheading);
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.text(title, margin, yPos);

    // Add underline that spans most of the width (like preview)
    doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.setLineWidth(0.2);
    doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);

    yPos += 8;
    doc.setTextColor(0, 0, 0);
  };

  // Add summary if it exists
  if (resumeData.summary) {
    addSectionHeader("Professional Summary");

    doc.setFont(normalFont, "normal");
    doc.setFontSize(fontSizeNormal);

    const summaryLines = doc.splitTextToSize(resumeData.summary, contentWidth);
    doc.text(summaryLines, margin, yPos);
    yPos += summaryLines.length * 5 + 8;
  }

  // Add experience if it exists
  if (resumeData.experience && resumeData.experience.length > 0) {
    addSectionHeader("Experience");

    for (const job of resumeData.experience) {
      // Check if we need a new page
      if (yPos > doc.internal.pageSize.height - 40) {
        doc.addPage();
        yPos = margin;
      }

      // Job position (bold)
      doc.setFont(boldFont, "bold");
      doc.setFontSize(fontSizeNormal);
      doc.text(job.position || "", margin, yPos);
      yPos += 5;

      // Company and location on left, dates on right (like preview)
      doc.setFont(normalFont, "normal");
      doc.setFontSize(fontSizeNormal);

      const companyText =
        job.company + (job.location ? `, ${job.location}` : "");

      // Format dates like in preview
      const startDate = job.startDate
        ? formatDate(job.startDate, "MMM yyyy")
        : "";
      const endDate = job.current
        ? "Present"
        : job.endDate
        ? formatDate(job.endDate, "MMM yyyy")
        : "";
      const dateText = `${startDate} - ${endDate}`;

      // Calculate positions for left-right alignment
      const dateWidth =
        (doc.getStringUnitWidth(dateText) * fontSizeNormal) /
        doc.internal.scaleFactor;
      const availableCompanyWidth = contentWidth - dateWidth - 10; // 10mm gap

      // Company text (truncate if too long)
      const companyLines = doc.splitTextToSize(
        companyText,
        availableCompanyWidth
      );
      doc.text(companyLines[0], margin, yPos); // Only use first line to maintain layout

      // Date text (right aligned)
      doc.text(dateText, pageWidth - margin - dateWidth, yPos);
      yPos += 7;

      // Responsibilities (bullet points like preview)
      if (job.responsibilities && job.responsibilities.length > 0) {
        doc.setFont(normalFont, "normal");
        doc.setFontSize(fontSizeNormal);

        for (const resp of job.responsibilities) {
          if (yPos > doc.internal.pageSize.height - 20) {
            doc.addPage();
            yPos = margin;
          }

          // Simple bullet point without special characters
          const bulletPoint = "• ";
          const respText = resp;
          const respLines = doc.splitTextToSize(respText, contentWidth - 10);

          // Add bullet to first line only
          doc.text(bulletPoint, margin + 2, yPos);
          doc.text(respLines[0], margin + 8, yPos);

          // Add remaining lines without bullet if text wraps
          if (respLines.length > 1) {
            for (let i = 1; i < respLines.length; i++) {
              yPos += 4;
              doc.text(respLines[i], margin + 8, yPos);
            }
          }

          yPos += 5;
        }
      }
      yPos += 6;
    }
  }

  // Add education if it exists
  if (resumeData.education && resumeData.education.length > 0) {
    if (yPos > doc.internal.pageSize.height - 50) {
      doc.addPage();
      yPos = margin;
    }

    addSectionHeader("Education");

    for (const edu of resumeData.education) {
      if (yPos > doc.internal.pageSize.height - 25) {
        doc.addPage();
        yPos = margin;
      }

      // Degree (bold, like preview)
      doc.setFont(boldFont, "bold");
      doc.setFontSize(fontSizeNormal);
      const degreeText =
        edu.degree + (edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : "");
      doc.text(degreeText, margin, yPos);
      yPos += 5;

      // Institution on left, dates on right (like preview)
      doc.setFont(normalFont, "normal");
      doc.setFontSize(fontSizeNormal);

      const institutionText =
        edu.institution + (edu.gpa ? ` | GPA: ${edu.gpa}` : "");

      // Education dates (like preview)
      const startDate = edu.startDate ? formatDate(edu.startDate, "yyyy") : "";
      const endDate = edu.current
        ? "Present"
        : edu.endDate
        ? formatDate(edu.endDate, "yyyy")
        : "";
      const dateText = `${startDate} - ${endDate}`;

      // Calculate positions for left-right alignment
      const dateWidth =
        (doc.getStringUnitWidth(dateText) * fontSizeNormal) /
        doc.internal.scaleFactor;
      const availableInstitutionWidth = contentWidth - dateWidth - 10; // 10mm gap

      // Institution text (truncate if too long)
      const institutionLines = doc.splitTextToSize(
        institutionText,
        availableInstitutionWidth
      );
      doc.text(institutionLines[0], margin, yPos); // Only use first line to maintain layout

      // Date text (right aligned)
      doc.text(dateText, pageWidth - margin - dateWidth, yPos);
      yPos += 10;
    }
  }

  // Add skills if they exist (with colored badges like preview)
  if (resumeData.skills && resumeData.skills.length > 0) {
    if (yPos > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPos = margin;
    }

    addSectionHeader("Skills");

    doc.setFont(normalFont, "normal");
    doc.setFontSize(fontSizeNormal);

    // Create a cleaner skills layout
    const skillsText = resumeData.skills.join(" • ");
    const skillsLines = doc.splitTextToSize(skillsText, contentWidth);
    doc.text(skillsLines, margin, yPos);
    yPos += skillsLines.length * 5 + 8;
  }

  // Add projects if available
  if (resumeData.projects && resumeData.projects.length > 0) {
    if (yPos > doc.internal.pageSize.height - 50) {
      doc.addPage();
      yPos = margin;
    }

    addSectionHeader("Projects");

    for (const project of resumeData.projects) {
      if (yPos > doc.internal.pageSize.height - 30) {
        doc.addPage();
        yPos = margin;
      }

      // Project name (bold)
      doc.setFont(boldFont, "bold");
      doc.setFontSize(fontSizeNormal);
      doc.text(project.name || "", margin, yPos);
      yPos += 5;

      // Project description
      doc.setFont(normalFont, "normal");
      doc.setFontSize(fontSizeNormal);

      if (project.description) {
        const descLines = doc.splitTextToSize(
          project.description,
          contentWidth
        );
        doc.text(descLines, margin, yPos);
        yPos += descLines.length * 4 + 2;
      }

      // Technologies
      if (project.technologies) {
        doc.setFont(normalFont, "bold");
        doc.text("Technologies: ", margin, yPos);

        const techWidth =
          (doc.getStringUnitWidth("Technologies: ") * fontSizeNormal) /
          doc.internal.scaleFactor;
        doc.setFont(normalFont, "normal");
        doc.text(project.technologies, margin + techWidth, yPos);
        yPos += 5;
      }

      // URL
      if (project.url) {
        doc.setFont(normalFont, "bold");
        doc.text("URL: ", margin, yPos);

        const urlLabelWidth =
          (doc.getStringUnitWidth("URL: ") * fontSizeNormal) /
          doc.internal.scaleFactor;
        doc.setFont(normalFont, "normal");
        doc.setTextColor(0, 0, 255); // Blue for URL
        doc.text(project.url, margin + urlLabelWidth, yPos);
        doc.setTextColor(0, 0, 0); // Reset to black
        yPos += 5;
      }

      yPos += 4;
    }
  }

  // Return the PDF as a blob
  return doc.output("blob");
}

// Helper function to convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}
