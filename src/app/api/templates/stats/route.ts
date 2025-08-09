// src/app/api/templates/stats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the total number of templates for the user
    const totalTemplates = await prisma.template.count({
      where: { userId },
    });

    // Get the total number of downloads for all templates of the user
    const downloadsResult = await prisma.template.aggregate({
      where: { userId },
      _sum: {
        downloads: true,
      },
    });
    const totalDownloads = downloadsResult._sum.downloads || 0;

    // Get the number of templates with at least one download (active templates)
    const activeTemplates = await prisma.template.count({
      where: {
        userId,
        downloads: { gt: 0 },
      },
    });

    // Calculate the average success rate
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

    return NextResponse.json({
      totalTemplates,
      totalDownloads,
      activeTemplates,
      avgSuccessRate,
    });
  } catch (error) {
    console.error("Error fetching template stats:", error);
    return NextResponse.json(
      { error: "Error fetching template stats" },
      { status: 500 }
    );
  }
}
