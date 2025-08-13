// src/components/recruiter/ResumeMatchingSystem.tsx
"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Search,
  Filter,
  Download,
  Star,
  User,
  Clock,
  MapPin,
  Award,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
  Briefcase,
  GraduationCap,
  Trash2,
  RefreshCw,
  Settings,
  Users,
  TrendingUp,
  Mail,
  Phone,
  Calendar,
  Badge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface SingleAnalysis {
  analysis: {
    overallScore: number;
    keywordMatches: string[];
    missingKeywords: string[];
    skillsMatch: string[];
    missingSkills: string[];
    experienceMatch: boolean;
    experienceGap: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    atsScore: number;
    detailedAnalysis: {
      technicalSkills: number;
      experience: number;
      education: number;
      keywords: number;
    };
  };
  fileName: string;
  fileSize: number;
}

interface BulkAnalysis {
  fileName: string;
  fileSize: number;
  candidateName: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  currentRole: string;
  skills: string[];
  education: string;
  overallScore: number;
  keywordMatches: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  atsScore: number;
  recommendation: "HIRE" | "MAYBE" | "REJECT";
  reasonForRecommendation: string;
}

interface BulkResults {
  totalProcessed: number;
  totalMatched: number;
  results: BulkAnalysis[];
  errors?: string[];
  summary: {
    hireRecommended: number;
    maybeRecommended: number;
    rejected: number;
    averageScore: number;
  };
}

