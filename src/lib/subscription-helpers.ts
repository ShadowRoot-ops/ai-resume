// src/lib/subscription-helpers.ts (continued)
import { prisma } from "@/lib/db";

export async function getSubscriptionStatus(userId: string) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return {
        isPro: false,
        isActive: false,
        plan: "FREE",
        status: "FREE",
        endDate: null,
      };
    }

    const isPro =
      subscription.plan === "PRO" && subscription.status === "ACTIVE";
    const isActive =
      subscription.status === "ACTIVE" &&
      (!subscription.endDate || new Date(subscription.endDate) > new Date());

    return {
      isPro,
      isActive,
      plan: subscription.plan,
      status: subscription.status,
      endDate: subscription.endDate,
    };
  } catch (error) {
    console.error("Error getting subscription status:", error);
    return {
      isPro: false,
      isActive: false,
      plan: "FREE",
      status: "ERROR",
      endDate: null,
    };
  }
}

export async function isFeatureUnlocked(userId: string, featureId: string) {
  try {
    // Check if user has PRO subscription first
    const subscription = await getSubscriptionStatus(userId);
    if (subscription.isPro && subscription.isActive) {
      return true;
    }

    // Check for specific feature unlock
    const featureUnlock = await prisma.featureUnlock.findUnique({
      where: {
        userId_feature: {
          userId,
          feature: featureId,
        },
      },
    });

    return (
      !!featureUnlock &&
      (!featureUnlock.expiresAt ||
        new Date(featureUnlock.expiresAt) > new Date())
    );
  } catch (error) {
    console.error("Error checking if feature is unlocked:", error);
    return false;
  }
}

export async function getUserUnlockedFeatures(userId: string) {
  try {
    const subscription = await getSubscriptionStatus(userId);

    // If user has PRO, return all features
    if (subscription.isPro && subscription.isActive) {
      return [
        "detailed_ats_analysis",
        "pdf_export",
        "keyword_suggestions",
        "industry_templates",
        "cover_letter_generator",
        "unlimited_scans",
        "priority_support",
      ];
    }

    // Get individual feature unlocks
    const featureUnlocks = await prisma.featureUnlock.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: {
        feature: true,
      },
    });

    return featureUnlocks.map((unlock) => unlock.feature);
  } catch (error) {
    console.error("Error getting user unlocked features:", error);
    return [];
  }
}
