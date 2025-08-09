// src/app/api/webhooks/razorpay/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const payload = JSON.parse(body);

    const requestHeaders = new Headers(request.headers);
    const signature = requestHeaders.get("x-razorpay-signature") || "";

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "")
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const event = payload.event;

    switch (event) {
      case "payment.captured":
        await handlePaymentCaptured(payload);
        break;

      case "subscription.charged":
        await handleSubscriptionCharged(payload);
        break;

      case "subscription.cancelled":
        await handleSubscriptionCancelled(payload);
        break;

      case "subscription.completed":
        await handleSubscriptionCompleted(payload);
        break;

      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing Razorpay webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

async function handlePaymentCaptured(payload: any) {
  const paymentId = payload.payload.payment.entity.id;
  const orderId = payload.payload.payment.entity.order_id;

  await prisma.payment.updateMany({
    where: {
      razorpayId: orderId,
      status: "pending",
    },
    data: {
      status: "successful",
    },
  });
}

async function handleSubscriptionCharged(payload: any) {
  const subscriptionId = payload.payload.subscription.entity.id;

  const subscription = await prisma.subscription.findFirst({
    where: { razorpaySubId: subscriptionId },
  });

  if (subscription) {
    const newEndDate = new Date(subscription.endDate || new Date());
    newEndDate.setDate(newEndDate.getDate() + 30);

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "ACTIVE",
        endDate: newEndDate,
      },
    });
  }
}

async function handleSubscriptionCancelled(payload: any) {
  const subscriptionId = payload.payload.subscription.entity.id;

  await prisma.subscription.updateMany({
    where: { razorpaySubId: subscriptionId },
    data: {
      status: "CANCELLED",
      canceledAt: new Date(),
    },
  });
}

async function handleSubscriptionCompleted(payload: any) {
  const subscriptionId = payload.payload.subscription.entity.id;

  await prisma.subscription.updateMany({
    where: { razorpaySubId: subscriptionId },
    data: {
      status: "INACTIVE",
    },
  });
}
