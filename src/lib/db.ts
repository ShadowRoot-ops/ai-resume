import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Neon-optimized Prisma Client configuration
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Neon-specific optimizations
    // __internal property removed as it's not supported in PrismaClient options
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

// Graceful shutdown for Neon connections
const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}, closing Prisma connection...`);
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

// Health check function for Neon
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "healthy", timestamp: new Date().toISOString() };
  } catch (error) {
    console.error("Database health check failed:", error);
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message: string }).message
        : String(error);
    return {
      status: "unhealthy",
      error: errorMessage,
      timestamp: new Date().toISOString(),
    };
  }
}
