"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";

export default function LuxuryNavbar() {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => pathname === path;

  // Don't show navbar on auth pages
  if (pathname.startsWith("/auth/") || pathname === "/onboarding") {
    return null;
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard", auth: true },
    { href: "/resume/create", label: "Create Resume", auth: true },
    { href: "/recruiter", label: "Recruiter Portal", auth: true },
  ];

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/10">
      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="group">
              <div className="text-2xl font-extralight tracking-wide group-hover:opacity-70 transition-opacity duration-300">
                <span className="font-bold">AI</span> Resume Builder
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              // Skip auth-required links for non-authenticated users
              if (link.auth && !isSignedIn) return null;

              return (
                <Link key={link.href} href={link.href}>
                  <span
                    className={`font-light transition-all duration-300 hover:text-gray-600 ${
                      isActive(link.href)
                        ? "text-black font-medium border-b-2 border-black pb-1"
                        : "text-black/70"
                    }`}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}

            {isLoaded && (
              <>
                {isSignedIn ? (
                  <div className="ml-6 flex items-center gap-4">
                    <Link href="/profile">
                      <span className="font-light text-black/70 hover:text-gray-600 transition-colors duration-300">
                        Profile
                      </span>
                    </Link>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                ) : (
                  <div className="flex items-center gap-4 ml-6">
                    <Link href="/auth/sign-in">
                      <span className="font-light text-black/70 hover:text-gray-600 transition-colors duration-300">
                        Sign In
                      </span>
                    </Link>
                    <Link href="/auth/sign-up">
                      <button className="px-6 py-2 bg-black text-white font-light hover:bg-gray-900 transition-all duration-300 transform hover:scale-105">
                        Sign Up
                      </button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-black/5 transition-colors duration-300"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-black/10">
          <div className="container mx-auto px-6 py-6">
            <nav className="flex flex-col space-y-6">
              {navLinks.map((link) => {
                // Skip auth-required links for non-authenticated users
                if (link.auth && !isSignedIn) return null;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span
                      className={`text-lg font-light transition-colors duration-300 ${
                        isActive(link.href)
                          ? "text-black font-medium"
                          : "text-black/70 hover:text-gray-600"
                      }`}
                    >
                      {link.label}
                    </span>
                  </Link>
                );
              })}

              {isLoaded && (
                <>
                  {isSignedIn ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="text-lg font-light text-black/70 hover:text-gray-600 transition-colors duration-300">
                          Profile
                        </span>
                      </Link>
                      <div className="pt-4 border-t border-black/10">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-light text-black/70">
                            Your Account
                          </span>
                          <UserButton afterSignOutUrl="/" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col gap-4 pt-4 border-t border-black/10">
                      <Link
                        href="/auth/sign-in"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <button className="w-full py-3 text-left font-light text-black/70 hover:text-gray-600 transition-colors duration-300">
                          Sign In
                        </button>
                      </Link>
                      <Link
                        href="/auth/sign-up"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <button className="w-full py-3 bg-black text-white font-light hover:bg-gray-900 transition-colors duration-300">
                          Sign Up
                        </button>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
