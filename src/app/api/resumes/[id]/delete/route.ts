import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params to get the actual values
    const { id } = await params;
    console.log(`Received delete request for resume ID: ${id}`);

    const { userId } = getAuth(request);

    if (!userId) {
      console.log("Unauthorized: No user ID found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      console.log("User not found in database");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the resume exists
    const resume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!resume) {
      console.log("Resume not found");
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Check if the user owns this resume
    if (resume.userId !== user.id) {
      console.log("User doesn't own this resume");
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    console.log("Deleting resume...");

    // Delete the resume
    await prisma.resume.delete({
      where: {
        id,
      },
    });

    console.log("Resume deleted successfully");

    return NextResponse.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error(`Error deleting resume:`, error);
    return NextResponse.json(
      { error: "Failed to delete resume" },
      { status: 500 }
    );
  }
}
