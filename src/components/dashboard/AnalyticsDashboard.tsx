"use client";

import React, { useState } from "react";
import {
  BarChart,
  LineChart,
  PieChart,
  Download,
  Users,
  TrendingUp,
  Calendar,
  Filter,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// For a real implementation, you would use a charting library like recharts, chart.js, etc.
// This is just a simplified mockup
const BarChartPlaceholder = ({ height = 300 }) => (
  <div
    className="w-full bg-gray-100 dark:bg-gray-800 rounded-md flex items-end justify-around p-4"
    style={{ height: `${height}px` }}
  >
    {[65, 40, 85, 30, 55, 60, 45, 70, 50, 75, 35, 80].map((val, i) => (
      <div key={i} className="flex flex-col items-center">
        <div
          className="bg-blue-500 dark:bg-blue-600 rounded-t-sm w-8"
          style={{ height: `${(val * 70) / 100}px` }}
        ></div>
        <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">
          {i + 1}
        </span>
      </div>
    ))}
  </div>
);

const LineChartPlaceholder = ({ height = 300 }) => (
  <div
    className="w-full bg-gray-100 dark:bg-gray-800 rounded-md p-4 relative"
    style={{ height: `${height}px` }}
  >
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-gray-400 dark:text-gray-500">
        Line chart visualization would appear here
      </span>
    </div>
  </div>
);

const PieChartPlaceholder = ({ height = 300 }) => (
  <div
    className="w-full bg-gray-100 dark:bg-gray-800 rounded-md p-4 flex items-center justify-center"
    style={{ height: `${height}px` }}
  >
    <div className="rounded-full h-40 w-40 relative">
      <div
        className="absolute inset-0 bg-blue-500 rounded-full"
        style={{
          clipPath:
            "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 30%)",
        }}
      ></div>
      <div
        className="absolute inset-0 bg-green-500 rounded-full"
        style={{ clipPath: "polygon(50% 50%, 50% 0%, 100% 0%, 100% 30%)" }}
      ></div>
      <div
        className="absolute inset-0 bg-yellow-500 rounded-full"
        style={{ clipPath: "polygon(50% 50%, 0% 30%, 0% 0%, 50% 0%)" }}
      ></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800"></div>
      </div>
    </div>
  </div>
);

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30days");
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Template Analytics</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Track the performance of your resume templates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Downloads
                </p>
                <h3 className="text-3xl font-bold mt-1">2,483</h3>
                <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                  ↑ 12.5% from last month
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <Download className="text-blue-600 dark:text-blue-400 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Unique Users
                </p>
                <h3 className="text-3xl font-bold mt-1">1,294</h3>
                <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                  ↑ 8.7% from last month
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <Users className="text-green-600 dark:text-green-400 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Interview Success
                </p>
                <h3 className="text-3xl font-bold mt-1">76.4%</h3>
                <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                  ↓ 2.1% from last month
                </p>
              </div>
              <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full">
                <TrendingUp className="text-amber-600 dark:text-amber-400 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active Templates
                </p>
                <h3 className="text-3xl font-bold mt-1">12</h3>
                <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                  ↑ 2 new this month
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <FileText className="text-purple-600 dark:text-purple-400 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different analytics views */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Templates</span>
          </TabsTrigger>
          <TabsTrigger value="demographics" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span>Demographics</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span>Trends</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Download Activity</CardTitle>
                <CardDescription>
                  Daily downloads of your templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartPlaceholder />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Success Rate Over Time</CardTitle>
                <CardDescription>
                  Percentage of users who secured interviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LineChartPlaceholder />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance by Template</CardTitle>
              <CardDescription>
                Success rates and download statistics by template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Template
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Company
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Role
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Downloads
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Success Rate
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        ATS Score
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        id: 1,
                        name: "Tech Lead Template",
                        company: "Google",
                        role: "Senior Software Engineer",
                        downloads: 245,
                        successRate: 82,
                        atsScore: 9.5,
                      },
                      {
                        id: 2,
                        name: "Product Management",
                        company: "Microsoft",
                        role: "Product Manager",
                        downloads: 198,
                        successRate: 79,
                        atsScore: 8.7,
                      },
                      {
                        id: 3,
                        name: "Data Science Pro",
                        company: "Amazon",
                        role: "Data Scientist",
                        downloads: 187,
                        successRate: 75,
                        atsScore: 9.2,
                      },
                      {
                        id: 4,
                        name: "UX Portfolio",
                        company: "Apple",
                        role: "UX Designer",
                        downloads: 143,
                        successRate: 71,
                        atsScore: 8.9,
                      },
                      {
                        id: 5,
                        name: "Marketing Manager",
                        company: "Meta",
                        role: "Marketing Manager",
                        downloads: 112,
                        successRate: 68,
                        atsScore: 8.3,
                      },
                    ].map((template) => (
                      <tr
                        key={template.id}
                        className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-3 px-4 text-sm font-medium">
                          {template.name}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {template.company}
                        </td>
                        <td className="py-3 px-4 text-sm">{template.role}</td>
                        <td className="py-3 px-4 text-sm text-right">
                          {template.downloads}
                        </td>
                        <td className="py-3 px-4 text-sm text-right">
                          <span
                            className={`font-medium ${
                              template.successRate >= 80
                                ? "text-green-600 dark:text-green-500"
                                : template.successRate >= 70
                                ? "text-blue-600 dark:text-blue-500"
                                : "text-yellow-600 dark:text-yellow-500"
                            }`}
                          >
                            {template.successRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-right">
                          {template.atsScore}/10
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Popularity</CardTitle>
                <CardDescription>
                  Number of downloads by template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartPlaceholder height={400} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template Distribution</CardTitle>
                <CardDescription>
                  Breakdown of template usage by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PieChartPlaceholder height={400} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="demographics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Industries</CardTitle>
                <CardDescription>
                  Distribution of users by industry
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PieChartPlaceholder height={350} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Experience Levels</CardTitle>
                <CardDescription>
                  Breakdown of users by years of experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartPlaceholder height={350} />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>
                  User locations around the world
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500">
                  Geographic map visualization would appear here
                </span>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Success Rate Trends</CardTitle>
                <CardDescription>
                  Interview success rates over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LineChartPlaceholder height={400} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skill Demand Trends</CardTitle>
                <CardDescription>
                  Changing demand for different skills based on user templates
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Skill
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Current Demand
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Trend
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Change
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        skill: "React",
                        demand: "Very High",
                        trend: "up",
                        change: "+12%",
                      },
                      {
                        skill: "TypeScript",
                        demand: "High",
                        trend: "up",
                        change: "+9%",
                      },
                      {
                        skill: "AWS",
                        demand: "High",
                        trend: "stable",
                        change: "+2%",
                      },
                      {
                        skill: "Python",
                        demand: "Very High",
                        trend: "up",
                        change: "+15%",
                      },
                      {
                        skill: "Docker",
                        demand: "Medium",
                        trend: "up",
                        change: "+7%",
                      },
                      {
                        skill: "SQL",
                        demand: "Medium",
                        trend: "stable",
                        change: "+1%",
                      },
                      {
                        skill: "Java",
                        demand: "Medium",
                        trend: "down",
                        change: "-3%",
                      },
                      {
                        skill: "PHP",
                        demand: "Low",
                        trend: "down",
                        change: "-8%",
                      },
                    ].map((item, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-3 px-4 text-sm font-medium">
                          {item.skill}
                        </td>
                        <td className="py-3 px-4 text-sm">{item.demand}</td>
                        <td className="py-3 px-4 text-sm">
                          {item.trend === "up" && (
                            <span className="text-green-600 dark:text-green-500">
                              ↑ Increasing
                            </span>
                          )}
                          {item.trend === "stable" && (
                            <span className="text-blue-600 dark:text-blue-500">
                              → Stable
                            </span>
                          )}
                          {item.trend === "down" && (
                            <span className="text-red-600 dark:text-red-500">
                              ↓ Decreasing
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span
                            className={
                              item.change.startsWith("+")
                                ? "text-green-600 dark:text-green-500"
                                : "text-red-600 dark:text-red-500"
                            }
                          >
                            {item.change}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
