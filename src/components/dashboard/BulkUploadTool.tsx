// src/app/recruiter/bulk-upload/page.tsx

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";
import RecruiterNavbar from "@/components/navigation/RecruiterNavbar";

export default function BulkUploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [csvTemplate, setCsvTemplate] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...fileArray]);
    }
  };

  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvTemplate(e.target.files[0]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) return;

    setIsUploading(true);

    // Simulate upload progress
    const totalFiles = files.length;
    let completed = 0;

    const uploadInterval = setInterval(() => {
      completed += 1;
      setUploadedCount(completed);
      setUploadProgress(Math.round((completed / totalFiles) * 100));

      if (completed >= totalFiles) {
        clearInterval(uploadInterval);
        setIsUploading(false);
        setUploadSuccess(true);
      }
    }, 500);

    // In a real implementation, you would have API calls here
  };

  return (
    <>
      <RecruiterNavbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/recruiter"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-6"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Bulk Upload Resume Templates
        </h1>

        {uploadSuccess ? (
          <div className="bg-white shadow rounded-lg border border-gray-200 p-8">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Upload Complete!
              </h3>
              <p className="text-gray-600 mb-6 text-center">
                Successfully uploaded {uploadedCount} resume templates. They are
                now available in your template library.
              </p>

              <div className="flex gap-4">
                <Link
                  href="/recruiter/templates"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  View Templates
                </Link>
                <Link
                  href="/recruiter/bulk-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Upload More
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Upload Multiple Templates
              </h2>
              <p className="text-gray-600">
                Upload multiple resume templates at once. For best results,
                include a CSV file with metadata.
              </p>
            </div>

            <form onSubmit={handleBulkUpload} className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Step 1: Download the CSV template (optional)
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Use our CSV template to specify details for each resume
                    template.
                  </p>
                  <Link
                    href="/assets/bulk-upload-template.csv"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Download CSV Template
                  </Link>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Step 2: Upload your filled CSV template (optional)
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    If you've filled out the CSV template, upload it here.
                  </p>

                  <div className="flex items-center mt-2">
                    <div className="flex-grow max-w-md">
                      <label className="block text-sm font-medium text-gray-700 sr-only">
                        CSV File
                      </label>
                      <div className="mt-1 flex items-center">
                        <span className="inline-block h-12 w-12 rounded-md overflow-hidden bg-gray-100 mr-3">
                          {csvTemplate ? (
                            <File className="h-full w-full text-gray-500 p-2" />
                          ) : (
                            <Upload className="h-full w-full text-gray-300 p-2" />
                          )}
                        </span>
                        <div className="flex-grow">
                          <label
                            htmlFor="csv-upload"
                            className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500"
                          >
                            <span>Upload a CSV file</span>
                            <input
                              id="csv-upload"
                              name="csv-upload"
                              type="file"
                              accept=".csv"
                              className="sr-only"
                              onChange={handleCsvChange}
                              disabled={isUploading}
                            />
                          </label>
                          <p className="text-xs text-gray-500">
                            CSV up to 10MB
                          </p>
                        </div>
                      </div>
                    </div>

                    {csvTemplate && (
                      <div className="ml-4 flex items-center text-sm text-gray-500">
                        <span className="truncate max-w-xs">
                          {csvTemplate.name}
                        </span>
                        <button
                          type="button"
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          onClick={() => setCsvTemplate(null)}
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Step 3: Upload resume templates
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Upload your resume templates in PDF, DOCX, or JSON format.
                  </p>

                  <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500"
                        >
                          <span>Upload template files</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            multiple
                            accept=".pdf,.docx,.json"
                            onChange={handleFileChange}
                            disabled={isUploading}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOCX or JSON up to 10MB each
                      </p>
                    </div>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Selected files ({files.length})
                      </h4>
                      <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden max-h-60 overflow-y-auto">
                        {files.map((file, index) => (
                          <li
                            key={index}
                            className="px-4 py-3 flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center">
                              <File className="h-5 w-5 text-gray-400 mr-2" />
                              <span className="truncate max-w-md">
                                {file.name}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">
                                {(file.size / 1024).toFixed(1)} KB
                              </span>
                            </div>
                            <button
                              type="button"
                              className="ml-2 text-gray-400 hover:text-gray-600"
                              onClick={() => handleRemoveFile(index)}
                              disabled={isUploading}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {isUploading && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Uploading ({uploadedCount}/{files.length})
                    </h4>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-primary-600 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 text-right">
                      {uploadProgress}% Complete
                    </p>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    disabled={files.length === 0 || isUploading}
                  >
                    {isUploading ? "Uploading..." : "Upload Templates"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
