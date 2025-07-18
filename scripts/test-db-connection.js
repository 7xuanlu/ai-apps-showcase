#!/usr/bin/env node

/**
 * Database Connection Test Script
 *
 * This script tests database connectivity for both SQLite and PostgreSQL
 * environments with detailed diagnostics and troubleshooting information.
 */

const { PrismaClient } = require("@prisma/client");
const { detectEnvironment } = require("./migration-utils");
const fs = require("fs");
const path = require("path");

async function testDatabaseConnection() {
  console.log("🔍 Testing database connection...\n");

  const env = detectEnvironment();
  console.log("📋 Environment Configuration:");
  console.log(`   NODE_ENV: ${env.nodeEnv}`);
  console.log(`   DATABASE_PROVIDER: ${env.databaseProvider}`);
  console.log(`   DATABASE_URL: ${env.databaseUrl}`);
  console.log("");

  let prisma;

  try {
    // Initialize Prisma client
    console.log("🔧 Initializing Prisma client...");
    prisma = new PrismaClient({
      log: ["error", "warn"],
    });

    // Test basic connection
    console.log("🔌 Testing database connection...");
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Test query execution
    console.log("📊 Testing query execution...");
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ Query execution successful");

    // Test table access (if User table exists)
    console.log("🗃️  Testing table access...");
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ User table accessible (${userCount} records)`);
    } catch (error) {
      console.log("⚠️  User table not accessible (may not exist yet)");
      console.log(`   Error: ${error.message}`);
    }

    // Environment-specific tests
    if (env.databaseProvider === "sqlite") {
      await testSQLiteSpecific(env);
    } else if (env.databaseProvider === "postgresql") {
      await testPostgreSQLSpecific(prisma);
    }

    console.log("\n✅ All database tests passed!");
  } catch (error) {
    console.error("\n❌ Database connection test failed:");
    console.error(`   ${error.message}`);

    // Provide specific troubleshooting based on error type
    await provideTroubleshooting(error, env);

    process.exit(1);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

async function testSQLiteSpecific(env) {
  console.log("🗄️  Running SQLite-specific tests...");

  // Check if database file exists
  const dbPath = env.databaseUrl.replace("file:", "");
  const fullDbPath = path.resolve(dbPath);

  // Also check for the file in the nested prisma directory (common issue)
  const nestedDbPath = path.resolve("./prisma/prisma/dev.db");

  if (fs.existsSync(fullDbPath)) {
    const stats = fs.statSync(fullDbPath);
    console.log(`✅ SQLite database file exists (${stats.size} bytes)`);
    console.log(`   Location: ${fullDbPath}`);
  } else if (fs.existsSync(nestedDbPath)) {
    const stats = fs.statSync(nestedDbPath);
    console.log(`✅ SQLite database file exists (${stats.size} bytes)`);
    console.log(`   Location: ${nestedDbPath} (nested location)`);
    console.log("   Note: Database was created in nested directory");
  } else {
    console.log("⚠️  SQLite database file does not exist");
    console.log(`   Expected location: ${fullDbPath}`);
    console.log(`   Also checked: ${nestedDbPath}`);
    console.log("   This is normal for a fresh installation");
  }

  // Check directory permissions
  const dbDir = path.dirname(fullDbPath);
  try {
    fs.accessSync(dbDir, fs.constants.W_OK);
    console.log("✅ Database directory is writable");
  } catch (error) {
    console.log("❌ Database directory is not writable");
    console.log(`   Directory: ${dbDir}`);
  }
}

async function testPostgreSQLSpecific(prisma) {
  console.log("🐘 Running PostgreSQL-specific tests...");

  try {
    // Test PostgreSQL version
    const versionResult = await prisma.$queryRaw`SELECT version()`;
    console.log("✅ PostgreSQL version check successful");

    // Test schema access
    const schemaResult = await prisma.$queryRaw`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'public'
    `;
    console.log("✅ Schema access successful");

    // Test connection pool
    console.log("🏊 Testing connection pooling...");
    const promises = Array.from(
      { length: 5 },
      (_, i) => prisma.$queryRaw`SELECT ${i} as connection_test`
    );
    await Promise.all(promises);
    console.log("✅ Connection pooling test successful");
  } catch (error) {
    console.log("⚠️  PostgreSQL-specific test failed:");
    console.log(`   ${error.message}`);
  }
}

async function provideTroubleshooting(error, env) {
  console.error("\n🔧 Troubleshooting Guide:");

  const errorMessage = error.message.toLowerCase();

  if (
    errorMessage.includes("enoent") ||
    errorMessage.includes("no such file")
  ) {
    console.error("   Issue: Database file not found");
    console.error("   Solutions:");
    console.error("     1. Run `npm run db:init` to initialize the database");
    console.error("     2. Check DATABASE_URL in your .env.local file");
    console.error(
      "     3. Ensure the database directory exists and is writable"
    );
  } else if (
    errorMessage.includes("econnrefused") ||
    errorMessage.includes("connection refused")
  ) {
    console.error("   Issue: Database server connection refused");
    console.error("   Solutions:");
    console.error("     1. Ensure PostgreSQL server is running");
    console.error("     2. Check DATABASE_URL connection string");
    console.error("     3. Verify firewall settings");
    console.error("     4. Check if the database server is accessible");
  } else if (
    errorMessage.includes("authentication") ||
    errorMessage.includes("password")
  ) {
    console.error("   Issue: Database authentication failed");
    console.error("   Solutions:");
    console.error("     1. Verify username and password in DATABASE_URL");
    console.error("     2. Check database user permissions");
    console.error("     3. Ensure the database user exists");
  } else if (
    errorMessage.includes("database") &&
    errorMessage.includes("does not exist")
  ) {
    console.error("   Issue: Database does not exist");
    console.error("   Solutions:");
    console.error("     1. Create the database on your PostgreSQL server");
    console.error("     2. Check the database name in DATABASE_URL");
    console.error("     3. Run database initialization scripts");
  } else if (errorMessage.includes("prisma")) {
    console.error("   Issue: Prisma configuration problem");
    console.error("   Solutions:");
    console.error("     1. Run `npx prisma generate` to regenerate client");
    console.error("     2. Check prisma/schema.prisma configuration");
    console.error("     3. Ensure DATABASE_PROVIDER matches your setup");
  } else {
    console.error("   Issue: General database connection problem");
    console.error("   Solutions:");
    console.error("     1. Check all environment variables");
    console.error("     2. Verify database server is running");
    console.error("     3. Test network connectivity");
    console.error("     4. Check application logs for more details");
  }

  console.error("\n📚 Additional Resources:");
  console.error("   - Prisma documentation: https://www.prisma.io/docs");
  console.error("   - Environment setup guide: See .env.example");
  console.error(
    "   - Run `node scripts/migration-utils.js detect` for environment info"
  );
}

// Handle process termination gracefully
process.on("SIGINT", () => {
  console.log("\n⚠️  Database test interrupted");
  process.exit(1);
});

// Run the test
testDatabaseConnection().catch((error) => {
  console.error("Unexpected error during database test:", error);
  process.exit(1);
});
