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
  UserCircle, // Changed from Settings to UserCircle for profile
} from "lucide-react";

const RecruiterNavbar: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path
      ? "bg-primary-100 text-primary-600"
      : "hover:bg-gray-100";
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                href="/recruiter"
                className="font-bold text-xl text-primary-600"
              >
                RecruiterHub
              </Link>
            </div>
            <nav className="ml-8 flex space-x-4">
              <Link
                href="/recruiter"
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive(
                  "/recruiter"
                )}`}
              >
                <Home className="mr-2 h-5 w-5" />
                Dashboard
              </Link>

              <Link
                href="/recruiter/templates"
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive(
                  "/recruiter/templates"
                )}`}
              >
                <FileText className="mr-2 h-5 w-5" />
                My Templates
              </Link>

              <Link
                href="/recruiter/upload"
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive(
                  "/recruiter/upload"
                )}`}
              >
                <FileUp className="mr-2 h-5 w-5" />
                Upload Template
              </Link>

              <Link
                href="/recruiter/analytics"
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive(
                  "/recruiter/analytics"
                )}`}
              >
                <BarChart2 className="mr-2 h-5 w-5" />
                Analytics
              </Link>

              <Link
                href="/recruiter/bulk-upload"
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive(
                  "/recruiter/bulk-upload"
                )}`}
              >
                <Database className="mr-2 h-5 w-5" />
                Bulk Upload
              </Link>
            </nav>
          </div>

          <div className="flex items-center">
            {/* Change from /settings to /profile or remove completely */}
            <Link
              href="/profile"
              className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <UserCircle className="h-5 w-5" />
            </Link>

            {/* The RC logo was already commented out, so it's fine */}
            <div className="ml-4 relative">
              {/* User avatar or profile component would go here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterNavbar;
