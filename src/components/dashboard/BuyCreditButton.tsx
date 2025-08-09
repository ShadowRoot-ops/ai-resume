// src/components/dashboard/BuyCreditButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BuyCreditsButton() {
  const router = useRouter();

  const handleClick = () => {
    // Scroll to buy credits section if on dashboard
    const buyCreditsSection = document.getElementById("buy-credits-section");
    if (buyCreditsSection) {
      buyCreditsSection.scrollIntoView({ behavior: "smooth" });
    } else {
      // Navigate to dashboard with anchor if not on dashboard
      router.push("/dashboard#buy-credits-section");
    }
  };

  return (
    <Button variant="default" className="w-full" onClick={handleClick}>
      <Sparkles className="h-4 w-4 mr-2" />
      Buy Credits
    </Button>
  );
}
