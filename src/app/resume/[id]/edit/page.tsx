import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import ResumeEditForm from "@/components/forms/ResumeEditForm";
import { notFound } from "next/navigation";

export default async function EditResumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth/sign-in");
  }

  // Await the params Promise
  const awaitedParams = await params;
  const resumeId = awaitedParams.id;

  // Find user
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    redirect("/dashboard");
  }

  // Get the resume
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    include: {
      user: true,
    },
  });

  if (!resume || resume.userId !== user.id) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Edit Resume</h1>
      <ResumeEditForm resume={JSON.parse(JSON.stringify(resume))} />
    </div>
  );
}
