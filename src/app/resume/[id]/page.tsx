// src/app/resume/[id]/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import { Edit, Trash2, CheckCircle, AlertCircle, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import PrintButton from "@/components/resume/PrintButton";
import DownloadOptions from "@/components/resume/DownloadOptions";
import AtsScoreBreakdown from "@/components/resume/AtsScoreBreakdown";
import KeywordSuggestions from "@/components/resume/KeywordSuggestions";
import PremiumFeatureGate from "@/components/premium/PremiumFeatureGate";
import { colorPalettes } from "@/lib/resume-templates";

// Helper function to safely format dates
const formatDate = (
  dateString: string | null | undefined,
  formatPattern: string
): string => {
  if (!dateString) return "N/A";

  try {
    return format(new Date(dateString), formatPattern);
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
};

export default function ResumePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const resumeRef = useRef<HTMLDivElement>(null);
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exceedsOnePage, setExceedsOnePage] = useState(false);
  const [keywordMatch, setKeywordMatch] = useState<{
    matched: string[];
    missing: string[];
  }>({
    matched: [],
    missing: [],
  });
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [unlockedFeatures, setUnlockedFeatures] = useState<string[]>([]);
  // Lightweight in-page toast replacement (sooner)
  const [sooner, setSooner] = useState<{
    title: string;
    description?: string;
    variant?: string;
  } | null>(null);

  // Show a lightweight toast-like notification (sooner)
  const soonerNotify = (payload: {
    title: string;
    description?: string;
    variant?: string;
  }) => {
    setSooner(payload);
    window.setTimeout(() => setSooner(null), 2500);
  };

  // Check if user has premium access
  useEffect(() => {
    const checkPremiumAccess = async () => {
      try {
        const response = await fetch("/api/user/subscription");
        if (response.ok) {
          const data = await response.json();
          setIsPremiumUser(data.subscription?.plan === "PRO");
          setUnlockedFeatures(data.unlockedFeatures || []);
        }
      } catch (error) {
        console.error("Error checking premium access:", error);
      }
    };

    checkPremiumAccess();
  }, []);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await fetch(`/api/resumes/${id}`);

        if (!response.ok) {
          throw new Error("Resume not found");
        }

        const data = await response.json();
        // Check if data has a resume property, and use that if available
        setResume(data.resume || data);
      } catch (err) {
        console.error("Error fetching resume:", err);
        setError("Failed to load resume");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResume();
    }
  }, [id]);

  useEffect(() => {
    if (resume && resume.jobDescription) {
      // Analyze keyword matches (improved version)
      const analyzeKeywords = () => {
        const jobDescLower = resume.jobDescription.toLowerCase();
        const skills = resume.content?.skills || [];
        const summary = resume.content?.summary?.toLowerCase() || "";
        const experienceText = (resume.content?.experience || [])
          .flatMap((exp: any) => {
            const texts = [];
            if (exp.position) texts.push(exp.position.toLowerCase());
            if (exp.company) texts.push(exp.company.toLowerCase());
            if (exp.responsibilities) {
              texts.push(
                ...exp.responsibilities.map((r: string) => r.toLowerCase())
              );
            }
            return texts;
          })
          .join(" ");

        // Industry-specific keywords list - expanded
        const commonKeywords = [
          // Technical skills
          "javascript",
          "react",
          "node",
          "nodejs",
          "typescript",
          "angular",
          "vue",
          "php",
          "python",
          "java",
          "c#",
          "ruby",
          "go",
          "swift",
          "kotlin",
          "html",
          "css",
          "scss",
          "tailwind",
          "bootstrap",
          "material-ui",
          "figma",
          "aws",
          "azure",
          "gcp",
          "firebase",
          "docker",
          "kubernetes",
          "terraform",
          "sql",
          "nosql",
          "mongodb",
          "postgresql",
          "mysql",
          "redis",
          "elasticsearch",
          "graphql",
          "rest",
          "api",
          "microservices",
          "serverless",
          "ci/cd",
          "jenkins",
          "git",
          "github",
          "gitlab",
          "devops",
          "testing",
          "jest",
          "cypress",
          "selenium",

          // Business skills
          "agile",
          "scrum",
          "kanban",
          "jira",
          "project management",
          "leadership",
          "team management",
          "stakeholder",
          "communication",
          "presentation",
          "analysis",
          "research",
          "strategy",
          "marketing",
          "sales",
          "customer service",
          "business development",
          "operations",
          "finance",
          "accounting",
          "hr",
          "analytics",
          "data analysis",
          "machine learning",
          "ai",
          "product management",
          "ux",
          "ui",
          "user experience",
          "design thinking",
          "content creation",
          "social media",
          "digital marketing",
          "seo",
          "ppc",
          "crm",
          "salesforce",

          // Soft skills
          "teamwork",
          "collaboration",
          "problem solving",
          "critical thinking",
          "time management",
          "adaptability",
          "flexibility",
          "creativity",
          "innovation",
          "attention to detail",
          "organization",
          "multitasking",
          "decision making",
          "conflict resolution",
          "negotiation",
          "empathy",
          "customer focus",
          "results driven",
          "self motivated",
        ];

        // Extract keywords from job description
        const relevantKeywords = commonKeywords.filter((keyword) =>
          jobDescLower.includes(keyword)
        );

        // Check for keyword matches
        const matched: string[] = [];
        const missing: string[] = [];

        for (const keyword of relevantKeywords) {
          const inSkills = skills.some((skill: string) =>
            skill.toLowerCase().includes(keyword)
          );
          const inSummary = summary.includes(keyword);
          const inExperience = experienceText.includes(keyword);

          if (inSkills || inSummary || inExperience) {
            matched.push(keyword);
          } else {
            missing.push(keyword);
          }
        }

        setKeywordMatch({
          matched: matched.slice(0, 12), // Show up to 12 matches
          missing: missing.slice(0, 12), // Show up to 12 missing keywords
        });
      };

      analyzeKeywords();
    }
  }, [resume]);

  useEffect(() => {
    const checkPageOverflow = () => {
      const resumeElement = resumeRef.current;
      if (!resumeElement) return;

      // A4 paper height is approximately 1123px at 96dpi
      const maxHeight = 1123;
      const currentHeight = resumeElement.scrollHeight;

      setExceedsOnePage(currentHeight > maxHeight);
    };

    if (!loading && resume) {
      checkPageOverflow();
      window.addEventListener("resize", checkPageOverflow);
    }

    return () => {
      window.removeEventListener("resize", checkPageOverflow);
    };
  }, [loading, resume]);

  const handleDeleteResume = async () => {
    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete resume");
      }

      soonerNotify({
        title: "Resume deleted",
        description: "Your resume has been deleted successfully.",
      });

      // Redirect to dashboard after deletion
      router.push("/dashboard");
    } catch (err) {
      console.error("Error deleting resume:", err);
      soonerNotify({
        title: "Error",
        description: "Failed to delete resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error || "Resume not found"}</p>
          <Link
            href="/dashboard"
            className="text-red-700 underline mt-2 inline-block"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Calculate job description match percentage
  const jobDescMatchPercentage =
    keywordMatch.matched.length + keywordMatch.missing.length === 0
      ? 0
      : Math.round(
          (keywordMatch.matched.length /
            (keywordMatch.matched.length + keywordMatch.missing.length)) *
            100
        );

  // Resume styling
  const colorPalette = colorPalettes[resume.colorPaletteIndex || 0];
  const resumeStyle = {
    fontFamily: resume.fontFamily || "Inter, sans-serif",
  };

  // Format the dates safely
  const createdDate = formatDate(resume.createdAt, "MMM d, yyyy");
  const updatedDate = formatDate(resume.updatedAt, "MMM d, yyyy");
  const datesAreDifferent =
    resume.createdAt &&
    resume.updatedAt &&
    resume.createdAt !== resume.updatedAt;

  return (
    <>
      {/* Lightweight toast/notification bar (sooner) */}
      {sooner && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-md shadow text-sm
            ${
              sooner.variant === "destructive"
                ? "bg-red-600 text-white"
                : "bg-green-600 text-white"
            }`}
          role="alert"
          aria-live="polite"
        >
          <strong className="mr-2">{sooner.title}</strong>
          {sooner.description && <span>{sooner.description}</span>}
        </div>
      )}

      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              {resume.title || "Untitled Resume"}
            </h1>
            <p className="text-gray-500">
              Created {createdDate}
              {datesAreDifferent && ` · Updated ${updatedDate}`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
            <PrintButton />

            {isPremiumUser || unlockedFeatures.includes("pdf_export") ? (
              <DownloadOptions
                resumeId={id}
                title={resume.title || "Resume"}
                resumeElementSelector="#resume-container"
              />
            ) : (
              <PremiumFeatureGate
                featureId="pdf_export"
                resumeId={id}
                title="Premium Export"
                blurredChildren={
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                }
              >
                <DownloadOptions
                  resumeId={id}
                  title={resume.title || "Resume"}
                  resumeElementSelector="#resume-container"
                />
              </PremiumFeatureGate>
            )}

            <Button variant="outline" asChild>
              <Link href={`/resume/${id}/edit`}>
                <Edit size={16} className="mr-2" />
                Edit
              </Link>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your resume.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteResume}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Resume Preview Column */}
          <div className="md:col-span-2">
            <Card className="mb-8 print:shadow-none print:border-none">
              <CardContent className="p-0">
                <div
                  ref={resumeRef}
                  id="resume-container"
                  className="resume-container p-8 relative"
                  style={resumeStyle}
                >
                  {/* Resume Header */}
                  <div className="text-center mb-6">
                    <h2
                      className="text-2xl font-bold"
                      style={{
                        color: colorPalette.primary,
                      }}
                    >
                      {resume.content?.personalInfo?.name || "Your Name"}
                    </h2>

                    <div className="flex flex-wrap justify-center gap-3 mt-2 text-sm">
                      {resume.content?.personalInfo?.email && (
                        <div className="flex items-center">
                          <span>📧 {resume.content.personalInfo.email}</span>
                        </div>
                      )}

                      {resume.content?.personalInfo?.phone && (
                        <div className="flex items-center">
                          <span>📱 {resume.content.personalInfo.phone}</span>
                        </div>
                      )}

                      {resume.content?.personalInfo?.location && (
                        <div className="flex items-center">
                          <span>📍 {resume.content.personalInfo.location}</span>
                        </div>
                      )}

                      {resume.content?.personalInfo?.linkedin && (
                        <div className="flex items-center">
                          <span>🔗 {resume.content.personalInfo.linkedin}</span>
                        </div>
                      )}

                      {resume.content?.personalInfo?.website && (
                        <div className="flex items-center">
                          <span>🌐 {resume.content.personalInfo.website}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  {resume.content?.summary && (
                    <div className="mb-6">
                      <h3
                        className="text-lg font-semibold mb-2 border-b pb-1"
                        style={{
                          color: colorPalette.primary,
                        }}
                      >
                        Professional Summary
                      </h3>
                      <p className="text-sm">{resume.content.summary}</p>
                    </div>
                  )}

                  {/* Experience */}
                  {resume.content?.experience?.length > 0 && (
                    <div className="mb-6">
                      <h3
                        className="text-lg font-semibold mb-2 border-b pb-1"
                        style={{
                          color: colorPalette.primary,
                        }}
                      >
                        Experience
                      </h3>

                      <div className="space-y-4">
                        {resume.content.experience.map(
                          (exp: any, index: number) => {
                            // Safely format experience dates
                            const startDate = exp.startDate
                              ? formatDate(exp.startDate, "MMM yyyy")
                              : "";
                            const endDate = exp.current
                              ? "Present"
                              : exp.endDate
                              ? formatDate(exp.endDate, "MMM yyyy")
                              : "";

                            return (
                              <div key={index} className="text-sm">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-bold">
                                      {exp.position}
                                    </div>
                                    <div>
                                      {exp.company}
                                      {exp.location ? `, ${exp.location}` : ""}
                                    </div>
                                  </div>
                                  <div className="text-right whitespace-nowrap">
                                    {startDate}
                                    {" - "}
                                    {endDate}
                                  </div>
                                </div>

                                {exp.responsibilities?.length > 0 && (
                                  <ul className="list-disc pl-5 mt-2 space-y-1">
                                    {exp.responsibilities.map(
                                      (resp: string, respIndex: number) => (
                                        <li key={respIndex}>{resp}</li>
                                      )
                                    )}
                                  </ul>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {resume.content?.education?.length > 0 && (
                    <div className="mb-6">
                      <h3
                        className="text-lg font-semibold mb-2 border-b pb-1"
                        style={{
                          color: colorPalette.primary,
                        }}
                      >
                        Education
                      </h3>

                      <div className="space-y-4">
                        {resume.content.education.map(
                          (edu: any, index: number) => {
                            // Safely format education dates
                            const startDate = edu.startDate
                              ? formatDate(edu.startDate, "yyyy")
                              : "";
                            const endDate = edu.current
                              ? "Present"
                              : edu.endDate
                              ? formatDate(edu.endDate, "yyyy")
                              : "";

                            return (
                              <div key={index} className="text-sm">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-bold">
                                      {edu.degree}
                                      {edu.fieldOfStudy
                                        ? ` in ${edu.fieldOfStudy}`
                                        : ""}
                                    </div>
                                    <div>{edu.institution}</div>
                                    {edu.gpa && <div>GPA: {edu.gpa}</div>}
                                  </div>
                                  <div className="text-right whitespace-nowrap">
                                    {startDate}
                                    {" - "}
                                    {endDate}
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {resume.content?.skills?.length > 0 && (
                    <div className="mb-6">
                      <h3
                        className="text-lg font-semibold mb-2 border-b pb-1"
                        style={{
                          color: colorPalette.primary,
                        }}
                      >
                        Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {resume.content.skills.map(
                          (skill: string, index: number) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 text-xs rounded-md"
                              style={{
                                backgroundColor: `${colorPalette.primary}20`,
                              }}
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {resume.content?.projects?.length > 0 && (
                    <div className="mb-6">
                      <h3
                        className="text-lg font-semibold mb-2 border-b pb-1"
                        style={{
                          color: colorPalette.primary,
                        }}
                      >
                        Projects
                      </h3>

                      <div className="space-y-4">
                        {resume.content.projects.map(
                          (project: any, index: number) => (
                            <div key={index} className="text-sm">
                              <div className="font-bold">{project.name}</div>
                              <p className="mt-1">{project.description}</p>

                              {project.technologies && (
                                <div className="mt-1">
                                  <span className="font-medium">
                                    Technologies:
                                  </span>{" "}
                                  {project.technologies}
                                </div>
                              )}

                              {project.url && (
                                <div className="mt-1">
                                  <span className="font-medium">URL:</span>{" "}
                                  <a
                                    href={project.url}
                                    className="text-blue-600 hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {project.url}
                                  </a>
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* One-page warning (only visible in preview, not in print) */}
                  {exceedsOnePage && (
                    <div className="absolute bottom-0 left-0 right-0 h-10 border-t border-dashed border-red-400 bg-red-50 flex items-center justify-center print-hide">
                      <span className="text-red-600 text-xs">
                        Page Break - Content continues to next page
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Warning for exceeding one page */}
            {exceedsOnePage && (
              <div className="mb-8 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 print-hide">
                <div className="flex items-start">
                  <AlertCircle
                    size={18}
                    className="mr-2 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p className="font-medium">Your resume exceeds one page</p>
                    <p className="text-sm mt-1">
                      Consider shortening content or removing less relevant
                      information to fit everything on a single page.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6 print-hide">
            {/* ATS Score Card */}
            <AtsScoreBreakdown
              resumeId={id}
              atsScore={resume.atsScore || 60}
              formattingScore={resume.formatScore || 65}
              keywordScore={jobDescMatchPercentage}
              skillsGapScore={
                resume.formatScore
                  ? Math.round((resume.atsScore + resume.formatScore) / 2)
                  : 60
              }
              keywordMatches={keywordMatch.matched}
              keywordMisses={keywordMatch.missing}
              beforeScore={resume.analysisData?.beforeScore}
              afterScore={resume.analysisData?.afterScore}
              isPremiumUnlocked={
                isPremiumUser ||
                unlockedFeatures.includes("detailed_ats_analysis")
              }
            />

            {/* Job Description Match */}
            {resume.jobDescription && (
              <Card>
                <CardHeader>
                  <CardTitle>Job Description Match</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Keyword Match</span>
                      <span className="font-medium">
                        {jobDescMatchPercentage}%
                      </span>
                    </div>
                    <Progress value={jobDescMatchPercentage} className="h-2" />
                  </div>

                  {/* Keyword Suggestions */}
                  <KeywordSuggestions
                    resumeId={id}
                    missingKeywords={keywordMatch.missing}
                    jobTitle={resume.jobTitle || ""}
                    isPremiumUnlocked={
                      isPremiumUser ||
                      unlockedFeatures.includes("keyword_suggestions")
                    }
                  />
                </CardContent>
              </Card>
            )}

            {/* Job Description */}
            {resume.jobDescription && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>Job Description</span>
                    {resume.jobTitle && (
                      <span className="text-sm font-normal text-gray-500">
                        {resume.jobTitle}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm max-h-96 overflow-y-auto">
                    {resume.jobDescription
                      .split("\n")
                      .map((paragraph: string, idx: number) => (
                        <p key={idx} className="mb-3">
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Industry Templates */}
            {resume.jobTitle && (
              <PremiumFeatureGate
                featureId="industry_templates"
                resumeId={id}
                title="Industry Templates"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Industry-specific Templates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">
                      We&apos;ve found these templates to work best for{" "}
                      <span className="font-medium">{resume.jobTitle}</span>{" "}
                      positions:
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/resume/${id}/edit?template=industry_1`}
                        className="block"
                      >
                        <div className="border rounded-md p-2 hover:border-primary cursor-pointer">
                          <div className="h-24 bg-gray-100 rounded-sm mb-2"></div>
                          <p className="text-xs font-medium">Professional</p>
                        </div>
                      </Link>

                      <Link
                        href={`/resume/${id}/edit?template=industry_2`}
                        className="block"
                      >
                        <div className="border rounded-md p-2 hover:border-primary cursor-pointer">
                          <div className="h-24 bg-gray-100 rounded-sm mb-2"></div>
                          <p className="text-xs font-medium">Modern</p>
                        </div>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </PremiumFeatureGate>
            )}

            {/* Free User Upgrade CTA */}
            {!isPremiumUser && (
              <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="font-bold text-lg text-indigo-700">
                      Upgrade to Pro
                    </h3>
                    <p className="text-indigo-600 text-sm mt-1 mb-4">
                      Get unlimited access to all premium features
                    </p>

                    <div className="space-y-3 text-left mb-6">
                      <div className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 mr-2" />
                        <p className="text-sm">
                          Detailed ATS analysis & score breakdown
                        </p>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 mr-2" />
                        <p className="text-sm">
                          Company-specific resume templates
                        </p>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 mr-2" />
                        <p className="text-sm">
                          Unlimited resume scans & exports
                        </p>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 mr-2" />
                        <p className="text-sm">Industry keyword packs</p>
                      </div>
                    </div>

                    <Button className="w-full" asChild>
                      <Link href={`/pricing?resumeId=${id}`}>
                        Upgrade Now ₹299/month
                      </Link>
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Or pay-per-use: ₹99 for 7 credits
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
