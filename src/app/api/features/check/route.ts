// src/app/api/features/check/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/user-helpers";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const featureId = url.searchParams.get("featureId");
    const resumeId = url.searchParams.get("resumeId");

    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(userId);

    // Check if user has PRO subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    const isPro =
      subscription?.plan === "PRO" &&
      subscription?.status === "ACTIVE" &&
      (!subscription.endDate || new Date(subscription.endDate) > new Date());

    if (isPro) {
      return NextResponse.json({
        isUnlocked: true,
        subscription: {
          plan: subscription.plan,
          status: subscription.status,
        },
      });
    }

    // Check for specific feature unlock
    const featureUnlock = featureId
      ? await prisma.featureUnlock.findUnique({
          where: {
            userId_feature: {
              userId: user.id,
              feature: featureId,
            },
          },
        })
      : null;

    const isUnlocked =
      featureUnlock &&
      (!featureUnlock.expiresAt ||
        new Date(featureUnlock.expiresAt) > new Date());

    return NextResponse.json({
      isUnlocked,
      subscription: subscription
        ? {
            plan: subscription.plan,
            status: subscription.status,
          }
        : null,
    });
  } catch (error) {
    console.error("Error checking feature status:", error);
    return NextResponse.json(
      { error: "Failed to check feature status" },
      { status: 500 }
    );
  }
}
