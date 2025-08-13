// src/components/resume/AtsScoreBreakdown.tsx
"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import PremiumFeatureGate from "@/components/premium/PremiumFeatureGate";

interface AtsScoreBreakdownProps {
  resumeId: string;
  atsScore: number;
  formattingScore: number;
  keywordScore: number;
  skillsGapScore: number;
  keywordMatches: string[];
  keywordMisses: string[];
  beforeScore?: number;
  afterScore?: number;
  isPremiumUnlocked?: boolean;
}

export default function AtsScoreBreakdown({
  resumeId,
  atsScore,
  formattingScore,
  keywordScore,
  skillsGapScore,
  keywordMatches,
  keywordMisses,
  beforeScore,
  afterScore,
  isPremiumUnlocked = false,
}: AtsScoreBreakdownProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const BasicView = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>ATS Score</span>
          <Badge
            variant={getScoreBadgeVariant(atsScore)}
            className="text-lg px-3 py-1"
          >
            {atsScore}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={atsScore} className="h-3 mb-4" />
        <p className="text-sm text-gray-600">
          {atsScore >= 80
            ? "Excellent! Your resume is highly optimized for ATS systems."
            : atsScore >= 60
            ? "Good score, but there's room for improvement."
            : "Your resume needs optimization to pass ATS filters effectively."}
        </p>
      </CardContent>
    </Card>
  );

  const DetailedView = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Detailed ATS Analysis</span>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <Badge
              variant={getScoreBadgeVariant(atsScore)}
              className="text-lg px-3 py-1"
            >
              {atsScore}%
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall ATS Score</span>
            <span className={`text-sm font-bold ${getScoreColor(atsScore)}`}>
              {atsScore}%
            </span>
          </div>
          <Progress value={atsScore} className="h-3" />
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Formatting & Structure</span>
              <span
                className={`text-sm font-medium ${getScoreColor(
                  formattingScore
                )}`}
              >
                {formattingScore}%
              </span>
            </div>
            <Progress value={formattingScore} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Keyword Optimization</span>
              <span
                className={`text-sm font-medium ${getScoreColor(keywordScore)}`}
              >
                {keywordScore}%
              </span>
            </div>
            <Progress value={keywordScore} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Skills Gap</span>
              <span
                className={`text-sm font-medium ${getScoreColor(
                  skillsGapScore
                )}`}
              >
                {skillsGapScore}%
              </span>
            </div>
            <Progress value={skillsGapScore} className="h-2" />
          </div>
        </div>

        {/* Improvement Indicators */}
        {beforeScore && afterScore && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">
                Score Improvement
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-500">
                {beforeScore}%
              </span>
              <div className="flex items-center text-green-600">
                <div className="h-0.5 w-8 bg-gradient-to-r from-gray-400 to-green-600 mx-2"></div>
                <span className="text-lg">→</span>
                <div className="h-0.5 w-8 bg-green-600 mx-2"></div>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {afterScore}%
              </span>
            </div>
            <p className="text-xs text-green-700 mt-2">
              +{afterScore - beforeScore} point improvement with our
              optimizations
            </p>
          </div>
        )}

        {/* Keywords Status */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              Matched Keywords ({keywordMatches.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {keywordMatches.slice(0, 6).map((keyword, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-green-50 text-green-700 border-green-200"
                >
                  {keyword}
                </Badge>
              ))}
              {keywordMatches.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{keywordMatches.length - 6} more
                </Badge>
              )}
            </div>
          </div>

          {keywordMisses.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 text-amber-600 mr-2" />
                Missing Keywords ({keywordMisses.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {keywordMisses.slice(0, 6).map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs bg-amber-50 text-amber-700 border-amber-200"
                  >
                    {keyword}
                  </Badge>
                ))}
                {keywordMisses.length > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{keywordMisses.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Optimization Recommendations:
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            {formattingScore < 80 && (
              <li>• Improve resume formatting and section structure</li>
            )}
            {keywordScore < 80 && (
              <li>• Add more relevant keywords from the job description</li>
            )}
            {skillsGapScore < 80 && (
              <li>• Address missing skills or highlight transferable ones</li>
            )}
            <li>• Use action verbs and quantify achievements</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  // If premium is unlocked, show detailed view directly
  if (isPremiumUnlocked) {
    return <DetailedView />;
  }

  // Otherwise, use PremiumFeatureGate with client-side premium checking
  return (
    <PremiumFeatureGate
      featureId="detailed_ats_analysis"
      resumeId={resumeId}
      title="Detailed ATS Analysis"
      description="Get comprehensive scoring breakdown and optimization suggestions"
      showImprovement={!!beforeScore && !!afterScore}
      beforeScore={beforeScore}
      afterScore={afterScore}
      blurredChildren={<BasicView />}
    >
      <DetailedView />
    </PremiumFeatureGate>
  );
}
