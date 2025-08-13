// src/app/api/keywords/suggestions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/user-helpers";
import { isFeatureUnlocked } from "@/lib/subscription-helpers";

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(userId);
    const isUnlocked = await isFeatureUnlocked(user.id, "keyword_suggestions");

    if (!isUnlocked) {
      return NextResponse.json(
        { error: "Feature not unlocked" },
        { status: 403 }
      );
    }

    const { resumeId, jobTitle, missingKeywords } = await request.json();

    // Industry-specific keyword mappings
    const industryKeywords: Record<string, string[]> = {
      "software engineer": [
        "software development",
        "programming",
        "debugging",
        "code review",
        "version control",
        "software architecture",
        "algorithms",
        "data structures",
      ],
      "frontend developer": [
        "responsive design",
        "cross-browser compatibility",
        "ui/ux",
        "web performance",
        "accessibility",
        "modern frameworks",
        "component-based architecture",
      ],
      "backend developer": [
        "server-side development",
        "database design",
        "api development",
        "scalability",
        "performance optimization",
        "security",
        "cloud services",
      ],
      "data scientist": [
        "statistical analysis",
        "data visualization",
        "predictive modeling",
        "big data",
        "data mining",
        "business intelligence",
        "model validation",
      ],
      "product manager": [
        "product strategy",
        "roadmap planning",
        "stakeholder management",
        "user research",
        "market analysis",
        "feature prioritization",
        "kpis",
      ],
      "marketing manager": [
        "campaign management",
        "brand strategy",
        "market research",
        "lead generation",
        "conversion optimization",
        "roi analysis",
        "customer acquisition",
      ],
      "project manager": [
        "project planning",
        "risk management",
        "resource allocation",
        "timeline management",
        "stakeholder communication",
        "budget management",
      ],
    };

    // Generate suggestions based on job title and missing keywords
    const generateSuggestions = () => {
      const suggestions: string[] = [];
      const jobTitleLower = jobTitle.toLowerCase();

      // Find matching industry keywords
      for (const [industry, keywords] of Object.entries(industryKeywords)) {
        if (jobTitleLower.includes(industry.toLowerCase())) {
          suggestions.push(...keywords);
        }
      }

      // Add variations of missing keywords
      missingKeywords.forEach((keyword: string) => {
        const variations = generateKeywordVariations(keyword);
        suggestions.push(...variations);
      });

      // Remove duplicates and limit to 10 suggestions
      return [...new Set(suggestions)].slice(0, 10);
    };

    const generateKeywordVariations = (keyword: string): string[] => {
      const variations: string[] = [];

      // Common variations and related terms
      const variationMap: Record<string, string[]> = {
        javascript: ["js", "ecmascript", "frontend development"],
        react: ["reactjs", "react.js", "component-based development"],
        python: ["python programming", "python development", "scripting"],
        java: ["java programming", "object-oriented programming"],
        leadership: ["team leadership", "people management", "team building"],
        communication: [
          "verbal communication",
          "written communication",
          "presentation skills",
        ],
        analysis: ["analytical skills", "data analysis", "problem analysis"],
        management: [
          "project management",
          "team management",
          "resource management",
        ],
      };

      if (variationMap[keyword.toLowerCase()]) {
        variations.push(...variationMap[keyword.toLowerCase()]);
      }

      return variations;
    };

    const suggestions = generateSuggestions();

    return NextResponse.json({
      suggestions,
      resumeId,
    });
  } catch (error) {
    console.error("Error generating keyword suggestions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
