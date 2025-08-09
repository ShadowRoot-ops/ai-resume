import { prisma } from "./db";

export async function getOrCreateUser(
  clerkId: string,
  email?: string,
  name?: string
) {
  try {
    // Try to find existing user
    let user = await prisma.user.findUnique({
      where: { clerkId },
    });

    // If user doesn't exist, create a new one
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId,
          email: email || `user-${clerkId}@example.com`, // Temporary email if not provided
          name: name || "New User", // Temporary name if not provided
          credits: 1, // Start with one free credit
        },
      });

      console.log("Created new user with ID:", user.id);
    }

    return user;
  } catch (error) {
    console.error("Error getting or creating user:", error);
    throw error;
  }
}
