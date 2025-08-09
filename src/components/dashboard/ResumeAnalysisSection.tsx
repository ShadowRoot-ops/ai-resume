// src/components/dashboard/ResumeAnalysisSection.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import ResumeUpload from "@/components/forms/ResumeUpload";

type ResumeAnalysisSectionProps = {
  credits: number;
  isPremium?: boolean;
  reachedDailyLimit?: boolean;
};

export default function ResumeAnalysisSection({
  credits,
  isPremium = false,
  reachedDailyLimit = false,
}: ResumeAnalysisSectionProps) {
  // Determine if user can use the feature
  const insufficientCredits = credits < 1;
  const canUseFeature = !insufficientCredits && !reachedDailyLimit;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume Analyzer & Optimizer</CardTitle>
        <CardDescription>
          Upload your existing resume to get AI-powered optimization
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!canUseFeature ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div
              className={`rounded-full p-4 mb-4 ${
                insufficientCredits ? "bg-muted" : "bg-amber-50"
              }`}
            >
              <AlertCircle
                className={`h-8 w-8 ${
                  insufficientCredits
                    ? "text-muted-foreground"
                    : "text-amber-600"
                }`}
              />
            </div>
            <h3 className="text-xl font-medium mb-2">
              {insufficientCredits
                ? "Insufficient Credits"
                : "Daily Limit Reached"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {insufficientCredits
                ? "You need at least 1 credit to analyze and optimize a resume."
                : "Free accounts are limited to 1 resume analysis per day. Your limit will reset at midnight."}
            </p>
            {insufficientCredits ? (
              <Link href="#buy-credits-section">
                <Button>Get Credits</Button>
              </Link>
            ) : (
              !isPremium && (
                <Link href="#buy-credits-section">
                  <Button variant="outline">
                    Upgrade for Unlimited Access
                  </Button>
                </Link>
              )
            )}
          </div>
        ) : (
          <ResumeUpload />
        )}
      </CardContent>
      <CardFooter className="border-t pt-6">
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md w-full">
          <div className="flex items-center mb-1">
            <span className="font-medium">Cost:</span>
            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full ml-2">
              1 Credit
            </span>
            {!isPremium && (
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full ml-2">
                1/day limit
              </span>
            )}
          </div>
          <p>
            Each analysis includes ATS score, keyword analysis, and custom
            optimization tips
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
