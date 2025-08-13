// src/components/navigation/RecruiterNavbar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileUp,
  BarChart2,
  FileText,
  Database,
  UserCircle,
  Search,
} from "lucide-react";

const RecruiterNavbar: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path
      ? "bg-primary-100 text-primary-600 border-primary-500"
      : "hover:bg-gray-100 text-gray-700 hover:text-gray-900";
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                href="/recruiter"
                className="font-bold text-xl text-primary-600 hover:text-primary-700"
              >
                RecruiterHub
              </Link>
            </div>

            <nav className="ml-8 flex space-x-1">
              <Link
                href="/recruiter"
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${isActive(
                  "/recruiter"
                )}`}
              >
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Link>

              <Link
                href="/recruiter/resume-match"
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${isActive(
                  "/recruiter/resume-match"
                )}`}
              >
                <Search className="mr-2 h-4 w-4" />
                Resume Match
              </Link>

              <Link
                href="/recruiter/templates"
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${isActive(
                  "/recruiter/templates"
                )}`}
              >
                <FileText className="mr-2 h-4 w-4" />
                My Templates
              </Link>

              <Link
                href="/recruiter/upload"
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${isActive(
                  "/recruiter/upload"
                )}`}
              >
                <FileUp className="mr-2 h-4 w-4" />
                Upload Template
              </Link>

              <Link
                href="/recruiter/analytics"
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${isActive(
                  "/recruiter/analytics"
                )}`}
              >
                <BarChart2 className="mr-2 h-4 w-4" />
                Analytics
              </Link>

              <Link
                href="/recruiter/bulk-upload"
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${isActive(
                  "/recruiter/bulk-upload"
                )}`}
              >
                <Database className="mr-2 h-4 w-4" />
                Bulk Upload
              </Link>
            </nav>
          </div>

          <div className="flex items-center">
            <Link
              href="/profile"
              className="ml-4 p-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
              title="Profile"
            >
              <UserCircle className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterNavbar;
