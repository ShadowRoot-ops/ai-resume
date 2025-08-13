// src/app/pricing/page.tsx

import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { getOrCreateUser } from "@/lib/user-helpers";
import { prisma } from "@/lib/db";

async function getSubscriptionDetails(userId: string) {
  const user = await getOrCreateUser(userId);
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });
  return {
    plan: subscription?.plan || "FREE",
    status: subscription?.status || "ACTIVE",
  };
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: { resumeId?: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const { plan, status } = await getSubscriptionDetails(userId);
  const isPro = plan === "PRO" && status === "ACTIVE";
  const resumeId = searchParams.resumeId;

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-3xl font-bold mb-4">Choose Your Perfect Plan</h1>
        <p className="text-gray-600">
          Get the tools you need to land your dream job. Upgrade today and
          unlock powerful features to make your resume stand out.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Free Plan */}
        <Card className={isPro ? "opacity-75" : ""}>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <div className="text-3xl font-bold">₹0</div>
            <CardDescription>Limited basic features</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>1 resume scan per month</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Basic ATS score</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Standard templates</span>
              </li>
              <li className="flex items-start opacity-50">
                <Check className="h-5 w-5 text-gray-300 mr-2 mt-0.5" />
                <span>Detailed ATS analysis</span>
              </li>
              <li className="flex items-start opacity-50">
                <Check className="h-5 w-5 text-gray-300 mr-2 mt-0.5" />
                <span>Company-specific templates</span>
              </li>
              <li className="flex items-start opacity-50">
                <Check className="h-5 w-5 text-gray-300 mr-2 mt-0.5" />
                <span>PDF/DOCX export</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              Current Plan
            </Button>
          </CardFooter>
        </Card>

        {/* Pay-per-use Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Pay-per-use</CardTitle>
            <div className="text-3xl font-bold">₹99</div>
            <CardDescription>7 credits to use as you need</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>7 premium feature credits</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Detailed ATS analysis (1 credit)</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>PDF/DOCX export (1 credit)</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Company-specific templates (1 credit)</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Industry keyword packs (1 credit)</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>No recurring charges</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => {
                // Client-side action will handle redirecting to checkout
                window.location.href = `/checkout/credits?resumeId=${
                  resumeId || ""
                }`;
              }}
            >
              Buy Credits
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card
          className={
            isPro
              ? "ring-2 ring-primary"
              : "bg-gradient-to-b from-indigo-50 to-white"
          }
        >
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Pro</CardTitle>
              {isPro && (
                <span className="bg-primary text-white text-xs font-medium px-2 py-1 rounded">
                  Current
                </span>
              )}
            </div>
            <div className="text-3xl font-bold">₹299</div>
            <CardDescription>per month, unlimited access</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>
                  <strong>Unlimited</strong> resume scans
                </span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Detailed ATS analysis</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>All premium templates</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>PDF/DOCX/TXT exports</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Industry keyword packs</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Priority support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant="default"
              disabled={isPro}
              onClick={() => {
                // Client-side action will handle redirecting to checkout
                window.location.href = `/checkout/subscription?resumeId=${
                  resumeId || ""
                }`;
              }}
            >
              {isPro ? "Current Plan" : "Upgrade to Pro"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mt-16">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">
              Can I cancel my subscription at any time?
            </h3>
            <p className="text-gray-600">
              Yes, you can cancel your Pro subscription at any time. You&#39;ll
              continue to have access until the end of your billing period.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">
              How does pay-per-use work?
            </h3>
            <p className="text-gray-600">
              With pay-per-use, you purchase 7 credits for ₹99. Each premium
              feature usage consumes 1 credit. Credits don&#39;t expire, so you
              can use them whenever you need.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">
              What are the company-specific templates?
            </h3>
            <p className="text-gray-600">
              We offer templates optimized for specific companies like TCS,
              Infosys, Wipro, and startups like Flipkart, Swiggy, and Zomato.
              These templates are designed to perform well with their particular
              ATS systems.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">
              Do I need a subscription for multiple resumes?
            </h3>
            <p className="text-gray-600">
              Free users can create multiple resumes but are limited to 1 ATS
              scan per month. Pro users get unlimited scans across all their
              resumes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
