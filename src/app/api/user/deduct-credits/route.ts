// src/app/api/user/deduct-credits/route.ts
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
    const { credits = 1, service } = data;

    if (!service) {
      return NextResponse.json(
        { error: "Service name is required" },
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
            service: service,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has enough credits
    if (user.credits < credits) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          creditsNeeded: credits,
          creditsAvailable: user.credits,
        },
        { status: 400 }
      );
    }

    // Check rate limits for free users
    const isPremium = user.subscription?.plan !== "free";
    const todayUsage = user.creditUsage.length;
    const isRateLimited = !isPremium && todayUsage >= 1;

    if (isRateLimited) {
      const resetTime = new Date();
      resetTime.setDate(resetTime.getDate() + 1);
      resetTime.setHours(0, 0, 0, 0);

      return NextResponse.json(
        {
          error: `Free accounts are limited to 1 ${service.replace(
            "_",
            " "
          )} per day. Your limit resets at midnight.`,
          rateLimited: true,
          resetTime,
        },
        { status: 429 }
      );
    }

    // Deduct credits and log usage in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user credits
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { credits: { decrement: credits } },
      });

      // Log credit usage
      const usage = await tx.creditUsage.create({
        data: {
          userId: user.id,
          amount: credits,
          service: service,
          description: `Used ${credits} credit${
            credits > 1 ? "s" : ""
          } for ${service}`,
        },
      });

      return { updatedUser, usage };
    });

    return NextResponse.json({
      success: true,
      remainingCredits: result.updatedUser.credits,
      usage: {
        id: result.usage.id,
        amount: result.usage.amount,
        service: result.usage.service,
        timestamp: result.usage.createdAt,
      },
    });
  } catch (error) {
    console.error("Error deducting credits:", error);
    return NextResponse.json(
      { error: "Failed to deduct credits" },
      { status: 500 }
    );
  }
}
