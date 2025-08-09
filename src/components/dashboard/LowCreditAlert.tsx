// src/components/dashboard/LowCreditsAlert.tsx
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface LowCreditsAlertProps {
  credits: number;
  showWarning: boolean;
}

export default function LowCreditsAlert({
  credits,
  showWarning,
}: LowCreditsAlertProps) {
  if (!showWarning) return null;

  return (
    <Alert className="mb-6 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-700 dark:text-amber-400">
        Credits Running Low
      </AlertTitle>
      <AlertDescription className="text-amber-600 dark:text-amber-300">
        You have only {credits} credit{credits !== 1 ? "s" : ""} remaining.
        Consider purchasing more to avoid interruptions.
      </AlertDescription>
    </Alert>
  );
}
