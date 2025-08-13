// src/components/resume/ResumeAnalyzer.tsx
"use client";

import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import AtsScoreBadge from "./AtsScoreBadge";
import { FileUp, Briefcase } from "lucide-react";
import Link from "next/link";
import { useCredits } from "@/lib/useCredits";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [country, setCountry] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  interface ResumeAnalysisResults {
    atsScore: number;
    matchScore: number;
    missingKeywords: string[];
    strengths: string[];
    recommendations: string[];
    // Add other fields as needed based on your API response
  }

  const [results, setResults] = useState<ResumeAnalysisResults | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fixed: rename the destructured function to avoid naming conflicts
  const { spendCredits } = useCredits();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error("Please upload a PDF, DOC, DOCX, or TXT file");
        e.target.value = "";
        return;
      }

      // Validate file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        e.target.value = "";
        return;
      }

      setFile(selectedFile);
      toast.success(`File "${selectedFile.name}" selected`);
    }
  };

  const detectCountryFromJobDescription = (text: string): string => {
    const text_lower = text.toLowerCase();

    // Common indicators for Indian job listings
    const indianKeywords = [
      "india",
      "mumbai",
      "delhi",
      "bangalore",
      "bengaluru",
      "hyderabad",
      "chennai",
      "kolkata",
      "pune",
      "ahmedabad",
      "jaipur",
      "inr",
      "rupees",
      "lakh",
      "lakhs",
      "crore",
      "crores",
      "btech",
      "b.tech",
      "iit",
      "nit",
      "aicte",
      "ugc",
      "upsc",
    ];

    for (const keyword of indianKeywords) {
      if (text_lower.includes(keyword)) {
        return "india";
      }
    }

    return "";
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please upload a resume file");
      return;
    }

    if (!jobDescription) {
      toast.error("Please enter a job description");
      return;
    }

    // Use 1 credit for resume analysis - FIXED
    const creditsUsed = await spendCredits("Resume Analysis", 1);
    if (!creditsUsed) return;

    setAnalyzing(true);
    const toastId = toast.loading("Analyzing your resume...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("jobDescription", jobDescription);

    // Auto-detect country if not selected
    const detectedCountry =
      country || detectCountryFromJobDescription(jobDescription);
    if (detectedCountry) {
      formData.append("country", detectedCountry);
      setCountry(detectedCountry);
    }

    try {
      const response = await fetch("/api/resumes/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
        toast.success("Resume analysis complete!", { id: toastId });
      } else {
        toast.error(data.error || "Failed to analyze resume", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during analysis", { id: toastId });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Advanced Resume Analysis</CardTitle>
          <CardDescription>
            Upload your resume and a job description to get tailored feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Resume</label>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
              />
              <p className="text-xs text-gray-500">
                Accepted formats: PDF, DOC, DOCX, TXT (max 5MB)
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Job Description</label>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="min-h-[150px]"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Country (Optional)</label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country (or leave blank for auto-detect)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto-detect">Auto-detect</SelectItem>
                  <SelectItem value="india">India</SelectItem>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="canada">Canada</SelectItem>
                  <SelectItem value="australia">Australia</SelectItem>
                  <SelectItem value="germany">Germany</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                We&#39;ll tailor our analysis to the selected job market
              </p>
            </div>

            <Button type="submit" disabled={analyzing} className="w-full">
              <FileUp className="h-4 w-4 mr-2" />
              {analyzing ? "Analyzing..." : "Analyze Resume"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {results && (
        <>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>ATS Compatibility Analysis</CardTitle>
                <AtsScoreBadge score={results.atsScore} />
              </div>
              <CardDescription>
                How well your resume performs with Applicant Tracking Systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-lg mb-2">Job Match Score</h3>
                  <div className="bg-muted h-4 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        results.matchScore >= 80
                          ? "bg-green-500"
                          : results.matchScore >= 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${results.matchScore}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-gray-500">0%</span>
                    <span className="text-sm font-medium">
                      {results.matchScore}%
                    </span>
                    <span className="text-sm text-gray-500">100%</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-2">Missing Keywords</h3>
                  {results.missingKeywords &&
                  results.missingKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {results.missingKeywords.map(
                        (keyword: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-red-50 text-red-700 border-red-200"
                          >
                            {keyword}
                          </Badge>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No critical keywords missing
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-2">Strengths</h3>
                  {results.strengths && results.strengths.length > 0 ? (
                    <ul className="space-y-1 list-disc list-inside">
                      {results.strengths.map(
                        (strength: string, index: number) => (
                          <li key={index} className="text-sm">
                            {strength}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No specific strengths identified
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-2">Recommendations</h3>
                  {results.recommendations &&
                  results.recommendations.length > 0 ? (
                    <ul className="space-y-1 list-disc list-inside">
                      {results.recommendations.map(
                        (recommendation: string, index: number) => (
                          <li key={index} className="text-sm">
                            {recommendation}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No specific recommendations
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Link href="/resume/create" className="w-full max-w-xs">
              <Button className="w-full flex items-center justify-center">
                <Briefcase className="h-4 w-4 mr-2" />
                Create Optimized Resume
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
