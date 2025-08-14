// src/app/templates/[id]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import TemplateDetailView from "@/components/dashboard/TemplateDetailView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const awaitedParams = await params;
  const template = await getTemplate(awaitedParams.id);

  if (!template) {
    return {
      title: "Template Not Found",
      description: "The requested template does not exist",
    };
  }

  return {
    title: `${template.companyName} - ${template.jobTitle} Resume Template`,
    description: `Resume template for ${template.jobTitle} position at ${template.companyName}`,
  };
}

async function getTemplate(id: string) {
  try {
    const { userId } = await auth();

    const template = await prisma.template.findUnique({
      where: { id },
    });

    if (!template) return null;

    // Check if user can access this template
    if (!template.isPublic && template.userId !== userId) {
      return null;
    }

    // Increment view count
    await prisma.template.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // Process template data to convert JSON strings to objects and null values to undefined
    return {
      ...template,
      tipsAndInsights: template.tipsAndInsights
        ? JSON.parse(template.tipsAndInsights)
        : [],
      keySkills: template.keySkills ? JSON.parse(template.keySkills) : [],
      cultureFitIndicators: template.cultureFitIndicators
        ? JSON.parse(template.cultureFitIndicators)
        : [],
      redFlags: template.redFlags ? JSON.parse(template.redFlags) : [],
      sampleInterviewQuestions: template.sampleInterviewQuestions
        ? JSON.parse(template.sampleInterviewQuestions)
        : [],
      // Convert null values to undefined for compatibility with component props
      industry: template.industry || undefined,
      seniorityLevel: template.seniorityLevel || undefined,
      department: template.department || undefined,
      successRate: template.successRate ?? undefined,
      atsScore: template.atsScore ?? undefined,
    };
  } catch (error) {
    console.error("Error fetching template:", error);
    return null;
  }
}

export default async function TemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const awaitedParams = await params;
  const template = await getTemplate(awaitedParams.id);

  if (!template) {
    notFound();
  }

  // Check if current user is the creator of this template
  const { userId } = await auth();
  const isRecruiter = template.userId === userId;

  return <TemplateDetailView template={template} isRecruiter={isRecruiter} />;
}
