// src/app/resume/create/ai-prompt/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/ui/file-upload";
import { Loader2, ArrowRight } from "lucide-react";

export default function AiPromptPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  // Removed unused activeTab state

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/extract-resume-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          jobTitle,
          company,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store the extracted data in session storage
        sessionStorage.setItem("resumeData", JSON.stringify(data.resumeData));
        // Redirect to resume create page
        router.push("/resume/create");
      } else {
        // Handle error
        alert(data.error || "Failed to extract resume data");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobTitle", jobTitle);
    formData.append("company", company);

    try {
      const response = await fetch("/api/ai/analyze-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store the extracted data in session storage
        sessionStorage.setItem("resumeData", JSON.stringify(data.resumeData));
        // Redirect to resume create page
        router.push("/resume/create");
      } else {
        // Handle error
        alert(data.error || "Failed to analyze resume");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Create Your Resume</h1>
      <p className="text-gray-500 mb-6">
        Let AI help you build a professional, ATS-optimized resume
      </p>

      <Tabs
        defaultValue="prompt"
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prompt">Using AI Prompt</TabsTrigger>
          <TabsTrigger value="upload">Upload Existing Resume</TabsTrigger>
        </TabsList>

        <TabsContent value="prompt">
          <Card>
            <CardHeader>
              <CardTitle>Generate Resume with AI</CardTitle>
              <CardDescription>
                Tell us about your experience, skills and the job you&#39;re
                applying for. Our AI will generate a resume draft for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePromptSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      placeholder="e.g. Senior Frontend Developer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Target Company</Label>
                    <Input
                      id="company"
                      placeholder="e.g. Google"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt">Tell us about yourself</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe your experience, education, skills, and projects. The more details you provide, the better the AI can generate your resume."
                    className="min-h-[200px]"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Resume
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Existing Resume</CardTitle>
              <CardDescription>
                Upload your current resume and we&#39;ll optimize it for your target
                job.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitleUpload">Job Title</Label>
                    <Input
                      id="jobTitleUpload"
                      placeholder="e.g. Senior Frontend Developer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyUpload">Target Company</Label>
                    <Input
                      id="companyUpload"
                      placeholder="e.g. Google"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Upload Resume</Label>
                  <FileUpload
                    onUpload={handleFileUpload}
                    accept=".pdf,.doc,.docx,.txt"
                    isLoading={isLoading}
                    helpText="Upload PDF, Word, or TXT files (max 5MB)"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={() => router.push("/resume/create")}>
          Skip & Create Manually
        </Button>
      </div>
    </div>
  );
}
