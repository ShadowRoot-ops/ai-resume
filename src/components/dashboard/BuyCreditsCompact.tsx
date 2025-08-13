// src/components/dashboard/BuyCreditsCompact.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Loader2,
  CreditCard,
  CheckCircle,
  Star,
  AlertCircle,
  RefreshCw,
  Zap,
  Shield,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createPaymentOrder } from "@/lib/actions/payment-actions";

// Define proper types for Razorpay
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
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

// interface RazorpayInstance {
//   open: () => void;
//   on: (event: string, callback: (response: RazorpayResponse) => void) => void;
//   close: () => void;
// }

// Remove duplicate Window interface extension for Razorpay.
// The Razorpay types and Window extension should be declared only once in a shared type definition file (e.g., src/lib/razorpay.ts).

type CreditPackage = {
  id: string;
  credits: number;
  price: number;
  originalPrice?: number;
  title: string;
  description: string;
  features: string[];
  badge?: string;
  popular?: boolean;
  savings?: string;
};

const creditPackages: CreditPackage[] = [
  {
    id: "basic",
    credits: 7,
    price: 99,
    title: "Basic Package",
    description: "Perfect for job seekers",
    features: [
      "7 ATS-optimized resumes",
      "Resume analysis included",
      "Professional templates",
      "PDF export included",
      "No subscription required",
    ],
  },
  {
    id: "premium",
    credits: 25,
    price: 299,
    originalPrice: 350,
    title: "Premium Package",
    description: "Best value for active job hunting",
    features: [
      "25 ATS-optimized resumes",
      "Advanced resume analysis",
      "Premium templates access",
      "Career tools included",
      "Priority support",
      "Unlimited PDF exports",
      "Industry-specific templates",
    ],
    badge: "Most Popular",
    popular: true,
    savings: "Save ₹51",
  },
];

type BuyCreditsCompactProps = {
  lowCredits?: boolean;
};

