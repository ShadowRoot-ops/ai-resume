import Razorpay from "razorpay";
import { prisma } from "./db";
import crypto from "crypto";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createPaymentOrder(userId: string, amount: number = 100) {
  try {
    const options = {
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
      notes: {
        userId: userId,
      },
    };

    const order = await razorpay.orders.create(options);

    // Create payment record
    await prisma.payment.create({
      data: {
        userId,
        amount,
        razorpayId: order.id,
        status: "pending",
      },
    });

    return order;
  } catch (error) {
    console.error("Payment order creation failed:", error);
    throw new Error("Payment initiation failed");
  }
}

export async function verifyPayment(
  paymentId: string,
  orderId: string,
  signature: string
) {
  const generatedSignature = generateRazorpaySignature(orderId, paymentId);

  if (generatedSignature === signature) {
    // Find the payment in the database
    const payment = await prisma.payment.findUnique({
      where: { razorpayId: orderId },
      include: { user: true },
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "successful" },
    });

    // Add credits to user
    await prisma.user.update({
      where: { id: payment.userId },
      data: { credits: { increment: payment.creditsAdded } },
    });

    return true;
  }

  return false;
}
function generateRazorpaySignature(orderId: string, paymentId: string) {
  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
  hmac.update(`${orderId}|${paymentId}`);
  return hmac.digest("hex");
}
