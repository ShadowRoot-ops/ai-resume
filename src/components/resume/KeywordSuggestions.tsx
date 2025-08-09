// src/components/resume/KeywordSuggestions.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Plus, TrendingUp } from "lucide-react";
import ServerPremiumGate from "@/components/premium/ServerPremiumGate";

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
  const BasicView = () => (
    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
      <div className="flex items-center mb-2">
        <Lightbulb className="h-4 w-4 text-blue-600 mr-2" />
        <span className="text-sm font-medium text-blue-800">
          Keyword Suggestions
        </span>
      </div>
      <p className="text-xs text-blue-700">
        {missingKeywords.length > 0
          ? `${missingKeywords.length} keywords could improve your ATS score`
          : "Your keyword optimization looks good!"}
      </p>
    </div>
  );

  const DetailedView = () => (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
          <span className="text-sm font-medium">Smart Keyword Suggestions</span>
        </div>
        <Badge variant="outline" className="text-xs">
          AI Powered
        </Badge>
      </div>

      {missingKeywords.length > 0 ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-600 mb-3">
              Adding these keywords could improve your ATS score by up to 25%:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {missingKeywords.slice(0, 8).map((keyword, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-amber-50 border border-amber-200 rounded-md group hover:bg-amber-100 transition-colors"
                >
                  <span className="text-xs font-medium text-amber-800">
                    {keyword}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            {missingKeywords.length > 8 && (
              <p className="text-xs text-gray-500 mt-2">
                +{missingKeywords.length - 8} more suggestions available
              </p>
            )}
          </div>

          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <h4 className="text-xs font-medium text-green-800 mb-2">
              Industry-Specific Tips for {jobTitle}:
            </h4>
            <ul className="text-xs text-green-700 space-y-1">
              <li>
                • Use action verbs like "optimized", "implemented", "achieved"
              </li>
              <li>
                • Include specific technologies and tools mentioned in the job
              </li>
              <li>• Quantify your achievements with numbers and percentages</li>
              <li>• Match the seniority level language used in job posting</li>
            </ul>
          </div>

          <Button size="sm" className="w-full text-xs" variant="outline">
            Apply Top 5 Keywords Automatically
          </Button>
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Lightbulb className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-sm font-medium text-green-800">
            Great keyword optimization!
          </p>
          <p className="text-xs text-green-600">
            Your resume includes most relevant keywords for this position.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <ServerPremiumGate
      featureId="keyword_suggestions"
      resumeId={resumeId}
      title="Smart Keyword Suggestions"
      description="AI-powered keyword optimization for better ATS performance"
      blurredChildren={<BasicView />}
    >
      <DetailedView />
    </ServerPremiumGate>
  );
}
