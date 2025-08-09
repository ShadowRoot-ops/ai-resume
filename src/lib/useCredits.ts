// src/lib/hooks/useCredits.ts
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export function useCredits() {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch user credits
  const fetchCredits = async () => {
    try {
      const response = await fetch("/api/user/credits");
      if (!response.ok) throw new Error("Failed to fetch credits");

      const data = await response.json();
      setCredits(data.credits);
      return data.credits;
    } catch (error) {
      console.error("Error fetching credits:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Check if user has enough credits and is within rate limits
  const checkCredits = async (
    requiredCredits: number = 1,
    action: string = "general"
  ) => {
    setLoading(true);
    try {
      const response = await fetch("/api/user/check-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requiredCredits, action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check credits");
      }

      setCredits(data.userCredits);

      if (!data.success) {
        // Handle rate limiting
        if (data.rateLimited) {
          const resetTime = data.resetTime ? new Date(data.resetTime) : null;
          const resetMessage = resetTime
            ? ` Limit resets at ${resetTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : "";

          toast.error(`${data.error}${resetMessage}`);
          return false;
        }

        // Handle insufficient credits
        if (!data.hasEnoughCredits) {
          toast.error(
            `Insufficient credits. You need ${requiredCredits} credit${
              requiredCredits > 1 ? "s" : ""
            } for this action.`
          );
          return false;
        }

        toast.error(data.error || "Could not verify credits");
        return false;
      }

      return true;
    } catch (error: any) {
      console.error("Error checking credits:", error);
      toast.error(error.message || "Failed to verify credits availability");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Spend credits for a specific service
  const spendCredits = async (service: string, amount: number = 1) => {
    // If we already have credits loaded and they're sufficient,
    // we can skip the check and proceed directly
    if (credits !== null && credits >= amount) {
      setLoading(true);
      try {
        const response = await fetch("/api/user/deduct-credits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credits: amount, service }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limited
            toast.error(
              data.error || "You've reached your usage limit for today"
            );
            return false;
          }

          throw new Error(data.error || "Failed to deduct credits");
        }

        setCredits(data.remainingCredits);
        return true;
      } catch (error: any) {
        console.error("Error using credits:", error);
        toast.error(error.message || "Failed to process credit usage");
        return false;
      } finally {
        setLoading(false);
      }
    } else {
      // If we're not sure about credits, do the check first
      const canProceed = await checkCredits(amount, service);

      if (!canProceed) {
        // Only redirect if we truly have insufficient credits
        if (credits !== null && credits < amount) {
          router.push("/dashboard?error=no-credits");
        }
        return false;
      }

      setLoading(true);
      try {
        const response = await fetch("/api/user/deduct-credits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credits: amount, service }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limited
            toast.error(
              data.error || "You've reached your usage limit for today"
            );
            return false;
          }

          throw new Error(data.error || "Failed to deduct credits");
        }

        setCredits(data.remainingCredits);
        return true;
      } catch (error: any) {
        console.error("Error using credits:", error);
        toast.error(error.message || "Failed to process credit usage");
        return false;
      } finally {
        setLoading(false);
      }
    }
  };

  // Load credits on component mount
  useEffect(() => {
    fetchCredits();
  }, []);

  return {
    credits,
    loading,
    checkCredits,
    spendCredits,
    useCredits: spendCredits, // keep old name for backward compatibility
    fetchCredits,
  };
}
