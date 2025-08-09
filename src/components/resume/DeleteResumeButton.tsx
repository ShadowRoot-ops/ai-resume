// src/components/resume/DeleteResumeButton.tsx
"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

interface DeleteResumeButtonProps {
  resumeId: string;
  resumeTitle: string;
}

const DeleteResumeButton: React.FC<DeleteResumeButtonProps> = ({
  resumeId,
  resumeTitle,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Add more logging to debug the issue
      console.log(`Attempting to delete resume with ID: ${resumeId}`);

      const response = await fetch(`/api/resumes/${resumeId}/delete`, {
        method: "DELETE",
      });

      const data = await response.json();

      console.log("Delete response:", {
        status: response.status,
        ok: response.ok,
        data,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to delete resume: ${data.error || "Unknown error"}`
        );
      }

      // Show success message
      alert("Resume deleted successfully!");

      // Refresh the page to update the list
      router.refresh();
    } catch (error) {
      console.error("Error deleting resume:", error);
      alert(
        `Failed to delete resume: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-red-500"
          onClick={(e) => e.stopPropagation()} // Prevent clicking the parent card
        >
          <Trash2 size={18} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Resume</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{resumeTitle}&quot;? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isDeleting ? (
              <>
                <span className="animate-spin mr-2">⊚</span>
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteResumeButton;
