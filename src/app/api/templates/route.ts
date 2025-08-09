// src/app/api/templates/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/user-helpers";

export async function GET(request: Request) {
  try {
    // Get user authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await getOrCreateUser(userId);

    // Get templates from the database
    const templates = await prisma.resumeTemplate.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format response data
    const formattedTemplates = templates.map((template) => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      company: template.company,
      isPremium: template.isPremium,
      thumbnailUrl: template.thumbnailUrl,
    }));

    return NextResponse.json(formattedTemplates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
