// Template related types
export type Industry =
  | "Technology"
  | "Healthcare"
  | "Finance"
  | "Education"
  | "Retail"
  | "Manufacturing"
  | "Consulting"
  | "Media"
  | "Government"
  | "Nonprofit"
  | "Other";

export type CompanySize =
  | "startup"
  | "small"
  | "medium"
  | "large"
  | "enterprise";

export type SeniorityLevel =
  | "intern"
  | "entry"
  | "junior"
  | "mid"
  | "senior"
  | "lead"
  | "manager"
  | "director"
  | "executive";

export type TemplateFormat = "pdf" | "docx" | "latex";

export type Template = {
  id: string;
  templateName?: string;
  companyName: string;
  jobTitle: string;
  seniorityLevel: SeniorityLevel;
  industry?: Industry;
  companySize?: CompanySize;
  department?: string;
  description?: string;
  successRate?: number;
  atsScore?: number;
  cultureFitIndicators?: string;
  keySkills?: string[];
  tipsAndInsights?: string;
  redFlags?: string;
  sampleInterviewQuestions?: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  recruiterVerified?: boolean;
  downloads?: number;
  views?: number;
  version?: string;
  isPublic: boolean;
  formats?: TemplateFormat[];
  templateContent?: any; // This would be defined more specifically in a real app
};

export type TemplateFilters = {
  companies?: string[];
  roles?: string[];
  seniority?: SeniorityLevel[];
  industry?: Industry[];
  experience?: string;
  atsScore?: number;
  successRate?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
  isVerified?: boolean;
};

// Analytics related types
export type TemplateAnalytics = {
  templateId: string;
  views: number;
  downloads: number;
  interviews: number;
  offers: number;
  successRate: number;
  feedback: {
    average: number;
    count: number;
  };
  demographics: {
    industries: {
      name: string;
      percentage: number;
    }[];
    experience: {
      range: string;
      percentage: number;
    }[];
    locations: {
      country: string;
      count: number;
    }[];
  };
  trendsData: {
    date: string;
    downloads: number;
    interviews: number;
    successRate: number;
  }[];
};

// User related types
export type UserRole = "user" | "recruiter" | "admin";

export type User = {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  company?: string;
  position?: string;
  industry?: Industry;
  yearsOfExperience?: number;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
};
