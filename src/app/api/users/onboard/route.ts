import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { name } = data;

    // Get user's email from Clerk
    const clerkUserResponse = await fetch(
      `https://api.clerk.dev/v1/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!clerkUserResponse.ok) {
      throw new Error("Failed to fetch Clerk user");
    }

    const clerkUser = await clerkUserResponse.json();
    const primaryEmail = clerkUser.email_addresses.find(
      (email) => email.id === clerkUser.primary_email_address_id
    );
    const email = primaryEmail ? primaryEmail.email_address : "";

    // Create or update user in our database
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        name,
      },
      create: {
        clerkId: userId,
        name,
        email,
        credits: 1, // Start with one free credit
      },
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Onboarding failed" }, { status: 500 });
  }
}
