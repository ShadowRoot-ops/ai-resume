// src/lib/actions/payment-actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/user-helpers";
import Razorpay from "razorpay";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

// Helper function to generate a short receipt ID
function generateShortReceipt(userId: string): string {
  const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
  const userIdShort = userId.slice(-8); // Last 8 characters of user ID
  return `cr_${timestamp}_${userIdShort}`; // Format: cr_12345678_abcd1234 (max 20 chars)
}

export async function createPaymentOrder(
  amount: number,
  credits: number,
  packageId: string
) {
  try {
    console.log("=== Server Action: Creating Payment Order ===");

    // Get auth from the server context
    const { userId } = await auth();

    if (!userId) {
      console.error("No userId found from auth()");
      throw new Error("User not authenticated");
    }

    console.log("UserId from auth():", userId);

    const user = await getOrCreateUser(userId);
    console.log("User found/created:", { id: user.id, credits: user.credits });

    // Validate input
    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    if (!credits || credits <= 0) {
      throw new Error("Invalid credits");
    }

    // Create a short receipt ID (max 40 characters, but we'll keep it under 20)
    const receipt = generateShortReceipt(user.id);
    console.log("Generated receipt:", receipt, "Length:", receipt.length);

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

    // Create the order
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
        creditsAdded: credits,
        receipt: receipt, // Store the receipt for reference
      },
    });

    console.log("Payment record created in database");

    const response = {
      success: true,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    };

    console.log("Sending response:", response);
    console.log("=== Server Action: Payment Order Creation Completed ===");

    return response;
  } catch (error) {
    console.error("=== Server Action: Payment Order Creation Error ===");
    console.error("Error details:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    throw new Error(
      error instanceof Error ? error.message : "Failed to create payment order"
    );
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
    console.log("Razorpay Order ID:", razorpayOrderId);
    console.log("Razorpay Payment ID:", razorpayPaymentId);
    // 'crypto' is already imported at the top of the file
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");

    console.log("Expected signature:", expectedSignature);
    console.log("Received signature:", razorpaySignature);

    if (expectedSignature !== razorpaySignature) {
      console.error("Signature mismatch - payment verification failed");
      throw new Error("Invalid payment signature");
    }

    console.log("Payment signature verified successfully");

    // Update payment status and add credits
    const payment = await prisma.payment.findUnique({
      where: { razorpayId: razorpayOrderId },
      include: { user: true },
    });

    if (!payment) {
      console.error("Payment record not found for order:", razorpayOrderId);
      throw new Error("Payment record not found");
    }

    console.log("Found payment record:", {
      id: payment.id,
      userId: payment.userId,
      amount: payment.amount,
      creditsAdded: payment.creditsAdded,
      currentStatus: payment.status,
    });

    // Prevent double processing
    if (payment.status === "successful") {
      console.log("Payment already processed successfully");
      return {
        success: true,
        message: "Payment already processed",
        creditsAdded: payment.creditsAdded,
      };
    }

    await prisma.$transaction(async (tx) => {
      // Update payment status with the correct field name
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "successful",
          razorpayPaymentId: razorpayPaymentId, // Now this field exists
          updatedAt: new Date(),
        },
      });

      // Add credits to user
      const updatedUser = await tx.user.update({
        where: { id: payment.userId },
        data: {
          credits: {
            increment: payment.creditsAdded,
          },
        },
      });

      console.log("Credits added successfully:", {
        previousCredits: payment.user.credits,
        creditsAdded: payment.creditsAdded,
        newCredits: updatedUser.credits,
      });
    });

    console.log("=== Server Action: Payment Verification Completed ===");

    revalidatePath("/dashboard");
    return {
      success: true,
      creditsAdded: payment.creditsAdded,
      message: `Payment verified successfully. ${payment.creditsAdded} credits added.`,
    };
  } catch (error) {
    console.error("=== Server Action: Payment Verification Error ===");
    console.error("Payment verification error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    throw new Error(
      error instanceof Error ? error.message : "Payment verification failed"
    );
  }
}
