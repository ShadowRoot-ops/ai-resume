// src/app/api/user/subscription/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/user-helpers";

export async function GET(request: Request) {
  try {
    // Get user authentication
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await getOrCreateUser(userId);

    // Get subscription info
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    // Get unlocked features
    const featureUnlocks = await prisma.featureUnlock.findMany({
      where: {
        userId: user.id,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    const unlockedFeatures = featureUnlocks.map((unlock) => unlock.feature);

    // Return subscription details
    return NextResponse.json({
      subscription: subscription
        ? {
            plan: subscription.plan,
            status: subscription.status,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            monthlyScansUsed: subscription.monthlyScansUsed,
            lastScanReset: subscription.lastScanReset,
          }
        : {
            plan: "FREE",
            status: "ACTIVE",
            monthlyScansUsed: 0,
            lastScanReset: new Date(),
          },
      unlockedFeatures: unlockedFeatures,
      credits: user.credits || 0,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
