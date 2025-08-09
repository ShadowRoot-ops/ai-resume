// src/components/dashboard/AnalyticsClient.tsx
"use client";

import { useState } from "react";
import { BarChart2, TrendingUp, Download, Eye, RefreshCw } from "lucide-react";

interface TemplatePerformance {
  name: string;
  downloads: number;
  successRate: number;
}

interface MonthlyDownload {
  month: string;
  downloads: number;
}

interface AnalyticsData {
  totalViews: number;
  totalDownloads: number;
  conversionRate: number;
  avgSuccessRate: number;
  templatePerformance: TemplatePerformance[];
  downloadsByMonth: MonthlyDownload[];
}

interface AnalyticsClientProps {
  initialData: AnalyticsData | null;
}

export default function AnalyticsClient({ initialData }: AnalyticsClientProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    initialData
  );
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState("30days");
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      // In a real application, you would fetch based on the timeframe
      const response = await fetch(`/api/analytics?timeframe=${timeframe}`);

      if (!response.ok) {
        throw new Error("Failed to load analytics data");
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderMetricCard = (
    icon: React.ReactNode,
    title: string,
    value: string | number,
    color: string
  ) => (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">Track your templates performance</p>
          </div>
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
          <p className="ml-2">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Template Analytics
          </h1>
          <p className="text-gray-600">Track your templates performance</p>
        </div>

        <div className="flex space-x-2">
          <button
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white text-gray-700 hover:bg-gray-50 flex items-center"
            onClick={fetchAnalytics}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh Data
          </button>

          <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
            <button
              className={`px-3 py-2 text-sm ${
                timeframe === "week"
                  ? "bg-primary-100 text-primary-800"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setTimeframe("week")}
            >
              Week
            </button>
            <button
              className={`px-3 py-2 text-sm ${
                timeframe === "30days"
                  ? "bg-primary-100 text-primary-800"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setTimeframe("30days")}
            >
              Month
            </button>
            <button
              className={`px-3 py-2 text-sm ${
                timeframe === "year"
                  ? "bg-primary-100 text-primary-800"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setTimeframe("year")}
            >
              Year
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
          <span>{error}</span>
          <button
            className="ml-auto text-red-700 hover:text-red-900"
            onClick={() => setError(null)}
          >
            &times;
          </button>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {analyticsData && (
          <>
            {renderMetricCard(
              <Eye className="h-5 w-5 text-blue-600" />,
              "Total Views",
              analyticsData.totalViews,
              "bg-blue-100"
            )}
            {renderMetricCard(
              <Download className="h-5 w-5 text-green-600" />,
              "Total Downloads",
              analyticsData.totalDownloads,
              "bg-green-100"
            )}
            {renderMetricCard(
              <TrendingUp className="h-5 w-5 text-purple-600" />,
              "Conversion Rate",
              `${analyticsData.conversionRate}%`,
              "bg-purple-100"
            )}
            {renderMetricCard(
              <BarChart2 className="h-5 w-5 text-yellow-600" />,
              "Avg. Success Rate",
              `${analyticsData.avgSuccessRate}%`,
              "bg-yellow-100"
            )}
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Top Performing Templates
            </h3>
          </div>
          <div className="overflow-x-auto">
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
                    Success Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData?.templatePerformance.map((template, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {template.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {template.downloads}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {template.successRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Downloads Trend
            </h3>
          </div>
          <div className="h-64">
            {/* Chart visualization */}
            <div className="h-full flex items-center justify-center">
              <div className="w-full">
                <div className="flex items-end justify-between h-48">
                  {analyticsData?.downloadsByMonth.map((data, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center flex-1"
                    >
                      <div
                        className="w-8 bg-primary-500 rounded-t"
                        style={{ height: `${data.downloads * 2}px` }}
                      ></div>
                      <span className="mt-2 text-xs font-medium text-gray-500">
                        {data.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
