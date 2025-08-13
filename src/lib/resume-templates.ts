// src/lib/resume-templates.ts
export type TemplateStyle = {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  headerStyle: string;
  sectionStyle: string;
};

export interface ResumeTemplate {
  name: string;
  description: string;
  isDefault?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  headerStyle?: string;
  sectionStyle?: string;
}

export interface ColorPalette {
  name: string;
  primary: string;
  secondary: string;
  accent?: string;
}

export const resumeTemplates = {
  professional: {
    name: "Professional",
    description: "Clean and modern design suitable for most industries",
    isDefault: true,
    primaryColor: "#2563eb",
    secondaryColor: "#1e40af",
    accentColor: "#3b82f6",
    fontFamily: "Arial, sans-serif",
    headerStyle: "border-b pb-2",
    sectionStyle: "uppercase tracking-wide text-xs font-bold",
  },
  minimal: {
    name: "Minimal",
    description: "Simple and elegant with minimal styling",
    primaryColor: "#0f172a",
    secondaryColor: "#475569",
    accentColor: "#94a3b8",
    fontFamily: "Georgia, serif",
    headerStyle: "border-b pb-2",
    sectionStyle: "text-sm font-semibold",
  },
  executive: {
    name: "Executive",
    description: "Bold and authoritative for senior positions",
    primaryColor: "#9333ea",
    secondaryColor: "#7e22ce",
    accentColor: "#a855f7",
    fontFamily: "Times New Roman, serif",
    headerStyle: "border-b pb-2",
    sectionStyle: "uppercase tracking-wide text-xs font-bold",
  },
  creative: {
    name: "Creative",
    description: "Stylish layout for creative and design roles",
    primaryColor: "#dc2626",
    secondaryColor: "#b91c1c",
    accentColor: "#ef4444",
    fontFamily: "Comic Sans MS, cursive",
    headerStyle: "border-b pb-2",
    sectionStyle: "italic text-sm",
  },
  technical: {
    name: "Technical",
    description: "Focused on skills and technical qualifications",
    primaryColor: "#0891b2",
    secondaryColor: "#0e7490",
    accentColor: "#06b6d4",
    fontFamily: "Courier New, monospace",
    headerStyle: "border-b pb-2",
    sectionStyle: "text-sm font-semibold",
  },
} as const satisfies Record<string, ResumeTemplate>;

export const colorPalettes: ColorPalette[] = [
  { name: "Blue", primary: "#2563eb", secondary: "#1e40af", accent: "#3b82f6" },
  {
    name: "Green",
    primary: "#16a34a",
    secondary: "#15803d",
    accent: "#22c55e",
  },
  {
    name: "Purple",
    primary: "#9333ea",
    secondary: "#7e22ce",
    accent: "#a855f7",
  },
  { name: "Red", primary: "#dc2626", secondary: "#b91c1c", accent: "#ef4444" },
  { name: "Dark", primary: "#0f172a", secondary: "#020617", accent: "#1e293b" },
  {
    name: "Slate",
    primary: "#475569",
    secondary: "#334155",
    accent: "#64748b",
  },
  {
    name: "Amber",
    primary: "#f59e0b",
    secondary: "#d97706",
    accent: "#fbbf24",
  },
  { name: "Cyan", primary: "#0891b2", secondary: "#0e7490", accent: "#06b6d4" },
];
