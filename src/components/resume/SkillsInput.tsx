// src/components/resume/SkillsInput.tsx
"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface SkillsInputProps {
  skills: string[];
  setSkills: (skills: string[]) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

const SkillsInput: React.FC<SkillsInputProps> = ({
  skills,
  setSkills,
  label = "Skills",
  placeholder = "Add skills (e.g., React, JavaScript, AWS)",
  className = "",
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  };

  const addSkill = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    // Handle comma-separated values
    const skillsToAdd = trimmedValue
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      // Don't add duplicates
      .filter((skill) => !skills.includes(skill));

    if (skillsToAdd.length) {
      setSkills([...skills, ...skillsToAdd]);
      setInputValue("");
    }
  };

  const removeSkill = (indexToRemove: number) => {
    setSkills(skills.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Label htmlFor="skills">{label} (press Enter or comma to add)</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {skills.map((skill, index) => (
          <Badge
            key={index}
            className="flex items-center gap-1 bg-primary text-primary-foreground"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(index)}
              className="ml-1 rounded-full hover:bg-primary-foreground/20"
              aria-label={`Remove ${skill}`}
            >
              <X size={14} />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        id="skills"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addSkill}
      />
    </div>
  );
};

export default SkillsInput;
