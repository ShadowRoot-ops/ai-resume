import { Template, TemplateFilters } from "@/types/types";

/**
 * Filter templates based on provided filters
 */
export function filterTemplates(
  templates: Template[],
  filters: TemplateFilters
): Template[] {
  return templates.filter((template) => {
    // Filter by companies
    if (
      filters.companies?.length &&
      !filters.companies.includes(template.companyName)
    ) {
      return false;
    }

    // Filter by roles
    if (
      filters.roles?.length &&
      !filters.roles.some((role) =>
        template.jobTitle.toLowerCase().includes(role.toLowerCase())
      )
    ) {
      return false;
    }

    // Filter by seniority level
    if (
      filters.seniority?.length &&
      !filters.seniority.includes(template.seniorityLevel)
    ) {
      return false;
    }

    // Filter by industry
    if (
      filters.industry?.length &&
      template.industry &&
      !filters.industry.includes(template.industry)
    ) {
      return false;
    }

    // Filter by ATS score
    if (
      filters.atsScore &&
      template.atsScore &&
      template.atsScore < filters.atsScore
    ) {
      return false;
    }

    // Filter by success rate
    if (
      filters.successRate &&
      template.successRate &&
      template.successRate < filters.successRate
    ) {
      return false;
    }

    // Filter by date range
    if (filters.dateRange) {
      const templateDate = new Date(template.updatedAt);
      if (
        templateDate < filters.dateRange.start ||
        templateDate > filters.dateRange.end
      ) {
        return false;
      }
    }

    // Filter by verification status
    if (
      filters.isVerified !== undefined &&
      template.recruiterVerified !== filters.isVerified
    ) {
      return false;
    }

    // All filters passed
    return true;
  });
}

/**
 * Get similar templates based on a reference template
 */
export function getSimilarTemplates(
  templates: Template[],
  referenceTemplate: Template,
  limit: number = 3
): Template[] {
  // Filter out the reference template itself
  const otherTemplates = templates.filter((t) => t.id !== referenceTemplate.id);

  // Score each template for similarity
  const scoredTemplates = otherTemplates.map((template) => {
    let score = 0;

    // Same company
    if (template.companyName === referenceTemplate.companyName) {
      score += 5;
    }

    // Similar job title
    if (
      template.jobTitle
        .toLowerCase()
        .includes(referenceTemplate.jobTitle.toLowerCase()) ||
      referenceTemplate.jobTitle
        .toLowerCase()
        .includes(template.jobTitle.toLowerCase())
    ) {
      score += 4;
    }

    // Same seniority level
    if (template.seniorityLevel === referenceTemplate.seniorityLevel) {
      score += 3;
    }

    // Same industry
    if (template.industry === referenceTemplate.industry) {
      score += 2;
    }

    // Similar success rate (within 10%)
    if (
      template.successRate &&
      referenceTemplate.successRate &&
      Math.abs(template.successRate - referenceTemplate.successRate) <= 10
    ) {
      score += 1;
    }

    return {
      template,
      score,
    };
  });

  // Sort by score (descending) and take the top 'limit' templates
  return scoredTemplates
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.template);
}

/**
 * Calculate ATS compatibility score based on template content
 * This is a simplified example - a real implementation would be more sophisticated
 */
export function calculateAtsScore(templateContent: any): number {
  const score = 0;
  const maxScore = 10;

  // This is a placeholder for ATS scoring logic
  // In a real app, this would analyze formatting, keyword density, etc.

  return Math.min(maxScore, score);
}

/**
 * Format a date string in a human-readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format a file size in a human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
