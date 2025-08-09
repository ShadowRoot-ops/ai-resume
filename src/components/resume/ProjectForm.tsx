// src/components/resume/ProjectForm.tsx
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Project {
  name: string;
  description: string;
  technologies?: string;
  url?: string;
}

interface ProjectFormProps {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ projects, setProjects }) => {
  const handleAddProject = () => {
    setProjects([
      ...projects,
      {
        name: "",
        description: "",
      },
    ]);
  };

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const updateProject = (
    index: number,
    field: keyof Project,
    value: string
  ) => {
    const updatedProjects = [...projects];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    setProjects(updatedProjects);
  };

  return (
    <div className="space-y-6">
      {projects.map((project, index) => (
        <Card key={index} className="relative">
          <CardContent className="pt-6">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 text-gray-500 hover:text-red-600"
              onClick={() => handleRemoveProject(index)}
            >
              <Trash2 size={16} />
            </Button>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Name</label>
                <Input
                  value={project.name}
                  onChange={(e) => updateProject(index, "name", e.target.value)}
                  placeholder="e.g., E-commerce Platform"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={project.description}
                  onChange={(e) =>
                    updateProject(index, "description", e.target.value)
                  }
                  placeholder="Describe the project, your role, and key achievements"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Technologies (Optional)
                </label>
                <Input
                  value={project.technologies || ""}
                  onChange={(e) =>
                    updateProject(index, "technologies", e.target.value)
                  }
                  placeholder="e.g., React, Node.js, MongoDB"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Project URL (Optional)
                </label>
                <Input
                  value={project.url || ""}
                  onChange={(e) => updateProject(index, "url", e.target.value)}
                  placeholder="e.g., https://github.com/username/project"
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
        onClick={handleAddProject}
      >
        <Plus size={16} className="mr-2" />
        Add Project
      </Button>
    </div>
  );
};

export default ProjectForm;
