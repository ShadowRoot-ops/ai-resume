// src/lib/rate-limiter.ts
import { prisma } from "@/lib/db";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetTime?: Date;
  error?: string;
};

/**
 * Check if an action is allowed based on the user's subscription and usage history
 */
export async function checkRateLimit(
  userId: string,
  action: string
): Promise<RateLimitResult> {
  try {
    // Get user with subscription info
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      return {
        allowed: false,
        remaining: 0,
        limit: 0,
        error: "User not found",
      };
    }

    // Check if premium user
    const isPremium = user.subscription?.plan !== "free";

    // Premium users have unlimited actions
    if (isPremium) {
      return {
        allowed: true,
        remaining: -1,
        limit: -1,
      };
    }

    // For free users, limit to 1 per day per action type
    const actionLimit = 1;
    const actionUsage = user.creditUsage.length;
    const remaining = Math.max(0, actionLimit - actionUsage);
    const allowed = remaining > 0;

    // Calculate reset time (tomorrow at midnight)
    const resetTime = new Date();
    resetTime.setDate(resetTime.getDate() + 1);
    resetTime.setHours(0, 0, 0, 0);

    return {
      allowed,
      remaining,
      limit: actionLimit,
      resetTime,
      error: allowed
        ? undefined
        : `You've reached your daily limit for this action (${actionLimit}/${actionLimit} used). Limit resets at midnight.`,
    };
  } catch (error) {
    console.error("Rate limit check error:", error);
    return {
      allowed: false,
      remaining: 0,
      limit: 0,
      error: "Failed to check rate limit",
    };
  }
}
