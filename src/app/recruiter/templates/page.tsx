// src/app/recruiter/templates/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import RecruiterNavbar from "@/components/navigation/RecruiterNavbar";
import TemplatesList from "@/components/dashboard/TemplateList";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "My Templates | Resume AI Builder",
  description: "Manage your resume templates",
};

async function getRecruiterTemplates(userId: string) {
  try {
    const templates = await prisma.template.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return templates;
  } catch (error) {
    console.error("Error fetching templates:", error);
    return [];
  }
}

export default async function RecruiterTemplatesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth/sign-in");
  }

  const templates = await getRecruiterTemplates(userId);

  return (
    <div className="min-h-screen bg-gray-50">
      <RecruiterNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Resume Templates
            </h1>
            <p className="text-gray-600">
              Manage and track your uploaded templates
            </p>
          </div>

          <Link href="/recruiter/upload">
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </Link>
        </div>

        <TemplatesList templates={templates} />
      </div>
    </div>
  );
}
