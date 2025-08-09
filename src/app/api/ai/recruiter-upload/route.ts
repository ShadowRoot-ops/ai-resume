import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { resumeContent, companyName, jobTitle } = data;

    // Save the uploaded resume
    const upload = await prisma.recruiterUpload.create({
      data: {
        resumeContent,
        companyName,
        jobTitle,
      },
    });

    return NextResponse.json({
      success: true,
      upload: upload,
    });
  } catch (error) {
    console.error("Recruiter upload error:", error);
    return NextResponse.json(
      { error: "Resume upload failed" },
      { status: 500 }
    );
  }
}
