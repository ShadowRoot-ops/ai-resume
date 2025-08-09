// src/components/resume/ExperienceForm.tsx
"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Trash2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Experience {
  company: string;
  position: string;
  location?: string;
  startDate: Date | string;
  endDate?: Date | string;
  current?: boolean;
  responsibilities: string[];
}

interface ExperienceFormProps {
  experiences: Experience[];
  setExperiences: (experiences: Experience[]) => void;
}

const ExperienceForm: React.FC<ExperienceFormProps> = ({
  experiences,
  setExperiences,
}) => {
  const [newResponsibility, setNewResponsibility] = useState("");

  const handleAddExperience = () => {
    setExperiences([
      ...experiences,
      {
        company: "",
        position: "",
        location: "",
        startDate: new Date(),
        responsibilities: [],
      },
    ]);
  };

  const handleRemoveExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const updateExperience = (
    index: number,
    field: keyof Experience,
    value: any
  ) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index] = {
      ...updatedExperiences[index],
      [field]: value,
    };

    // If setting current job to true, clear end date
    if (field === "current" && value === true) {
      updatedExperiences[index].endDate = undefined;
    }

    setExperiences(updatedExperiences);
  };

  const addResponsibility = (index: number) => {
    if (!newResponsibility.trim()) return;

    const updatedExperiences = [...experiences];
    updatedExperiences[index] = {
      ...updatedExperiences[index],
      responsibilities: [
        ...(updatedExperiences[index].responsibilities || []),
        newResponsibility,
      ],
    };
    setExperiences(updatedExperiences);
    setNewResponsibility("");
  };

  const removeResponsibility = (expIndex: number, respIndex: number) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[expIndex].responsibilities = updatedExperiences[
      expIndex
    ].responsibilities.filter((_, i) => i !== respIndex);
    setExperiences(updatedExperiences);
  };

  return (
    <div className="space-y-6">
      {experiences.map((exp, index) => (
        <Card key={index} className="relative">
          <CardContent className="pt-6">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 text-gray-500 hover:text-red-600"
              onClick={() => handleRemoveExperience(index)}
            >
              <Trash2 size={16} />
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company</label>
                <Input
                  value={exp.company}
                  onChange={(e) =>
                    updateExperience(index, "company", e.target.value)
                  }
                  placeholder="e.g., Google"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Position</label>
                <Input
                  value={exp.position}
                  onChange={(e) =>
                    updateExperience(index, "position", e.target.value)
                  }
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Location (Optional)
                </label>
                <Input
                  value={exp.location || ""}
                  onChange={(e) =>
                    updateExperience(index, "location", e.target.value)
                  }
                  placeholder="e.g., San Francisco, CA"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    id={`current-job-${index}`}
                    checked={exp.current || false}
                    onChange={(e) =>
                      updateExperience(index, "current", e.target.checked)
                    }
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor={`current-job-${index}`}
                    className="text-sm font-medium"
                  >
                    Current Position
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <DatePicker
                label="Start Date"
                date={
                  typeof exp.startDate === "string"
                    ? new Date(exp.startDate)
                    : exp.startDate
                }
                setDate={(date) => updateExperience(index, "startDate", date)}
              />

              <DatePicker
                label="End Date"
                date={
                  exp.endDate
                    ? typeof exp.endDate === "string"
                      ? new Date(exp.endDate)
                      : exp.endDate
                    : undefined
                }
                setDate={(date) => updateExperience(index, "endDate", date)}
                disabled={exp.current}
                placeholder={exp.current ? "Present" : "Select end date"}
              />
            </div>

            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium">Responsibilities</label>
              {exp.responsibilities && exp.responsibilities.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 mb-3">
                  {exp.responsibilities.map((resp, respIndex) => (
                    <li key={respIndex} className="flex items-start group">
                      <span className="flex-1">{resp}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeResponsibility(index, respIndex)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 mb-3">
                  No responsibilities added yet.
                </p>
              )}

              <div className="flex space-x-2">
                <Textarea
                  placeholder="Describe your responsibility or achievement"
                  value={newResponsibility}
                  onChange={(e) => setNewResponsibility(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={() => addResponsibility(index)}
                  disabled={!newResponsibility.trim()}
                >
                  <Plus size={16} />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Tip: Use bullet points and quantify achievements (e.g.,
                "Increased sales by 20%")
              </p>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleAddExperience}
      >
        <Plus size={16} className="mr-2" />
        Add Experience
      </Button>
    </div>
  );
};

export default ExperienceForm;
