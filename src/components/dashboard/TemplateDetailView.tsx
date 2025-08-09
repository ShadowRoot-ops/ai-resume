// src/components/dashboard/TemplateDetailView.tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Download,
  Edit2,
  Copy,
  Share2,
  Trash2,
  Star,
  AlertCircle,
  Check,
  ChevronLeft,
  Eye,
  FileText,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Define types for template data
interface TemplateProps {
  id: string;
  companyName: string;
  jobTitle: string;
  industry?: string;
  seniorityLevel?: string;
  version?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  downloads?: number;
  views?: number;
  successRate?: number;
  atsScore?: number;
  isRecruiter?: boolean;
  resumeContent?: string;
  tipsAndInsights?: string[] | string;
  keySkills?: string[] | string;
  redFlags?: string[] | string;
  cultureFitIndicators?: string[] | string;
  sampleInterviewQuestions?: string[] | string;
}

interface TemplateDetailViewProps {
  template: TemplateProps;
  isRecruiter?: boolean;
}

const TemplateDetailView: React.FC<TemplateDetailViewProps> = ({
  template,
  isRecruiter = false,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Helper function to ensure we have arrays
  const ensureArray = (value: string[] | string | undefined): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      try {
        // First try to parse it as JSON in case it's a stringified array
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
      } catch (e) {
        // If it's not valid JSON, split by newlines or commas
        return value
          .split(/[\n,]+/)
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }
    return [];
  };

  const handleDownload = async () => {
    if (isDownloaded) return;

    setIsDownloading(true);

    try {
      // Simulate download delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real implementation, you would fetch the actual template data
      const response = await fetch(`/api/templates/${template.id}/download`, {
        method: "POST",
      });

      if (response.ok) {
        setIsDownloaded(true);

        // Create a blob from the template data and download it
        const blob = new Blob([template.resumeContent || "{}"], {
          type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${template.companyName}-${template.jobTitle}-template.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error downloading template:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEdit = () => {
    // Navigate to edit template page
    window.location.href = `/templates/edit/${template.id}`;
  };

  const handleDuplicate = async () => {
    try {
      const response = await fetch(`/api/templates/${template.id}/duplicate`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = `/templates/${data.id}`;
      }
    } catch (error) {
      console.error("Error duplicating template:", error);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/templates/${template.id}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);

    setTimeout(() => {
      setCopySuccess(false);
    }, 3000);
  };

  const handleDelete = async () => {
    if (showConfirmDelete) {
      setIsDeleting(true);

      try {
        const response = await fetch(`/api/templates/${template.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          window.location.href = "/recruiter/templates";
        }
      } catch (error) {
        console.error("Error deleting template:", error);
      } finally {
        setIsDeleting(false);
      }
    } else {
      setShowConfirmDelete(true);
    }
  };

  const renderMetricCard = (
    icon: React.ReactNode,
    title: string,
    value: string | number,
    color: string
  ) => (
    <div className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200`}>
      <div className="flex items-center">
        <div className={`p-2 rounded-full ${color} mr-3`}>{icon}</div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  const renderContentSection = (
    title: string,
    icon: React.ReactNode,
    content: React.ReactNode
  ) => (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center mb-4">
        {icon}
        <h2 className="text-lg font-medium text-gray-900 ml-2">{title}</h2>
      </div>
      {content}
    </div>
  );

  const renderActionButtons = () => (
    <div className="flex flex-wrap gap-3 mt-6">
      <button
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        onClick={handleDownload}
      >
        <Download className="mr-2 h-4 w-4" />
        {isDownloading
          ? "Downloading..."
          : isDownloaded
          ? "Downloaded"
          : "Download Template"}
      </button>

      <button
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        onClick={handleEdit}
      >
        <Edit2 className="mr-2 h-4 w-4" />
        Edit Template
      </button>

      <button
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        onClick={handleDuplicate}
      >
        <Copy className="mr-2 h-4 w-4" />
        Duplicate
      </button>

      <button
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        onClick={handleShare}
      >
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </button>

      <button
        className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        onClick={handleDelete}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        {showConfirmDelete ? "Confirm Delete" : "Delete"}
      </button>
    </div>
  );

  // Format the template content for display
  let formattedContent = "";
  try {
    if (template.resumeContent) {
      const jsonContent = JSON.parse(template.resumeContent);
      formattedContent = JSON.stringify(jsonContent, null, 2);
    }
  } catch (e) {
    formattedContent = template.resumeContent || "";
  }

  // Handle date formatting with error handling
  const getFormattedDate = (dateValue: Date | string) => {
    try {
      return formatDistanceToNow(new Date(dateValue), { addSuffix: true });
    } catch (e) {
      return "recently";
    }
  };

  // Process all array-like data
  const tipsAndInsights = ensureArray(template.tipsAndInsights);
  const keySkills = ensureArray(template.keySkills);
  const cultureFitIndicators = ensureArray(template.cultureFitIndicators);
  const redFlags = ensureArray(template.redFlags);
  const sampleInterviewQuestions = ensureArray(
    template.sampleInterviewQuestions
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={isRecruiter ? "/recruiter/templates" : "/dashboard"}
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to {isRecruiter ? "Templates" : "Dashboard"}
      </Link>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {template.companyName} - {template.jobTitle}
            </h1>
            <div className="mt-2 flex flex-wrap items-center text-sm text-gray-500">
              {template.industry && (
                <span className="mr-4">{template.industry}</span>
              )}
              {template.seniorityLevel && (
                <span className="mr-4">{template.seniorityLevel}</span>
              )}
              {template.version && (
                <span className="mr-4">Version: {template.version}</span>
              )}
              <span>Updated {getFormattedDate(template.updatedAt)}</span>
            </div>
          </div>

          {isRecruiter && (
            <div className="mt-4 md:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Check className="mr-1 h-3 w-3" /> Verified Template
              </span>
            </div>
          )}
        </div>

        {isRecruiter && renderActionButtons()}
      </div>

      {/* Metrics Row (for recruiters only) */}
      {isRecruiter && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {renderMetricCard(
            <Download className="h-5 w-5 text-green-600" />,
            "Downloads",
            template.downloads || 0,
            "bg-green-100"
          )}
          {renderMetricCard(
            <Eye className="h-5 w-5 text-blue-600" />,
            "Views",
            template.views || 0,
            "bg-blue-100"
          )}
          {renderMetricCard(
            <Star className="h-5 w-5 text-yellow-600" />,
            "Success Rate",
            `${template.successRate || 0}%`,
            "bg-yellow-100"
          )}
          {renderMetricCard(
            <AlertCircle className="h-5 w-5 text-purple-600" />,
            "ATS Score",
            `${template.atsScore || 0}/100`,
            "bg-purple-100"
          )}
        </div>
      )}

      {/* Template Content */}
      {renderContentSection(
        "Resume Template",
        <FileText className="h-5 w-5 text-gray-500" />,
        <div>
          <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm">
            {formattedContent}
          </pre>
          {!isRecruiter && (
            <button
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading
                ? "Downloading..."
                : isDownloaded
                ? "Downloaded"
                : "Download Template"}
            </button>
          )}
        </div>
      )}

      {/* Tips & Insights */}
      {tipsAndInsights.length > 0 &&
        renderContentSection(
          "Recruiter Tips & Insights",
          <MessageSquare className="h-5 w-5 text-gray-500" />,
          <div className="space-y-4">
            {tipsAndInsights.map((tip, index) => (
              <div key={index} className="flex">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary-100 text-primary-800 text-sm font-medium mr-3">
                  {index + 1}
                </span>
                <p className="text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        )}

      {/* Key Skills */}
      {keySkills.length > 0 &&
        renderContentSection(
          "Key Skills",
          <Star className="h-5 w-5 text-gray-500" />,
          <div className="flex flex-wrap gap-2">
            {keySkills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

      {/* Culture Fit Indicators */}
      {cultureFitIndicators.length > 0 &&
        renderContentSection(
          "Culture Fit Indicators",
          <Eye className="h-5 w-5 text-gray-500" />,
          <div className="space-y-2">
            {cultureFitIndicators.map((indicator, index) => (
              <div key={index} className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <p className="text-gray-700">{indicator}</p>
              </div>
            ))}
          </div>
        )}

      {/* Red Flags (recruiters only) */}
      {isRecruiter &&
        redFlags.length > 0 &&
        renderContentSection(
          "Red Flags",
          <AlertCircle className="h-5 w-5 text-gray-500" />,
          <div className="space-y-2">
            {redFlags.map((flag, index) => (
              <div key={index} className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <p className="text-gray-700">{flag}</p>
              </div>
            ))}
          </div>
        )}

      {/* Sample Interview Questions (recruiters only) */}
      {isRecruiter &&
        sampleInterviewQuestions.length > 0 &&
        renderContentSection(
          "Sample Interview Questions",
          <Calendar className="h-5 w-5 text-gray-500" />,
          <div className="space-y-4">
            {sampleInterviewQuestions.map((question, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-800 font-medium">{question}</p>
              </div>
            ))}
          </div>
        )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              onClick={() => setShowShareModal(false)}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Share2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Share Template
                    </h3>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">
                        Share this template link with others:
                      </p>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="text"
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          value={`${window.location.origin}/templates/${template.id}`}
                          readOnly
                        />
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded-r-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          onClick={handleCopyLink}
                        >
                          {copySuccess ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {copySuccess && (
                        <p className="mt-2 text-xs text-green-600">
                          Link copied to clipboard!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowShareModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateDetailView;