const ResumeMatchingSystem = () => {
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");
  const [jobDescription, setJobDescription] = useState("");
  const [singleResumeFile, setSingleResumeFile] = useState<File | null>(null);
  const [bulkResumes, setBulkResumes] = useState<File[]>([]);
  const [singleResult, setSingleResult] = useState<SingleAnalysis | null>(null);
  const [bulkResults, setBulkResults] = useState<BulkResults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filters, setFilters] = useState({
    minExperience: "",
    maxExperience: "",
    requiredSkills: "",
    location: "",
    education: "",
    minScore: 70,
    maxCandidates: 10,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const singleFileRef = useRef<HTMLInputElement>(null);
  const bulkFileRef = useRef<HTMLInputElement>(null);

  const handleSingleResumeUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload PDF, DOCX, or TXT files only");
        return;
      }
      setSingleResumeFile(file);
      setSingleResult(null);
    }
  };

  const handleBulkUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    const validFiles = files.filter((file) => allowedTypes.includes(file.type));
    if (validFiles.length !== files.length) {
      alert(
        "Some files were skipped. Only PDF, DOCX, and TXT files are supported."
      );
    }

    setBulkResumes(validFiles);
    setBulkResults(null);
  };

  const analyzeSingleResume = async () => {
    if (!singleResumeFile || !jobDescription.trim()) {
      alert("Please upload a resume and provide job description");
      return;
    }

    setIsAnalyzing(true);
    setErrors([]);

    try {
      const formData = new FormData();
      formData.append("resume", singleResumeFile);
      formData.append("jobDescription", jobDescription);

      const response = await fetch("/api/recruiter/resume-match", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setSingleResult(data);
    } catch (error) {
      console.error("Single resume analysis error:", error);
      setErrors([error instanceof Error ? error.message : "Analysis failed"]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeBulkResumes = async () => {
    if (bulkResumes.length === 0 || !jobDescription.trim()) {
      alert("Please upload resumes and provide job description");
      return;
    }

    setIsAnalyzing(true);
    setErrors([]);

    try {
      const formData = new FormData();
      formData.append("jobDescription", jobDescription);

      // Add filters
      const filterData = {
        minExperience: filters.minExperience
          ? parseInt(filters.minExperience)
          : undefined,
        maxExperience: filters.maxExperience
          ? parseInt(filters.maxExperience)
          : undefined,
        requiredSkills: filters.requiredSkills
          ? filters.requiredSkills.split(",").map((s) => s.trim())
          : [],
        location: filters.location || undefined,
        education: filters.education || undefined,
        minScore: filters.minScore,
        maxCandidates: filters.maxCandidates,
      };

      formData.append("filters", JSON.stringify(filterData));

      // Add all resume files
      bulkResumes.forEach((file, index) => {
        formData.append(`resumes[${index}]`, file);
      });

      const response = await fetch("/api/recruiter/bulk-resume-match", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Bulk analysis failed");
      }

      setBulkResults(data);
      if (data.errors) {
        setErrors(data.errors);
      }
    } catch (error) {
      console.error("Bulk resume analysis error:", error);
      setErrors([
        error instanceof Error ? error.message : "Bulk analysis failed",
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeBulkFile = (index: number) => {
    setBulkResumes((prev) => prev.filter((_, i) => i !== index));
  };

  const downloadResults = () => {
    const dataToDownload = bulkResults?.results || [];
    if (dataToDownload.length === 0) return;

    const csvContent = [
      // CSV headers
      "Name,Email,Phone,Location,Experience,Current Role,Education,Overall Score,ATS Score,Recommendation,Skills,Missing Skills,Strengths",
      // CSV rows
      ...dataToDownload.map((result) =>
        [
          result.candidateName,
          result.email,
          result.phone,
          result.location,
          result.experience,
          result.currentRole,
          result.education,
          result.overallScore,
          result.atsScore,
          result.recommendation,
          result.skills.join("; "),
          result.missingSkills.join("; "),
          result.strengths.join("; "),
        ]
          .map((field) => `"${field}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume_analysis_results_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "HIRE":
        return "bg-green-100 text-green-800";
      case "MAYBE":
        return "bg-yellow-100 text-yellow-800";
      case "REJECT":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Resume Matching System
        </h1>
        <p className="text-gray-600">
          Analyze individual resumes or process multiple candidates against job
          requirements using AI
        </p>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-sm font-medium text-red-800">
              Errors occurred:
            </h3>
          </div>
          <ul className="list-disc list-inside text-sm text-red-700">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("single")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "single"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Single Resume Analysis
              </div>
            </button>
            <button
              onClick={() => setActiveTab("bulk")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "bulk"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Bulk Resume Processing
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Job Description Input */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="mr-2 h-5 w-5" />
            Job Description
          </CardTitle>
          <CardDescription>
            Paste the job description or requirements to match candidates
            against
          </CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here...

Example:
We are looking for a Senior Software Engineer with:
- 3+ years of experience in JavaScript, React, and Node.js
- Experience with AWS cloud services
- Bachelor's degree in Computer Science or related field
- Strong problem-solving skills
- Experience with agile development methodologies"
            className="w-full h-40 p-3 border border-gray-300 rounded-lg resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </CardContent>
      </Card>

      {/* Single Resume Analysis */}
      {activeTab === "single" && (
        <div>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upload Resume</CardTitle>
              <CardDescription>
                Upload a single resume file (PDF, DOCX, or TXT) for detailed
                analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {singleResumeFile ? (
                        <>
                          <FileText className="w-10 h-10 mb-3 text-blue-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              {singleResumeFile.name}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">
                            {(singleResumeFile.size / 1024 / 1024).toFixed(2)}{" "}
                            MB
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PDF, DOCX, or TXT (MAX. 10MB)
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      ref={singleFileRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.txt"
                      onChange={handleSingleResumeUpload}
                    />
                  </label>
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={analyzeSingleResume}
                    disabled={
                      !singleResumeFile || !jobDescription.trim() || isAnalyzing
                    }
                    className="flex-1"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Analyze Resume
                      </>
                    )}
                  </Button>

                  {singleResumeFile && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSingleResumeFile(null);
                        setSingleResult(null);
                        if (singleFileRef.current) {
                          singleFileRef.current.value = "";
                        }
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Single Resume Results */}
          {singleResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Analysis Results</span>
                  <div className="flex items-center space-x-2">
                    <UIBadge
                      variant="secondary"
                      className={getScoreColor(
                        singleResult.analysis.overallScore
                      )}
                    >
                      Overall Score: {singleResult.analysis.overallScore}%
                    </UIBadge>
                    <UIBadge
                      variant="secondary"
                      className={getScoreColor(singleResult.analysis.atsScore)}
                    >
                      ATS Score: {singleResult.analysis.atsScore}%
                    </UIBadge>
                  </div>
                </CardTitle>
                <CardDescription>
                  Detailed analysis for {singleResult.fileName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Score Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Technical Skills
                        </span>
                        <span className="text-sm text-gray-500">
                          {
                            singleResult.analysis.detailedAnalysis
                              .technicalSkills
                          }
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          singleResult.analysis.detailedAnalysis.technicalSkills
                        }
                        className="h-2"
                      />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Experience</span>
                        <span className="text-sm text-gray-500">
                          {singleResult.analysis.detailedAnalysis.experience}%
                        </span>
                      </div>
                      <Progress
                        value={
                          singleResult.analysis.detailedAnalysis.experience
                        }
                        className="h-2"
                      />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Education</span>
                        <span className="text-sm text-gray-500">
                          {singleResult.analysis.detailedAnalysis.education}%
                        </span>
                      </div>
                      <Progress
                        value={singleResult.analysis.detailedAnalysis.education}
                        className="h-2"
                      />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Keywords</span>
                        <span className="text-sm text-gray-500">
                          {singleResult.analysis.detailedAnalysis.keywords}%
                        </span>
                      </div>
                      <Progress
                        value={singleResult.analysis.detailedAnalysis.keywords}
                        className="h-2"
                      />
                    </div>
                  </div>

                  {/* Matched and Missing Skills */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Matched Skills (
                        {singleResult.analysis.skillsMatch.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {singleResult.analysis.skillsMatch.map(
                          (skill, index) => (
                            <UIBadge
                              key={index}
                              variant="secondary"
                              className="bg-green-100 text-green-800"
                            >
                              {skill}
                            </UIBadge>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-red-700 mb-3 flex items-center">
                        <XCircle className="mr-2 h-4 w-4" />
                        Missing Skills (
                        {singleResult.analysis.missingSkills.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {singleResult.analysis.missingSkills.map(
                          (skill, index) => (
                            <UIBadge
                              key={index}
                              variant="secondary"
                              className="bg-red-100 text-red-800"
                            >
                              {skill}
                            </UIBadge>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Keyword Analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-blue-700 mb-3 flex items-center">
                        <Target className="mr-2 h-4 w-4" />
                        Matched Keywords (
                        {singleResult.analysis.keywordMatches.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {singleResult.analysis.keywordMatches.map(
                          (keyword, index) => (
                            <UIBadge
                              key={index}
                              variant="outline"
                              className="text-blue-600"
                            >
                              {keyword}
                            </UIBadge>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-orange-700 mb-3 flex items-center">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Missing Keywords (
                        {singleResult.analysis.missingKeywords.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {singleResult.analysis.missingKeywords.map(
                          (keyword, index) => (
                            <UIBadge
                              key={index}
                              variant="outline"
                              className="text-orange-600"
                            >
                              {keyword}
                            </UIBadge>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Strengths and Weaknesses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Strengths
                      </h4>
                      <ul className="space-y-2">
                        {singleResult.analysis.strengths.map(
                          (strength, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">
                                {strength}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-red-700 mb-3 flex items-center">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Areas for Improvement
                      </h4>
                      <ul className="space-y-2">
                        {singleResult.analysis.weaknesses.map(
                          (weakness, index) => (
                            <li key={index} className="flex items-start">
                              <XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">
                                {weakness}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Experience Gap Analysis */}
                  {singleResult.analysis.experienceGap && (
                    <div>
                      <h4 className="font-semibold text-purple-700 mb-3 flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        Experience Analysis
                      </h4>
                      <div
                        className={`p-4 rounded-lg ${
                          singleResult.analysis.experienceMatch
                            ? "bg-green-50 border border-green-200"
                            : "bg-yellow-50 border border-yellow-200"
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          {singleResult.analysis.experienceMatch ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                          )}
                          <span
                            className={`font-medium ${
                              singleResult.analysis.experienceMatch
                                ? "text-green-800"
                                : "text-yellow-800"
                            }`}
                          >
                            {singleResult.analysis.experienceMatch
                              ? "Experience Requirements Met"
                              : "Experience Gap Identified"}
                          </span>
                        </div>
                        <p
                          className={`text-sm ${
                            singleResult.analysis.experienceMatch
                              ? "text-green-700"
                              : "text-yellow-700"
                          }`}
                        >
                          {singleResult.analysis.experienceGap}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {singleResult.analysis.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-indigo-700 mb-3 flex items-center">
                        <Star className="mr-2 h-4 w-4" />
                        Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {singleResult.analysis.recommendations.map(
                          (recommendation, index) => (
                            <li key={index} className="flex items-start">
                              <Star className="h-4 w-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">
                                {recommendation}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Bulk Resume Analysis */}
      {activeTab === "bulk" && (
        <div>
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Filtering Options
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  {showFilters ? "Hide" : "Show"} Filters
                </Button>
              </CardTitle>
            </CardHeader>
            {showFilters && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Experience (years)
                    </label>
                    <input
                      type="number"
                      value={filters.minExperience}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          minExperience: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. 2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Experience (years)
                    </label>
                    <input
                      type="number"
                      value={filters.maxExperience}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          maxExperience: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. 10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={filters.location}
                      onChange={(e) =>
                        setFilters({ ...filters, location: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. Bengaluru, Mumbai"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Required Skills (comma separated)
                    </label>
                    <input
                      type="text"
                      value={filters.requiredSkills}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          requiredSkills: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. JavaScript, React, Node.js"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Education Level
                    </label>
                    <select
                      value={filters.education}
                      onChange={(e) =>
                        setFilters({ ...filters, education: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Any</option>
                      <option value="High School">High School</option>
                      <option value="Bachelor">Bachelor's Degree</option>
                      <option value="Master">Master's Degree</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Score: {filters.minScore}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.minScore}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          minScore: parseInt(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Candidates
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={filters.maxCandidates}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          maxCandidates: parseInt(e.target.value),
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Bulk Upload */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upload Multiple Resumes</CardTitle>
              <CardDescription>
                Upload multiple resume files (PDF, DOCX, or TXT) for batch
                processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {bulkResumes.length > 0 ? (
                        <>
                          <Users className="w-10 h-10 mb-3 text-blue-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              {bulkResumes.length} files selected
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">
                            Total size:{" "}
                            {(
                              bulkResumes.reduce(
                                (acc, file) => acc + file.size,
                                0
                              ) /
                              1024 /
                              1024
                            ).toFixed(2)}{" "}
                            MB
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            Multiple PDF, DOCX, or TXT files (MAX. 10MB each)
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      ref={bulkFileRef}
                      type="file"
                      className="hidden"
                      multiple
                      accept=".pdf,.docx,.txt"
                      onChange={handleBulkUpload}
                    />
                  </label>
                </div>

                {/* File List */}
                {bulkResumes.length > 0 && (
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                    <div className="divide-y divide-gray-200">
                      {bulkResumes.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3"
                        >
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-blue-500 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBulkFile(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button
                    onClick={analyzeBulkResumes}
                    disabled={
                      bulkResumes.length === 0 ||
                      !jobDescription.trim() ||
                      isAnalyzing
                    }
                    className="flex-1"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Processing {bulkResumes.length} resumes...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Analyze {bulkResumes.length} Resumes
                      </>
                    )}
                  </Button>

                  {bulkResumes.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setBulkResumes([]);
                        setBulkResults(null);
                        if (bulkFileRef.current) {
                          bulkFileRef.current.value = "";
                        }
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Results */}
          {bulkResults && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Analysis Summary</span>
                    <Button
                      onClick={downloadResults}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export Results
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {bulkResults.totalProcessed}
                      </div>
                      <div className="text-sm text-blue-800">
                        Total Processed
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {bulkResults.summary.hireRecommended}
                      </div>
                      <div className="text-sm text-green-800">Recommended</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {bulkResults.summary.maybeRecommended}
                      </div>
                      <div className="text-sm text-yellow-800">Maybe</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {bulkResults.summary.averageScore}%
                      </div>
                      <div className="text-sm text-gray-800">Average Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Candidate Results */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Top Candidates ({bulkResults.totalMatched} matches)
                  </CardTitle>
                  <CardDescription>
                    Results sorted by overall match score (highest first)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bulkResults.results.map((candidate, index) => (
                      <div
                        key={candidate.fileName}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {candidate.candidateName !== "Not Found"
                                  ? candidate.candidateName
                                  : `Candidate ${index + 1}`}
                              </h3>
                              <UIBadge
                                className={getRecommendationColor(
                                  candidate.recommendation
                                )}
                              >
                                {candidate.recommendation}
                              </UIBadge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                              {candidate.email !== "Not Found" && (
                                <div className="flex items-center">
                                  <Mail className="mr-2 h-4 w-4" />
                                  {candidate.email}
                                </div>
                              )}
                              {candidate.phone !== "Not Found" && (
                                <div className="flex items-center">
                                  <Phone className="mr-2 h-4 w-4" />
                                  {candidate.phone}
                                </div>
                              )}
                              {candidate.location !== "Not Found" && (
                                <div className="flex items-center">
                                  <MapPin className="mr-2 h-4 w-4" />
                                  {candidate.location}
                                </div>
                              )}
                              {candidate.experience !== "Not specified" && (
                                <div className="flex items-center">
                                  <Clock className="mr-2 h-4 w-4" />
                                  {candidate.experience}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <div
                              className={`text-2xl font-bold ${getScoreColor(
                                candidate.overallScore
                              )}`}
                            >
                              {candidate.overallScore}%
                            </div>
                            <div className="text-sm text-gray-500">
                              Overall Score
                            </div>
                            <div
                              className={`text-lg font-semibold ${getScoreColor(
                                candidate.atsScore
                              )} mt-1`}
                            >
                              {candidate.atsScore}%
                            </div>
                            <div className="text-xs text-gray-500">
                              ATS Score
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {candidate.currentRole !== "Not Found" && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">
                                Current Role:
                              </span>
                              <p className="text-sm text-gray-600">
                                {candidate.currentRole}
                              </p>
                            </div>
                          )}
                          {candidate.education !== "Not Found" && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">
                                Education:
                              </span>
                              <p className="text-sm text-gray-600">
                                {candidate.education}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Skills */}
                        {candidate.skills.length > 0 && (
                          <div className="mb-4">
                            <span className="text-sm font-medium text-gray-700 mb-2 block">
                              Skills:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {candidate.skills
                                .slice(0, 8)
                                .map((skill, skillIndex) => (
                                  <UIBadge
                                    key={skillIndex}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {skill}
                                  </UIBadge>
                                ))}
                              {candidate.skills.length > 8 && (
                                <UIBadge
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  +{candidate.skills.length - 8} more
                                </UIBadge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Recommendation Reason */}
                        <div className="bg-gray-50 p-3 rounded-md">
                          <span className="text-sm font-medium text-gray-700">
                            Recommendation Reason:
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            {candidate.reasonForRecommendation}
                          </p>
                        </div>

                        {/* Expandable Details */}
                        <div className="mt-4">
                          <details className="group">
                            <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
                              View detailed analysis
                            </summary>
                            <div className="mt-3 space-y-4">
                              {/* Strengths and Weaknesses */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {candidate.strengths.length > 0 && (
                                  <div>
                                    <h5 className="text-sm font-medium text-green-700 mb-2">
                                      Strengths:
                                    </h5>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                      {candidate.strengths.map(
                                        (strength, idx) => (
                                          <li
                                            key={idx}
                                            className="flex items-start"
                                          >
                                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-1 flex-shrink-0" />
                                            {strength}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}

                                {candidate.weaknesses.length > 0 && (
                                  <div>
                                    <h5 className="text-sm font-medium text-red-700 mb-2">
                                      Areas for Improvement:
                                    </h5>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                      {candidate.weaknesses.map(
                                        (weakness, idx) => (
                                          <li
                                            key={idx}
                                            className="flex items-start"
                                          >
                                            <XCircle className="h-3 w-3 text-red-500 mr-2 mt-1 flex-shrink-0" />
                                            {weakness}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                              </div>

                              {/* Keyword Matches */}
                              {candidate.keywordMatches.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium text-blue-700 mb-2">
                                    Matched Keywords (
                                    {candidate.keywordMatches.length}):
                                  </h5>
                                  <div className="flex flex-wrap gap-1">
                                    {candidate.keywordMatches.map(
                                      (keyword, idx) => (
                                        <UIBadge
                                          key={idx}
                                          variant="outline"
                                          className="text-xs text-blue-600"
                                        >
                                          {keyword}
                                        </UIBadge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Missing Skills */}
                              {candidate.missingSkills.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium text-orange-700 mb-2">
                                    Missing Skills (
                                    {candidate.missingSkills.length}):
                                  </h5>
                                  <div className="flex flex-wrap gap-1">
                                    {candidate.missingSkills.map(
                                      (skill, idx) => (
                                        <UIBadge
                                          key={idx}
                                          variant="outline"
                                          className="text-xs text-orange-600"
                                        >
                                          {skill}
                                        </UIBadge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* File Info */}
                              <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                                File: {candidate.fileName} (
                                {(candidate.fileSize / 1024).toFixed(1)} KB)
                              </div>
                            </div>
                          </details>
                        </div>
                      </div>
                    ))}

                    {bulkResults.results.length === 0 && (
                      <div className="text-center py-8">
                        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          No matches found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Try adjusting your filters or job description to find
                          suitable candidates.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeMatchingSystem;
