import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="mb-6">
        <Link href="/">
          <div className="text-2xl font-bold">AI Resume Builder</div>
        </Link>
      </div>
      <div className="w-full max-w-md">
        <SignUp
          routing="hash"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white dark:bg-gray-800 shadow-md rounded-lg",
              headerTitle: "text-center text-2xl font-bold",
              headerSubtitle: "text-center",
            },
          }}
          redirectUrl="/onboarding"
          signInUrl="/auth/sign-in"
        />
      </div>
      <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
