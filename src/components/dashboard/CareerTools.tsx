// src/components/dashboard/CareerTools.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Info } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCredits } from "@/lib/useCredits";

// Dynamically import our advanced tools to reduce initial page load
const ResumeAnalyzer = dynamic(
  () => import("@/components/resume/ResumeAnalyzer"),
  {
    loading: () => (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-pulse flex space-x-2">
          <div className="h-3 w-3 bg-primary/60 rounded-full"></div>
          <div className="h-3 w-3 bg-primary/60 rounded-full"></div>
          <div className="h-3 w-3 bg-primary/60 rounded-full"></div>
        </div>
        <p className="text-center mt-4 text-gray-500">
          Loading resume analyzer...
        </p>
      </div>
    ),
  }
);

const CoverLetterGenerator = dynamic(
  () => import("@/components/resume/CoverLetterGenerator"),
  {
    loading: () => (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-pulse flex space-x-2">
          <div className="h-3 w-3 bg-primary/60 rounded-full"></div>
          <div className="h-3 w-3 bg-primary/60 rounded-full"></div>
          <div className="h-3 w-3 bg-primary/60 rounded-full"></div>
        </div>
        <p className="text-center mt-4 text-gray-500">
          Loading cover letter generator...
        </p>
      </div>
    ),
  }
);

export default function CareerTools() {
  const [activeTab, setActiveTab] = useState("analyze");
  // Fixed: rename the destructured functions to avoid naming conflicts
  const { checkCredits, spendCredits } = useCredits();

  const handleTabChange = async (value: string) => {
    // Check credits before allowing tab change
    if (value === "cover-letter") {
      const hasEnoughCredits = await checkCredits(2);
      if (hasEnoughCredits) {
        setActiveTab(value);
      }
    } else {
      setActiveTab(value);
    }
  };

  return (
    <div className="w-full">
      <Tabs
        defaultValue="analyze"
        className="w-full"
        value={activeTab}
        onValueChange={handleTabChange}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="analyze">Resume Analysis</TabsTrigger>
          <TabsTrigger value="cover-letter">Cover Letter Generator</TabsTrigger>
          <TabsTrigger value="interview">Interview Preparation</TabsTrigger>
        </TabsList>

        <TabsContent value="analyze">
          <ResumeAnalyzer />
        </TabsContent>

        <TabsContent value="cover-letter">
          <CoverLetterGenerator />
        </TabsContent>

        <TabsContent value="interview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Interview Preparation
              </CardTitle>
              <CardDescription>
                Practice common interview questions and get AI-powered feedback
                on your answers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/5 p-4 rounded-lg flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-3 mt-1">
                  <Info className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Coming Soon</h3>
                  <p className="text-sm text-gray-500">
                    We're working on an interactive interview preparation tool
                    to help you practice and perfect your responses to common
                    interview questions based on your resume and target job.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gray-50 dark:bg-gray-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Mock Interviews</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-500">
                      Practice with AI-powered mock interviews tailored to your
                      target job and industry.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50 dark:bg-gray-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Response Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-500">
                      Get detailed feedback on your interview responses with
                      suggestions for improvement.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50 dark:bg-gray-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Industry Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-500">
                      Learn what hiring managers in your target industry are
                      looking for in candidates.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50 dark:bg-gray-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Behavioral Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-500">
                      Master the STAR method for answering behavioral interview
                      questions effectively.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center">
                <Link href="/feedback">
                  <Button
                    variant="outline"
                    className="text-primary border-primary hover:bg-primary/10"
                  >
                    Request Early Access
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
