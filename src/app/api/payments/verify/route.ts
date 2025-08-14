// src/app/api/payments/verify/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/user-helpers";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    console.log("=== Payment Verification Started ===");

    const authResult = await auth();

    if (!authResult.userId) {
      console.log("No userId found in verification");
      return NextResponse.json(
        { error: "Unauthorized", message: "Please log in to continue" },
        { status: 401 }
      );
    }

    const user = await getOrCreateUser(authResult.userId);
    const requestBody = await request.json();

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      type,
      credits,
      packageId,
      featureId,
      resumeId,
    } = requestBody;

    console.log("Verification request:", {
      razorpayOrderId,
      razorpayPaymentId,
      type,
      credits,
      packageId,
      featureId,
      resumeId,
    });

    // Verify signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      console.error("Signature verification failed");
      console.error("Expected:", expectedSignature);
      console.error("Received:", razorpaySignature);
      console.error("Body used for signing:", body);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log("Signature verified successfully");

    // Find the payment record
    const payment = await prisma.payment.findUnique({
      where: { razorpayId: razorpayOrderId },
    });

    if (!payment) {
      console.error("Payment record not found for order:", razorpayOrderId);
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "completed",
        razorpayPaymentId: razorpayPaymentId,
        updatedAt: new Date(),
      },
    });

    console.log("Payment record updated to completed");

    // Handle different payment types
    if (type === "credits") {
      console.log("Processing credits purchase:", credits);

      // Add credits to user account
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          credits: {
            increment: credits,
          },
          updatedAt: new Date(),
        },
      });

      // Create credit usage record for tracking
      await prisma.creditUsage.create({
        data: {
          userId: user.id,
          amount: credits,
          service: "credit_purchase",
          description: `Purchased ${credits} credits via ${packageId} package`,
        },
      });

      console.log(
        `Added ${credits} credits to user account. New balance: ${updatedUser.credits}`
      );

      return NextResponse.json({
        success: true,
        message: "Payment verified and credits added",
        type: "credits",
        creditsAdded: credits,
        newBalance: updatedUser.credits,
        packageId,
      });
    } else if (type === "subscription") {
      console.log("Processing subscription activation");

      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

      // Create or update subscription
      const existingSubscription = await prisma.subscription.findUnique({
        where: { userId: user.id },
      });

      if (existingSubscription) {
        await prisma.subscription.update({
          where: { userId: user.id },
          data: {
            plan: "PRO",
            status: "ACTIVE",
            startDate,
            endDate,
            monthlyScansUsed: 0,
            lastScanReset: startDate,
            razorpaySubId: razorpayPaymentId,
            updatedAt: new Date(),
          },
        });
        console.log("Subscription updated to PRO");
      } else {
        await prisma.subscription.create({
          data: {
            userId: user.id,
            plan: "PRO",
            status: "ACTIVE",
            startDate,
            endDate,
            monthlyScansUsed: 0,
            lastScanReset: startDate,
            razorpaySubId: razorpayPaymentId,
          },
        });
        console.log("New PRO subscription created");
      }

      // Remove any existing feature unlocks since PRO gives access to everything
      await prisma.featureUnlock.deleteMany({
        where: { userId: user.id },
      });

      return NextResponse.json({
        success: true,
        message: "Payment verified and subscription activated",
        type: "subscription",
      });
    } else if (type === "feature_unlock" && featureId) {
      console.log("Processing feature unlock for:", featureId);

      // Create feature unlock
      await prisma.featureUnlock.create({
        data: {
          userId: user.id,
          feature: featureId,
          razorpayPaymentId: razorpayPaymentId,
          ...(resumeId && { resumeId }), // Only include resumeId if provided
          expiresAt: null, // Feature doesn't expire for now
        },
      });

      console.log("Feature unlock created successfully");

      return NextResponse.json({
        success: true,
        message: "Payment verified and feature unlocked",
        type: "feature_unlock",
        featureId,
      });
    } else {
      console.error("Unknown payment type:", type);
      return NextResponse.json(
        { error: "Unknown payment type" },
        { status: 400 }
      );
    }

    console.log("=== Payment Verification Completed Successfully ===");
  } catch (error: unknown) {
    console.error("=== Payment Verification Error ===");
    console.error("Error details:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    // Handle specific database errors
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") {
        console.log("Duplicate entry - feature may already be unlocked");
        return NextResponse.json({
          success: true,
          message: "Feature already unlocked",
        });
      }
    }

    return NextResponse.json(
      {
        error: "Payment verification failed",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        debug: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}
