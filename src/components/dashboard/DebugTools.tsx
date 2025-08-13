// src/components/dashboard/DebugTools.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "react-hot-toast";

export default function DebugTools() {
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
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gray-50 dark:bg-gray-900 border-dashed">
      <CardHeader className="py-2">
        <CardTitle className="text-sm text-gray-600">Developer Tools</CardTitle>
        <CardDescription className="text-xs">
          For development only
        </CardDescription>
      </CardHeader>
      <CardContent className="py-2">
        <Button
          onClick={handleAddCredits}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {isLoading ? "Adding..." : "Add Dev Credits"}
        </Button>
      </CardContent>
    </Card>
  );
}
