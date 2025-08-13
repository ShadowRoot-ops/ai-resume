// src/components/resume/CoverLetterGenerator.tsx
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
import { FileUp, Copy, Download } from "lucide-react";
import { useCredits } from "@/lib/useCredits"; // Fixed path with proper quotation

export default function CoverLetterGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("");
  const [generating, setGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please upload a resume file");
      return;
    }

    if (!jobDescription) {
      toast.error("Please enter a job description");
      return;
    }

    if (!companyName) {
      toast.error("Please enter a company name");
      return;
    }

    // Use 2 credits for cover letter generation
    const creditsUsed = await spendCredits("Cover Letter Generator", 2);
    if (!creditsUsed) return;

    setGenerating(true);
    const toastId = toast.loading("Generating your cover letter...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("jobDescription", jobDescription);
    formData.append("companyName", companyName);

    if (country) {
      formData.append("country", country);
    }

    try {
      const response = await fetch("/api/resumes/cover-letter", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setCoverLetter(data.coverLetter);
        toast.success("Cover letter generated successfully!", { id: toastId });
      } else {
        toast.error(data.error || "Failed to generate cover letter", {
          id: toastId,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while generating the cover letter", {
        id: toastId,
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(coverLetter);
      toast.success("Cover letter copied to clipboard");
    }
  };

  const downloadAsTxt = () => {
    if (coverLetter) {
      const element = document.createElement("a");
      const file = new Blob([coverLetter], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `Cover Letter - ${companyName}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("Cover letter downloaded");
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Cover Letter Generator</CardTitle>
          <CardDescription>
            Upload your resume and job details to generate a tailored cover
            letter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name</label>
                <Input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name..."
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Country (Optional)
                </label>
                <Input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="E.g., India, United States..."
                />
              </div>
            </div>

            <Button type="submit" disabled={generating} className="w-full">
              <FileUp className="h-4 w-4 mr-2" />
              {generating ? "Generating..." : "Generate Cover Letter"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {coverLetter && (
        <Card>
          <CardHeader>
            <CardTitle>Your Cover Letter</CardTitle>
            <CardDescription>
              Customized cover letter for {companyName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md whitespace-pre-wrap font-serif">
              {coverLetter}
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                variant="outline"
                onClick={copyToClipboard}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </Button>
              <Button onClick={downloadAsTxt} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download as TXT
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
