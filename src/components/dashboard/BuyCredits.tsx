// src/components/dashboard/BuyCredits.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Loader2,
  CreditCard,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// Razorpay response types
interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Razorpay callback function type
type RazorpayHandlerCallback = (response: RazorpayPaymentResponse) => void;

// Define RazorpayOptions interface
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: RazorpayHandlerCallback;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: {
    [key: string]: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

// Razorpay instance interface
interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (data: unknown) => void) => void;
  close: () => void;
}

// Define Razorpay in window - using a unique namespace to avoid conflicts
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

// API response types
interface OrderResponse {
  key: string;
  order: {
    id: string;
    amount: number;
    currency: string;
  };
}

interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  error?: string;
}

type BuyCreditsProps = {
  lowCredits?: boolean;
};

export default function BuyCredits({ lowCredits = false }: BuyCreditsProps) {
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const router = useRouter();

  // Load Razorpay script more robustly
  const loadRazorpayScript = (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Failed to load Razorpay checkout script"));
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (): Promise<void> => {
    try {
      setLoading(true);
      setPaymentError(null);

      // Create order
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const orderData: OrderResponse = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(
          orderData.order?.id || "Failed to create payment order"
        );
      }

      // Load Razorpay script
      await loadRazorpayScript();

      // Configure Razorpay
      const options: RazorpayOptions = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "AI Resume Builder",
        description: "7 Resume Generation Credits",
        order_id: orderData.order.id,
        handler: function (response: RazorpayPaymentResponse) {
          handlePaymentSuccess(response);
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
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Payment processing failed. Please try again.";

      setPaymentError(errorMessage);
      setLoading(false);
      toast.error("Payment processing failed. Please try again.");
    }
  };

  const handlePaymentSuccess = async (
    response: RazorpayPaymentResponse
  ): Promise<void> => {
    try {
      // Verify payment on server
      const verifyResponse = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });

      const data: PaymentVerificationResponse = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(data.error || "Payment verification failed");
      }

      // Success - update UI
      setPaymentSuccess(true);
      setShowDialog(true);
      toast.success("Payment successful! Credits added to your account.");

      // Redirect to dashboard with payment success parameter
      setTimeout(() => {
        router.push("/dashboard?payment_success=true");
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error("Payment verification error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Payment verification failed. Please contact support.";

      setPaymentError(errorMessage);
      setShowDialog(true);
      toast.error("Payment verification failed. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className={lowCredits ? "border-amber-300 shadow-md" : "shadow-sm"}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            Buy Credits
          </CardTitle>
          <CardDescription>
            Get more credits to use our AI features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-primary/5 rounded-lg p-4 flex flex-col items-center text-center mb-4">
            <div className="text-3xl font-bold mb-2 flex items-baseline">
              <span className="text-primary">₹99</span>
              <span className="text-sm text-gray-500 ml-1">one-time</span>
            </div>
            <div className="flex items-center justify-center text-lg font-semibold mb-1">
              <span>7 Credits</span>
            </div>
            <p className="text-sm text-gray-500">
              Generate up to 7 professional resumes
            </p>
          </div>

          <ul className="space-y-2 text-sm">
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
              <span>ATS-optimized resume creation</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
              <span>Resume analysis and improvement</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
              <span>No subscription, pay as you go</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handlePayment} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Buy Now
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {paymentSuccess ? "Payment Successful" : "Payment Failed"}
            </DialogTitle>
            <DialogDescription>
              {paymentSuccess
                ? "Your payment was successful and credits have been added to your account."
                : `Payment processing failed. ${
                    paymentError || "Please try again."
                  }`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center py-6">
            {paymentSuccess ? (
              <div className="bg-green-100 rounded-full p-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            ) : (
              <div className="bg-red-100 rounded-full p-4">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
            )}
          </div>

          <DialogFooter>
            {paymentSuccess ? (
              <Button
                onClick={() => {
                  setShowDialog(false);
                  router.push("/dashboard?payment_success=true");
                  router.refresh();
                }}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowDialog(false);
                    setPaymentError(null);
                    handlePayment();
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
