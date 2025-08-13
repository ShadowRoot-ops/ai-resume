import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/user-helpers";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

// Helper function to generate a short receipt ID
function generateShortReceipt(userId: string, paymentType: string): string {
  const timestamp = Date.now().toString().slice(-8);
  const userIdShort = userId.slice(-8);
  const typePrefix = paymentType === "subscription" ? "sub" : "feat";
  return `${typePrefix}_${timestamp}_${userIdShort}`.slice(0, 40);
}

export async function POST(request: Request) {
  try {
    console.log("=== Payment Order Creation Started ===");

    const authResult = await auth();

    if (!authResult.userId) {
      console.log("No userId found");
      return NextResponse.json(
        { error: "Unauthorized", message: "Please log in to continue" },
        { status: 401 }
      );
    }

    console.log("UserId found:", authResult.userId);

    const user = await getOrCreateUser(authResult.userId);
    console.log("User found/created:", { id: user.id, credits: user.credits });

    const requestBody = await request.json();
    console.log("Request body:", requestBody);

    const {
      amount,
      paymentType = "subscription",
      featureId,
      resumeId,
    } = requestBody;

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          error: "Invalid amount",
          message: "Amount must be greater than 0",
        },
        { status: 400 }
      );
    }

    // Validate payment type
    if (!["subscription", "feature_unlock"].includes(paymentType)) {
      return NextResponse.json(
        {
          error: "Invalid payment type",
          message: "Payment type must be 'subscription' or 'feature_unlock'",
        },
        { status: 400 }
      );
    }

    // Create a short receipt ID
    const receipt = generateShortReceipt(user.id, paymentType);
    console.log("Generated receipt:", receipt, "Length:", receipt.length);

    // Validate receipt length
    if (receipt.length > 40) {
      console.error("Receipt too long:", receipt.length);
      return NextResponse.json(
        {
          error: "Receipt generation failed",
          message: "Internal error generating receipt",
        },
        { status: 500 }
      );
    }

    // Create order options - amount should be in paise (multiply by 100)
    const amountInPaise = Number(amount) * 100;

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        userId: user.id,
        clerkId: authResult.userId,
        paymentType,
        featureId: featureId || "",
        resumeId: resumeId || "",
        type:
          paymentType === "subscription" ? "subscription" : "feature_unlock",
      },
    };

    console.log("Creating Razorpay order with options:", {
      ...options,
      amount: `${amountInPaise} paise (₹${amount})`,
    });

    // Create the order
    const order = await razorpay.orders.create(options);
    console.log("Razorpay order created successfully:", {
      id: order.id,
      amount: `${order.amount} paise (₹${Number(order.amount) / 100})`,
    });

    // Map paymentType to database enum
    const dbPaymentType =
      paymentType === "subscription" ? "SUBSCRIPTION" : "FEATURE_UNLOCK";

    // Create pending payment record
    const paymentRecord = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: Number(amount), // Store amount in rupees
        currency: "INR",
        razorpayId: order.id,
        status: "pending",
        receipt: receipt,
        type: dbPaymentType, // Use 'type' instead of 'paymentType'
        featureId: featureId || null,
        resumeId: resumeId || null,
      },
    });

    console.log("Payment record created in database:", paymentRecord.id);

    const response = {
      success: true,
      key:
        process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      order: {
        id: order.id,
        amount: order.amount, // This will be in paise
        currency: order.currency,
      },
      paymentRecord: paymentRecord.id,
    };

    console.log(
      "Sending response with order amount:",
      `${order.amount} paise (₹${Number(order.amount) / 100})`
    );
    console.log("=== Payment Order Creation Completed ===");

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("=== Payment Order Creation Error ===");
    console.error("Error details:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    // Handle specific Razorpay errors
    if (
      error &&
      typeof error === "object" &&
      "statusCode" in error &&
      error.statusCode === 400 &&
      "error" in error
    ) {
      console.error("Razorpay validation error:", (error as any).error);
      return NextResponse.json(
        {
          error: "Payment order validation failed",
          message:
            (error as any).error.description || "Invalid request parameters",
          debug:
            process.env.NODE_ENV === "development"
              ? (error as any).error
              : undefined,
        },
        { status: 400 }
      );
    }

    // Handle auth errors
    if (error instanceof Error && error.message.includes("auth")) {
      return NextResponse.json(
        {
          error: "Authentication failed",
          message: "Please log in again and try",
        },
        { status: 401 }
      );
    }

    // Handle database errors
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error: "Duplicate payment request",
          message: "A payment with this information already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create payment order",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        debug: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}
