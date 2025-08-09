"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Zap,
  Target,
  Shield,
  Clock,
  FileText,
  BarChart3,
  Users,
  Award,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";

export default function LuxuryLandingPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);
  const [particles, setParticles] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEmailTooltip, setShowEmailTooltip] = useState(false);
  const [email, setEmail] = useState("");

  // Handle loading animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Rotate through stats
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Generate background particles
  useEffect(() => {
    const generateParticles = () => {
      return [...Array(40)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1 + Math.random() * 3,
        animationDelay: Math.random() * 5,
        animationDuration: 3 + Math.random() * 7,
        opacity: 0.1 + Math.random() * 0.2,
      }));
    };
    setParticles(generateParticles());
  }, []);

  // Email subscription handler
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setShowEmailTooltip(true);
      setTimeout(() => {
        setShowEmailTooltip(false);
        setEmail("");
      }, 3000);
    }
  };

  // Navigation handlers
  const handleStartFreeTrial = () => {
    router.push("/dashboard");
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleTryNow = () => {
    router.push("/dashboard");
  };

  const handleBasicPlan = () => {
    router.push("/dashboard");
  };

  const handleProPlan = () => {
    router.push("/dashboard");
  };

  const handleEnterprisePlan = () => {
    router.push("/contact");
  };

  const handleCreateFreeResume = () => {
    router.push("/resume/create");
  };

  const stats = [
    { icon: Users, value: "80,000+", label: "Resumes Generated" },
    { icon: BarChart3, value: "97%", label: "Success Rate" },
    { icon: Clock, value: "15 sec", label: "Average Generation Time" },
    { icon: Award, value: "99.5%", label: "ATS Compatibility" },
  ];

  const features = [
    {
      icon: Target,
      title: "Precision Targeting",
      description:
        "Our AI analyzes job descriptions with surgical precision, identifying key requirements and matching your experience perfectly.",
    },
    {
      icon: Shield,
      title: "ATS Fortress",
      description:
        "Break through Applicant Tracking Systems with resumes engineered to pass automated screening with flying colors.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Generate professional, tailored resumes in seconds, not hours. Your time is valuable, and we respect that.",
    },
    {
      icon: FileText,
      title: "Executive Quality",
      description:
        "Every resume meets C-suite standards with impeccable formatting, professional language, and strategic positioning.",
    },
  ];

  return (
    <div
      className={`min-h-screen bg-white text-black transition-all duration-1000 ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Loading Overlay */}
      <div
        className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-all duration-1000 ${
          isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-white text-xl font-light tracking-wider">
            CRAFTING EXCELLENCE
          </div>
        </div>
      </div>

      {/* Back Button */}
      {/* <div className="fixed top-6 left-6 z-50">
        <button
          onClick={handleGoBack}
          className="flex items-center text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div> */}

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                backgroundColor: "black",
                opacity: particle.opacity,
                animation: `pulse ${particle.animationDuration}s infinite alternate ${particle.animationDelay}s`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-6 text-center relative z-10 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6"
            >
              <span className="px-4 py-1 bg-black text-white text-sm tracking-wider uppercase font-medium">
                AI-Powered Excellence
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-7xl font-light tracking-tight mb-8 leading-none"
            >
              <span className="block">The</span>
              <span className="block font-bold">Future of Resumes</span>
              <span className="block text-2xl md:text-3xl font-light mt-6 text-gray-600">
                AI precision meets human ambition
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl md:text-2xl font-light mb-12 max-w-3xl mx-auto leading-relaxed text-gray-600"
            >
              Generate ATS-optimized resumes in seconds. Land more interviews
              with documents that speak the language of both
              <span className="text-black font-medium">
                {" "}
                hiring managers and algorithms
              </span>
              .
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-16"
            >
              <button
                onClick={handleStartFreeTrial}
                className="w-full sm:w-auto group relative px-8 py-4 text-lg font-medium bg-black text-white hover:bg-gray-900 transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-xl"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
              </button>

              <Link href="/features" className="w-full sm:w-auto">
                <button className="w-full px-8 py-4 text-lg font-medium border border-black text-black hover:bg-black hover:text-white transition-all duration-300">
                  See How It Works
                </button>
              </Link>
            </motion.div>

            {/* Mock Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="relative max-w-4xl mx-auto"
            >
              <div className="aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center p-6">
                  <div className="w-full max-w-2xl bg-white shadow-xl flex">
                    <div className="w-1/3 bg-black p-6 text-white">
                      <div className="w-20 h-20 rounded-full bg-gray-700 mb-6"></div>
                      <div className="h-4 w-3/4 bg-gray-700 rounded mb-4"></div>
                      <div className="h-3 w-1/2 bg-gray-700 rounded mb-8"></div>

                      <div className="space-y-3 mt-8">
                        <div className="h-3 w-full bg-gray-700 rounded"></div>
                        <div className="h-3 w-full bg-gray-700 rounded"></div>
                        <div className="h-3 w-3/4 bg-gray-700 rounded"></div>
                      </div>

                      <div className="space-y-3 mt-8">
                        <div className="h-3 w-full bg-gray-700 rounded"></div>
                        <div className="h-3 w-full bg-gray-700 rounded"></div>
                        <div className="h-3 w-1/2 bg-gray-700 rounded"></div>
                      </div>
                    </div>
                    <div className="w-2/3 p-6">
                      <div className="h-6 w-3/4 bg-gray-200 rounded mb-6"></div>
                      <div className="h-4 w-1/2 bg-gray-200 rounded mb-8"></div>

                      <div className="space-y-2 mb-6">
                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                      </div>

                      <div className="h-5 w-1/4 bg-black rounded mb-4"></div>
                      <div className="space-y-2 mb-6">
                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                      </div>

                      <div className="h-5 w-1/4 bg-black rounded mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-4 left-4 right-4 h-6 flex items-center px-4 justify-start space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="ml-4 h-6 w-1/2 bg-white rounded-md"></div>
              </div>
            </motion.div>

            {/* Floating Stats */}
            <div className="mt-16">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                      key={index}
                      className={`text-center transition-all duration-500 ${
                        currentStat === index
                          ? "scale-110 opacity-100"
                          : "opacity-70"
                      }`}
                    >
                      <div className="bg-black/5 p-2 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-2xl md:text-3xl font-bold">
                        {stat.value}
                      </div>
                      <div className="text-sm font-light text-gray-600">
                        {stat.label}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-black rounded-full flex justify-center">
            <div className="w-1 h-3 bg-black rounded-full mt-2 animate-bounce"></div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-black/5 uppercase tracking-wider mb-4">
              Superior Technology
            </span>
            <h2 className="text-4xl md:text-5xl font-light mb-6">
              Engineered for
              <span className="font-bold block">Maximum Impact</span>
            </h2>
            <p className="text-xl font-light text-gray-600 max-w-2xl mx-auto">
              Our AI doesn't just create resumes—it engineers career advancement
              opportunities with unprecedented precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  key={index}
                  className="group p-8 bg-white border border-gray-100 hover:border-black hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                >
                  <div className="flex items-start gap-6">
                    <div className="p-3 bg-black text-white group-hover:bg-gray-900 transition-colors duration-300">
                      <Icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold mb-4">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed font-light">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-black/5 uppercase tracking-wider mb-4">
              Effortless Experience
            </span>
            <h2 className="text-4xl md:text-5xl font-light mb-6">
              Three Simple Steps
            </h2>
            <p className="text-xl font-light text-gray-600 max-w-2xl mx-auto">
              Our streamlined process delivers exceptional results with minimal
              effort.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {[
              {
                number: "01",
                title: "Input Your Target",
                description:
                  "Paste the job description you're targeting. Our AI immediately begins analyzing requirements, keywords, and industry standards.",
              },
              {
                number: "02",
                title: "AI Optimization",
                description:
                  "Advanced algorithms restructure your experience, optimize keyword density, and ensure ATS compatibility while maintaining human readability.",
              },
              {
                number: "03",
                title: "Deliver Excellence",
                description:
                  "Receive a professionally formatted, strategically positioned resume that positions you as the ideal candidate for your target role.",
              },
            ].map((step, index) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                key={index}
                className="flex flex-col md:flex-row items-center gap-8 mb-20 group"
              >
                <div className="md:w-1/3">
                  <div className="text-8xl font-thin text-black/10 group-hover:text-black/20 transition-colors duration-500">
                    {step.number}
                  </div>
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-3xl font-semibold mb-4">{step.title}</h3>
                  <p className="text-xl font-light text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-black text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-white/10 uppercase tracking-wider mb-4">
              Pricing
            </span>
            <h2 className="text-4xl md:text-5xl font-light mb-6">
              Investment in
              <span className="font-bold block">Your Future</span>
            </h2>
            <p className="text-xl font-light opacity-80 max-w-2xl mx-auto">
              Premium quality at an accessible price point with guaranteed
              results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Tier */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 border border-white/10 backdrop-blur-sm overflow-hidden transform hover:scale-105 transition-all duration-300"
            >
              <div className="p-8">
                <h3 className="text-2xl font-light mb-2">Basic</h3>
                <p className="text-white/70 font-light text-sm mb-6">
                  Perfect for first-time users
                </p>

                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-light">₹0</span>
                  <span className="text-white/70 ml-2 text-sm">Free trial</span>
                </div>

                <div className="space-y-3 mb-8 text-sm">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="font-light">1 free resume generation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="font-light">Basic ATS optimization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="font-light">Standard templates</span>
                  </div>
                  <div className="flex items-center gap-3 opacity-50">
                    <X className="w-5 h-5 flex-shrink-0" />
                    <span className="font-light">Keyword analysis</span>
                  </div>
                  <div className="flex items-center gap-3 opacity-50">
                    <X className="w-5 h-5 flex-shrink-0" />
                    <span className="font-light">Advanced formatting</span>
                  </div>
                </div>

                <button
                  onClick={handleBasicPlan}
                  className="w-full py-3 bg-white/10 text-white hover:bg-white/20 transition-colors duration-300"
                >
                  Start Free Trial
                </button>
              </div>
            </motion.div>

            {/* Pro Tier (Most Popular) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white text-black relative transform hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              <div className="absolute top-0 inset-x-0 bg-black text-white text-center py-2 text-sm font-medium">
                MOST POPULAR
              </div>
              <div className="p-8 pt-16">
                <h3 className="text-2xl font-bold mb-2">Professional</h3>
                <p className="text-gray-600 font-light text-sm mb-6">
                  Perfect for active job seekers
                </p>

                <div className="flex items-baseline mb-6">
                  <span className="text-5xl font-light">₹100</span>
                  <span className="text-gray-600 ml-3 text-sm">
                    for 7 resumes
                  </span>
                </div>

                <div className="space-y-3 mb-8 text-sm">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="font-medium">
                      Everything in Basic, plus:
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="font-light">
                      7 premium resume generations
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="font-light">
                      Advanced ATS optimization
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="font-light">
                      Keyword analysis & integration
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="font-light">
                      Executive-level formatting
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="font-light">Premium design templates</span>
                  </div>
                </div>

                <button
                  onClick={handleProPlan}
                  className="w-full py-3 bg-black text-white hover:bg-gray-900 transition-colors duration-300 font-medium"
                >
                  Get Started
                </button>
              </div>
            </motion.div>

            {/* Enterprise Tier */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/5 border border-white/10 backdrop-blur-sm overflow-hidden transform hover:scale-105 transition-all duration-300"
            >
              <div className="p-8">
                <h3 className="text-2xl font-light mb-2">Enterprise</h3>
                <p className="text-white/70 font-light text-sm mb-6">
                  For businesses & career coaches
                </p>

                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-light">Custom</span>
                  <span className="text-white/70 ml-2 text-sm">Contact us</span>
                </div>

                <div className="space-y-3 mb-8 text-sm">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="font-light">
                      Everything in Professional, plus:
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="font-light">
                      Unlimited resume generations
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="font-light">White-label solutions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="font-light">API access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="font-light">
                      Dedicated account manager
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleEnterprisePlan}
                  className="w-full py-3 bg-white/10 text-white hover:bg-white/20 transition-colors duration-300"
                >
                  Contact Sales
                </button>
              </div>
            </motion.div>
          </div>

          <div className="mt-16 text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-light mb-6">
              Satisfaction Guaranteed
            </h3>
            <p className="text-white/80 font-light leading-relaxed">
              If our AI-generated resumes don't improve your interview response
              rate within 30 days, we'll refund your purchase. We're that
              confident in our technology.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-black/5 uppercase tracking-wider mb-4">
              Questions
            </span>
            <h2 className="text-4xl md:text-5xl font-light mb-6">
              Frequently Asked
              <span className="font-bold block">Questions</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            {[
              {
                question: "How does the AI optimize my resume?",
                answer:
                  "Our AI analyzes your experience against the target job description, restructuring content to highlight relevant skills, adjusting keyword density for ATS compatibility, and reformatting to professional standards—all while maintaining a natural, human-readable flow.",
              },
              {
                question: "Will the resume look like it was made by AI?",
                answer:
                  "Absolutely not. Our system is designed to produce resumes that read naturally and professionally. Each document maintains your unique voice while optimizing structure and content for both ATS systems and human recruiters.",
              },
              {
                question: "How many credits do I need for my job search?",
                answer:
                  "Most successful job seekers utilize 3-5 resumes during their search, each tailored to slightly different positions or companies. Our 7-credit Professional package provides ample opportunity to refine your approach as you progress.",
              },
              {
                question: "Can I edit the generated resume?",
                answer:
                  "Yes, you have complete control to edit, refine, and adjust any content after generation. Our system provides an excellent foundation that you can personalize further if desired.",
              },
              {
                question: "Are my personal details secure?",
                answer:
                  "Your privacy is paramount. We employ bank-level encryption for all data, never share your information with third parties, and provide options to delete your data permanently upon request.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="border-b border-gray-200 pb-8"
              >
                <h3 className="text-xl font-medium mb-4">{faq.question}</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-6xl font-light mb-8">
              Ready to Transform
              <span className="font-bold block mt-2">
                Your Career Trajectory?
              </span>
            </h2>
            <p className="text-xl font-light text-white/80 mb-12 max-w-2xl mx-auto">
              Join thousands of professionals who have elevated their careers
              with AI-optimized resumes. Your first resume is free.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleCreateFreeResume}
                className="px-16 py-5 text-xl font-medium bg-white text-black hover:bg-gray-200 transition-all duration-300"
              >
                Create Free Resume
              </button>
              <Link href="/pricing">
                <button className="px-16 py-5 text-xl font-medium bg-transparent border border-white text-white hover:bg-white/10 transition-all duration-300">
                  View Plans
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-light mb-4">
              Stay Updated with Career Insights
            </h2>
            <p className="text-gray-600 mb-8">
              Subscribe to receive the latest job market trends, resume tips,
              and exclusive offers.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 px-4 py-3 border border-gray-300 focus:border-black outline-none"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-black text-white hover:bg-gray-900 transition-all duration-300"
              >
                Subscribe
              </button>
            </form>
            {showEmailTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-green-600"
              >
                Thank you for subscribing! Check your inbox for updates.
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div>
              <Link
                href="/"
                className="font-bold text-2xl tracking-tight mb-4 inline-block"
              >
                ResumeAI
              </Link>
              <p className="text-gray-600 font-light mb-4">
                AI-powered resume builder that helps professionals land more
                interviews.
              </p>
              <div className="flex space-x-4">
                <Link
                  href="#"
                  aria-label="Twitter"
                  className="text-gray-400 hover:text-black"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </Link>
                <Link
                  href="#"
                  aria-label="LinkedIn"
                  className="text-gray-400 hover:text-black"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                  </svg>
                </Link>
                <Link
                  href="#"
                  aria-label="Instagram"
                  className="text-gray-400 hover:text-black"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-4">Company</h3>
              <ul className="space-y-3 font-light">
                <li>
                  <Link href="/about" className="hover:text-gray-900">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/features" className="hover:text-gray-900">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-gray-900">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-gray-900">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Legal</h3>
              <ul className="space-y-3 font-light">
                <li>
                  <Link href="/privacy-policy" className="hover:text-gray-900">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-gray-900">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/resume-tips" className="hover:text-gray-900">
                    Resume Tips
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} ResumeAI. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="/privacy-policy"
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
