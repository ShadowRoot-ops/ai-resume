// src/app/recruiter/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import RecruiterNavbar from "@/components/navigation/RecruiterNavbar";
import RecruiterDashboard from "@/components/dashboard/RecruiterDashboard";

export const metadata = {
  title: "Recruiter Dashboard | Resume AI Builder",
  description: "Manage your resume templates and analytics",
};

export default async function RecruiterDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RecruiterNavbar />
      <RecruiterDashboard userId={userId} />
    </div>
  );
}
