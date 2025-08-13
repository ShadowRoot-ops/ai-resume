// src/components/resume/EducationForm.tsx
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Trash2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Education {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  gpa?: string;
  startDate: Date | string;
  endDate?: Date | string;
  current?: boolean;
}

interface EducationFormProps {
  education: Education[];
  setEducation: (education: Education[]) => void;
}

const EducationForm: React.FC<EducationFormProps> = ({
  education,
  setEducation,
}) => {
  const handleAddEducation = () => {
    setEducation([
      ...education,
      {
        institution: "",
        degree: "",
        startDate: new Date(),
      },
    ]);
  };

  const handleRemoveEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const updateEducation = (
    index: number,
    field: keyof Education,
    value: string | Date | boolean | undefined
  ) => {
    const updatedEducation = [...education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };

    // If setting current to true, clear end date
    if (field === "current" && value === true) {
      updatedEducation[index].endDate = undefined;
    }

    setEducation(updatedEducation);
  };

  return (
    <div className="space-y-6">
      {education.map((edu, index) => (
        <Card key={index} className="relative">
          <CardContent className="pt-6">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 text-gray-500 hover:text-red-600"
              onClick={() => handleRemoveEducation(index)}
            >
              <Trash2 size={16} />
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Institution</label>
                <Input
                  value={edu.institution}
                  onChange={(e) =>
                    updateEducation(index, "institution", e.target.value)
                  }
                  placeholder="e.g., Harvard University"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Degree</label>
                <Input
                  value={edu.degree}
                  onChange={(e) =>
                    updateEducation(index, "degree", e.target.value)
                  }
                  placeholder="e.g., Bachelor of Science"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Field of Study (Optional)
                </label>
                <Input
                  value={edu.fieldOfStudy || ""}
                  onChange={(e) =>
                    updateEducation(index, "fieldOfStudy", e.target.value)
                  }
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">GPA (Optional)</label>
                <Input
                  value={edu.gpa || ""}
                  onChange={(e) =>
                    updateEducation(index, "gpa", e.target.value)
                  }
                  placeholder="e.g., 3.8/4.0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <DatePicker
                label="Start Date"
                date={
                  typeof edu.startDate === "string"
                    ? new Date(edu.startDate)
                    : edu.startDate
                }
                setDate={(date) => updateEducation(index, "startDate", date)}
              />

              <div className="space-y-2">
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    id={`current-edu-${index}`}
                    checked={edu.current || false}
                    onChange={(e) =>
                      updateEducation(index, "current", e.target.checked)
                    }
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor={`current-edu-${index}`}
                    className="text-sm font-medium"
                  >
                    Currently Studying
                  </label>
                </div>

                <DatePicker
                  date={
                    edu.endDate
                      ? typeof edu.endDate === "string"
                        ? new Date(edu.endDate)
                        : edu.endDate
                      : undefined
                  }
                  setDate={(date) => updateEducation(index, "endDate", date)}
                  disabled={edu.current}
                  placeholder={edu.current ? "Present" : "Select end date"}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleAddEducation}
      >
        <Plus size={16} className="mr-2" />
        Add Education
      </Button>
    </div>
  );
};

export default EducationForm;
