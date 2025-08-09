// src/components/dashboard/TemplatesList.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Search, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Template {
  id: string;
  companyName: string;
  jobTitle: string;
  industry?: string | null;
  downloads: number;
  views: number;
  updatedAt: Date;
  successRate?: number | null;
}

interface TemplatesListProps {
  templates: Template[];
}

export default function TemplatesList({
  templates: initialTemplates,
}: TemplatesListProps) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const router = useRouter();

  // Get unique industries from templates for the filter dropdown
  const industries = Array.from(
    new Set(
      templates
        .map((template) => template.industry)
        .filter((industry): industry is string => Boolean(industry))
    )
  );

  // Filter templates based on search query and industry filter
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesIndustry = industryFilter
      ? template.industry === industryFilter
      : true;

    return matchesSearch && matchesIndustry;
  });

  // Sort templates based on selected sorting option
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case "companyName":
        return a.companyName.localeCompare(b.companyName);
      case "jobTitle":
        return a.jobTitle.localeCompare(b.jobTitle);
      case "downloads":
        return b.downloads - a.downloads;
      case "views":
        return b.views - a.views;
      case "successRate":
        return (b.successRate || 0) - (a.successRate || 0);
      case "updatedAt":
      default:
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }
  });

  // Handle template deletion
  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete template");
      }

      // Remove the deleted template from the state
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      router.refresh();
    } catch (error) {
      console.error("Error deleting template:", error);
      setDeleteError("Failed to delete template. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              className="block w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
            >
              <option value="">All Industries</option>
              {industries.map((industry) => (
                <option key={industry} value={industry || ""}>
                  {industry || "Unknown"}
                </option>
              ))}
            </select>

            <select
              className="block w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="updatedAt">Most Recent</option>
              <option value="downloads">Most Downloads</option>
              <option value="views">Most Views</option>
              <option value="successRate">Highest Success Rate</option>
              <option value="companyName">Company Name</option>
              <option value="jobTitle">Job Title</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error message */}
      {deleteError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{deleteError}</span>
        </div>
      )}

      {/* Templates List */}
      {sortedTemplates.length > 0 ? (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Template
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Downloads
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Views
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Success Rate
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Last Updated
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTemplates.map((template) => (
                <tr key={template.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {template.companyName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {template.jobTitle}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {template.downloads}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {template.views}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {template.successRate ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {template.successRate}%
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(template.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/templates/${template.id}`}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      View
                    </Link>
                    <Link
                      href={`/templates/edit/${template.id}`}
                      className="text-gray-600 hover:text-gray-900 mr-3"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      disabled={isDeleting}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-10 text-center">
          <div className="h-16 w-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {searchQuery || industryFilter
              ? "No matching templates found"
              : "No templates yet"}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || industryFilter
              ? "Try changing your search or filter criteria"
              : "Start by uploading your first resume template."}
          </p>
          {!searchQuery && !industryFilter && (
            <Link href="/recruiter/upload">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
                <FileText className="mr-2 h-4 w-4" />
                Upload Template
              </button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
