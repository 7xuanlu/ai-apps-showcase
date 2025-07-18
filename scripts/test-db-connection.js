require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");

async function testConnection() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL);

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    console.log("Attempting to connect...");
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Test a simple query
    const userCount = await prisma.user.count();
    console.log("📊 User count:", userCount);
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  } finally {
    await prisma.$disconnect();
    console.log("✅ Database disconnected");
  }
}

testConnection();
