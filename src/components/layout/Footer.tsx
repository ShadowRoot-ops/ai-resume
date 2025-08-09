"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LuxuryFooter() {
  const pathname = usePathname();

  // Don't show footer on auth pages
  if (pathname.startsWith("/auth/") || pathname === "/onboarding") {
    return null;
  }

  const footerSections = [
    {
      title: "Product",
      links: [
        { href: "/features", label: "Features" },
        { href: "/pricing", label: "Pricing" },
        { href: "/recruiter", label: "For Recruiters" },
      ],
    },
    {
      title: "Resources",
      links: [
        // { href: "/blog", label: "Blog" },
        { href: "/resume-tips", label: "Resume Tips" },
        { href: "/faq", label: "FAQ" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/terms", label: "Terms of Service" },
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/cookies", label: "Cookie Policy" },
      ],
    },
  ];

  const socialLinks = [
    {
      href: "#",
      label: "Facebook",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
    },
    {
      href: "#",
      label: "Instagram",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
    },
    {
      href: "#",
      label: "LinkedIn",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link href="/" className="inline-block mb-6">
                <div className="text-2xl font-extralight tracking-wide">
                  <span className="font-bold">AI</span> Resume Builder
                </div>
              </Link>
              <p className="text-white/70 font-light leading-relaxed max-w-md">
                Elevate your career with AI-powered resumes that speak the
                language of both machines and humans. Every word optimized,
                every format perfected.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-6 mt-8">
                {socialLinks.map((social, index) => (
                  <Link
                    key={index}
                    href={social.href}
                    className="text-white/60 hover:text-white transition-colors duration-300 transform hover:scale-110"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section, index) => (
              <div key={index}>
                <h3 className="text-sm font-medium uppercase tracking-wider text-white/90 mb-6">
                  {section.title}
                </h3>
                <ul className="space-y-4">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="text-white/70 font-light hover:text-white transition-colors duration-300"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-white/10 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm font-light text-white/60">
              © {new Date().getFullYear()} AI Resume Builder. All rights
              reserved.
            </p>

            {/* Additional Links */}
            <div className="flex items-center gap-8">
              <Link
                href="/contact"
                className="text-sm font-light text-white/60 hover:text-white transition-colors duration-300"
              >
                Contact Us
              </Link>
              <Link
                href="/support"
                className="text-sm font-light text-white/60 hover:text-white transition-colors duration-300"
              >
                Support
              </Link>
              <Link
                href="/careers"
                className="text-sm font-light text-white/60 hover:text-white transition-colors duration-300"
              >
                Careers
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Element */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    </footer>
  );
}
