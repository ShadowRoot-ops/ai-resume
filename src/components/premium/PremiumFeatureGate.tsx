"use client";

import React, { useState, useEffect } from "react";
import {
  Lock,
  Check,
  Loader2,
  Star,
  Clock,
  Shield,
  Sparkles,
  Crown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

interface PremiumFeatureGateProps {
  featureId: string;
  resumeId?: string;
  blurIntensity?: "light" | "medium" | "heavy";
  children: React.ReactNode;
  blurredChildren?: React.ReactNode;
  title?: string;
  description?: string;
  showImprovement?: boolean;
  beforeScore?: number;
  afterScore?: number;
  unlockText?: string;
  customFeatures?: string[];
  showTimer?: boolean;
}

interface SubscriptionInfo {
  plan: string;
  status: string;
  monthlyScansUsed?: number;
  lastScanReset?: Date;
  startDate?: Date | null;
  endDate?: Date | null;
  userId?: string;
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FeatureCheckResponse {
  isUnlocked: boolean;
  subscription?: SubscriptionInfo | null;
}

// Razorpay types
type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayPaymentOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
  };
  handler: (response: RazorpayHandlerResponse) => Promise<void>;
  theme: {
    color: string;
    backdrop_color: string;
  };
  modal: {
    ondismiss: () => void;
  };
};

type RazorpayInstance = {
  open: () => void;
};

type RazorpayConstructor = {
  new (options: RazorpayPaymentOptions): RazorpayInstance;
};

const FEATURE_CONFIGS = {
  detailed_ats_analysis: {
    title: "Detailed ATS Analysis",
    description:
      "Get comprehensive scoring breakdown and optimization suggestions",
    features: [
      "Complete ATS Score Breakdown",
      "Advanced Keyword Gap Analysis",
      "Professional Formatting Assessment",
      "Skills Gap Identification",
      "AI-Powered Recommendations",
    ],
  },
  pdf_export: {
    title: "Premium Export",
    description: "Export your resume in multiple professional formats",
    features: [
      "High-Quality PDF Export",
      "Multiple Format Options",
      "Watermark-free Downloads",
      "Print-optimized Layouts",
    ],
  },
  keyword_suggestions: {
    title: "Smart Keyword Optimization",
    description: "AI-powered keyword optimization for better ATS performance",
    features: [
      "Industry-specific Keywords",
      "Job-tailored Suggestions",
      "Keyword Density Analysis",
      "Competitor Insights",
    ],
  },
  industry_templates: {
    title: "Industry Templates",
    description: "Premium templates designed for specific companies and roles",
    features: [
      "Company-specific Templates",
      "Industry-optimized Layouts",
      "ATS-tested Designs",
      "Success-proven Formats",
    ],
  },
  cover_letter_generator: {
    title: "Cover Letter Generator",
    description: "AI-powered cover letter creation tailored to your resume",
    features: [
      "Personalized Cover Letters",
      "Job-specific Content",
      "Professional Templates",
      "Multiple Variations",
    ],
  },
} as const;

type FeatureId = keyof typeof FEATURE_CONFIGS;

