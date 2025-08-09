// src/app/settings/page.tsx
"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Here you would update user settings via your API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      setMessage("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="pt-16 md:pt-20 px-4 pb-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Account Settings
        </h1>

        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded ${
              message.includes("Failed")
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-green-50 border border-green-200 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Profile Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    defaultValue={user?.fullName || ""}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    defaultValue={user?.primaryEmailAddress?.emailAddress || ""}
                    disabled
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Email changes must be verified. Contact support for
                    assistance.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={isSaving}>
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>

          <div className="border-t border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Notification Preferences
            </h2>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  id="emailNotifications"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  defaultChecked
                />
                <label
                  htmlFor="emailNotifications"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Email notifications
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="marketingEmails"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label
                  htmlFor="marketingEmails"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Marketing emails
                </label>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 p-6">
            <h2 className="text-lg font-medium text-red-600 mb-4">
              Danger Zone
            </h2>

            <p className="text-sm text-gray-500 mb-4">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>

            <Button
              variant="destructive"
              onClick={() =>
                confirm(
                  "Are you sure you want to delete your account? This action cannot be undone."
                )
              }
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
