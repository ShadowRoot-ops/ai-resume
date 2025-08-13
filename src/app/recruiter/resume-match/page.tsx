// src/app/recruiter/resume-match/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ResumeMatchingSystem from "@/components/recruiter/ResumeMatchingSystem";
import RecruiterNavbar from "@/components/navigation/RecruiterNavbar";

export default async function ResumeMatchPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RecruiterNavbar />
      <main className="py-8">
        <ResumeMatchingSystem />
      </main>
    </div>
  );
}
