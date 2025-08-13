// src/app/api/keywords/industry/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// Industry-specific keyword collections
const industryKeywords = {
  // IT & Software Development
  it: [
    "agile methodology",
    "api development",
    "automated testing",
    "ci/cd pipeline",
    "cloud architecture",
    "data structures",
    "devops",
    "distributed systems",
    "git",
    "kubernetes",
    "microservices",
    "object-oriented programming",
    "restful apis",
    "scalability",
    "system design",
    "version control",
  ],

  // Marketing
  marketing: [
    "a/b testing",
    "brand strategy",
    "content creation",
    "conversion optimization",
    "digital campaigns",
    "email marketing",
    "growth hacking",
    "inbound marketing",
    "lead generation",
    "market research",
    "seo/sem",
    "social media marketing",
    "user acquisition",
    "user engagement",
    "web analytics",
    "content strategy",
  ],

  // Sales
  sales: [
    "account management",
    "business development",
    "client relationship",
    "closing techniques",
    "crm software",
    "customer acquisition",
    "lead qualification",
    "negotiation skills",
    "pipeline management",
    "prospecting",
    "revenue growth",
    "sales cycle",
    "sales forecasting",
    "solution selling",
    "territory management",
    "upselling",
  ],

  // Design
  design: [
    "accessibility",
    "adobe creative suite",
    "brand identity",
    "color theory",
    "design thinking",
    "figma",
    "information architecture",
    "interaction design",
    "prototyping",
    "responsive design",
    "sketch",
    "typography",
    "ui/ux design",
    "user research",
    "visual hierarchy",
    "wireframing",
  ],

  // Finance
  finance: [
    "accounting principles",
    "budgeting",
    "cash flow management",
    "cost analysis",
    "financial modeling",
    "financial reporting",
    "forecasting",
    "investment analysis",
    "p&l management",
    "risk assessment",
    "spreadsheet modeling",
    "valuation",
    "venture capital",
    "financial statements",
    "portfolio management",
    "tax planning",
  ],

  // HR
  hr: [
    "benefits administration",
    "compensation planning",
    "conflict resolution",
    "employee engagement",
    "employee relations",
    "hr information systems",
    "onboarding",
    "performance management",
    "recruitment",
    "retention strategies",
    "succession planning",
    "talent acquisition",
    "training & development",
    "workforce planning",
    "diversity & inclusion",
    "organizational development",
  ],

  // Operations
  operations: [
    "business process optimization",
    "continuous improvement",
    "inventory management",
    "lean methodology",
    "logistics",
    "operational efficiency",
    "process documentation",
    "quality assurance",
    "resource allocation",
    "risk management",
    "six sigma",
    "supply chain management",
    "vendor management",
    "workflow optimization",
    "capacity planning",
    "process automation",
  ],
};

// Map job titles to industries
function mapJobTitleToIndustry(jobTitle: string): string[] {
  const title = jobTitle.toLowerCase();

  if (
    title.includes("develop") ||
    title.includes("program") ||
    title.includes("engineer") ||
    title.includes("code") ||
    title.includes("software") ||
    title.includes("tech") ||
    title.includes("data") ||
    title.includes("it ")
  ) {
    return industryKeywords.it;
  }

  if (
    title.includes("market") ||
    title.includes("brand") ||
    title.includes("content") ||
    title.includes("seo") ||
    title.includes("social media") ||
    title.includes("digital")
  ) {
    return industryKeywords.marketing;
  }

  if (
    title.includes("sales") ||
    title.includes("account") ||
    title.includes("business develop") ||
    title.includes("client") ||
    title.includes("revenue")
  ) {
    return industryKeywords.sales;
  }

  if (
    title.includes("design") ||
    title.includes("ux") ||
    title.includes("ui") ||
    title.includes("graphic") ||
    title.includes("product design")
  ) {
    return industryKeywords.design;
  }

  if (
    title.includes("financ") ||
    title.includes("account") ||
    title.includes("bookkeep") ||
    title.includes("invest") ||
    title.includes("banking") ||
    title.includes("audit")
  ) {
    return industryKeywords.finance;
  }

  if (
    title.includes("hr") ||
    title.includes("human resource") ||
    title.includes("recruit") ||
    title.includes("talent") ||
    title.includes("people operations")
  ) {
    return industryKeywords.hr;
  }

  if (
    title.includes("operat") ||
    title.includes("logistics") ||
    title.includes("supply chain") ||
    title.includes("process") ||
    title.includes("production") ||
    title.includes("project manage")
  ) {
    return industryKeywords.operations;
  }

  // Default to IT if nothing matches
  return [...industryKeywords.it];
}

export async function GET(request: Request) {
  try {
    // Get user authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    // const user = await getOrCreateUser(userId);

    // Get query parameters
    const url = new URL(request.url);
    const jobTitle = url.searchParams.get("jobTitle") || "";

    if (!jobTitle) {
      return NextResponse.json(
        { error: "jobTitle parameter is required" },
        { status: 400 }
      );
    }

    // Get keywords for this job title
    const keywords = mapJobTitleToIndustry(jobTitle);

    // Shuffle and select a subset
    const shuffled = [...keywords].sort(() => 0.5 - Math.random());
    const selectedKeywords = shuffled.slice(0, 10);

    return NextResponse.json({
      keywords: selectedKeywords,
    });
  } catch (error) {
    console.error("Error fetching industry keywords:", error);
    return NextResponse.json(
      { error: "Failed to fetch industry keywords" },
      { status: 500 }
    );
  }
}
