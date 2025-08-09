// src/app/api/dashboard/stats/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // Generate random stats for demo purposes
  const stats = {
    totalTemplates: Math.floor(Math.random() * 10) + 8,
    totalDownloads: Math.floor(Math.random() * 200) + 400,
    activeTemplates: Math.floor(Math.random() * 5) + 5,
    avgSuccessRate: Math.floor(Math.random() * 15) + 70,
  };

  return NextResponse.json(stats);
}
