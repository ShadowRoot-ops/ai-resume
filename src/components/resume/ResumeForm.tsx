// src/components/forms/ResumeForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { resumeTemplates, colorPalettes } from "@/lib/resume-templates";
import ExperienceForm from "@/components/resume/ExperienceForm";
import EducationForm from "@/components/resume/EducationForm";
import ProjectForm from "@/components/resume/ProjectForm";
import SkillsInput from "@/components/resume/SkillsInput";
import { format } from "date-fns";

// Define TypeScript interfaces for form data
interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  website?: string;
  location?: string;
}

interface Experience {
  company: string;
  position: string;
  location?: string;
  startDate: Date | string;
  endDate?: Date | string;
  current?: boolean;
  responsibilities: string[];
}

interface Education {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  gpa?: string;
  startDate: Date | string;
  endDate?: Date | string;
  current?: boolean;
}

interface Project {
  name: string;
  description: string;
  technologies?: string;
  url?: string;
}

interface FormData {
  title: string;
  jobDescription: string;
  jobTitle?: string;
  companyTargeted?: string;
  templateId: string;
  colorPaletteIndex: number;
  fontFamily: string;
  personalInfo: PersonalInfo;
  summary?: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
}

interface ResumeFormProps {
  initialData?: any;
  resumeId?: string;
  mode: "create" | "edit";
}

