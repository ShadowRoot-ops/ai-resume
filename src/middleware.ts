// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// // Define public routes that don't require authentication
// const isPublicRoute = createRouteMatcher([
//   "/",
//   "/auth/sign-in(.*)",
//   "/auth/sign-up(.*)",
//   "/api/webhooks/clerk",
//   "/api/webhooks/razorpay",
//   "/api/payments/razorpay-webhook",
// ]);

// export default clerkMiddleware(async (auth, request) => {
//   if (!isPublicRoute(request)) {
//     await auth.protect();
//   }
// });

// export const config = {
//   matcher: [
//     // Match all routes except static files and Next.js internals
//     "/((?!_next|.*\\.(?:ico|png|jpg|jpeg|svg|gif|css|js|json|txt|woff|woff2|ttf|eot|map)).*)",
//     // Always run for API routes
//     "/(api|trpc)(.*)",
//   ],
// };
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/auth/sign-in(.*)",
  "/auth/sign-up(.*)",
  "/api/webhooks/clerk",
  "/api/webhooks/razorpay",
  "/api/payments/razorpay-webhook",
]);

export default clerkMiddleware(async (auth, request) => {
  // Only protect if it's not a public route
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

// Match all necessary routes and exclude static files or Next.js internals
export const config = {
  matcher: [
    // Match all pages except static assets and _next folder
    "/((?!_next|.*\\.(?:ico|png|jpg|jpeg|svg|gif|css|js|json|txt|woff|woff2|ttf|eot|map)).*)",
    // Match all API routes including webhooks
    "/(api|trpc)(.*)",
  ],
};
