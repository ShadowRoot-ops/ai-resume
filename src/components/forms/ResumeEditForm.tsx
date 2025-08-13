"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { resumeTemplates, colorPalettes } from "@/lib/resume-templates";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  title: z.string().min(1, { message: "Resume title is required" }),
  summary: z.string().optional(),
  templateId: z.string().min(1, { message: "Select a template" }),
  colorPaletteIndex: z.string(),
  skills: z.array(z.string()).optional(),
});

type Resume = {
  id: string;
  title: string;
  templateId: string;
  colorPaletteIndex?: number;
  jobTitle?: string;
  content: {
    summary?: string;
    skills?: string[];
    personalInfo?: {
      name?: string;
    };
    experience?: Array<{
      company?: string;
      date?: string;
    }>;
  };
};

type ResumeEditFormProps = {
  resume: Resume;
};

export default function ResumeEditForm({ resume }: ResumeEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState("");

  const resumeContent = resume.content;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: resume.title || "",
      summary: resumeContent.summary || "",
      templateId: resume.templateId || "professional",
      colorPaletteIndex: (resume.colorPaletteIndex || 0).toString(),
      skills: resumeContent.skills || [],
    },
  });

  const watchTemplateId = form.watch("templateId");
  const watchSkills = form.watch("skills");

  // Template preview component
  const TemplatePreview = ({ templateId }: { templateId: string }) => {
    const template = resumeTemplates[templateId];
    const colorPalette =
      colorPalettes[parseInt(form.getValues("colorPaletteIndex") || "0")];

    const previewStyle = {
      "--primary-color": colorPalette?.primary || template.primaryColor,
      "--secondary-color": colorPalette?.secondary || template.secondaryColor,
      "--accent-color": colorPalette?.accent || template.accentColor,
      fontFamily: template.fontFamily,
    } as React.CSSProperties;

    return (
      <div
        className="border rounded-md p-4 mt-2 bg-white text-sm"
        style={previewStyle}
      >
        <div
          className={template.headerStyle}
          style={{ color: "var(--primary-color)" }}
        >
          <h3 className="font-bold text-lg">
            {resumeContent?.personalInfo?.name || "John Doe"}
          </h3>
          <p style={{ color: "var(--accent-color)" }}>
            {resume.jobTitle || "Software Engineer"}
          </p>
        </div>
        <div className="mt-3">
          <h4
            className={template.sectionStyle}
            style={{ color: "var(--primary-color)" }}
          >
            Experience
          </h4>
          <div className="mt-2">
            <p className="font-semibold">
              {resumeContent?.experience?.[0]?.company || "Company Name"}
            </p>
            <p className="text-xs" style={{ color: "var(--accent-color)" }}>
              {resumeContent?.experience?.[0]?.date || "2020 - Present"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Add skill
  const addSkill = () => {
    if (newSkill.trim() === "") return;

    const currentSkills = form.getValues("skills") || [];
    if (!currentSkills.includes(newSkill.trim())) {
      form.setValue("skills", [...currentSkills, newSkill.trim()]);
    }

    setNewSkill("");
  };

  // Remove skill
  const removeSkill = (skill: string) => {
    const currentSkills = form.getValues("skills") || [];
    form.setValue(
      "skills",
      currentSkills.filter((s) => s !== skill)
    );
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);

    try {
      // Update resume content
      const updatedContent = {
        ...resumeContent,
        summary: values.summary,
        skills: values.skills || [],
      };

      // FIXED: Changed /api/resume/ to /api/resumes/ to match your API route
      const response = await fetch(`/api/resumes/${resume.id}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title,
          content: updatedContent,
          templateId: values.templateId,
          colorPaletteIndex: parseInt(values.colorPaletteIndex),
        }),
      });

      if (!response.ok) {
        // Better error handling
        const data = await response
          .json()
          .catch(() => ({ error: "Failed to update resume" }));
        throw new Error(
          data.error || `Error ${response.status}: Failed to update resume`
        );
      }

      // const data = await response.json();

      // Redirect to view resume
      router.push(`/resume/${resume.id}`);
      router.refresh();
    } catch (error: unknown) {
      console.error("Update failed:", error);
      if (error instanceof Error) {
        setError(error.message || "Failed to update resume");
      } else {
        setError("Failed to update resume");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full mx-auto mb-10">
      <CardHeader>
        <CardTitle>Edit Resume</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resume Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Summary</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="min-h-[100px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Skills Section */}
            <FormField
              control={form.control}
              name="skills"
              render={({}) => (
                <FormItem>
                  <FormLabel>Skills</FormLabel>

                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                    />
                    <Button type="button" onClick={addSkill} size="sm">
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {watchSkills &&
                      watchSkills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="rounded-full h-4 w-4 bg-gray-400 text-white flex items-center justify-center text-xs leading-none ml-1"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Style</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(resumeTemplates).map(
                          ([id, template]) => (
                            <SelectItem key={id} value={id}>
                              {template.name}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="colorPaletteIndex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color Scheme</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select color scheme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colorPalettes.map((palette, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: palette.primary }}
                              ></div>
                              {palette.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-2">
              <h4 className="text-sm font-medium mb-1">Preview</h4>
              <TemplatePreview templateId={watchTemplateId} />
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/resume/${resume.id}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
