// src/lib/subscription-helpers.ts
import { prisma } from "@/lib/db";
import { SubscriptionStatus } from "@prisma/client";

export async function isFeatureUnlocked(
  userId: string,
  featureId: string,
  resumeId?: string | null
): Promise<boolean> {
  try {
    // First check if user has active PRO subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    // If user has active PRO subscription, all features are unlocked
    if (
      subscription &&
      subscription.plan === "PRO" &&
      subscription.status === "ACTIVE" &&
      subscription.endDate &&
      subscription.endDate > new Date()
    ) {
      return true;
    }

    // Check for specific feature unlocks
    const featureUnlock = await prisma.featureUnlock.findFirst({
      where: {
        userId,
        feature: featureId,
        ...(resumeId && { resumeId }), // Only check resumeId if provided
        OR: [
          { expiresAt: null }, // Feature doesn't expire
          { expiresAt: { gt: new Date() } }, // Feature hasn't expired yet
        ],
      },
    });

    return !!featureUnlock;
  } catch (error) {
    console.error("Error checking feature unlock status:", error);
    return false;
  }
}

export async function getUserSubscription(userId: string) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return {
        plan: "FREE",
        status: "ACTIVE",
        monthlyScansUsed: 0,
        lastScanReset: new Date(),
        startDate: null,
        endDate: null,
      };
    }

    // Check if subscription is expired
    if (subscription.endDate && subscription.endDate <= new Date()) {
      // Update subscription status to expired
      await prisma.subscription.update({
        where: { userId },
        data: { status: SubscriptionStatus.INACTIVE },
      });

      return {
        ...subscription,
        status: "EXPIRED",
      };
    }

    return subscription;
  } catch (error) {
    console.error("Error fetching user subscription:", error);
    return null;
  }
}

export async function getUnlockedFeatures(userId: string): Promise<string[]> {
  try {
    // Check if user has PRO subscription
    const subscription = await getUserSubscription(userId);
    if (
      subscription &&
      subscription.plan === "PRO" &&
      subscription.status === "ACTIVE"
    ) {
      // Return all available features for PRO users
      return [
        "detailed_ats_analysis",
        "pdf_export",
        "keyword_suggestions",
        "industry_templates",
        "cover_letter_generator",
      ];
    }

    // Get specific feature unlocks
    const featureUnlocks = await prisma.featureUnlock.findMany({
      where: {
        userId,
        OR: [
          { expiresAt: null }, // Feature doesn't expire
          { expiresAt: { gt: new Date() } }, // Feature hasn't expired yet
        ],
      },
      select: {
        feature: true,
      },
    });

    return featureUnlocks.map((unlock) => unlock.feature);
  } catch (error) {
    console.error("Error fetching unlocked features:", error);
    return [];
  }
}

export async function canUserAccessFeature(
  userId: string,
  featureId: string,
  resumeId?: string
): Promise<{
  canAccess: boolean;
  reason?: string;
  subscription?: any;
}> {
  try {
    const subscription = await getUserSubscription(userId);

    // Check PRO subscription
    if (
      subscription &&
      subscription.plan === "PRO" &&
      subscription.status === "ACTIVE"
    ) {
      return {
        canAccess: true,
        subscription,
      };
    }

    // Check specific feature unlock
    const hasFeatureUnlock = await isFeatureUnlocked(
      userId,
      featureId,
      resumeId
    );

    if (hasFeatureUnlock) {
      return {
        canAccess: true,
        subscription,
      };
    }

    // Determine reason for denial
    let reason = "Feature not unlocked";
    if (subscription?.plan === "PRO" && subscription.status === "EXPIRED") {
      reason = "Subscription expired";
    } else if (
      subscription?.plan === "PRO" &&
      subscription.status === "CANCELLED"
    ) {
      reason = "Subscription cancelled";
    }

    return {
      canAccess: false,
      reason,
      subscription,
    };
  } catch (error) {
    console.error("Error checking user feature access:", error);
    return {
      canAccess: false,
      reason: "Error checking access",
    };
  }
}

export async function incrementMonthlyScans(userId: string): Promise<boolean> {
  try {
    const subscription = await getUserSubscription(userId);

    if (!subscription) {
      return false;
    }

    // Check if we need to reset monthly counter
    const now = new Date();
    const lastReset = new Date(subscription.lastScanReset);
    const shouldReset =
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear();

    if (shouldReset) {
      await prisma.subscription.update({
        where: { userId },
        data: {
          monthlyScansUsed: 1,
          lastScanReset: now,
        },
      });
      return true;
    }

    // Check limits based on plan
    const limits = {
      FREE: 3,
      PRO: 999999, // Unlimited for PRO users
    };

    const limit = limits[subscription.plan as keyof typeof limits] || 0;

    if (subscription.monthlyScansUsed >= limit) {
      return false; // Limit exceeded
    }

    // Increment counter
    await prisma.subscription.update({
      where: { userId },
      data: {
        monthlyScansUsed: subscription.monthlyScansUsed + 1,
      },
    });

    return true;
  } catch (error) {
    console.error("Error incrementing monthly scans:", error);
    return false;
  }
}

export async function getRemainingScans(userId: string): Promise<number> {
  try {
    const subscription = await getUserSubscription(userId);

    if (!subscription) {
      return 0;
    }

    if (subscription.plan === "PRO" && subscription.status === "ACTIVE") {
      return 999999; // Unlimited for PRO users
    }

    const limits = {
      FREE: 3,
      PRO: 999999,
    };

    const limit = limits[subscription.plan as keyof typeof limits] || 0;
    const used = subscription.monthlyScansUsed || 0;

    return Math.max(0, limit - used);
  } catch (error) {
    console.error("Error getting remaining scans:", error);
    return 0;
  }
}
