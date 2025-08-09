export type TemplateStyle = {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  headerStyle: string;
  sectionStyle: string;
};

// src/lib/resume-templates.ts

export interface ResumeTemplate {
  name: string;
  description: string;
  isDefault?: boolean;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent?: string;
}

export const resumeTemplates: Record<string, ResumeTemplate> = {
  professional: {
    name: "Professional",
    description: "Clean and modern design suitable for most industries",
    isDefault: true,
  },
  minimal: {
    name: "Minimal",
    description: "Simple and elegant with minimal styling",
  },
  executive: {
    name: "Executive",
    description: "Bold and authoritative for senior positions",
  },
  creative: {
    name: "Creative",
    description: "Stylish layout for creative and design roles",
  },
  technical: {
    name: "Technical",
    description: "Focused on skills and technical qualifications",
  },
};

export const colorPalettes: ColorPalette[] = [
  { primary: "#2563eb", secondary: "#1e40af" }, // Blue
  { primary: "#16a34a", secondary: "#15803d" }, // Green
  { primary: "#9333ea", secondary: "#7e22ce" }, // Purple
  { primary: "#dc2626", secondary: "#b91c1c" }, // Red
  { primary: "#0f172a", secondary: "#020617" }, // Dark
  { primary: "#475569", secondary: "#334155" }, // Slate
  { primary: "#f59e0b", secondary: "#d97706" }, // Amber
  { primary: "#0891b2", secondary: "#0e7490" }, // Cyan
];
