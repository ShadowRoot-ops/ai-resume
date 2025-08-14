// src/app/features/page.tsx
"use client";
import React from "react";
import {
  ArrowLeft,
  Zap,
  Shield,
  Target,
  FileText,
  BarChart3,
  Sparkles,
  Award,
  Layers,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function FeaturesPage() {
  const router = useRouter();

  const features = [
    {
      icon: Target,
      title: "Job-Specific Targeting",
      description:
        "Our AI analyzes job descriptions to identify key requirements and tailor your resume to highlight relevant qualifications, substantially increasing your chances of getting past the initial screening.",
    },
    {
      icon: Shield,
      title: "ATS Optimization",
      description:
        "We ensure your resume passes through Applicant Tracking Systems with industry-leading compatibility algorithms that optimize keyword placement while maintaining readability.",
    },
    {
      icon: Zap,
      title: "Lightning Fast Creation",
      description:
        "Generate a professionally formatted, ATS-optimized resume in less than 60 seconds. Our system handles the heavy lifting so you can focus on your job search.",
    },
    {
      icon: FileText,
      title: "Premium Templates",
      description:
        "Choose from dozens of HR-approved, field-tested templates designed for specific industries and career levels, from entry-level to executive.",
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description:
        "Track how your resume performs with detailed metrics on views, downloads, and estimated pass rates for various ATS systems.",
    },
    {
      icon: Sparkles,
      title: "Content Enhancement",
      description:
        "Our AI suggests powerful phrasing, action verbs, and accomplishment-focused bullets that elevate your professional narrative beyond generic descriptions.",
    },
    {
      icon: Award,
      title: "Expert Validation",
      description:
        "Every template and algorithm is developed in collaboration with hiring managers and recruiters from Fortune 500 companies to ensure real-world effectiveness.",
    },
    {
      icon: Layers,
      title: "Version Control",
      description:
        "Create and save multiple versions of your resume tailored for different positions or industries, and track changes over time.",
    },
    {
      icon: Users,
      title: "Recruiter Insights",
      description:
        "Gain access to industry-specific insights about what recruiters look for in top candidates, with tailored recommendations for your profile.",
    },
  ];

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

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-5xl font-bold mb-6">Powerful Features</h1>
            <p className="text-xl text-gray-600">
              Our AI-powered resume builder combines cutting-edge technology
              with expert career insights to give you a competitive edge in your
              job search.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-lg transition-all duration-300 hover:border-black"
                >
                  <div className="bg-black/5 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-black" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to experience these features?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-xl mx-auto">
              <button
                onClick={() => router.push("/resume/create")}
                className="px-8 py-4 bg-black text-white hover:bg-gray-900 transition-all duration-300 text-lg font-medium"
              >
                Create Your Resume
              </button>
              <button
                onClick={() => router.push("/pricing")}
                className="px-8 py-4 border border-black text-black hover:bg-black hover:text-white transition-all duration-300 text-lg font-medium"
              >
                View Pricing Plans
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Detail Sections */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  AI-Powered Resume Analysis
                </h2>
                <p className="text-lg text-gray-600 mb-4">
                  Our advanced machine learning algorithms analyze thousands of
                  successful resumes to identify patterns that get candidates
                  hired.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="bg-black rounded-full p-1 mt-1.5 mr-3">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span>
                      Keyword optimization for specific job descriptions
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-black rounded-full p-1 mt-1.5 mr-3">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span>Content gap analysis against top performers</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-black rounded-full p-1 mt-1.5 mr-3">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span>Industry-specific terminology suggestions</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <div className="aspect-[4/3] bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                  {/* Placeholder for feature image/illustration */}
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <BarChart3 className="h-16 w-16 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <div className="aspect-[4/3] bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                  {/* Placeholder for feature image/illustration */}
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Shield className="h-16 w-16 text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <h2 className="text-3xl font-bold mb-6">
                  ATS Fortress Technology
                </h2>
                <p className="text-lg text-gray-600 mb-4">
                  Our proprietary ATS Fortress technology ensures your resume
                  sails through applicant tracking systems that might otherwise
                  filter out qualified candidates.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="bg-black rounded-full p-1 mt-1.5 mr-3">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span>Compatible with all major ATS platforms</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-black rounded-full p-1 mt-1.5 mr-3">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span>
                      Strategic keyword placement without sacrificing
                      readability
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-black rounded-full p-1 mt-1.5 mr-3">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span>
                      Clear, parsable formatting that preserves your design
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Experience the ResumeAI Advantage
            </h2>
            <p className="text-xl mb-8">
              Join thousands of professionals who have accelerated their careers
              with our AI-powered resume platform.
            </p>
            <button
              onClick={() => router.push("/resume/create")}
              className="px-8 py-4 bg-white text-black hover:bg-gray-100 transition-all duration-300 text-lg font-medium"
            >
              Create Your Resume Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Add Check icon with proper TypeScript typing
interface CheckProps {
  className?: string;
}

const Check: React.FC<CheckProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
