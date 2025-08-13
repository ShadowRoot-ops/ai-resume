import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/user-helpers";
import {
  isFeatureUnlocked,
  getUserSubscription,
} from "@/lib/subscription-helpers";

export async function GET(request: NextRequest) {
  try {
    const authResult = await auth();

    if (!authResult.userId) {
      return NextResponse.json({ isUnlocked: false }, { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const featureId = searchParams.get("featureId");
    const resumeId = searchParams.get("resumeId");

    if (!featureId) {
      return NextResponse.json(
        { error: "featureId is required" },
        { status: 400 }
      );
    }

    // Get user and check subscription
    const user = await getOrCreateUser(authResult.userId);
    const isUnlocked = await isFeatureUnlocked(user.id, featureId, resumeId);

    // Get subscription info
    const subscription = await getUserSubscription(user.id);

    return NextResponse.json({
      isUnlocked,
      subscription,
    });
  } catch (error) {
    console.error("Error checking feature status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
