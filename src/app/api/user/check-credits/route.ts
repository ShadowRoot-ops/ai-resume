// src/app/api/user/check-credits/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { requiredCredits = 1, action } = data;

    // Action is required for rate limiting
    if (!action) {
      return NextResponse.json(
        {
          error: "Action type is required",
        },
        { status: 400 }
      );
    }

    // Get user from database - Only use include, not select
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        subscription: true,
        creditUsage: {
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
            },
            service: action,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has enough credits
    const hasEnoughCredits = user.credits >= requiredCredits;

    if (!hasEnoughCredits) {
      return NextResponse.json(
        {
          success: false,
          hasEnoughCredits: false,
          userCredits: user.credits,
          requiredCredits,
          error: `Insufficient credits. This action requires ${requiredCredits} credit${
            requiredCredits !== 1 ? "s" : ""
          }, but you only have ${user.credits}.`,
        },
        { status: 200 }
      );
    }

    // Check rate limits for free users
    const isPremium = user.subscription?.plan !== "free";
    const todayUsage = user.creditUsage.length;
    const isRateLimited = !isPremium && todayUsage >= 1;

    if (isRateLimited) {
      // Calculate reset time (tomorrow at midnight)
      const resetTime = new Date();
      resetTime.setDate(resetTime.getDate() + 1);
      resetTime.setHours(0, 0, 0, 0);

      return NextResponse.json(
        {
          success: false,
          hasEnoughCredits: true,
          userCredits: user.credits,
          requiredCredits,
          rateLimited: true,
          error: `Free accounts are limited to 1 ${action.replace(
            "_",
            " "
          )} per day. Your limit will reset tomorrow.`,
          resetTime,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      hasEnoughCredits: true,
      userCredits: user.credits,
      requiredCredits,
      rateLimited: false,
      remaining: isPremium ? -1 : 1 - todayUsage,
    });
  } catch (error) {
    console.error("Error checking credits:", error);
    return NextResponse.json(
      { error: "Failed to check credits" },
      { status: 500 }
    );
  }
}
