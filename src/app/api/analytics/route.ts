// src/app/api/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const timeframe = searchParams.get("timeframe") || "30days";

  try {
    // Set the date range based on timeframe
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case "week":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "year":
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case "30days":
      default:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get total views and downloads
    const totals = await prisma.template.aggregate({
      where: {
        userId,
        updatedAt: { gte: startDate },
      },
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
        updatedAt: { gte: startDate },
      },
      _avg: {
        successRate: true,
      },
    });
    const avgSuccessRate = Math.round(successRateResult._avg.successRate || 0);

    // Get top performing templates
    const templates = await prisma.template.findMany({
      where: {
        userId,
        updatedAt: { gte: startDate },
      },
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

    // Generate downloads by month data based on timeframe
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
    const currentMonth = now.getMonth();

    // For a real application, you would query download data by month from the database
    // For this example, we'll create simulated data based on the timeframe
    const downloadsByMonth = []; // Changed from let to const

    if (timeframe === "week") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const currentDay = now.getDay();

      for (let i = 6; i >= 0; i--) {
        const dayIndex = (currentDay - i + 7) % 7;
        downloadsByMonth.push({
          month: days[dayIndex], // Using month key for consistency
          downloads: Math.floor(Math.random() * 20) + 5,
        });
      }
    } else if (timeframe === "year") {
      for (let i = 11; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        downloadsByMonth.push({
          month: months[monthIndex],
          downloads: Math.floor(Math.random() * 50) + 20,
        });
      }
    } else {
      // default 30 days
      for (let i = 6; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
        const weekLabel = `${weekStart.getDate()} ${
          months[weekStart.getMonth()]
        }`;

        downloadsByMonth.push({
          month: weekLabel,
          downloads: Math.floor(Math.random() * 35) + 15,
        });
      }
    }

    return NextResponse.json({
      totalViews,
      totalDownloads,
      conversionRate,
      avgSuccessRate,
      templatePerformance,
      downloadsByMonth,
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json(
      { error: "Error fetching analytics data" },
      { status: 500 }
    );
  }
}
