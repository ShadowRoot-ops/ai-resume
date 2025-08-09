import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/user-helpers";
import ResumeForm from "@/components/resume/ResumeForm";

export default async function CreateResumePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth/sign-in");
  }

  // Get Clerk user data
  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect("/auth/sign-in");
  }

  try {
    // Get or create user in our database
    const user = await getOrCreateUser(
      userId,
      clerkUser.emailAddresses[0]?.emailAddress,
      `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim()
    );

    // Check if user has credits
    if (user.credits <= 0) {
      redirect("/dashboard?error=no-credits");
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Create Your Optimized Resume
        </h1>
        <ResumeForm mode="create" initialData={null} resumeId={undefined} />
      </div>
    );
  } catch (error) {
    console.error("Error in create resume page:", error);
    redirect("/dashboard?error=unknown");
  }
}
