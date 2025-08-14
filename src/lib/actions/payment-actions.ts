// src/lib/actions/payment-actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/user-helpers";
import Razorpay from "razorpay";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

// Helper function to generate a short receipt ID
function generateShortReceipt(userId: string): string {
  const timestamp = Date.now().toString().slice(-8);
  const userIdShort = userId.slice(-8);
  return `cr_${timestamp}_${userIdShort}`;
}

interface PaymentOrderResult {
  success: boolean;
  order?: any;
  key?: string;
  error?: string;
}

export async function createPaymentOrder(
  amount: number,
  credits: number,
  packageId: string
) {
  try {
    console.log("=== Server Action: Creating Payment Order ===");

    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await getOrCreateUser(userId);
    console.log("User found/created:", { id: user.id, credits: user.credits });

    // Validate input
    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    if (!credits || credits <= 0) {
      throw new Error("Invalid credits");
    }

    // Create a short receipt ID
    const receipt = generateShortReceipt(user.id);
    console.log("Generated receipt:", receipt);

    // Create order options
    const options = {
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt,
      notes: {
        userId: user.id,
        clerkId: userId,
        credits: credits.toString(),
        packageId,
        type: "credits",
      },
    };

    console.log("Creating Razorpay order with options:", options);

    const order = await razorpay.orders.create(options);
    console.log("Razorpay order created successfully:", order.id);

    // Create pending payment record
    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: amount,
        currency: "INR",
        razorpayId: order.id,
        status: "pending",
        type: "CREDITS", // Use the enum value
        creditsAdded: credits,
        receipt: receipt,
      },
    });

    console.log("Payment record created in database");

    return {
      success: true,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    };
  } catch (error) {
    console.error("Payment order creation error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create payment order",
    };
  }
}

export async function verifyPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) {
  try {
    console.log("=== Server Action: Payment Verification Started ===");

    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    console.log("Verifying payment for user:", userId);
    console.log("Order ID:", razorpayOrderId);
    console.log("Payment ID:", razorpayPaymentId);

    // Verify signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    console.log("Body for signing:", body);
    console.log("Expected signature:", expectedSignature);
    console.log("Received signature:", razorpaySignature);
    console.log(
      "Secret key (first 10 chars):",
      process.env.RAZORPAY_KEY_SECRET?.substring(0, 10)
    );

    if (expectedSignature !== razorpaySignature) {
      console.error("Signature mismatch!");
      throw new Error("Invalid payment signature");
    }

    console.log("Payment signature verified successfully");

    // Find and update payment
    const payment = await prisma.payment.findUnique({
      where: { razorpayId: razorpayOrderId },
      include: { user: true },
    });

    if (!payment) {
      throw new Error("Payment record not found");
    }

    // Prevent double processing
    if (payment.status === "completed") {
      console.log("Payment already processed");
      return {
        success: true,
        message: "Payment already processed",
        creditsAdded: payment.creditsAdded,
      };
    }

    // Transaction to update payment and add credits
    await prisma.$transaction(async (tx) => {
      // Update payment status
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "completed",
          razorpayPaymentId: razorpayPaymentId,
          updatedAt: new Date(),
        },
      });

      // Add credits to user
      await tx.user.update({
        where: { id: payment.userId },
        data: {
          credits: {
            increment: payment.creditsAdded,
          },
        },
      });

      // Create credit usage record for tracking
      await tx.creditUsage.create({
        data: {
          userId: payment.userId,
          amount: payment.creditsAdded,
          service: "credit_purchase",
          description: `Purchased ${payment.creditsAdded} credits`,
        },
      });
    });

    console.log("=== Payment Verification Completed Successfully ===");

    revalidatePath("/dashboard");
    return {
      success: true,
      creditsAdded: payment.creditsAdded,
      message: `Payment verified successfully. ${payment.creditsAdded} credits added.`,
    };
  } catch (error) {
    console.error("Payment verification error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Payment verification failed",
    };
  }
}
