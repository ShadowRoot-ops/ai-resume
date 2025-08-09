// src/app/recruiter/analytics/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import RecruiterNavbar from "@/components/navigation/RecruiterNavbar";
import AnalyticsClient from "@/components/dashboard/AnalyticsClient";

export const metadata = {
  title: "Analytics | Resume AI Builder",
  description: "Track your template performance with detailed analytics",
};

async function getAnalyticsData(userId: string) {
  try {
    // Get total views and downloads
    const totals = await prisma.template.aggregate({
      where: { userId },
      _sum: {
        views: true,
        downloads: true,
      },
    });

    const totalViews = totals._sum.views || 0;
    const totalDownloads = totals._sum.downloads || 0;

    // Calculate conversion rate
    const conversionRate =
      totalViews > 0 ? Math.round((totalDownloads / totalViews) * 100) : 0;

    // Get average success rate
    const successRateResult = await prisma.template.aggregate({
      where: {
        userId,
        successRate: { not: null },
      },
      _avg: {
        successRate: true,
      },
    });
    const avgSuccessRate = Math.round(successRateResult._avg.successRate || 0);

    // Get top performing templates
    const templates = await prisma.template.findMany({
      where: { userId },
      select: {
        id: true,
        companyName: true,
        jobTitle: true,
        downloads: true,
        successRate: true,
      },
      orderBy: [{ downloads: "desc" }, { successRate: "desc" }],
      take: 5,
    });

    const templatePerformance = templates.map((template) => ({
      name: `${template.companyName} - ${template.jobTitle}`,
      downloads: template.downloads,
      successRate: template.successRate || 0,
    }));

    // For downloads by month, we would typically query this from the database
    // In this example, we'll create mock data for the chart
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentMonth = new Date().getMonth();

    const downloadsByMonth = [];
    for (let i = 6; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const month = months[monthIndex];

      // This would be replaced by a real query in a production app
      // For now, we'll use random data
      const downloads = Math.floor(Math.random() * 30) + (30 - i * 3);

      downloadsByMonth.push({
        month,
        downloads,
      });
    }

    return {
      totalViews,
      totalDownloads,
      conversionRate,
      avgSuccessRate,
      templatePerformance,
      downloadsByMonth,
    };
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return null;
  }
}

export default async function RecruiterAnalyticsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth/sign-in");
  }

  const analyticsData = await getAnalyticsData(userId);

  return (
    <div className="min-h-screen bg-gray-50">
      <RecruiterNavbar />
      <AnalyticsClient initialData={analyticsData} />
    </div>
  );
}
