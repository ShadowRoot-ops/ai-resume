import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

// IMPORTANT: Remove this endpoint before production
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user by Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      // If user doesn't exist, create one
      const newUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: "temp@example.com", // Placeholder
          name: "New User",
          credits: 5, // Start with 5 credits
        },
      });

      return NextResponse.json({
        success: true,
        message: "New user created with 5 credits",
        user: {
          id: newUser.id,
          credits: newUser.credits,
        },
      });
    }

    // Add credits
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { credits: { increment: 5 } },
    });

    return NextResponse.json({
      success: true,
      message: "Credits added successfully",
      user: {
        id: updatedUser.id,
        credits: updatedUser.credits,
      },
    });
  } catch (error) {
    console.error("Error adding credits:", error);
    return NextResponse.json(
      { error: "Failed to add credits" },
      { status: 500 }
    );
  }
}
