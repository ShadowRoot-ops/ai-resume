// src/app/api/templates/recent/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // Generate sample recent templates
  const recentTemplates = [
    {
      id: '1',
      companyName: 'Google',
      jobTitle: 'Software Engineer',
      industry: 'Technology',
      downloads: 156,
      views: 543,
      createdAt: '2023-06-15T12:00:00Z',
      updatedAt: '2023-07-20T15:30:00Z'
    },
    {
      id: '2',
      companyName: 'Microsoft',
      jobTitle: 'Product Manager',
      industry: 'Technology',
      downloads: 98,
      views: 312,
      createdAt: '2023-05-22T09:15:00Z',
      updatedAt: '2023-07-18T11:45:00Z'
    },
    {
      id: '3',
      companyName: 'Amazon',
      jobTitle: 'Data Scientist',
      industry: 'Technology',
      downloads: 89,
      views: 278,
      createdAt: '2023-06-30T14:20:00Z',
      updatedAt: '2023-07-15T10:10:00Z'
    }
  ];

  return NextResponse.json(recentTemplates);
}