export default function PremiumFeatureGate({
  featureId,
  resumeId,
  blurIntensity = "medium",
  children,
  blurredChildren,
  title,
  description,
  showImprovement = false,
  beforeScore,
  afterScore,
  unlockText = "Unlock Premium",
  customFeatures,
  showTimer = true,
}: PremiumFeatureGateProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(
    null
  );
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [unlocking, setUnlocking] = useState<"pro" | "feature" | null>(null);

  const { user } = useUser();

  const config = FEATURE_CONFIGS[featureId as FeatureId] || {
    title: title || "Premium Feature",
    description: description || "Upgrade to unlock advanced features",
    features: customFeatures || ["Advanced Features", "Premium Access"],
  };

  const blurClass = {
    light: "blur-[1px]",
    medium: "blur-[2px]",
    heavy: "blur-[4px]",
  }[blurIntensity];

  // Check feature status on the client side via an API call
  useEffect(() => {
    const checkFeatureStatus = async () => {
      setIsChecking(true);
      try {
        const response = await fetch(
          `/api/features/check?featureId=${featureId}&resumeId=${
            resumeId ?? ""
          }`
        );

        if (!response.ok) throw new Error("Failed to check feature status");

        const data: FeatureCheckResponse = await response.json();
        setIsUnlocked(data.isUnlocked);
        setSubscription(data.subscription ?? null);
      } catch (error) {
        console.error("Error checking feature status:", error);
        setIsUnlocked(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkFeatureStatus();
  }, [featureId, resumeId]);

  // Timer for urgency
  useEffect(() => {
    if (isModalOpen && timeLeft > 0 && showTimer) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isModalOpen, timeLeft, showTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleLockedContentClick = () => {
    if (!isUnlocked && !isChecking) {
      setIsModalOpen(true);
    }
  };

  const loadRazorpay = () => {
    return new Promise<void>((resolve, reject) => {
      const razorpay = (window as unknown as { Razorpay?: RazorpayConstructor })
        .Razorpay;
      if (razorpay) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
      document.body.appendChild(script);
    });
  };

  const processPayment = async (
    paymentType: "subscription" | "feature_unlock",
    amount: number
  ) => {
    try {
      setIsLoading(true);
      setUnlocking(paymentType === "subscription" ? "pro" : "feature");

      await loadRazorpay();

      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          paymentType,
          featureId,
          resumeId,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      const orderData: {
        order: { id: string; amount: number; currency: string };
        key: string;
      } = await orderResponse.json();

      const options: RazorpayPaymentOptions = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Resume AI Builder",
        description:
          paymentType === "subscription"
            ? "Pro Subscription (₹239/month)"
            : `Unlock ${config.title} (₹99)`,
        order_id: orderData.order.id,
        prefill: {
          name: user?.fullName || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
        },
        handler: async function (response: RazorpayHandlerResponse) {
          try {
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                type: paymentType,
                featureId,
                resumeId,
              }),
            });

            if (!verifyResponse.ok) {
              const errorData = await verifyResponse.json();
              throw new Error(
                errorData.message || "Payment verification failed"
              );
            }

            setIsUnlocked(true);
            setIsModalOpen(false);
            setUnlocking(null);
            setIsLoading(false);

            toast.success(
              paymentType === "subscription"
                ? "Subscription Activated!"
                : "Feature Unlocked!",
              {
                description:
                  paymentType === "subscription"
                    ? "You now have access to all premium features."
                    : `You now have access to ${config.title}.`,
              }
            );

            // Refresh the page to update UI
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment Verification Failed", {
              description: "Please contact support if payment was deducted.",
            });
            setUnlocking(null);
            setIsLoading(false);
          }
        },
        theme: {
          color: "#000000",
          backdrop_color: "rgba(0, 0, 0, 0.8)",
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
            setUnlocking(null);
          },
        },
      };

      const windowRazorpay = (
        window as unknown as { Razorpay?: RazorpayConstructor }
      ).Razorpay;
      if (windowRazorpay) {
        const paymentObject = new windowRazorpay(options);
        paymentObject.open();
      } else {
        throw new Error("Razorpay SDK not loaded");
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("Payment Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to initiate payment. Please try again.",
      });
      setIsLoading(false);
      setUnlocking(null);
    }
  };

  const handleProSubscription = () => {
    const amount = timeLeft > 0 && showTimer ? 239 : 299;
    processPayment("subscription", amount);
  };

  const handleFeatureUnlock = () => {
    processPayment("feature_unlock", 99);
  };

  if (isChecking) {
    return (
      <div className="relative min-h-[200px]">
        <div className="animate-pulse bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl h-full w-full border"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl border">
            <Loader2 className="h-8 w-8 animate-spin text-gray-600 mx-auto" />
            <p className="text-sm text-gray-500 mt-2 text-center">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (
    isUnlocked ||
    (subscription?.plan === "PRO" && subscription?.status === "ACTIVE")
  ) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        onClick={handleLockedContentClick}
        className="relative cursor-pointer group transition-all duration-500 hover:scale-[1.01] rounded-xl overflow-hidden"
      >
        {blurredChildren ? (
          <div className={`${blurClass} transition-all duration-500 grayscale`}>
            {blurredChildren}
          </div>
        ) : (
          <div
            className={`${blurClass} pointer-events-none transition-all duration-500 grayscale`}
          >
            {children}
          </div>
        )}

        {/* Luxurious Black & White Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-gray-900/50 to-black/70 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm transition-all duration-500 group-hover:from-black/70 group-hover:via-gray-900/60 group-hover:to-black/80">
          {/* Premium Lock Card */}
          <div className="bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full border-2 border-gray-100/20 transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-3xl">
            {/* Elegant Crown Icon */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative p-5 bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-full shadow-xl border-4 border-white/10">
                <Crown className="h-8 w-8 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 via-amber-300 to-yellow-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-black animate-pulse" />
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-900 to-black opacity-20 blur-xl"></div>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
              {config.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 mb-6 leading-relaxed text-sm">
              {config.description}
            </p>

            {/* Premium Badge */}
            <Badge className="mb-6 bg-black text-white border-0 px-4 py-2 text-xs font-medium tracking-wide">
              <Star className="h-3 w-3 mr-2" />
              PREMIUM FEATURE
            </Badge>

            {/* Unlock Button */}
            <Button
              size="lg"
              className="w-full bg-black hover:bg-gray-900 text-white shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-0 py-4 text-base font-semibold tracking-wide"
            >
              <Crown className="h-5 w-5 mr-3" />
              {unlockText}
            </Button>

            {/* Subtle feature hint */}
            <p className="text-xs text-gray-500 mt-4 font-medium">
              Unlock now and elevate your career
            </p>
          </div>
        </div>
      </div>

      {/* Premium Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto bg-white border-0 shadow-2xl rounded-2xl">
          {/* Header Section */}
          <DialogHeader className="text-center space-y-4 pb-6 border-b border-gray-100">
            <div className="flex justify-center">
              <div className="p-4 bg-black rounded-2xl shadow-xl">
                <Crown className="h-10 w-10 text-white" />
              </div>
            </div>
            <DialogTitle className="text-4xl font-bold text-gray-900 tracking-tight">
              Choose Your Plan
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-lg max-w-2xl mx-auto">
              Unlock premium features and accelerate your career success with
              our professional-grade resume tools.
            </DialogDescription>
          </DialogHeader>

          {/* Limited Time Offer */}
          {timeLeft > 0 && showTimer && (
            <div className="bg-black text-white p-6 rounded-2xl my-6 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="p-2 bg-white/20 rounded-full mr-3">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white font-bold text-xl">
                    ⚡ Limited Time: 20% OFF
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white font-mono text-lg px-4 py-2 animate-pulse border-0"
                >
                  {formatTime(timeLeft)}
                </Badge>
              </div>
              <p className="text-white/90 font-medium">
                Upgrade to Pro now and save ₹60 on your first month. This
                exclusive offer expires soon!
              </p>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
            {/* Pro Subscription Card */}
            <div className="relative border-4 border-black rounded-2xl p-8 bg-gradient-to-br from-gray-50 to-white shadow-2xl transform hover:scale-105 transition-all duration-300">
              {/* Popular Badge */}
              <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-2 text-sm shadow-lg border-0 font-semibold tracking-wide">
                <Crown className="h-4 w-4 mr-2" />
                MOST POPULAR
              </Badge>

              <div className="text-center">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-black rounded-2xl shadow-lg">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                </div>

                {/* Plan Details */}
                <h3 className="font-bold text-3xl mb-3 text-gray-900">
                  Pro Subscription
                </h3>
                <p className="text-gray-600 mb-8 text-base leading-relaxed">
                  Unlimited access to all premium features with priority support
                  and advanced analytics.
                </p>

                {/* Pricing */}
                <div className="flex items-baseline justify-center mb-8">
                  <span className="text-5xl font-bold text-gray-900">
                    ₹{timeLeft > 0 && showTimer ? "239" : "299"}
                  </span>
                  <span className="text-xl text-gray-600 ml-2">/month</span>
                  {timeLeft > 0 && showTimer && (
                    <span className="ml-4 text-xl line-through text-gray-400">
                      ₹299
                    </span>
                  )}
                </div>

                {/* CTA Button */}
                <Button
                  onClick={handleProSubscription}
                  disabled={isLoading}
                  className="w-full bg-black hover:bg-gray-900 text-white py-6 text-lg font-bold shadow-2xl transform hover:scale-105 transition-all duration-300 border-0 tracking-wide"
                >
                  {unlocking === "pro" ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin mr-3" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Crown className="h-6 w-6 mr-3" />
                      Upgrade to Pro
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Single Feature Card */}
            <div className="border-2 border-gray-300 rounded-2xl p-8 bg-gradient-to-br from-white to-gray-50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="text-center">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gray-600 rounded-2xl shadow-lg">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                </div>

                {/* Plan Details */}
                <h3 className="font-bold text-3xl mb-3 text-gray-900">
                  Single Feature
                </h3>
                <p className="text-gray-600 mb-8 text-base leading-relaxed">
                  Unlock just this specific feature for immediate use with no
                  recurring commitment.
                </p>

                {/* Pricing */}
                <div className="flex items-baseline justify-center mb-8">
                  <span className="text-4xl font-bold text-gray-900">₹99</span>
                  <span className="text-xl text-gray-600 ml-2">one-time</span>
                </div>

                {/* CTA Button */}
                <Button
                  variant="outline"
                  onClick={handleFeatureUnlock}
                  disabled={isLoading}
                  className="w-full border-2 border-gray-900 hover:bg-gray-900 hover:text-white py-6 text-lg font-bold transition-all duration-300 bg-white text-gray-900 tracking-wide"
                >
                  {unlocking === "feature" ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin mr-3" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="h-6 w-6 mr-3" />
                      Unlock Feature
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Feature Benefits */}
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-8 my-8 border border-gray-200">
            <h4 className="font-bold text-2xl mb-6 text-gray-900 flex items-center">
              <Sparkles className="h-6 w-6 mr-3" />
              What&apos;s included with {config.title}:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center text-base bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="p-2 bg-black rounded-full mr-4 flex-shrink-0">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-800 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Improvement Showcase */}
          {showImprovement && beforeScore && afterScore && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 my-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-3 bg-green-600 rounded-full mr-4">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-green-800">
                    Proven Results Guarantee
                  </span>
                </div>

                <div className="flex items-center justify-center text-3xl font-bold mb-4">
                  <span className="px-6 py-3 bg-white border-2 border-green-200 rounded-xl text-gray-600">
                    {beforeScore}%
                  </span>
                  <div className="mx-8 flex items-center">
                    <div className="w-12 h-1 bg-gradient-to-r from-gray-400 to-green-600 rounded"></div>
                    <span className="mx-4 text-green-600">→</span>
                    <div className="w-12 h-1 bg-green-600 rounded"></div>
                  </div>
                  <span className="px-6 py-3 bg-green-600 text-white rounded-xl">
                    {afterScore}%
                  </span>
                </div>

                <p className="text-green-700 font-semibold text-lg">
                  Join 50,000+ professionals who improved their ATS score by an
                  average of {afterScore - beforeScore}+ points
                </p>
              </div>
            </div>
          )}

          {/* Trust Indicators */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-8 text-gray-600 mb-4">
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Secure Payment</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Instant Access</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">30-Day Guarantee</span>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Powered by Razorpay • Cancel anytime • Full refund within 30 days
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}
