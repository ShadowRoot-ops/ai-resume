// src/components/dashboard/RecruiterDashboard.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileUp,
  BarChart2,
  FileText,
  Database,
  Download,
  Activity,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface DashboardProps {
  userId: string;
}

interface DashboardStats {
  totalTemplates: number;
  totalDownloads: number;
  activeTemplates: number;
  avgSuccessRate: number;
}

interface Template {
  id: string;
  companyName: string;
  jobTitle: string;
  industry?: string;
  downloads: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

const RecruiterDashboard: React.FC<DashboardProps> = ({ userId }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTemplates: 0,
    totalDownloads: 0,
    activeTemplates: 0,
    avgSuccessRate: 0,
  });
  const [recentTemplates, setRecentTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, [userId]); // Include userId in the dependency array

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats
      const statsResponse = await fetch("/api/templates/stats");
      if (!statsResponse.ok) {
        throw new Error("Failed to fetch stats");
      }

      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch templates
      const templatesResponse = await fetch("/api/templates");
      if (!templatesResponse.ok) {
        throw new Error("Failed to fetch templates");
      }

      const templatesData = await templatesResponse.json();

      // Get the most recent 5 templates
      const mostRecent = templatesData
        .sort(
          (a: Template, b: Template) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 5);

      setRecentTemplates(mostRecent);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete template");
      }

      // Remove the deleted template from state
      setRecentTemplates((prev) => prev.filter((t) => t.id !== id));

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalTemplates: Math.max(0, prev.totalTemplates - 1),
      }));

      router.refresh();
    } catch (err) {
      console.error("Error deleting template:", err);
      setError("Failed to delete template. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Your Recruiter Dashboard
        </h1>
        <p className="text-gray-600">
          Manage your resume templates and track their performance
        </p>
      </div>

      {/* Error notification */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>{error}</span>
          <button
            className="ml-auto text-red-700 hover:text-red-900"
            onClick={() => setError(null)}
          >
            &times;
          </button>
        </div>
      )}

      {/* Stats Overview */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-700">
            Performance Overview
          </h2>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Templates
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? "..." : stats.totalTemplates}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <Download className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Downloads
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? "..." : stats.totalDownloads}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active Templates
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? "..." : stats.activeTemplates}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 mr-4">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Avg. Success Rate
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? "..." : `${stats.avgSuccessRate}%`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-10">
        <h2 className="text-lg font-medium text-gray-700 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/recruiter/upload"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors flex flex-col items-center text-center"
          >
            <div className="p-3 rounded-full bg-primary-100 mb-3">
              <FileUp className="h-6 w-6 text-primary-600" />
            </div>

            <h3 className="font-medium text-gray-900 mb-1">Upload Template</h3>
            <p className="text-sm text-gray-500">
              Create a new resume template
            </p>
          </Link>

          <Link
            href="/recruiter/templates"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors flex flex-col items-center text-center"
          >
            <div className="p-3 rounded-full bg-primary-100 mb-3">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">View Templates</h3>
            <p className="text-sm text-gray-500">
              Manage your existing templates
            </p>
          </Link>

          <Link
            href="/recruiter/analytics"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors flex flex-col items-center text-center"
          >
            <div className="p-3 rounded-full bg-primary-100 mb-3">
              <BarChart2 className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">View Analytics</h3>
            <p className="text-sm text-gray-500">See performance metrics</p>
          </Link>

          <Link
            href="/recruiter/bulk-upload"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors flex flex-col items-center text-center"
          >
            <div className="p-3 rounded-full bg-primary-100 mb-3">
              <Database className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Bulk Upload</h3>
            <p className="text-sm text-gray-500">Upload multiple templates</p>
          </Link>
        </div>
      </section>

      {/* Recent Templates */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-700">
            Recent Templates
          </h2>
          <Link
            href="/recruiter/templates"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all templates
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-3 text-gray-500">Loading templates...</p>
          </div>
        ) : recentTemplates.length > 0 ? (
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
                    Last Updated
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTemplates.map((template) => (
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
              No templates yet
            </h3>
            <p className="text-gray-500 mb-4">
              Start by uploading your first resume template.
            </p>
            <Link href="/recruiter/upload">
              <Button className="inline-flex items-center">
                <FileUp className="mr-2 h-4 w-4" />
                Upload Template
              </Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default RecruiterDashboard;
