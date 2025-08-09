// src/app/api/payments/create-order/route.ts
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
function generateShortReceipt(userId: string): string {
  const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
  const userIdShort = userId.slice(-8); // Last 8 characters of user ID
  return `cr_${timestamp}_${userIdShort}`; // Format: cr_12345678_abcd1234 (max 20 chars)
}

export async function POST(request: Request) {
  try {
    console.log("=== Payment Order Creation Started ===");

    // Try multiple ways to get auth
    let userId: string | null = null;

    try {
      const authResult = await auth();
      userId = authResult.userId;
      console.log("Auth result:", authResult);
    } catch (authError) {
      console.error("Auth error:", authError);
    }

    // If auth() doesn't work, try getting from headers
    if (!userId) {
      const authHeader = request.headers.get("authorization");
      const sessionToken = request.headers.get("clerk-session-token");
      console.log("Auth header:", authHeader);
      console.log("Session token:", sessionToken);

      if (!authHeader && !sessionToken) {
        return NextResponse.json(
          {
            error: "No authentication found",
            debug: "Missing auth header and session token",
          },
          { status: 401 }
        );
      }
    }

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          debug: "No userId found from any auth method",
        },
        { status: 401 }
      );
    }

    console.log("UserId found:", userId);

    const user = await getOrCreateUser(userId);
    console.log("User found/created:", { id: user.id, credits: user.credits });

    const requestBody = await request.json();
    console.log("Request body:", requestBody);

    const { amount, credits = 7, packageId = "basic" } = requestBody;

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (!credits || credits <= 0) {
      return NextResponse.json({ error: "Invalid credits" }, { status: 400 });
    }

    // Create a short receipt ID (max 40 characters, but we'll keep it under 20)
    const receipt = generateShortReceipt(user.id);
    console.log("Generated receipt:", receipt, "Length:", receipt.length);

    // Validate receipt length
    if (receipt.length > 40) {
      console.error("Receipt too long:", receipt.length);
      return NextResponse.json(
        { error: "Receipt generation failed" },
        { status: 500 }
      );
    }

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
      key:
        process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    };

    console.log("Sending response:", response);
    console.log("=== Payment Order Creation Completed ===");

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("=== Payment Order Creation Error ===");
    console.error("Error details:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    // Handle specific Razorpay errors
    if (error.statusCode === 400 && error.error) {
      console.error("Razorpay validation error:", error.error);
      return NextResponse.json(
        {
          error: "Payment order validation failed",
          message: error.error.description || "Invalid request parameters",
          debug:
            process.env.NODE_ENV === "development" ? error.error : undefined,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create payment order",
        message: error instanceof Error ? error.message : "Unknown error",
        debug: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}
