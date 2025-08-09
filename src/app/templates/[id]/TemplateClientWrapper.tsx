// src/app/templates/[id]/TemplateClientWrapper.tsx
"use client";

import TemplateDetailView from "@/components/dashboard/TemplateDetailView";

export default function TemplateClientWrapper({ template }: { template: any }) {
  // Add any client-side logic here
  const isRecruiter = false; // Replace with actual logic

  return <TemplateDetailView template={template} isRecruiter={isRecruiter} />;
}
