// src/app/privacy-policy/page.tsx
"use client";
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="fixed top-6 left-6 z-50">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      <div className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Privacy Policy
          </h1>
          <p className="text-gray-500 mb-12">Last updated: August 1, 2025</p>

          <div className="prose prose-lg max-w-none">
            <p>
              At ResumeAI, we take your privacy seriously. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you visit our website and use our resume creation
              services.
            </p>

            <h2 className="text-2xl font-semibold mt-12 mb-4">
              Information We Collect
            </h2>

            <h3 className="text-xl font-medium mt-8 mb-3">
              Personal Information
            </h3>
            <p>
              We may collect personal information that you voluntarily provide
              to us when you:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Create an account</li>
              <li>Generate or edit a resume</li>
              <li>Fill out a form</li>
              <li>Subscribe to our newsletter</li>
              <li>Request customer support</li>
            </ul>
            <p>
              This information may include your name, email address, phone
              number, employment history, education background, skills, and
              other resume-related content.
            </p>

            <h3 className="text-xl font-medium mt-8 mb-3">Usage Information</h3>
            <p>
              We automatically collect certain information about your device and
              how you interact with our website, including:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>IP address</li>
              <li>Browser type</li>
              <li>Operating system</li>
              <li>Pages visited and time spent</li>
              <li>Referring website addresses</li>
              <li>General geographic location based on IP address</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-12 mb-4">
              How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mb-6">
              <li>Provide, maintain, and improve our services</li>
              <li>Generate resumes based on your inputs</li>
              <li>Process payments</li>
              <li>Send administrative information</li>
              <li>Respond to inquiries and offer support</li>
              <li>
                Send marketing and promotional communications (with your
                consent)
              </li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Enhance the security of our services</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-12 mb-4">
              AI Training and Data Usage
            </h2>
            <p>
              ResumeAI uses machine learning algorithms to improve our resume
              generation capabilities. By default, we do not use your personal
              resume content to train our AI models. However, we may use
              anonymized, aggregated data patterns to improve our
              algorithms&#39; understanding of effective resume structures and
              formats.
            </p>
            <p>
              You can opt out of having your anonymized data used for service
              improvement by adjusting your privacy settings in your account
              dashboard.
            </p>

            <h2 className="text-2xl font-semibold mt-12 mb-4">
              Data Retention
            </h2>
            <p>
              We retain your personal information for as long as your account is
              active or as needed to provide you with our services. You can
              request deletion of your account and associated data at any time
              through your account settings or by contacting our support team.
            </p>

            <h2 className="text-2xl font-semibold mt-12 mb-4">Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding
              your personal information, including:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>
                Right to access the personal information we have about you
              </li>
              <li>Right to rectify inaccurate information</li>
              <li>Right to request deletion of your personal information</li>
              <li>
                Right to restrict or object to our processing of your
                information
              </li>
              <li>Right to data portability</li>
              <li>Right to withdraw consent</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-12 mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data
              practices, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> privacy@resumeai.com
              <br />
              {/* <strong>Address:</strong> 123 AI Boulevard, Suite 456, San
              Francisco, CA 94105 */}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
