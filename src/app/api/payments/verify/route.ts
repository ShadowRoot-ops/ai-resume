// src/app/api/payments/verify/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    console.log("=== Payment Verification Started ===");

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      credits,
      packageId,
    } = body;

    console.log("Verification request:", {
      userId,
      razorpay_order_id,
      razorpay_payment_id,
      credits,
      packageId,
    });

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment parameters" },
        { status: 400 }
      );
    }

    // const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    console.log("Expected signature:", expectedSignature);
    console.log("Received signature:", razorpay_signature);

    if (expectedSignature !== razorpay_signature) {
      console.error("Signature mismatch - payment verification failed");
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    console.log("Payment signature verified successfully");

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { razorpayId: razorpay_order_id },
      include: { user: true },
    });

    if (!payment) {
      console.error("Payment record not found for order:", razorpay_order_id);
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
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
      return NextResponse.json({
        success: true,
        message: "Payment already processed",
        creditsAdded: payment.creditsAdded,
      });
    }

    // Update payment and add credits in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update payment status with razorpayPaymentId field
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "successful",
          razorpayPaymentId: razorpay_payment_id, // This field should now exist in schema
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

      return {
        payment: updatedPayment,
        user: updatedUser,
        creditsAdded: payment.creditsAdded,
      };
    });

    console.log("Credits added successfully:", {
      previousCredits: payment.user.credits,
      creditsAdded: result.creditsAdded,
      newCredits: result.user.credits,
    });

    console.log("=== Payment Verification Completed ===");

    // Revalidate the dashboard to show updated credits
    revalidatePath("/dashboard");

    return NextResponse.json({
      success: true,
      creditsAdded: result.creditsAdded,
      newTotalCredits: result.user.credits,
      message: `Payment verified successfully. ${result.creditsAdded} credits added.`,
    });
  } catch (error: any) {
    console.error("=== Payment Verification Error ===");
    console.error("Payment verification error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    return NextResponse.json(
      {
        error: "Payment verification failed",
        message: error instanceof Error ? error.message : "Unknown error",
        debug: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}
