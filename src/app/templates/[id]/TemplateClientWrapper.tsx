// src/app/templates/[id]/TemplateClientWrapper.tsx
"use client";

import TemplateDetailView from "@/components/dashboard/TemplateDetailView";

// Type definition based on your Prisma schema
interface Template {
  id: string;
  companyName: string;
  jobTitle: string;
  industry?: string;
  seniorityLevel?: string;
  department?: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  downloads: number;
  views: number;
  successRate?: number;
  atsScore?: number;
  resumeContent: string; // JSON string
  tipsAndInsights?: string; // JSON string array
  keySkills?: string; // JSON string array
  cultureFitIndicators?: string; // JSON string array
  redFlags?: string; // JSON string array
  sampleInterviewQuestions?: string; // JSON string array
  isPublic: boolean;
  isAnonymized: boolean;
  userId: string;
  user?: {
    id: string;
    name?: string;
    email: string;
  };
}

interface TemplateClientWrapperProps {
  template: Template;
}

export default function TemplateClientWrapper({
  template,
}: TemplateClientWrapperProps) {
  // Add any client-side logic here
  const isRecruiter = false; // Replace with actual logic

  return <TemplateDetailView template={template} isRecruiter={isRecruiter} />;
}
