// src/app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/user-helpers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Plus,
  FileText,
  Clock,
  Sparkles,
  Award,
  CheckCircle,
  TrendingUp,
  Star,
} from "lucide-react";
import Link from "next/link";
import BuyCreditsCompact from "@/components/dashboard/BuyCreditsCompact";
import BuyCreditsButton from "@/components/dashboard/BuyCreditButton";
import DeleteResumeButton from "@/components/resume/DeleteResumeButton";
import CareerTools from "@/components/dashboard/CareerTools";
import LowCreditsAlert from "@/components/dashboard/LowCreditAlert";
import ResumeAnalysisSection from "@/components/dashboard/ResumeAnalysisSection";
import { checkRateLimit } from "@/lib/rate-limiter";

// For fresh data on each page load
export const revalidate = 0;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth/sign-in");
  }

  // Get Clerk user
  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect("/auth/sign-in");
  }

  // Get or create user in database
  const user = await getOrCreateUser(
    userId,
    clerkUser.emailAddresses[0]?.emailAddress,
    `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim()
  );

  // Get user's resumes
  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Get user's recent payments for dashboard insights
  const recentPayments = await prisma.payment.findMany({
    where: { userId: user.id, status: "successful" },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  // Calculate user statistics
  const totalCreditsUsed = await prisma.creditUsage.aggregate({
    where: { userId: user.id },
    _sum: { amount: true },
  });

  // Await searchParams and extract values
  const searchParamsResolved = await searchParams;
  const error = searchParamsResolved?.error
    ? String(searchParamsResolved.error)
    : undefined;
  const paymentSuccess = searchParamsResolved?.payment_success ? true : false;
  const hasLowCredits = user.credits > 0 && user.credits < 3;

  // Check rate limits for free users
  const createResumeRateLimit = await checkRateLimit(user.id, "resume_create");
  const createResumeReachedLimit = !createResumeRateLimit.allowed;

  const analyzeResumeRateLimit = await checkRateLimit(
    user.id,
    "resume_analyze"
  );
  const analyzeResumeReachedLimit = !analyzeResumeRateLimit.allowed;

  const careerToolsRateLimit = await checkRateLimit(user.id, "career_tools");
  const careerToolsReachedLimit = !careerToolsRateLimit.allowed;

  // Check if user has a premium subscription
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  const isPremium = !!(
    subscription &&
    subscription.plan !== "FREE" &&
    subscription.status === "ACTIVE" &&
    (!subscription.endDate || new Date(subscription.endDate) > new Date())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {clerkUser.firstName || "User"}!
            </h1>
            <p className="text-gray-600 mt-1">
              Let's create some amazing resumes today
            </p>
          </div>

          {isPremium && (
            <Badge className="mt-2 sm:mt-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <Star className="h-3 w-3 mr-1" />
              Pro Member
            </Badge>
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {error === "no-credits" && user.credits <= 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Credits Remaining</AlertTitle>
          <AlertDescription>
            You need to purchase more credits to generate resumes.
          </AlertDescription>
        </Alert>
      )}

      {error === "no-credits" && user.credits > 0 && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle>Credits Available</AlertTitle>
          <AlertDescription>
            You have {user.credits} credits available. You can now create or
            analyze resumes.
          </AlertDescription>
        </Alert>
      )}

      {paymentSuccess && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Payment Successful</AlertTitle>
          <AlertDescription>
            Your payment was successful and credits have been added to your
            account.
          </AlertDescription>
        </Alert>
      )}

      <LowCreditsAlert
        credits={user.credits}
        showWarning={!error && hasLowCredits}
      />

      {/* Rest of your component remains the same... */}
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Available Credits Card */}
        <Card
          className={`border-l-4 ${
            user.credits < 3 ? "border-l-amber-500" : "border-l-primary"
          } shadow-sm hover:shadow-md transition-shadow h-fit`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Sparkles className="h-5 w-5 mr-2 text-primary" />
              Available Credits
            </CardTitle>
            <CardDescription className="text-sm">
              Your remaining AI-powered tools usage
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex items-baseline mb-3">
              <p className="text-3xl font-bold text-gray-900">
                {user.credits || 0}
              </p>
              <p className="text-sm text-gray-500 ml-2">credits</p>
            </div>

            {user.credits === 0 && (
              <p className="text-sm text-red-500 mb-3">
                Purchase credits to continue using premium features
              </p>
            )}

            {user.credits > 0 && user.credits < 3 && (
              <p className="text-sm text-amber-600 mb-3">
                Credits running low. Consider purchasing more soon.
              </p>
            )}

            {user.credits >= 3 && (
              <p className="text-sm text-green-600 mb-3">
                You're all set! Create amazing resumes.
              </p>
            )}

            {!isPremium && (
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md border">
                <p className="font-medium text-gray-700 mb-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Free account limits:
                </p>
                <div className="space-y-1">
                  <p>• 1 resume creation per day</p>
                  <p>• 1 resume analysis per day</p>
                  <p>• 1 career tool use per day</p>
                </div>
              </div>
            )}
          </CardContent>
          {user.credits < 5 && (
            <CardFooter className="pt-0">
              <BuyCreditsButton />
            </CardFooter>
          )}
        </Card>

        {/* Resume Portfolio Card */}
        <Card className="shadow-sm hover:shadow-md transition-shadow h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Resume Portfolio
            </CardTitle>
            <CardDescription className="text-sm">
              Your professional resume collection
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex items-baseline mb-3">
              <p className="text-3xl font-bold text-gray-900">
                {resumes.length}
              </p>
              <p className="text-sm text-gray-500 ml-2">resumes</p>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {resumes.length === 0
                ? "Create your first professional resume"
                : "Manage and optimize your career documents"}
            </p>

            {/* Portfolio Stats */}
            {resumes.length > 0 && (
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md border space-y-1">
                <div className="flex justify-between">
                  <span>Latest created:</span>
                  <span className="font-medium">
                    {new Date(resumes[0].createdAt).toLocaleDateString()}
                  </span>
                </div>
                {resumes.some((r) => r.atsScore) && (
                  <div className="flex justify-between">
                    <span>Best ATS Score:</span>
                    <span className="font-medium text-green-600">
                      {Math.max(...resumes.map((r) => r.atsScore || 0))}%
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Total created:</span>
                  <span className="font-medium">{resumes.length}</span>
                </div>
              </div>
            )}

            {/* Empty state filler */}
            {resumes.length === 0 && (
              <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-md border min-h-[60px] flex items-center justify-center">
                <p className="text-center">
                  No resumes yet.
                  <br />
                  Start building your professional portfolio!
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link
              href={
                user.credits > 0 && !createResumeReachedLimit
                  ? "/resume/create"
                  : "/dashboard?error=no-credits"
              }
              className="w-full"
            >
              <Button variant="outline" className="w-full" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Resume
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Buy Credits Card - Compact */}
        <div id="buy-credits-section">
          <BuyCreditsCompact lowCredits={user.credits < 3} />
        </div>
      </div>

      {/* Quick Stats Row */}
      {(totalCreditsUsed._sum.amount ||
        isPremium ||
        recentPayments.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-900">
                {totalCreditsUsed._sum.amount || 0}
              </p>
              <p className="text-sm text-blue-600">Total Credits Used</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4 text-center">
              <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-900">
                {resumes.filter((r) => r.atsScore && r.atsScore >= 80).length}
              </p>
              <p className="text-sm text-green-600">High ATS Scores</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-900">
                {isPremium ? "Pro" : "Free"}
              </p>
              <p className="text-sm text-purple-600">Account Status</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="resumes" className="w-full">
        <TabsList className="mb-6 bg-gray-100">
          <TabsTrigger value="resumes" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            My Resumes
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Create Resume
            {!isPremium && (
              <Badge variant="secondary" className="ml-2 text-xs">
                1/day
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analyze" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analyze Resume
            <Badge variant="secondary" className="ml-2 text-xs">
              1 credit
            </Badge>
            {!isPremium && (
              <Badge variant="secondary" className="ml-2 text-xs">
                1/day
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="career-tools" className="flex items-center">
            Career Tools
            <Badge variant="secondary" className="ml-2 text-xs">
              2 credits
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumes" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Create New Resume Card */}
            <Link
              href={
                user.credits > 0 && !createResumeReachedLimit
                  ? "/resume/create"
                  : "/dashboard?error=no-credits"
              }
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-dashed border-2 border-gray-300 hover:border-primary group">
                <CardContent className="flex flex-col items-center justify-center h-64 p-6">
                  <div className="p-4 bg-primary/10 rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-lg font-medium text-center text-gray-700 group-hover:text-primary">
                    Create New Resume
                  </p>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    {user.credits > 0 && !createResumeReachedLimit
                      ? "Build a new optimized resume"
                      : createResumeReachedLimit
                      ? "Daily limit reached. Resets at midnight."
                      : "Purchase credits to create resumes"}
                  </p>
                  {user.credits > 0 && !createResumeReachedLimit && (
                    <Badge className="mt-3 bg-primary/10 text-primary hover:bg-primary hover:text-white">
                      1 Credit
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </Link>

            {/* User's Resumes */}
            {resumes.map((resume) => (
              <Card
                key={resume.id}
                className="h-full hover:shadow-lg transition-all duration-300 group"
              >
                <CardContent className="p-6 h-64 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      {resume.atsScore && (
                        <Badge
                          variant={
                            resume.atsScore >= 80
                              ? "default"
                              : resume.atsScore >= 60
                              ? "secondary"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          Score: {resume.atsScore}%
                        </Badge>
                      )}
                      <DeleteResumeButton
                        resumeId={resume.id}
                        resumeTitle={resume.title}
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <Link href={`/resume/${resume.id}`}>
                      <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors line-clamp-2">
                        {resume.title}
                      </h3>
                    </Link>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        {new Date(resume.createdAt).toLocaleDateString()}
                      </p>

                      {resume.companyTargeted && (
                        <p className="text-sm text-gray-600 truncate">
                          <span className="font-medium">Company:</span>{" "}
                          {resume.companyTargeted}
                        </p>
                      )}

                      {resume.jobTitle && (
                        <p className="text-sm text-gray-600 truncate">
                          <span className="font-medium">Position:</span>{" "}
                          {resume.jobTitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-auto pt-4">
                    <Link href={`/resume/${resume.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        View
                      </Button>
                    </Link>
                    <Link href={`/resume/${resume.id}/edit`} className="flex-1">
                      <Button className="w-full" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {resumes.length === 0 && (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No resumes yet
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                You haven't created any resumes yet. Start building your
                professional portfolio today!
              </p>
              <Link
                href={
                  user.credits > 0 && !createResumeReachedLimit
                    ? "/resume/create"
                    : "/dashboard?error=no-credits"
                }
              >
                <Button size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Resume
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="create">
          <div className="max-w-4xl mx-auto">
            {createResumeReachedLimit && !isPremium ? (
              <Alert className="mb-6 bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-700">
                  Daily Limit Reached
                </AlertTitle>
                <AlertDescription className="text-amber-600">
                  Free accounts can create 1 resume per day. Your limit will
                  reset at midnight.{" "}
                  <Link
                    href="#buy-credits-section"
                    className="underline font-medium"
                  >
                    Upgrade for unlimited access.
                  </Link>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="text-center mb-8">
                <Link
                  href={
                    user.credits > 0
                      ? "/resume/create"
                      : "/dashboard?error=no-credits"
                  }
                >
                  <Button size="lg" className="mb-4">
                    <Plus className="h-5 w-5 mr-2" />
                    Create New Resume
                    <Badge variant="secondary" className="ml-2">
                      1 credit
                    </Badge>
                  </Button>
                </Link>
                <p className="text-gray-600">
                  Build an ATS-optimized resume in minutes with our AI-powered
                  builder
                </p>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Award className="h-6 w-6 mr-3 text-primary" />
                  Resume Creation Process
                </CardTitle>
                <CardDescription>
                  Follow these steps to create an ATS-optimized resume
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    step: 1,
                    title: "Enter Personal Information",
                    description:
                      "Provide your contact details, skills, and other basic information.",
                  },
                  {
                    step: 2,
                    title: "Add Education & Work Experience",
                    description:
                      "Enter your academic background and professional experience with details.",
                  },
                  {
                    step: 3,
                    title: "Paste Job Description",
                    description:
                      "Add the job posting you're applying to for targeted optimization.",
                  },
                  {
                    step: 4,
                    title: "Choose Design & Colors",
                    description:
                      "Select a template and color scheme that fits the role and company.",
                  },
                  {
                    step: 5,
                    title: "Generate & Download",
                    description:
                      "Our AI will create an optimized resume you can download as PDF.",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center text-lg font-semibold mr-4 flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-lg">
                        {item.title}
                      </h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analyze">
          <ResumeAnalysisSection
            credits={user.credits}
            isPremium={isPremium}
            reachedDailyLimit={analyzeResumeReachedLimit}
          />
        </TabsContent>

        <TabsContent value="career-tools">
          {user.credits >= 2 ? (
            careerToolsReachedLimit && !isPremium ? (
              <div className="text-center py-12">
                <div className="p-4 bg-amber-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <AlertCircle className="h-10 w-10 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Daily Limit Reached
                </h3>
                <p className="text-gray-500 mb-6 text-center max-w-md mx-auto">
                  Free accounts can use career tools once per day. Your limit
                  will reset at midnight.
                </p>
                <Link href="#buy-credits-section">
                  <Button size="lg">Upgrade for Unlimited Access</Button>
                </Link>
              </div>
            ) : (
              <>
                <Card className="mb-6 bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-medium mr-2">Cost:</span>
                        <Badge className="bg-primary/10 text-primary">
                          2 Credits
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        Available credits:{" "}
                        <span className="font-semibold">{user.credits}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <CareerTools />
              </>
            )
          ) : (
            <NoCreditsMessage requiredCredits={2} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NoCreditsMessage({
  requiredCredits = 1,
}: {
  requiredCredits?: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="p-4 bg-amber-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
        <AlertCircle className="h-10 w-10 text-amber-600" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Insufficient Credits</h3>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        You need at least {requiredCredits} credit
        {requiredCredits !== 1 ? "s" : ""} to use this feature. Purchase more
        credits to access advanced tools.
      </p>
      <Link href="#buy-credits-section">
        <Button size="lg">Get Credits</Button>
      </Link>
    </div>
  );
}
