// src/components/payment/PaymentModal.tsx
"use client";

import React, { useState } from "react";
import { RazorpayOptions, RazorpayPaymentResponse } from "@/lib/razorpay";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    Razorpay: new (
      options: RazorpayOptions
    ) => import("@/lib/razorpay").RazorpayInstance;
  }
}

// interface RazorpayOptions {
//   key: string;
//   amount: number;
//   currency: string;
//   name: string;
//   description: string;
//   order_id?: string;
//   subscription_id?: string;
//   handler: (response: RazorpayPaymentResponse) => void;
//   prefill?: {
//     name?: string;
//     email?: string;
//     contact?: string;
//   };
//   theme?: {
//     color?: string;
//   };
//   modal?: {
//     ondismiss?: () => void;
//   };
// }

// interface RazorpayPaymentResponse {
//   razorpay_payment_id: string;
//   razorpay_order_id: string;
//   razorpay_signature: string;
// }

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  title: string;
  description: string;
  paymentType: "oneTime" | "subscription";
  resumeId?: string;
  feature?: string;
  onSuccess?: (data: {
    success: boolean;
    message?: string;
    [key: string]: unknown;
  }) => void;
}

export default function PaymentModal({
  open,
  onClose,
  amount,
  title,
  description,
  paymentType,
  resumeId,
  feature,
  onSuccess,
}: PaymentModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError("");

      // Create order on server
      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          paymentType,
          resumeId,
          feature,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment order");
      }

      const data = await response.json();

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Razorpay"));
          document.body.appendChild(script);
        });
      }

      // Create Razorpay instance
      const options: RazorpayOptions = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Resume.AI Builder",
        description: description,
        order_id: paymentType === "oneTime" ? data.orderId : undefined,
        handler: async function (response: RazorpayPaymentResponse) {
          try {
            // Verify payment on server
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                type: paymentType,
                resumeId,
                feature,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed");
            }

            const result = await verifyResponse.json();

            onClose();

            if (onSuccess) {
              onSuccess(result);
            } else {
              router.refresh();
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            setError("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com",
        },
        theme: {
          color: "#6366F1",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      setError("Failed to initiate payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => !loading && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold">₹{amount}</div>
            <div className="text-sm text-gray-500">
              {paymentType === "subscription"
                ? "Monthly subscription"
                : "One-time payment"}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handlePayment}
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Pay with Razorpay
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
