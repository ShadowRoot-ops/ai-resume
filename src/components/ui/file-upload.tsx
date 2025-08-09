// src/components/ui/file-upload.tsx
"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Cloud, FileIcon, Loader2, X } from "lucide-react";

interface FileUploadProps {
  onUpload: (file: File) => void;
  accept?: string;
  maxSize?: number;
  isLoading?: boolean;
  helpText?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  accept = ".pdf,.doc,.docx,.txt",
  maxSize = 5 * 1024 * 1024, // 5MB
  isLoading = false,
  helpText = "Upload PDF, Word, or TXT files (max 5MB)",
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      if (acceptedFiles.length === 0) {
        return;
      }

      const selectedFile = acceptedFiles[0];

      if (selectedFile.size > maxSize) {
        setError(
          `File is too large. Max size is ${maxSize / (1024 * 1024)}MB.`
        );
        return;
      }

      setFile(selectedFile);
    },
    [maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(",").reduce((obj, ext) => {
      // Convert file extensions to mime types for react-dropzone
      if (ext === ".pdf") obj["application/pdf"] = [];
      else if (ext === ".doc") obj["application/msword"] = [];
      else if (ext === ".docx")
        obj[
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ] = [];
      else if (ext === ".txt") obj["text/plain"] = [];
      else obj[ext] = [];
      return obj;
    }, {} as Record<string, string[]>),
    maxFiles: 1,
  });

  const handleUpload = () => {
    if (file) {
      onUpload(file);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setError(null);
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-primary hover:bg-gray-50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          {file ? (
            <>
              <div className="flex items-center space-x-2">
                <FileIcon className="h-8 w-8 text-blue-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                >
                  <X size={16} />
                </Button>
              </div>
            </>
          ) : (
            <>
              <Cloud className="h-10 w-10 text-gray-400" />
              <p className="text-sm font-medium">
                Drag & drop your resume here or click to browse
              </p>
              <p className="text-xs text-gray-500">{helpText}</p>
            </>
          )}
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {file && (
        <Button
          type="button"
          className="mt-4 w-full"
          onClick={handleUpload}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Upload and Analyze"
          )}
        </Button>
      )}
    </div>
  );
};
