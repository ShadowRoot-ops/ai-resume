// src/lib/pdf-generator.ts
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { colorPalettes } from "@/lib/resume-templates";
import { format } from "date-fns";
import { oklchToHex } from "@/lib/color-utils";

// Define types for better type safety
interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
}

interface Experience {
  position?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  responsibilities?: string[];
}

interface Education {
  degree?: string;
  fieldOfStudy?: string;
  institution?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  gpa?: string;
}

interface Project {
  name?: string;
  description?: string;
  technologies?: string;
  url?: string;
}

interface ResumeContent {
  personalInfo?: PersonalInfo;
  summary?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  projects?: Project[];
}

interface ResumeData {
  title?: string;
  fontFamily?: string;
  colorPaletteIndex?: number;
  content?: ResumeContent;
  // Legacy support - these might be at root level
  personalInfo?: PersonalInfo;
  summary?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  projects?: Project[];
}

export function generateResumePDF(resumeData: ResumeData): Blob {
  console.log("Resume data received:", resumeData);

  // Normalize the data structure
  const normalizedData: ResumeContent = {
    personalInfo: resumeData.content?.personalInfo || resumeData.personalInfo,
    summary: resumeData.content?.summary || resumeData.summary,
    experience: resumeData.content?.experience || resumeData.experience || [],
    education: resumeData.content?.education || resumeData.education || [],
    skills: resumeData.content?.skills || resumeData.skills || [],
    projects: resumeData.content?.projects || resumeData.projects || [],
  };

  // Validate that we have the required data
  if (!normalizedData.personalInfo?.name) {
    throw new Error("Invalid resume data format - missing personal info");
  }

  // Create PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Get color palette
  const colorPalette = colorPalettes[resumeData.colorPaletteIndex || 0];
  let primaryColorHex = colorPalette.primary;

  // Convert OKLCH to hex if needed
  if (primaryColorHex.includes("oklch")) {
    try {
      primaryColorHex = oklchToHex(primaryColorHex);
    } catch (error) {
      console.error("Error converting OKLCH to hex:", error);
      primaryColorHex = "#3b82f6"; // Fallback to blue
    }
  }

  const primaryColor = hexToRgb(primaryColorHex);

  // PDF settings
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  // Helper functions
  const formatDate = (
    dateString: string | null | undefined,
    formatPattern: string
  ): string => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), formatPattern);
    } catch (error) {
      console.error("Date formatting error:", error);
      return "";
    }
  };

  const checkPageBreak = (spaceNeeded: number = 15) => {
    if (yPos + spaceNeeded > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  const addSectionHeader = (title: string) => {
    checkPageBreak(15);
    yPos += 8;

    // Section title - matching the preview style
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.text(title, margin, yPos);

    // Underline - exactly like the preview
    doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);

    yPos += 8;
    doc.setTextColor(0, 0, 0);
  };

  // HEADER SECTION - Exactly matching the preview
  yPos += 5;

  // Name - centered, large, bold, colored (matching preview exactly)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);

  const nameText = normalizedData.personalInfo.name || "Your Name";
  const nameWidth =
    (doc.getStringUnitWidth(nameText) * 24) / doc.internal.scaleFactor;
  const nameX = (pageWidth - nameWidth) / 2;
  doc.text(nameText, nameX, yPos);
  yPos += 10;

  // Contact info - each item on separate line, centered, NO EMOJIS
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);

  // Email
  if (normalizedData.personalInfo.email) {
    const emailWidth =
      (doc.getStringUnitWidth(normalizedData.personalInfo.email) * 10) /
      doc.internal.scaleFactor;
    const emailX = (pageWidth - emailWidth) / 2;
    doc.text(normalizedData.personalInfo.email, emailX, yPos);
    yPos += 5;
  }

  // Phone
  if (normalizedData.personalInfo.phone) {
    const phoneWidth =
      (doc.getStringUnitWidth(normalizedData.personalInfo.phone) * 10) /
      doc.internal.scaleFactor;
    const phoneX = (pageWidth - phoneWidth) / 2;
    doc.text(normalizedData.personalInfo.phone, phoneX, yPos);
    yPos += 5;
  }

  // Location - with proper text wrapping to fill the space
  if (normalizedData.personalInfo.location) {
    const locationLines = doc.splitTextToSize(
      normalizedData.personalInfo.location,
      contentWidth
    );
    locationLines.forEach((line: string) => {
      const lineWidth =
        (doc.getStringUnitWidth(line) * 10) / doc.internal.scaleFactor;
      const lineX = (pageWidth - lineWidth) / 2;
      doc.text(line, lineX, yPos);
      yPos += 5;
    });
    yPos += 2; // Small gap before links
  }

  // Links on the same line
  const linkItems = [];
  if (normalizedData.personalInfo.linkedin) {
    linkItems.push(normalizedData.personalInfo.linkedin);
  }
  if (normalizedData.personalInfo.website) {
    linkItems.push(normalizedData.personalInfo.website);
  }

  if (linkItems.length > 0) {
    const linksLine = linkItems.join(" • ");
    const linksLineWidth =
      (doc.getStringUnitWidth(linksLine) * 10) / doc.internal.scaleFactor;
    const linksLineX = (pageWidth - linksLineWidth) / 2;
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.text(linksLine, linksLineX, yPos);
    yPos += 5;
  }

  // Reset text color
  doc.setTextColor(40, 40, 40);

  yPos += 10;

  // PROFESSIONAL SUMMARY SECTION - exactly like preview
  if (normalizedData.summary) {
    addSectionHeader("Professional Summary");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);

    const summaryLines = doc.splitTextToSize(
      normalizedData.summary,
      contentWidth
    );
    summaryLines.forEach((line: string) => {
      checkPageBreak(5);
      doc.text(line, margin, yPos);
      yPos += 5;
    });
    yPos += 5;
  }

  // EXPERIENCE SECTION - exactly matching preview layout
  if (normalizedData.experience && normalizedData.experience.length > 0) {
    addSectionHeader("Experience");

    normalizedData.experience.forEach((exp, index) => {
      checkPageBreak(25);

      // Job position and date on same line (like preview)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text(exp.position || "", margin, yPos);

      // Date on right side
      const startDate = exp.startDate
        ? formatDate(exp.startDate, "MMM yyyy")
        : "";
      const endDate = exp.current
        ? "Present"
        : exp.endDate
        ? formatDate(exp.endDate, "MMM yyyy")
        : "";
      const dateText = startDate && endDate ? `${startDate} - ${endDate}` : "";

      if (dateText) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        const dateWidth =
          (doc.getStringUnitWidth(dateText) * 10) / doc.internal.scaleFactor;
        doc.text(dateText, pageWidth - margin - dateWidth, yPos);
      }
      yPos += 5;

      // Company and location (like preview)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const companyText = `${exp.company || ""}${
        exp.location ? `, ${exp.location}` : ""
      }`;
      if (companyText.trim()) {
        doc.text(companyText, margin, yPos);
        yPos += 5;
      }

      // Responsibilities with bullets (exactly like preview)
      if (exp.responsibilities && exp.responsibilities.length > 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);

        exp.responsibilities.forEach((resp) => {
          checkPageBreak(8);
          yPos += 2;

          // Bullet point
          doc.text("•", margin + 5, yPos);

          // Responsibility text with proper wrapping
          const respLines = doc.splitTextToSize(resp, contentWidth - 15);
          respLines.forEach((line: string, lineIndex: number) => {
            if (lineIndex > 0) {
              yPos += 4;
              checkPageBreak(5);
            }
            doc.text(line, margin + 12, yPos);
          });
          yPos += 4;
        });
      }

      // Add spacing between experiences (like preview)
      if (index < normalizedData.experience!.length - 1) {
        yPos += 8;
      }
    });
    yPos += 5;
  }

  // EDUCATION SECTION - exactly matching preview
  if (normalizedData.education && normalizedData.education.length > 0) {
    addSectionHeader("Education");

    normalizedData.education.forEach((edu, index) => {
      checkPageBreak(15);

      // Degree and date on same line (like preview)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      const degreeText = `${edu.degree || ""}${
        edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""
      }`;
      doc.text(degreeText, margin, yPos);

      // Date on right
      const startDate = edu.startDate ? formatDate(edu.startDate, "yyyy") : "";
      const endDate = edu.current
        ? "Present"
        : edu.endDate
        ? formatDate(edu.endDate, "yyyy")
        : "";
      const dateText = startDate && endDate ? `${startDate} - ${endDate}` : "";

      if (dateText) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        const dateWidth =
          (doc.getStringUnitWidth(dateText) * 10) / doc.internal.scaleFactor;
        doc.text(dateText, pageWidth - margin - dateWidth, yPos);
      }
      yPos += 5;

      // Institution (like preview)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      if (edu.institution) {
        doc.text(edu.institution, margin, yPos);
        yPos += 4;
      }

      // GPA (like preview)
      if (edu.gpa) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`GPA: ${edu.gpa}`, margin, yPos);
        yPos += 4;
      }

      // Add spacing between education entries
      if (index < normalizedData.education!.length - 1) {
        yPos += 6;
      }
    });
    yPos += 5;
  }

  // SKILLS SECTION - exactly matching preview with pill-style badges
  if (normalizedData.skills && normalizedData.skills.length > 0) {
    addSectionHeader("Skills");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    let currentX = margin;
    const rowHeight = 6;
    const skillSpacing = 4;
    const skillPaddingX = 4;
    const skillPaddingY = 1.5;

    normalizedData.skills.forEach((skill) => {
      // Calculate skill width
      const textWidth =
        (doc.getStringUnitWidth(skill) * 9) / doc.internal.scaleFactor;
      const skillWidth = textWidth + skillPaddingX * 2;

      // Check if skill fits on current line
      if (currentX + skillWidth > pageWidth - margin) {
        currentX = margin;
        yPos += rowHeight + 2;
        checkPageBreak(8);
      }

      // Draw skill background (very light version of primary color - matching preview exactly)
      const lightR = Math.min(
        255,
        primaryColor.r + (255 - primaryColor.r) * 0.85
      );
      const lightG = Math.min(
        255,
        primaryColor.g + (255 - primaryColor.g) * 0.85
      );
      const lightB = Math.min(
        255,
        primaryColor.b + (255 - primaryColor.b) * 0.85
      );
      doc.setFillColor(lightR, lightG, lightB);

      // Draw rounded rectangle for skill badge (exactly like preview)
      doc.roundedRect(currentX, yPos - 3, skillWidth, rowHeight, 1.5, 1.5, "F");

      // Draw skill text in dark color (matching preview)
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text(skill, currentX + skillPaddingX, yPos + skillPaddingY);

      currentX += skillWidth + skillSpacing;
    });

    yPos += rowHeight + 8;
    doc.setTextColor(0, 0, 0); // Reset text color
  }

  // PROJECTS SECTION - exactly matching preview
  if (normalizedData.projects && normalizedData.projects.length > 0) {
    addSectionHeader("Projects");

    normalizedData.projects.forEach((project, index) => {
      checkPageBreak(20);

      // Project name (bold, like preview)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text(project.name || "", margin, yPos);
      yPos += 5;

      // Project description (like preview)
      if (project.description) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);

        const descLines = doc.splitTextToSize(
          project.description,
          contentWidth
        );
        descLines.forEach((line: string) => {
          checkPageBreak(5);
          doc.text(line, margin, yPos);
          yPos += 4;
        });
        yPos += 2;
      }

      // Technologies (with label, like preview)
      if (project.technologies) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text("Technologies: ", margin, yPos);

        const techLabelWidth =
          (doc.getStringUnitWidth("Technologies: ") * 10) /
          doc.internal.scaleFactor;
        doc.setFont("helvetica", "normal");
        doc.text(project.technologies, margin + techLabelWidth, yPos);
        yPos += 4;
      }

      // URL (colored link, like preview)
      if (project.url) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text("URL: ", margin, yPos);

        const urlLabelWidth =
          (doc.getStringUnitWidth("URL: ") * 10) / doc.internal.scaleFactor;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
        doc.textWithLink(project.url, margin + urlLabelWidth, yPos, {
          url: project.url,
        });
        yPos += 4;
      }

      // Add spacing between projects
      if (index < normalizedData.projects!.length - 1) {
        yPos += 8;
      }
    });
  }

  return doc.output("blob");
}

// Helper function to convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  hex = hex.replace("#", "");

  // Handle 8-character hex (with alpha)
  if (hex.length === 8) {
    hex = hex.substring(0, 6);
  }

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 59, g: 130, b: 246 }; // Default blue
}