const ResumeForm: React.FC<ResumeFormProps> = ({
  initialData,
  resumeId,
  mode,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof FormData, string>>
  >({});
  const [previewVisible, setPreviewVisible] = useState(false);

  // Initialize form data with defaults or existing data
  const [formData, setFormData] = useState<FormData>(() => {
    if (initialData) {
      // If editing existing resume
      return {
        title: initialData.title || "",
        jobDescription: initialData.jobDescription || "",
        jobTitle: initialData.jobTitle || "",
        companyTargeted: initialData.companyTargeted || "",
        templateId: initialData.templateId || "professional",
        colorPaletteIndex: initialData.colorPaletteIndex || 0,
        fontFamily: initialData.fontFamily || "Inter",
        personalInfo: initialData.content?.personalInfo || {
          name: "",
          email: "",
          phone: "",
        },
        summary: initialData.content?.summary || "",
        experience: initialData.content?.experience || [],
        education: initialData.content?.education || [],
        skills: initialData.content?.skills || [],
        projects: initialData.content?.projects || [],
      };
    }

    // Check for session storage data from AI
    const sessionData =
      typeof window !== "undefined"
        ? sessionStorage.getItem("resumeData")
        : null;

    if (sessionData) {
      try {
        const parsedData = JSON.parse(sessionData);
        return {
          title: parsedData.title || "My Resume",
          jobDescription: parsedData.jobDescription || "",
          jobTitle: parsedData.jobTitle || "",
          companyTargeted: parsedData.companyTargeted || "",
          templateId: "professional",
          colorPaletteIndex: 0,
          fontFamily: "Inter",
          personalInfo: parsedData.personalInfo || {
            name: "",
            email: "",
            phone: "",
          },
          summary: parsedData.summary || "",
          experience: parsedData.experience || [],
          education: parsedData.education || [],
          skills: parsedData.skills || [],
          projects: parsedData.projects || [],
        };
      } catch (e) {
        console.error("Error parsing session data:", e);
      }
    }

    // Default empty form
    return {
      title: "My Resume",
      jobDescription: "",
      jobTitle: "",
      companyTargeted: "",
      templateId: "professional",
      colorPaletteIndex: 0,
      fontFamily: "Inter",
      personalInfo: {
        name: "",
        email: "",
        phone: "",
      },
      summary: "",
      experience: [],
      education: [],
      skills: [],
      projects: [],
    };
  });

  // Clear session storage data after loading
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("resumeData");
    }
  }, []);

  // Update form data handler
  const updateFormData = (
    section: keyof FormData,
    field: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  // Simple fields update
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Handle nested fields like personalInfo.name
    if (name.includes(".")) {
      const [section, field] = name.split(".");
      updateFormData(section as keyof FormData, field, value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};

    // Basic validation
    if (!formData.title.trim()) errors.title = "Resume title is required";
    if (!formData.personalInfo.name.trim())
      errors.personalInfo = "Name is required";
    if (!formData.personalInfo.email.trim())
      errors.personalInfo = "Email is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint =
        mode === "create" ? "/api/resumes" : `/api/resumes/${resumeId}`;

      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save resume");
      }

      // Redirect to the created/updated resume
      router.push(`/resume/${data.id}`);
    } catch (error) {
      console.error("Error saving resume:", error);
      alert("Failed to save resume. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle preview
  const togglePreview = () => {
    setPreviewVisible(!previewVisible);

    if (!previewVisible) {
      // Scroll to preview when showing it
      setTimeout(() => {
        const previewElement = document.getElementById("resume-preview");
        if (previewElement) {
          previewElement.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Top controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1">
          <Label htmlFor="title">Resume Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="My Professional Resume"
            className={formErrors.title ? "border-red-500" : ""}
          />
          {formErrors.title && (
            <p className="text-sm text-red-500 mt-1">{formErrors.title}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={togglePreview}>
            {previewVisible ? "Hide Preview" : "Preview Resume"}
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Resume"
            )}
          </Button>
        </div>
      </div>

      {/* Main form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form sections */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="skills">Skills & Projects</TabsTrigger>
            </TabsList>

            {/* Personal Info Tab */}
            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="personalInfo.name">Full Name *</Label>
                      <Input
                        id="personalInfo.name"
                        name="personalInfo.name"
                        value={formData.personalInfo.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        required
                        className={
                          formErrors.personalInfo ? "border-red-500" : ""
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="personalInfo.email">Email *</Label>
                      <Input
                        id="personalInfo.email"
                        name="personalInfo.email"
                        value={formData.personalInfo.email}
                        onChange={handleInputChange}
                        placeholder="johndoe@example.com"
                        type="email"
                        required
                        className={
                          formErrors.personalInfo ? "border-red-500" : ""
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="personalInfo.phone">Phone Number *</Label>
                      <Input
                        id="personalInfo.phone"
                        name="personalInfo.phone"
                        value={formData.personalInfo.phone}
                        onChange={handleInputChange}
                        placeholder="(555) 123-4567"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="personalInfo.location">
                        Location (Optional)
                      </Label>
                      <Input
                        id="personalInfo.location"
                        name="personalInfo.location"
                        value={formData.personalInfo.location || ""}
                        onChange={handleInputChange}
                        placeholder="San Francisco, CA"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="personalInfo.linkedin">
                        LinkedIn (Optional)
                      </Label>
                      <Input
                        id="personalInfo.linkedin"
                        name="personalInfo.linkedin"
                        value={formData.personalInfo.linkedin || ""}
                        onChange={handleInputChange}
                        placeholder="linkedin.com/in/johndoe"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="personalInfo.website">
                        Website (Optional)
                      </Label>
                      <Input
                        id="personalInfo.website"
                        name="personalInfo.website"
                        value={formData.personalInfo.website || ""}
                        onChange={handleInputChange}
                        placeholder="johndoe.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="summary">Professional Summary</Label>
                    <Textarea
                      id="summary"
                      name="summary"
                      value={formData.summary || ""}
                      onChange={handleInputChange}
                      placeholder="A brief overview of your professional background, key skills, and career objectives."
                      rows={4}
                    />
                    <p className="text-xs text-gray-500">
                      Pro tip: Keep your summary concise, targeted, and focus on
                      your strengths relevant to the position.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Targeting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Target Job Title</Label>
                      <Input
                        id="jobTitle"
                        name="jobTitle"
                        value={formData.jobTitle || ""}
                        onChange={handleInputChange}
                        placeholder="e.g., Senior Frontend Developer"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyTargeted">Target Company</Label>
                      <Input
                        id="companyTargeted"
                        name="companyTargeted"
                        value={formData.companyTargeted || ""}
                        onChange={handleInputChange}
                        placeholder="e.g., Google"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobDescription">Job Description</Label>
                    <Textarea
                      id="jobDescription"
                      name="jobDescription"
                      value={formData.jobDescription}
                      onChange={handleInputChange}
                      placeholder="Paste the job description here to optimize your resume for ATS compatibility"
                      rows={6}
                    />
                    <p className="text-xs text-gray-500">
                      Pasting the job description helps our AI analyze and
                      suggest optimizations to increase your chances of getting
                      an interview.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Experience Tab */}
            <TabsContent value="experience">
              <Card>
                <CardHeader>
                  <CardTitle>Work Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <ExperienceForm
                    experiences={formData.experience}
                    setExperiences={(experience) =>
                      setFormData({ ...formData, experience })
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education">
              <Card>
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                </CardHeader>
                <CardContent>
                  <EducationForm
                    education={formData.education}
                    setEducation={(education) =>
                      setFormData({ ...formData, education })
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Skills & Projects Tab */}
            <TabsContent value="skills" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <SkillsInput
                    skills={formData.skills}
                    setSkills={(skills) => setFormData({ ...formData, skills })}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProjectForm
                    projects={formData.projects}
                    setProjects={(projects) =>
                      setFormData({ ...formData, projects })
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Styling Options */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Resume Styling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="templateId">Template Style</Label>
                <Select
                  value={formData.templateId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, templateId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(resumeTemplates).map(([id, template]) => (
                      <SelectItem key={id} value={id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="colorPalette">Color Scheme</Label>
                <div className="grid grid-cols-5 gap-2">
                  {colorPalettes.map((palette, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`h-8 rounded-full border-2 ${
                        formData.colorPaletteIndex === index
                          ? "border-black dark:border-white"
                          : "border-transparent"
                      }`}
                      style={{
                        background: `linear-gradient(to right, ${palette.primary}, ${palette.secondary})`,
                      }}
                      onClick={() =>
                        setFormData({ ...formData, colorPaletteIndex: index })
                      }
                      aria-label={`Color palette ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontFamily">Font Style</Label>
                <Select
                  value={formData.fontFamily}
                  onValueChange={(value) =>
                    setFormData({ ...formData, fontFamily: value })
                  }
                >
                  <SelectTrigger id="fontFamily">
                    <SelectValue placeholder="Select a font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Lato">Lato</SelectItem>
                    <SelectItem value="Playfair Display">
                      Playfair Display
                    </SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Times New Roman">
                      Times New Roman
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => setActiveTab("personal")}
                >
                  Continue Editing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resume Preview */}
      {previewVisible && (
        <div id="resume-preview" className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Resume Preview</h2>
          <div className="border rounded-lg shadow-lg overflow-hidden">
            {/* Resume preview content */}
            <div
              className="resume-container p-8 bg-white"
              style={{
                fontFamily: formData.fontFamily,
                minHeight: "1123px", // A4 height equivalent at 96dpi
              }}
            >
              {/* Resume Header */}
              <div className="text-center mb-6">
                <h2
                  className="text-2xl font-bold"
                  style={{
                    color: colorPalettes[formData.colorPaletteIndex].primary,
                  }}
                >
                  {formData.personalInfo.name || "Your Name"}
                </h2>

                <div className="flex flex-wrap justify-center gap-3 mt-2 text-sm">
                  {formData.personalInfo.email && (
                    <div className="flex items-center">
                      <span>📧 {formData.personalInfo.email}</span>
                    </div>
                  )}

                  {formData.personalInfo.phone && (
                    <div className="flex items-center">
                      <span>📱 {formData.personalInfo.phone}</span>
                    </div>
                  )}

                  {formData.personalInfo.location && (
                    <div className="flex items-center">
                      <span>📍 {formData.personalInfo.location}</span>
                    </div>
                  )}

                  {formData.personalInfo.linkedin && (
                    <div className="flex items-center">
                      <span>🔗 {formData.personalInfo.linkedin}</span>
                    </div>
                  )}

                  {formData.personalInfo.website && (
                    <div className="flex items-center">
                      <span>🌐 {formData.personalInfo.website}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              {formData.summary && (
                <div className="mb-6">
                  <h3
                    className="text-lg font-semibold mb-2 border-b pb-1"
                    style={{
                      color: colorPalettes[formData.colorPaletteIndex].primary,
                    }}
                  >
                    Summary
                  </h3>
                  <p className="text-sm">{formData.summary}</p>
                </div>
              )}

              {/* Experience */}
              {formData.experience.length > 0 && (
                <div className="mb-6">
                  <h3
                    className="text-lg font-semibold mb-2 border-b pb-1"
                    style={{
                      color: colorPalettes[formData.colorPaletteIndex].primary,
                    }}
                  >
                    Experience
                  </h3>

                  <div className="space-y-4">
                    {formData.experience.map((exp, index) => (
                      <div key={index} className="text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold">{exp.position}</div>
                            <div>
                              {exp.company}
                              {exp.location ? `, ${exp.location}` : ""}
                            </div>
                          </div>
                          <div className="text-right">
                            {exp.startDate && typeof exp.startDate === "object"
                              ? format(exp.startDate, "MMM yyyy")
                              : exp.startDate}
                            {" - "}
                            {exp.current
                              ? "Present"
                              : exp.endDate && typeof exp.endDate === "object"
                              ? format(exp.endDate, "MMM yyyy")
                              : exp.endDate}
                          </div>
                        </div>

                        {exp.responsibilities &&
                          exp.responsibilities.length > 0 && (
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                              {exp.responsibilities.map((resp, respIndex) => (
                                <li key={respIndex}>{resp}</li>
                              ))}
                            </ul>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {formData.education.length > 0 && (
                <div className="mb-6">
                  <h3
                    className="text-lg font-semibold mb-2 border-b pb-1"
                    style={{
                      color: colorPalettes[formData.colorPaletteIndex].primary,
                    }}
                  >
                    Education
                  </h3>

                  <div className="space-y-4">
                    {formData.education.map((edu, index) => (
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
                          <div className="text-right">
                            {edu.startDate && typeof edu.startDate === "object"
                              ? format(edu.startDate, "yyyy")
                              : edu.startDate}
                            {" - "}
                            {edu.current
                              ? "Present"
                              : edu.endDate && typeof edu.endDate === "object"
                              ? format(edu.endDate, "yyyy")
                              : edu.endDate}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {formData.skills.length > 0 && (
                <div className="mb-6">
                  <h3
                    className="text-lg font-semibold mb-2 border-b pb-1"
                    style={{
                      color: colorPalettes[formData.colorPaletteIndex].primary,
                    }}
                  >
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 text-xs rounded-md"
                        style={{
                          backgroundColor: `${
                            colorPalettes[formData.colorPaletteIndex].primary
                          }20`,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {formData.projects.length > 0 && (
                <div className="mb-6">
                  <h3
                    className="text-lg font-semibold mb-2 border-b pb-1"
                    style={{
                      color: colorPalettes[formData.colorPaletteIndex].primary,
                    }}
                  >
                    Projects
                  </h3>

                  <div className="space-y-4">
                    {formData.projects.map((project, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-bold">{project.name}</div>
                        <p className="mt-1">{project.description}</p>

                        {project.technologies && (
                          <div className="mt-1">
                            <span className="font-medium">Technologies:</span>{" "}
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
                    ))}
                  </div>
                </div>
              )}

              {/* Warning for one-page overflow (example) */}
              {/* <div className="absolute bottom-0 left-0 right-0 h-10 border-t border-dashed border-red-400 bg-red-50 flex items-center justify-center print-hide">
                <span className="text-red-600 text-xs">
                  Page Break - Content continues to next page
                </span>
              </div> */}
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default ResumeForm;
