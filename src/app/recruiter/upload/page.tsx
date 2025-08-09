// src/app/recruiter/upload/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import RecruiterNavbar from "@/components/navigation/RecruiterNavbar";
import EnhancedRecruiterUpload from "@/components/dashboard/EnhancedRecruiterUpload";

export default async function RecruiterUploadPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RecruiterNavbar />
      <EnhancedRecruiterUpload userId={userId} />
    </div>
  );
}
