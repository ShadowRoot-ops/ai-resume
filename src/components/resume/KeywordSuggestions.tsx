// src/components/resume/KeywordSuggestions.tsx
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Plus, Loader2 } from "lucide-react";
import PremiumFeatureGate from "@/components/premium/PremiumFeatureGate";

interface KeywordSuggestionsProps {
  resumeId: string;
  missingKeywords: string[];
  jobTitle: string;
  isPremiumUnlocked?: boolean;
}

export default function KeywordSuggestions({
  resumeId,
  missingKeywords,
  jobTitle,
  isPremiumUnlocked = false,
}: KeywordSuggestionsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const generateSuggestions = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/keywords/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          jobTitle,
          missingKeywords,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const BasicView = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center">
          <Lightbulb className="h-4 w-4 text-amber-600 mr-2" />
          Missing Keywords
        </h4>
      </div>

      {missingKeywords.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {missingKeywords.slice(0, 4).map((keyword, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs bg-amber-50 text-amber-700 border-amber-200"
            >
              {keyword}
            </Badge>
          ))}
          {missingKeywords.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{missingKeywords.length - 4} more
            </Badge>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-600">
          Great! You're using most relevant keywords.
        </p>
      )}
    </div>
  );

  const DetailedView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center">
          <Lightbulb className="h-4 w-4 text-amber-600 mr-2" />
          Smart Keyword Suggestions
        </h4>
        <Button
          size="sm"
          variant="outline"
          onClick={generateSuggestions}
          disabled={isGenerating}
          className="text-xs"
        >
          {isGenerating ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <Plus className="h-3 w-3 mr-1" />
          )}
          Generate
        </Button>
      </div>

      {missingKeywords.length > 0 && (
        <div>
          <p className="text-xs text-gray-600 mb-2">
            Missing from job description:
          </p>
          <div className="flex flex-wrap gap-1">
            {missingKeywords.map((keyword, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs bg-amber-50 text-amber-700 border-amber-200 cursor-pointer hover:bg-amber-100"
                onClick={() => {
                  // Add functionality to insert keyword into resume
                  console.log("Add keyword:", keyword);
                }}
              >
                {keyword}
                <Plus className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div>
          <p className="text-xs text-gray-600 mb-2">
            AI-generated suggestions:
          </p>
          <div className="flex flex-wrap gap-1">
            {suggestions.map((suggestion, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs bg-blue-50 text-blue-700 border-blue-200 cursor-pointer hover:bg-blue-100"
                onClick={() => {
                  // Add functionality to insert suggestion into resume
                  console.log("Add suggestion:", suggestion);
                }}
              >
                {suggestion}
                <Plus className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {missingKeywords.length === 0 && suggestions.length === 0 && (
        <div className="text-center py-4">
          <div className="text-green-600 mb-2">
            <Lightbulb className="h-8 w-8 mx-auto" />
          </div>
          <p className="text-sm text-gray-600">
            Great! Your resume is well-optimized for this job.
          </p>
        </div>
      )}
    </div>
  );

  if (isPremiumUnlocked) {
    return <DetailedView />;
  }

  return (
    <PremiumFeatureGate
      featureId="keyword_suggestions"
      resumeId={resumeId}
      title="Smart Keyword Suggestions"
      description="AI-powered keyword optimization for better ATS performance"
      blurredChildren={<BasicView />}
    >
      <DetailedView />
    </PremiumFeatureGate>
  );
}
