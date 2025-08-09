// src/app/about/page.tsx
"use client";
import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AboutPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-8">
            About ResumeAI
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-600 mb-8">
              ResumeAI was founded with a singular mission: to democratize
              career opportunities by using artificial intelligence to help job
              seekers present their best professional selves.
            </p>

            <h2 className="text-2xl font-semibold mt-12 mb-4">Our Story</h2>
            <p>
              Founded in 2022 by a team of AI researchers and career development
              experts, ResumeAI emerged from a simple observation: the job
              application process was fundamentally broken. Qualified candidates
              were being filtered out by automated systems, while others
              struggled to effectively communicate their value to potential
              employers.
            </p>
            <p>
              We built our platform to level the playing field, ensuring that
              every professional has access to the tools needed to craft
              compelling, ATS-optimized resumes that showcase their unique
              qualifications.
            </p>

            <h2 className="text-2xl font-semibold mt-12 mb-4">
              Our Technology
            </h2>
            <p>
              At the core of ResumeAI is our proprietary machine learning
              algorithm that analyzes thousands of successful resumes and job
              descriptions to identify patterns that lead to interview
              invitations. Our system doesn&rsquo;t just fill in templates—it
              thoughtfully restructures your professional experience to align
              with employer expectations and industry standards.
            </p>
            <p>
              Unlike other tools, our AI is trained to maintain your authentic
              voice while optimizing content for both automated screening
              systems and human recruiters. The result is a resume that feels
              genuinely yours, but strategically enhanced.
            </p>

            <h2 className="text-2xl font-semibold mt-12 mb-4">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div>
                <h3 className="text-xl font-medium mb-2">Accessibility</h3>
                <p>
                  We believe career advancement tools should be available to
                  everyone, regardless of background or resources.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Integrity</h3>
                <p>
                  We present your qualifications in the best light while
                  maintaining complete truthfulness.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Innovation</h3>
                <p>
                  We continuously refine our algorithms to stay ahead of
                  evolving recruitment practices.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Privacy</h3>
                <p>
                  Your data is yours. We maintain strict confidentiality and
                  security standards.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mt-12 mb-4">Our Team</h2>
            <p>
              ResumeAI brings together experts from machine learning, natural
              language processing, HR, and career counseling. Our diverse team
              is united by a passion for creating technology that makes a
              meaningful difference in people&apos;s professional journeys.
            </p>

            <div className="mt-12">
              <Link href="/contact">
                <button className="px-8 py-3 bg-black text-white hover:bg-gray-900 transition-all duration-300">
                  Contact Us
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
