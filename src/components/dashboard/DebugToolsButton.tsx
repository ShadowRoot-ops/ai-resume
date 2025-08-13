// src/components/dashboard/DebugToolsButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export default function DebugToolsButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddCredits = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/debug/add-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add credits");
      }

      toast.success(`Added 5 credits. New total: ${data.user.credits}`);

      // Refresh the page after a delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAddCredits}
      disabled={isLoading}
      variant="outline"
      size="sm"
    >
      {isLoading ? "Adding..." : "Add Dev Credits"}
    </Button>
  );
}
