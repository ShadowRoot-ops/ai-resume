import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";
import type { Metadata } from "next";
import ToastProvider from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "AI Resume Builder",
  description:
    "Create professional, ATS-optimized resumes with our AI-powered platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en">
        <body className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <main className="flex-1 pt-16 md:pt-20">{children}</main>
          <ToastProvider />
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
