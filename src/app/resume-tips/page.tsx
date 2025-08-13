// src/app/resume-tips/page.tsx
"use client";
import React from "react";
import { ArrowLeft, Check, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ResumeTipsPage() {
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
            Resume Writing Tips
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl">
            Even with AI assistance, understanding resume best practices helps
            you create the most effective document. Here are our expert tips to
            maximize your resume&#39;s impact.
          </p>

          <div className="space-y-16">
            <section>
              <h2 className="text-2xl font-bold mb-6">
                Structure and Formatting
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-green-50 border-l-4 border-green-400 p-6">
                  <h3 className="flex items-center text-lg font-medium text-green-800 mb-4">
                    <Check className="mr-2 h-5 w-5" />
                    Best Practices
                  </h3>
                  <ul className="space-y-3 text-green-800">
                    <li className="flex">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        Use consistent formatting throughout the document
                      </span>
                    </li>
                    <li className="flex">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        Maintain clean alignment and appropriate spacing
                      </span>
                    </li>
                    <li className="flex">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        Use standard, readable fonts (Arial, Helvetica, Calibri)
                      </span>
                    </li>
                    <li className="flex">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        Implement strategic bold and italics for emphasis
                      </span>
                    </li>
                    <li className="flex">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>Use bullet points for improved readability</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 border-l-4 border-red-400 p-6">
                  <h3 className="flex items-center text-lg font-medium text-red-800 mb-4">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Common Mistakes
                  </h3>
                  <ul className="space-y-3 text-red-800">
                    <li className="flex">
                      <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>Excessive or distracting graphic elements</span>
                    </li>
                    <li className="flex">
                      <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        Using multiple font types or sizes inconsistently
                      </span>
                    </li>
                    <li className="flex">
                      <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>Dense, unbroken paragraphs of text</span>
                    </li>
                    <li className="flex">
                      <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        Non-standard formatting that confuses ATS systems
                      </span>
                    </li>
                    <li className="flex">
                      <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>Improper or inconsistent margin spacing</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6">Content and Language</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-green-50 border-l-4 border-green-400 p-6">
                  <h3 className="flex items-center text-lg font-medium text-green-800 mb-4">
                    <Check className="mr-2 h-5 w-5" />
                    Best Practices
                  </h3>
                  <ul className="space-y-3 text-green-800">
                    <li className="flex">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        Use action verbs to begin bullet points (Achieved,
                        Implemented, Led)
                      </span>
                    </li>
                    <li className="flex">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        Quantify achievements with specific metrics and
                        percentages
                      </span>
                    </li>
                    <li className="flex">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        Tailor content to match the job description&#39;s
                        keywords
                      </span>
                    </li>
                    <li className="flex">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        Focus on achievements rather than responsibilities
                      </span>
                    </li>
                    <li className="flex">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        Use industry-specific terminology appropriately
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 border-l-4 border-red-400 p-6">
                  <h3 className="flex items-center text-lg font-medium text-red-800 mb-4">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Common Mistakes
                  </h3>
                  <ul className="space-y-3 text-red-800">
                    <li className="flex">
                      <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        Using generic descriptions lacking specific details
                      </span>
                    </li>
                    <li className="flex">
                      <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>Including irrelevant personal information</span>
                    </li>
                    <li className="flex">
                      <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        Writing in first person (using &quot;I&quot; or
                        &quot;my&quot;)
                      </span>
                    </li>
                    <li className="flex">
                      <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>Including outdated or irrelevant experiences</span>
                    </li>
                    <li className="flex">
                      <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>Using clichés or buzzwords without substance</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6">ATS Optimization</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-green-50 border-l-4 border-green-400 p-6">
                  <h3 className="flex items-center text-lg font-medium text-green-800 mb-4">
                    <Check className="mr-2 h-5 w-5" />
                    Best Practices
                  </h3>
                  <ul className="space-y-3 text-green-800">
                    <li className="flex">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        Use standard section headings (Experience, Education,
                        Skills)
                      </span>
                    </li>
                    <li className="flex">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        Include relevant keywords from the job description
                      </span>
                    </li>
                    <li className="flex">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        Use both spelled-out terms and acronyms (Certified
                        Public Accountant, CPA)
                      </span>
                    </li>
                    <li className="flex">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>Save file as a simple .docx or .pdf format</span>
                    </li>
                    <li className="flex">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        Place key information in the body, not headers or
                        footers
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 border-l-4 border-red-400 p-6">
                  <h3 className="flex items-center text-lg font-medium text-red-800 mb-4">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Common Mistakes
                  </h3>
                  <ul className="space-y-3 text-red-800">
                    <li className="flex">
                      <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        Using tables, text boxes, or complex formatting
                      </span>
                    </li>
                    <li className="flex">
                      <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>Including images, charts, or graphics</span>
                    </li>
                    <li className="flex">
                      <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>Using non-standard fonts or symbols</span>
                    </li>
                    <li className="flex">
                      <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>Submitting in non-standard file formats</span>
                    </li>
                    <li className="flex">
                      <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>Keyword stuffing (excessive repetition)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6">Length and Relevance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-green-50 border-l-4 border-green-400 p-6">
                  <h3 className="flex items-center text-lg font-medium text-green-800 mb-4">
                    <Check className="mr-2 h-5 w-5" />
                    Best Practices
                  </h3>
                  <ul className="space-y-3 text-green-800">
                    <li className="flex">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>Keep to 1-2 pages for most positions</span>
                    </li>
                    <li className="flex">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>Place most relevant experience at the top</span>
                    </li>
                    <li className="flex">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>Customize content for each application</span>
                    </li>
                    <li className="flex">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        Include only the most relevant jobs from past 10-15
                        years
                      </span>
                    </li>
                    <li className="flex">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        Focus on transferable skills for career changes
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 border-l-4 border-red-400 p-6">
                  <h3 className="flex items-center text-lg font-medium text-red-800 mb-4">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Common Mistakes
                  </h3>
                  <ul className="space-y-3 text-red-800">
                    <li className="flex">
                      <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>Including every job you&#39;ve ever held</span>
                    </li>
                    <li className="flex">
                      <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        Using a one-size-fits-all resume for all applications
                      </span>
                    </li>
                    <li className="flex">
                      <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        Providing excessive detail for irrelevant experiences
                      </span>
                    </li>
                    <li className="flex">
                      <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        Listing responsibilities without context or impact
                      </span>
                    </li>
                    <li className="flex">
                      <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        Including hobbies or interests unrelated to the position
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <div className="bg-gray-50 p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">
                Ready to Create Your Resume?
              </h2>
              <p className="text-lg mb-6">
                Apply these expert tips with the help of our AI-powered resume
                builder for the best results. Our system incorporates these best
                practices automatically while allowing you to maintain control
                over your personal branding.
              </p>
              <button
                onClick={() => router.push("/resume/create")}
                className="px-8 py-3 bg-black text-white hover:bg-gray-900 transition-all duration-300"
              >
                Create Your Resume Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
