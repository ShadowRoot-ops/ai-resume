// src/app/terms/page.tsx
"use client";
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-gray-500 mb-12">Last updated: August 1, 2025</p>

          <div className="prose prose-lg max-w-none">
            <p>
              Welcome to ResumeAI. These Terms of Service (&quot;Terms&quot;)
              govern your use of our website and services offered by ResumeAI
              (&quot;Service&quot;). Please read these Terms carefully before
              using our Service.
            </p>
            <p>
              By accessing or using the Service, you agree to be bound by these
              Terms. If you disagree with any part of the terms, you may not
              access the Service.
            </p>

            <h2 className="text-2xl font-semibold mt-12 mb-4">
              1. Account Registration
            </h2>
            <p>
              To use certain features of the Service, you must register for an
              account. You agree to provide accurate, current, and complete
              information during the registration process and to update such
              information to keep it accurate, current, and complete.
            </p>
            <p>
              You are responsible for safeguarding your password and for all
              activities that occur under your account. You agree to notify us
              immediately of any unauthorized use of your account.
            </p>

            <h2 className="text-2xl font-semibold mt-12 mb-4">
              2. Subscription and Billing
            </h2>
            <p>
              Some aspects of the Service require payment of fees. You shall pay
              all applicable fees as described on the website in connection with
              the Services selected by you. We may change our fees at any time
              by posting the changes on the Service or by notifying you
              directly.
            </p>
            <p>
              You authorize us to charge the credit card or other payment method
              you provide to us for all applicable fees. If your payment
              information is not accurate or no longer valid, your access to
              paid features may be suspended or terminated.
            </p>
            <p>
              You may cancel your subscription at any time by accessing your
              account settings. Refunds are provided in accordance with our
              Refund Policy.
            </p>

            <h2 className="text-2xl font-semibold mt-12 mb-4">
              3. User Content
            </h2>
            <p>
              Our Service allows you to create resumes and related materials
              (&quot;User Content&quot;). You retain all rights in, and are
              solely responsible for, the User Content you create using our
              Service.
            </p>
            <p>
              By creating User Content with our Service, you grant us a
              worldwide, non-exclusive, royalty-free license to use, reproduce,
              modify, and display your User Content solely for the purpose of
              providing the Service to you and improving our algorithms, unless
              you opt out of anonymous data collection in your account settings.
            </p>
            <p>You represent and warrant that:</p>
            <ul className="list-disc pl-6 mb-6">
              <li>You own or have the necessary rights to your User Content</li>
              <li>
                Your User Content does not violate the privacy rights, publicity
                rights, intellectual property rights, or other rights of any
                person
              </li>
              <li>Your User Content is truthful and accurate</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-12 mb-4">
              4. Intellectual Property
            </h2>
            <p>
              The Service and its original content (excluding User Content),
              features, and functionality are and will remain the exclusive
              property of ResumeAI and its licensors. The Service is protected
              by copyright, trademark, and other laws.
            </p>
            <p>
              Our trademarks and trade dress may not be used in connection with
              any product or service without the prior written consent of
              ResumeAI.
            </p>

            <h2 className="text-2xl font-semibold mt-12 mb-4">
              5. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, in no event
              shall ResumeAI be liable for any indirect, punitive, incidental,
              special, consequential damages, or any damages whatsoever
              including, without limitation, damages for loss of use, data, or
              profits, arising out of or in any way connected with the use or
              performance of the Service.
            </p>

            <h2 className="text-2xl font-semibold mt-12 mb-4">
              6. Termination
            </h2>
            <p>
              We may terminate or suspend your account and access to the Service
              immediately, without prior notice or liability, for any reason,
              including without limitation if you breach the Terms.
            </p>
            <p>
              Upon termination, your right to use the Service will immediately
              cease. If you wish to terminate your account, you may simply
              discontinue using the Service or contact us to delete your
              account.
            </p>

            <h2 className="text-2xl font-semibold mt-12 mb-4">
              7. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of the State of California, without regard to its
              conflict of law provisions.
            </p>

            <h2 className="text-2xl font-semibold mt-12 mb-4">
              8. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify or replace these Terms at any time.
              We will provide notice of any significant changes by posting the
              new Terms on this page and/or sending you an email.
            </p>
            <p>
              Your continued use of the Service after any such changes
              constitutes your acceptance of the new Terms.
            </p>

            <h2 className="text-2xl font-semibold mt-12 mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at
              legal@resumeai.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
