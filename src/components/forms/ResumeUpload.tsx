// src/components/forms/ResumeUpload.tsx
"use client";
import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  Target,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "react-hot-toast";
import { useCredits } from "@/lib/useCredits";

export default function ResumeUpload() {
  // const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { loading: creditsLoading, spendCredits, fetchCredits } = useCredits();

  const [fileName, setFileName] = useState("");
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileContent, setFileContent] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  type AnalysisResults = {
    atsScore?: number;
    matchScore?: number;
    keywordMatch?: number;
    formatScore?: number;
    missingKeywords?: string[];
    keywordAnalysis?: {
      missing?: string[];
      present?: string[];
      overused?: string[];
    };
    formattingIssues?: string[];
    improvementAreas?: string[];
    recommendations?: string[];
    optimizedContent?: {
      name?: string;
      contactInfo?: string;
      summary?: string;
      skills?: Record<string, string> | string;
      experience?: Array<{
        title?: string;
        company?: string;
        dates?: string;
        responsibilities?: string[];
      }>;
      education?: string[] | string;
    };
  };

  const [analysisResults, setAnalysisResults] =
    useState<AnalysisResults | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [activeTab, setActiveTab] = useState("analysis");
  const [error, setError] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Updated file validation to be more comprehensive
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];

      const isValidType =
        validTypes.includes(file.type) ||
        file.name.endsWith(".doc") ||
        file.name.endsWith(".docx") ||
        file.name.endsWith(".pdf") ||
        file.name.endsWith(".txt");

      if (isValidType) {
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          setError("File size must be less than 5MB");
          setFileName("");
          setFileUploaded(false);
          setFileContent(null);
          return;
        }

        setFileName(file.name);
        setFileUploaded(true);
        setFileContent(file);
        setError("");
        toast.success(`File "${file.name}" uploaded successfully`);
      } else {
        setError(
          "Please upload a PDF, Word document, or text file (.pdf, .doc, .docx, .txt)"
        );
        setFileName("");
        setFileUploaded(false);
        setFileContent(null);
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileUploaded || !fileContent) {
      setError("Please upload a resume file first");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please enter the job description for better results");
      return;
    }

    // Show credit usage confirmation if not already shown
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    // Check if user has enough credits first
    try {
      const hasCredits = await spendCredits("resume_analyze", 1);
      if (!hasCredits) {
        setShowConfirmation(false);
        setError(
          "Insufficient credits or daily limit reached. Please purchase more credits to continue."
        );
        return;
      }

      // Reset any previous errors
      setError("");

      // Start processing
      setProcessing(true);
      setProcessingStep(1);

      // Create FormData for API call - FIXED: Use "file" instead of "resume"
      const formData = new FormData();
      formData.append("file", fileContent); // Changed from "resume" to "file"
      formData.append("jobDescription", jobDescription.trim());
      if (customPrompt.trim()) {
        formData.append("customPrompt", customPrompt.trim());
      }

      console.log("Submitting form data:", {
        fileName: fileContent.name,
        fileSize: fileContent.size,
        jobDescriptionLength: jobDescription.length,
        hasCustomPrompt: !!customPrompt.trim(),
      });

      // Progress the UI steps with timeouts to show activity
      setTimeout(() => setProcessingStep(2), 1000);
      setTimeout(() => setProcessingStep(3), 2500);

      // Make the API call
      const response = await fetch("/api/resumes/analyze", {
        method: "POST",
        body: formData,
      });

      console.log("API Response status:", response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error("API Error:", errorData);
        } catch (err) {
          console.error("Failed to parse error response:", err);
          throw new Error(`${response.status} ${response.statusText}`);
        }

        throw new Error(errorData.error || "Failed to analyze resume");
      }

      // Get the analysis results
      const data = await response.json();
      console.log("Analysis results received:", data);

      // Update UI with results - Handle both nested and flat response structures
      const results = data.results || data;
      setAnalysisResults(results);
      setAnalysisComplete(true);

      // Show success toast
      toast.success("Resume analysis completed successfully!");

      // Refresh credits display
      fetchCredits();
    } catch (err: unknown) {
      console.error("Resume analysis error:", err);
      let errorMessage = "An error occurred during analysis. Please try again.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);

      toast.error(errorMessage);

      // If the error was related to credits, we should refresh the credits count
      fetchCredits();
    } finally {
      setProcessing(false);
      setShowConfirmation(false);
    }
  };

  const resetForm = () => {
    setFileName("");
    setFileUploaded(false);
    setFileContent(null);
    setJobDescription("");
    setCustomPrompt("");
    setProcessing(false);
    setProcessingStep(0);
    setAnalysisComplete(false);
    setAnalysisResults(null);
    setShowConfirmation(false);
    setError("");

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadOptimizedResume = () => {
    if (!analysisResults?.optimizedContent) {
      toast.error("No optimized resume content available to download");
      return;
    }

    // Create text content for the optimized resume
    let content = "";

    const optimized = analysisResults.optimizedContent;

    // Header
    content += `${optimized.name || "John Doe"}\n`;
    content += `${
      optimized.contactInfo ||
      "email@example.com | (123) 456-7890 | City, State"
    }\n\n`;

    // Summary
    if (optimized.summary) {
      content += `PROFESSIONAL SUMMARY\n${optimized.summary}\n\n`;
    }

    // Skills
    if (optimized.skills) {
      content += `SKILLS\n`;
      if (typeof optimized.skills === "object") {
        Object.entries(optimized.skills).forEach(([key, value]) => {
          content += `${
            key.charAt(0).toUpperCase() + key.slice(1)
          }: ${value}\n`;
        });
      } else {
        content += `${optimized.skills}\n`;
      }
      content += "\n";
    }

    // Experience
    if (optimized.experience && Array.isArray(optimized.experience)) {
      content += `EXPERIENCE\n\n`;
      optimized.experience.forEach(
        (role: {
          title?: string;
          company?: string;
          dates?: string;
          responsibilities?: string[];
        }) => {
          content += `${role.title || ""}\n`;
          content += `${role.company || ""} | ${role.dates || ""}\n`;

          if (Array.isArray(role.responsibilities)) {
            role.responsibilities.forEach((resp: string) => {
              content += `- ${resp}\n`;
            });
          }
          content += "\n";
        }
      );
    }

    // Education
    if (optimized.education) {
      content += `EDUCATION\n`;
      if (Array.isArray(optimized.education)) {
        optimized.education.forEach((edu: string) => {
          content += `${edu}\n`;
        });
      } else {
        content += `${optimized.education}\n`;
      }
    }

    // Create a blob and download
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized-resume.txt";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success("Optimized resume downloaded!");
  };

  return (
    <>
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* File Upload Section */}
            <div>
              <Label htmlFor="resume-upload" className="block mb-2">
                Upload Your Resume
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                id="resume-upload"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />

              {!fileUploaded ? (
                <div
                  onClick={triggerFileInput}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, Word Document, or Text File (Max 5MB)
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-primary/5 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <span className="font-medium">{fileName}</span>
                      <p className="text-xs text-gray-500">
                        {fileContent &&
                          `${(fileContent.size / 1024 / 1024).toFixed(2)} MB`}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={triggerFileInput}
                  >
                    Change
                  </Button>
                </div>
              )}
            </div>

            {/* Job Description Section */}
            <div>
              <Label htmlFor="job-description" className="block mb-2">
                Paste Job Description
              </Label>
              <Textarea
                id="job-description"
                placeholder="Paste the full job description here for better targeting..."
                className="min-h-32"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-2">
                For best results, include the full job description including
                requirements and responsibilities
              </p>
            </div>

            {/* Advanced Options */}
            <div>
              <button
                type="button"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {isAdvancedOpen ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Hide Advanced Options
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show Advanced Options
                  </>
                )}
              </button>

              {isAdvancedOpen && (
                <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                  <Label htmlFor="custom-prompt" className="block mb-2">
                    Custom AI Instructions (Optional)
                  </Label>
                  <Textarea
                    id="custom-prompt"
                    placeholder="E.g., Focus on highlighting leadership skills, use more action verbs, emphasize technical expertise in Python and React..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="mb-2"
                  />
                  <p className="text-xs text-gray-500">
                    Provide specific instructions to guide the AI in optimizing
                    your resume
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={
                  processing ||
                  !fileUploaded ||
                  !jobDescription.trim() ||
                  creditsLoading
                }
                className="flex items-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {fileUploaded && jobDescription.trim() ? (
                      <>
                        <Target className="h-4 w-4" />
                        Analyze & Optimize
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        {!fileUploaded
                          ? "Upload Resume First"
                          : "Enter Job Description"}
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Credit Confirmation Dialog */}
      <Dialog
        open={showConfirmation && !processing}
        onOpenChange={(open) => !processing && setShowConfirmation(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Resume Analysis</DialogTitle>
            <DialogDescription>
              This will use 1 credit from your account. Do you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4 bg-primary/5 rounded-md">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-primary bg-primary/10 hover:bg-primary/10"
              >
                1 Credit
              </Badge>
              <span className="text-sm">
                will be deducted from your balance
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Proceed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Processing Dialog */}
      <Dialog open={processing} onOpenChange={() => false}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Analyzing Your Resume</DialogTitle>
            <DialogDescription>
              Our AI is optimizing your resume for the target job description
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <Progress value={(processingStep / 3) * 100} className="h-2" />

            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-6 mr-4">
                  {processingStep >= 1 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <div
                  className={
                    processingStep >= 1 ? "text-black" : "text-gray-500"
                  }
                >
                  Analyzing document structure and content
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-6 mr-4">
                  {processingStep >= 2 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : processingStep === 1 ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <div
                  className={
                    processingStep >= 2 ? "text-black" : "text-gray-500"
                  }
                >
                  Comparing with job description requirements
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-6 mr-4">
                  {processingStep >= 3 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : processingStep === 2 ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <div
                  className={
                    processingStep >= 3 ? "text-black" : "text-gray-500"
                  }
                >
                  Generating optimized content and recommendations
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Results Dialog */}
      <Dialog
        open={analysisComplete}
        onOpenChange={(open) => {
          if (!open) resetForm();
          setAnalysisComplete(open);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resume Analysis Results</DialogTitle>
            <DialogDescription>
              Here&apos;s how your resume matches with the target job
              description
            </DialogDescription>
          </DialogHeader>

          {analysisResults && (
            <div className="py-4">
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[180px] bg-primary/5 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-500 mb-1">
                    ATS Compatibility
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    {analysisResults.atsScore || 0}%
                  </div>
                </div>
                <div className="flex-1 min-w-[180px] bg-primary/5 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-500 mb-1">Match Score</div>
                  <div className="text-3xl font-bold text-primary">
                    {analysisResults.matchScore ||
                      analysisResults.keywordMatch ||
                      0}
                    %
                  </div>
                </div>
                <div className="flex-1 min-w-[180px] bg-primary/5 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-500 mb-1">Format Score</div>
                  <div className="text-3xl font-bold text-primary">
                    {analysisResults.formatScore || 85}%
                  </div>
                </div>
              </div>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="recommendations">
                    Recommendations
                  </TabsTrigger>
                  <TabsTrigger value="optimized">Optimized Resume</TabsTrigger>
                </TabsList>

                <TabsContent value="analysis">
                  <div className="space-y-6">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="keywords">
                        <AccordionTrigger>Keyword Analysis</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium mb-2">
                                Missing Keywords
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {analysisResults.missingKeywords?.map(
                                  (keyword: string, i: number) => (
                                    <Badge
                                      key={i}
                                      variant="outline"
                                      className="bg-red-50 text-red-700 border-red-200"
                                    >
                                      {keyword}
                                    </Badge>
                                  )
                                ) ||
                                  analysisResults.keywordAnalysis?.missing?.map(
                                    (keyword: string, i: number) => (
                                      <Badge
                                        key={i}
                                        variant="outline"
                                        className="bg-red-50 text-red-700 border-red-200"
                                      >
                                        {keyword}
                                      </Badge>
                                    )
                                  )}
                                {(!analysisResults.missingKeywords &&
                                  !analysisResults.keywordAnalysis?.missing) ||
                                  (analysisResults.missingKeywords?.length ===
                                    0 &&
                                    analysisResults.keywordAnalysis?.missing
                                      ?.length === 0 && (
                                      <span className="text-sm text-gray-500">
                                        No missing keywords detected
                                      </span>
                                    ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium mb-2">
                                Present Keywords
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {analysisResults.keywordAnalysis?.present?.map(
                                  (keyword: string, i: number) => (
                                    <Badge
                                      key={i}
                                      variant="outline"
                                      className="bg-green-50 text-green-700 border-green-200"
                                    >
                                      {keyword}
                                    </Badge>
                                  )
                                )}
                                {(!analysisResults.keywordAnalysis?.present ||
                                  analysisResults.keywordAnalysis.present
                                    .length === 0) && (
                                  <span className="text-sm text-gray-500">
                                    No matching keywords detected
                                  </span>
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium mb-2">
                                Overused Terms
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {analysisResults.keywordAnalysis?.overused?.map(
                                  (term: string, i: number) => (
                                    <Badge
                                      key={i}
                                      variant="outline"
                                      className="bg-amber-50 text-amber-700 border-amber-200"
                                    >
                                      {term}
                                    </Badge>
                                  )
                                )}
                                {(!analysisResults.keywordAnalysis?.overused ||
                                  analysisResults.keywordAnalysis.overused
                                    .length === 0) && (
                                  <span className="text-sm text-gray-500">
                                    No overused terms detected
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="formatting">
                        <AccordionTrigger>Formatting Issues</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-2">
                            {analysisResults.formattingIssues?.map(
                              (issue: string, i: number) => (
                                <li key={i} className="text-gray-700">
                                  {issue}
                                </li>
                              )
                            )}
                            {(!analysisResults.formattingIssues ||
                              analysisResults.formattingIssues.length ===
                                0) && (
                              <li className="text-gray-500">
                                No significant formatting issues detected
                              </li>
                            )}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="improvement">
                        <AccordionTrigger>
                          Areas for Improvement
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-2">
                            {analysisResults.improvementAreas?.map(
                              (area: string, i: number) => (
                                <li key={i} className="text-gray-700">
                                  {area}
                                </li>
                              )
                            )}
                            {(!analysisResults.improvementAreas ||
                              analysisResults.improvementAreas.length ===
                                0) && (
                              <li className="text-gray-500">
                                No specific improvement areas identified
                              </li>
                            )}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </TabsContent>

                <TabsContent value="recommendations">
                  <div className="space-y-4">
                    <Alert className="bg-primary/5 border-primary/20">
                      <Target className="h-4 w-4 text-primary" />
                      <AlertTitle>Strategic Recommendations</AlertTitle>
                      <AlertDescription>
                        Apply these changes to improve your resume&apos;s
                        effectiveness for this job
                      </AlertDescription>
                    </Alert>

                    <ul className="space-y-3">
                      {analysisResults.recommendations?.map(
                        (rec: string, i: number) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 p-3 border rounded-md bg-white"
                          >
                            <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">
                              {i + 1}
                            </div>
                            <span>{rec}</span>
                          </li>
                        )
                      )}
                      {(!analysisResults.recommendations ||
                        analysisResults.recommendations.length === 0) && (
                        <li className="p-3 border rounded-md bg-white text-gray-500">
                          No specific recommendations available
                        </li>
                      )}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="optimized">
                  {/* Complete optimized resume display */}
                  <div className="space-y-6">
                    {analysisResults.optimizedContent ? (
                      <div className="border rounded-lg p-6 bg-white shadow-sm">
                        {/* Header section */}
                        <div className="border-b pb-4 mb-4">
                          <h2 className="text-2xl font-bold">
                            {analysisResults.optimizedContent?.name ||
                              "John Doe"}
                          </h2>
                          <p className="text-sm text-gray-600 mt-1">
                            {analysisResults.optimizedContent?.contactInfo ||
                              "email@example.com | (123) 456-7890 | City, State"}
                          </p>
                        </div>

                        {/* Summary section */}
                        {analysisResults.optimizedContent?.summary && (
                          <div className="mb-6">
                            <h3 className="text-lg font-bold uppercase mb-2">
                              Professional Summary
                            </h3>
                            <p>{analysisResults.optimizedContent.summary}</p>
                          </div>
                        )}

                        {/* Skills section */}
                        {analysisResults.optimizedContent?.skills && (
                          <div className="mb-6">
                            <h3 className="text-lg font-bold uppercase mb-2">
                              Technical Skills
                            </h3>
                            {typeof analysisResults.optimizedContent.skills ===
                            "object" ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {Object.entries(
                                  analysisResults.optimizedContent.skills
                                ).map(
                                  (
                                    [category, skills]: [string, string],
                                    i: number
                                  ) => (
                                    <p key={i}>
                                      <span className="font-medium">
                                        {category.charAt(0).toUpperCase() +
                                          category.slice(1)}
                                        :
                                      </span>{" "}
                                      {skills}
                                    </p>
                                  )
                                )}
                              </div>
                            ) : (
                              <p>{analysisResults.optimizedContent.skills}</p>
                            )}
                          </div>
                        )}

                        {/* Experience section */}
                        {analysisResults.optimizedContent?.experience && (
                          <div className="mb-6">
                            <h3 className="text-lg font-bold uppercase mb-4">
                              Professional Experience
                            </h3>
                            <div className="space-y-6">
                              {analysisResults.optimizedContent.experience.map(
                                (
                                  role: {
                                    title?: string;
                                    company?: string;
                                    dates?: string;
                                    responsibilities?: string[];
                                  },
                                  i: number
                                ) => (
                                  <div key={i} className="pb-4">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                                      <h4 className="font-semibold text-primary">
                                        {role.title || "Position"}
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        {role.dates || "Date Range"}
                                      </p>
                                    </div>
                                    <p className="font-medium mb-2">
                                      {role.company || "Company"}
                                    </p>
                                    {role.responsibilities && (
                                      <ul className="list-disc pl-5 space-y-1">
                                        {role.responsibilities.map(
                                          (bullet: string, j: number) => (
                                            <li key={j}>{bullet}</li>
                                          )
                                        )}
                                      </ul>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* Education section */}
                        {analysisResults.optimizedContent?.education && (
                          <div>
                            <h3 className="text-lg font-bold uppercase mb-2">
                              Education
                            </h3>
                            {Array.isArray(
                              analysisResults.optimizedContent.education
                            ) ? (
                              analysisResults.optimizedContent.education.map(
                                (edu: string, i: number) => (
                                  <p key={i} className="mb-1">
                                    {edu}
                                  </p>
                                )
                              )
                            ) : (
                              <p>
                                {analysisResults.optimizedContent.education}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border rounded-lg p-6 bg-gray-50 text-center">
                        <p className="text-gray-500 mb-4">
                          No optimized resume content available. The analysis
                          focused on providing recommendations for improvement.
                        </p>
                        <div className="text-sm text-gray-600">
                          <p>Based on your analysis results:</p>
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>ATS Score: {analysisResults.atsScore || 0}%</li>
                            <li>
                              Match Score:{" "}
                              {analysisResults.matchScore ||
                                analysisResults.keywordMatch ||
                                0}
                              %
                            </li>
                            <li>
                              Check the Recommendations tab for specific
                              improvements
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500 italic">
                          {analysisResults.optimizedContent
                            ? "This optimized resume has been tailored to match the job requirements while maintaining your original qualifications."
                            : "Use the recommendations provided to improve your resume manually."}
                        </p>
                        {analysisResults.optimizedContent && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center"
                            onClick={downloadOptimizedResume}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between items-center pt-6 border-t mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAnalysisComplete(false);
                    resetForm();
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Start Over
                </Button>

                <div className="flex gap-3">
                  {analysisResults.optimizedContent && (
                    <Button variant="outline" onClick={downloadOptimizedResume}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Resume
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
