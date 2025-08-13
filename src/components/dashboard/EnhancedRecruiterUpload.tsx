// src/components/dashboard/EnhancedRecruiterUpload.tsx
"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Define the form schema with proper types
const resumeTemplateSchema = z.object({
  companyName: z.string().min(1, { message: "Company name is required" }),
  jobTitle: z.string().min(1, { message: "Job title is required" }),
  resumeContent: z.string().min(1, { message: "Resume content is required" }),
  version: z.string().optional(),
  industry: z.string().optional(),
  seniorityLevel: z.string().optional(),
  department: z.string().optional(),
  tipsAndInsights: z.string().optional(),
  keySkills: z.string().optional(),
  cultureFitIndicators: z.string().optional(),
  redFlags: z.string().optional(),
  sampleInterviewQuestions: z.string().optional(),
  isPublic: z.boolean(),
  isAnonymized: z.boolean(),
  allowAnonymousFeedback: z.boolean(),
  templateName: z.string().optional(),
});

type ResumeTemplateFormData = z.infer<typeof resumeTemplateSchema>;

export default function EnhancedRecruiterUpload() {
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ResumeTemplateFormData>({
    resolver: zodResolver(resumeTemplateSchema),
    defaultValues: {
      isPublic: true,
      isAnonymized: false,
      allowAnonymousFeedback: true,
    },
  });

  const onSubmit: SubmitHandler<ResumeTemplateFormData> = async (data) => {
    try {
      setIsUploading(true);
      setUploadError(null);

      // Validate JSON before submitting
      try {
        if (data.resumeContent) {
          JSON.parse(data.resumeContent);
        }

        // Validate optional JSON fields if they exist
        const jsonFields = [
          "tipsAndInsights",
          "keySkills",
          "cultureFitIndicators",
          "redFlags",
          "sampleInterviewQuestions",
        ];
        for (const field of jsonFields) {
          const value = data[field as keyof ResumeTemplateFormData];
          if (value && typeof value === "string" && value.trim() !== "") {
            JSON.parse(value);
          }
        }
      } catch {
        setUploadError("Invalid JSON format. Please check your input.");
        setIsUploading(false);
        return;
      }

      // Submit to API
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to upload template");
      }

      const result = await response.json();

      setUploadSuccess(true);

      // Redirect to template view after short delay
      setTimeout(() => {
        router.push(`/templates/${result.id}`);
      }, 2000);
    } catch (error) {
      console.error("Error uploading template:", error);
      setUploadError("Failed to upload template. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleExampleClick = () => {
    const resumeContentExample = {
      personalInfo: {
        name: "Jane Doe",
        email: "jane.doe@example.com",
        phone: "(123) 456-7890",
        location: "San Francisco, CA",
        linkedin: "linkedin.com/in/janedoe",
      },
      summary:
        "Experienced software engineer with expertise in JavaScript and React.",
      skills: ["JavaScript", "React", "Node.js", "TypeScript", "CSS"],
      experience: [
        {
          title: "Senior Frontend Engineer",
          company: "Tech Company",
          location: "San Francisco, CA",
          startDate: "2021-01",
          endDate: "Present",
          description:
            "Led development of core product features and mentored junior engineers.",
        },
        {
          title: "Frontend Developer",
          company: "Startup Inc.",
          location: "San Francisco, CA",
          startDate: "2018-06",
          endDate: "2020-12",
          description:
            "Built responsive web applications using React and TypeScript.",
        },
      ],
      education: [
        {
          degree: "B.S. Computer Science",
          institution: "University of California",
          location: "Berkeley, CA",
          graduationYear: "2018",
        },
      ],
      projects: [
        {
          name: "Personal Portfolio",
          description: "Designed and developed a responsive portfolio website",
          url: "portfolio.janedoe.com",
        },
      ],
    };

    const resumeExampleString = JSON.stringify(resumeContentExample, null, 2);

    // You would set this to a form field with setValue or similar
    console.log(resumeExampleString);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {uploadSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Template uploaded successfully! Redirecting...</span>
        </div>
      )}

      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>{uploadError}</span>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {/* Stepper */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                currentStep === 1
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setCurrentStep(1)}
            >
              Basic Info
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                currentStep === 2
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setCurrentStep(2)}
            >
              Resume Content
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                currentStep === 3
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setCurrentStep(3)}
            >
              Additional Info
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900">
                Basic Template Information
              </h2>
              <p className="text-sm text-gray-500">
                Provide the basic details about this resume template.
              </p>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="companyName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Company Name
                  </label>
                  <input
                    {...register("companyName")}
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="e.g. Google, Microsoft, etc."
                  />
                </div>

                <div>
                  <label
                    htmlFor="jobTitle"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Job Title
                  </label>
                  <input
                    {...register("jobTitle")}
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="e.g. Software Engineer, Product Manager, etc."
                  />
                </div>

                <div>
                  <label
                    htmlFor="industry"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Industry
                  </label>
                  <select
                    {...register("industry")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Select an industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Retail">Retail</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Media">Media</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="seniorityLevel"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Seniority Level
                    </label>
                    <select
                      {...register("seniorityLevel")}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="">Select level</option>
                      <option value="Entry">Entry-level</option>
                      <option value="Junior">Junior</option>
                      <option value="Mid-level">Mid-level</option>
                      <option value="Senior">Senior</option>
                      <option value="Lead">Lead</option>
                      <option value="Manager">Manager</option>
                      <option value="Director">Director</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="department"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Department
                    </label>
                    <select
                      {...register("department")}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="">Select department</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="Customer Support">Customer Support</option>
                      <option value="HR">Human Resources</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                      <option value="Legal">Legal</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="button" onClick={() => setCurrentStep(2)}>
                  Next: Resume Content
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Resume Content */}
          {currentStep === 2 && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900">
                Resume Content
              </h2>
              <p className="text-sm text-gray-500">
                Enter the JSON content for this resume template. This will be
                used as a base for user customization.
              </p>

              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  className="text-sm text-primary-600 hover:text-primary-500"
                  onClick={handleExampleClick}
                >
                  See example format
                </button>
              </div>

              <div>
                <label
                  htmlFor="resumeContent"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Resume Content (JSON format)
                </label>
                <textarea
                  // src/components/dashboard/EnhancedRecruiterUpload.tsx (continued)
                  {...register("resumeContent")}
                  rows={15}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 font-mono text-sm"
                  placeholder='{
  "personalInfo": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "skills": ["JavaScript", "React"],
  "experience": [
    {
      "title": "Software Engineer",
      "company": "Tech Co",
      "startDate": "2020-01",
      "endDate": "Present"
    }
  ]
}'
                ></textarea>
                <p className="mt-2 text-xs text-gray-500">
                  Enter valid JSON structure with resume sections.
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                >
                  Back
                </Button>
                <Button type="button" onClick={() => setCurrentStep(3)}>
                  Next: Additional Info
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Additional Info */}
          {currentStep === 3 && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900">
                Additional Information
              </h2>
              <p className="text-sm text-gray-500">
                Add supplementary information to help job seekers improve their
                resume.
              </p>

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="tipsAndInsights"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tips & Insights (JSON array)
                  </label>
                  <textarea
                    {...register("tipsAndInsights")}
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 font-mono text-sm"
                    placeholder='["Focus on quantifiable achievements", "Include relevant keywords", "Keep it concise"]'
                  ></textarea>
                </div>

                <div>
                  <label
                    htmlFor="keySkills"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Key Skills (JSON array)
                  </label>
                  <textarea
                    {...register("keySkills")}
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 font-mono text-sm"
                    placeholder='["JavaScript", "React", "Node.js", "TypeScript", "Problem Solving"]'
                  ></textarea>
                </div>

                <div>
                  <label
                    htmlFor="cultureFitIndicators"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Culture Fit Indicators (JSON array)
                  </label>
                  <textarea
                    {...register("cultureFitIndicators")}
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 font-mono text-sm"
                    placeholder='["Collaborative experience", "Innovation mindset", "Growth-oriented"]'
                  ></textarea>
                </div>

                <div>
                  <label
                    htmlFor="redFlags"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Red Flags to Avoid (JSON array)
                  </label>
                  <textarea
                    {...register("redFlags")}
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 font-mono text-sm"
                    placeholder='["Unexplained gaps", "Generic statements", "Too many job changes"]'
                  ></textarea>
                </div>

                <div>
                  <label
                    htmlFor="sampleInterviewQuestions"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Sample Interview Questions (JSON array)
                  </label>
                  <textarea
                    {...register("sampleInterviewQuestions")}
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 font-mono text-sm"
                    placeholder='["Describe a challenging project", "How do you handle tight deadlines?", "What is your approach to problem-solving?"]'
                  ></textarea>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center">
                    <input
                      {...register("isPublic")}
                      id="isPublic"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      defaultChecked
                    />
                    <label
                      htmlFor="isPublic"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Make template public (available to all users)
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      {...register("isAnonymized")}
                      id="isAnonymized"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label
                      htmlFor="isAnonymized"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Anonymize template (remove identifying company
                      information)
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      {...register("allowAnonymousFeedback")}
                      id="allowAnonymousFeedback"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      defaultChecked
                    />
                    <label
                      htmlFor="allowAnonymousFeedback"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Allow anonymous feedback from users
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                >
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting || isUploading}>
                  {(isSubmitting || isUploading) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSubmitting || isUploading
                    ? "Uploading..."
                    : "Upload Template"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