export default function BuyCreditsCompact({
  lowCredits = false,
}: BuyCreditsCompactProps) {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(
    null
  );

  const router = useRouter();

  // Load Razorpay script
  const loadRazorpayScript = () => {
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

  const handlePayment = async (packageData: CreditPackage) => {
    try {
      setLoading(packageData.id);
      setPaymentError(null);
      setSelectedPackage(packageData);

      console.log("Starting payment for package:", packageData);
      toast.loading("Creating payment order...", { id: "payment-loading" });

      // Use server action instead of API route
      const orderData = await createPaymentOrder(
        packageData.price,
        packageData.credits,
        packageData.id
      );

      console.log("Order data received:", orderData);
      toast.dismiss("payment-loading");

      if (!orderData.success) {
        throw new Error("Failed to create payment order");
      }

      // Load Razorpay script
      await loadRazorpayScript();
      toast.success("Opening payment gateway...");

      // Ensure Razorpay is loaded
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded");
      }

      // Configure Razorpay with proper types
      const options: RazorpayOptions = {
        key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: Number(orderData.order.amount),
        currency: orderData.order.currency,
        name: "AI Resume Builder",
        description: `${packageData.credits} Resume Generation Credits - ${packageData.title}`,
        order_id: orderData.order.id,
        handler: function (response: RazorpayResponse) {
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
            setLoading(null);
            toast.error("Payment cancelled");
          },
        },
      };

      console.log("Opening Razorpay with options:", options);

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: unknown) {
      console.error("Payment error:", error);
      toast.dismiss("payment-loading");

      // Handle specific error messages
      let errorMessage = "Payment processing failed. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("receipt")) {
          errorMessage =
            "Payment order creation failed. Please try again in a moment.";
        } else if (error.message.includes("BAD_REQUEST_ERROR")) {
          errorMessage =
            "Invalid payment parameters. Please refresh and try again.";
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      setPaymentError(errorMessage);
      setLoading(null);
      setShowResultDialog(true);
      toast.error(errorMessage);
    }
  };

  const handlePaymentSuccess = async (response: RazorpayResponse) => {
    try {
      console.log("Payment success response:", response);
      toast.loading("Verifying payment...", { id: "payment-verification" });

      // Verify payment on server
      const verifyResponse = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          credits: selectedPackage?.credits || 7,
          packageId: selectedPackage?.id || "basic",
        }),
      });

      const data = await verifyResponse.json();
      console.log("Verification response:", data);

      if (!verifyResponse.ok) {
        throw new Error(data.error || "Payment verification failed");
      }

      toast.dismiss("payment-verification");

      // Success - update UI
      setPaymentSuccess(true);
      setShowResultDialog(true);
      toast.success(
        `Payment successful! ${
          data.creditsAdded || selectedPackage?.credits || 7
        } credits added to your account.`,
        { duration: 5000 }
      );

      // Redirect to dashboard with payment success parameter
      setTimeout(() => {
        router.push("/dashboard?payment_success=true");
        router.refresh();
      }, 2000);
    } catch (error: unknown) {
      console.error("Payment verification error:", error);
      toast.dismiss("payment-verification");

      let errorMessage = "Payment verification failed. Please contact support.";
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }

      setPaymentError(errorMessage);
      setShowResultDialog(true);
      toast.error(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  const handleQuickBuy = (packageId: string) => {
    const pkg = creditPackages.find((p) => p.id === packageId);
    if (pkg) {
      setShowDetailModal(false);
      handlePayment(pkg);
    }
  };

  const resetPaymentState = () => {
    setPaymentSuccess(false);
    setPaymentError(null);
    setSelectedPackage(null);
    setLoading(null);
  };

  return (
    <>
      <Card
        className={`shadow-sm hover:shadow-md transition-shadow h-fit ${
          lowCredits ? "border-amber-300 bg-amber-50/30" : ""
        }`}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            Buy Credits
          </CardTitle>
          <CardDescription className="text-sm">
            Choose the package that fits your needs
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-4">
          {/* Quick Options */}
          <div className="space-y-3">
            {/* Basic Package - Compact */}
            <div className="border rounded-lg p-3 hover:border-primary/50 transition-all hover:shadow-sm bg-white">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-medium text-sm">Basic</p>
                  <p className="text-xs text-gray-600">7 Credits</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">₹99</p>
                  <p className="text-xs text-gray-500">₹14 per credit</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => handleQuickBuy("basic")}
                disabled={!!loading}
              >
                {loading === "basic" ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-3 w-3 mr-1" />
                    Buy Now
                  </>
                )}
              </Button>
            </div>

            {/* Premium Package - Compact */}
            <div className="border-2 border-primary/50 bg-primary/5 rounded-lg p-3 relative">
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-primary text-white px-2 py-1 text-xs shadow-sm">
                  <Star className="h-2.5 w-2.5 mr-1" />
                  Best Value
                </Badge>
              </div>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-medium text-sm">Premium</p>
                  <p className="text-xs text-gray-600">25 Credits</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <p className="text-lg font-bold text-primary">₹299</p>
                    <span className="text-xs text-gray-500 line-through">
                      ₹350
                    </span>
                  </div>
                  <p className="text-xs text-green-600 font-medium">Save ₹51</p>
                </div>
              </div>
              <Button
                size="sm"
                className="w-full text-xs bg-primary hover:bg-primary/90"
                onClick={() => handleQuickBuy("premium")}
                disabled={!!loading}
              >
                {loading === "premium" ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-3 w-3 mr-1" />
                    Buy Now
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* View Details Button */}
          <div className="mt-3 text-center">
            <button
              className="text-xs text-primary hover:underline transition-colors"
              onClick={() => setShowDetailModal(true)}
              disabled={!!loading}
            >
              View All Features & Details →
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center justify-center text-xs text-green-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              <span>
                Secure payment • No subscription • Credits never expire
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Features Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-primary" />
              Choose Your Credit Package
            </DialogTitle>
            <DialogDescription>
              Select the package that best fits your resume creation needs
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {creditPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`border rounded-lg p-5 transition-all ${
                  pkg.popular
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-gray-200 hover:border-primary/50 hover:shadow-sm"
                }`}
              >
                {pkg.badge && (
                  <div className="flex justify-center mb-3">
                    <Badge className="bg-primary text-white px-3 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      {pkg.badge}
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="font-bold text-xl mb-1">{pkg.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {pkg.description}
                  </p>

                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-primary">
                      ₹{pkg.price}
                    </span>
                    {pkg.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        ₹{pkg.originalPrice}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-1">
                    {pkg.credits} Credits
                  </p>
                  <p className="text-xs text-gray-500">
                    ₹{(pkg.price / pkg.credits).toFixed(1)} per credit
                  </p>

                  {pkg.savings && (
                    <p className="text-sm text-green-600 font-semibold mt-1">
                      {pkg.savings}
                    </p>
                  )}
                </div>

                <div className="space-y-2 mb-5">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-start text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  variant={pkg.popular ? "default" : "outline"}
                  onClick={() => {
                    setShowDetailModal(false);
                    handlePayment(pkg);
                  }}
                  disabled={!!loading}
                >
                  {loading === pkg.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Buy {pkg.credits} Credits for ₹{pkg.price}
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="text-center text-xs text-gray-500 space-y-1">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-4 w-4 mr-1" />
                <span className="font-medium">100% Secure Payment</span>
              </div>
              <p>🔒 Secure payment via Razorpay</p>
              <p>💳 No hidden charges • No subscription required</p>
              <p>⚡ Credits never expire • Instant activation</p>
              <p>🎯 30-day money-back guarantee</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {paymentSuccess ? "Payment Successful!" : "Payment Failed"}
            </DialogTitle>
            <DialogDescription>
              {paymentSuccess
                ? `Your payment was successful and ${
                    selectedPackage?.credits || 7
                  } credits have been added to your account.`
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

          {paymentSuccess && selectedPackage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="text-center">
                <h4 className="font-semibold text-green-800 mb-2">
                  🎉 {selectedPackage.title} Activated!
                </h4>
                <p className="text-sm text-green-700 mb-2">
                  You now have {selectedPackage.credits} credits to create
                  amazing resumes.
                </p>
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  +{selectedPackage.credits} Credits Added
                </Badge>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {paymentSuccess ? (
              <Button
                onClick={() => {
                  setShowResultDialog(false);
                  resetPaymentState();
                  router.push("/dashboard?payment_success=true");
                  router.refresh();
                }}
                className="flex-1"
              >
                <Zap className="h-4 w-4 mr-2" />
                Start Creating Resumes
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResultDialog(false);
                    resetPaymentState();
                  }}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowResultDialog(false);
                    setPaymentError(null);
                    if (selectedPackage) {
                      handlePayment(selectedPackage);
                    }
                  }}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
