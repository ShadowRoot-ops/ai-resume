// src/components/premium/PremiumFeatureGate.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Lock, Check, X, Loader2, Star, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
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

const FEATURE_CONFIGS = {
  detailed_ats_analysis: {
    title: "Detailed ATS Analysis",
    description:
      "Get comprehensive scoring breakdown and optimization suggestions",
    features: [
      "ATS Score Breakdown",
      "Keyword Gap Analysis",
      "Formatting Assessment",
      "Skills Gap Identification",
      "Improvement Recommendations",
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
    title: "Smart Keyword Suggestions",
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
};

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
  const [subscription, setSubscription] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [unlocking, setUnlocking] = useState<"pro" | "feature" | null>(null);

  const { toast } = useToast();
  const { user } = useUser();

  const config = FEATURE_CONFIGS[featureId as keyof typeof FEATURE_CONFIGS] || {
    title: title || "Premium Feature",
    description: description || "Upgrade to unlock advanced features",
    features: customFeatures || ["Advanced Features", "Premium Access"],
  };

  const blurClass = {
    light: "blur-sm",
    medium: "blur-md",
    heavy: "blur-lg",
  }[blurIntensity];

  // Check feature status
  useEffect(() => {
    const checkFeatureStatus = async () => {
      setIsChecking(true);
      try {
        const response = await fetch(
          `/api/features/check?featureId=${featureId}&resumeId=${
            resumeId || ""
          }`
        );

        if (!response.ok) throw new Error("Failed to check feature status");

        const data = await response.json();
        setIsUnlocked(data.isUnlocked);
        setSubscription(data.subscription);
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
      if ((window as any).Razorpay) {
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

      if (!orderResponse.ok) throw new Error("Failed to create order");
      const orderData = await orderResponse.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Resume AI Builder",
        description:
          paymentType === "subscription"
            ? "Pro Subscription (₹299/month)"
            : `Unlock ${config.title} (₹99)`,
        order_id: orderData.id,
        prefill: {
          name: user?.fullName || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
        },
        handler: async function (response: any) {
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

            if (!verifyResponse.ok)
              throw new Error("Payment verification failed");

            setIsUnlocked(true);
            setIsModalOpen(false);

            toast({
              title:
                paymentType === "subscription"
                  ? "Subscription Activated!"
                  : "Feature Unlocked!",
              description:
                paymentType === "subscription"
                  ? "You now have access to all premium features."
                  : `You now have access to ${config.title}.`,
            });

            // Refresh the page to update UI
            window.location.reload();
          } catch (error) {
            console.error("Payment verification error:", error);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if payment was deducted.",
              variant: "destructive",
            });
          }
        },
        theme: { color: "#4F46E5" },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
            setUnlocking(null);
          },
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
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
    return <div className="animate-pulse bg-gray-200 rounded-lg h-40"></div>;
  }

  if (
    isUnlocked ||
    (subscription?.plan === "PRO" && subscription?.status === "ACTIVE")
  ) {
    return <>{children}</>;
  }

  return (
    <>
      <div onClick={handleLockedContentClick} className="relative">
        {blurredChildren ? (
          <>{blurredChildren}</>
        ) : (
          <div className={`${blurClass} pointer-events-none`}>{children}</div>
        )}

        {/* Lock overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40 flex flex-col items-center justify-center rounded-lg cursor-pointer backdrop-blur-[1px]">
          {showImprovement &&
            beforeScore !== undefined &&
            afterScore !== undefined && (
              <div className="bg-white p-4 rounded-lg mb-4 text-center shadow-lg">
                <div className="text-sm font-medium mb-2">
                  Potential Score Improvement
                </div>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-500">
                      {beforeScore}%
                    </div>
                    <div className="text-xs text-gray-400">Current</div>
                  </div>
                  <div className="flex items-center text-green-600">
                    <div className="h-0.5 w-8 bg-gradient-to-r from-gray-400 to-green-600"></div>
                    <div className="text-lg">→</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {afterScore}%
                    </div>
                    <div className="text-xs text-green-600">Potential</div>
                  </div>
                </div>
              </div>
            )}

          <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm mx-4">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full">
                <Lock className="h-6 w-6 text-white" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {config.title}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{config.description}</p>

            <div className="space-y-2 mb-4">
              {config.features.slice(0, 2).map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center text-left text-sm"
                >
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              {unlockText}
            </Button>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Unlock Full Access
            </DialogTitle>
            <DialogDescription className="text-base">
              Get all premium features for just ₹299/month or ₹99 for one-time
              use.
            </DialogDescription>
          </DialogHeader>

          {/* Limited-time offer */}
          {timeLeft > 0 && showTimer && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-amber-600 mr-2" />
                  <span className="text-amber-800 font-semibold">
                    Limited Time: 20% OFF
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 font-mono"
                >
                  {formatTime(timeLeft)}
                </Badge>
              </div>
              <p className="text-amber-700 text-sm">
                Upgrade now and save ₹60 on your first month!
              </p>
            </div>
          )}

          {/* Features list */}
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-4 flex items-center">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              Premium Features:
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {[
                "Detailed analysis",
                "PDF export",
                "Calendar sync",
                "Recruiter templates",
                "Industry keyword packs",
                "Unlimited resume scans",
                "Company-specific templates",
                "Priority support",
              ].map((feature, index) => (
                <div key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-gray-800">{feature}</span>
                    {index < 4 && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {index === 0 &&
                          "Get comprehensive ATS scoring and optimization tips"}
                        {index === 1 &&
                          "Export high-quality, watermark-free PDFs"}
                        {index === 2 && "Sync with your preferred calendar app"}
                        {index === 3 &&
                          "Templates optimized for TCS, Infosys, and more"}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing plans */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            {/* Pro Subscription */}
            <div className="border-2 border-indigo-200 rounded-lg p-5 bg-gradient-to-br from-indigo-50 to-blue-50 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-indigo-600 text-white px-3 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>

              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">Pro Subscription</h3>
                <Shield className="h-5 w-5 text-indigo-600" />
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Access all premium features for 30 days
              </p>

              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-bold text-indigo-600">
                  ₹{timeLeft > 0 && showTimer ? "239" : "299"}
                </span>
                <span className="text-sm text-gray-500 ml-2">/month</span>
                {timeLeft > 0 && showTimer && (
                  <span className="ml-3 text-sm line-through text-gray-400">
                    ₹299
                  </span>
                )}
              </div>

              <Button
                onClick={handleProSubscription}
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2"
              >
                {unlocking === "pro" && isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Upgrade to Pro"
                )}
              </Button>
            </div>

            {/* Single Feature */}
            <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Single Feature</h3>
                <Lock className="h-5 w-5 text-gray-500" />
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Unlock just {config.title} for 30 days
              </p>

              <div className="flex items-baseline mb-4">
                <span className="text-2xl font-bold text-gray-800">₹99</span>
                <span className="text-sm text-gray-500 ml-2">one-time</span>
              </div>

              <Button
                variant="outline"
                onClick={handleFeatureUnlock}
                disabled={isLoading}
                className="w-full border-gray-300 hover:bg-gray-100"
              >
                {unlocking === "feature" && isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Unlock This Feature"
                )}
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center">
              <Shield className="h-3 w-3 mr-1" />
              Secure payment via Razorpay • Cancel anytime
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
