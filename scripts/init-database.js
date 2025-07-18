#!/usr/bin/env node

/**
 * Database Initialization Script
 * 
 * This script initializes the database for both development (SQLite) and 
 * production (PostgreSQL) environments with proper error handling and validation.
 */

const { 
  detectEnvironment, 
  generateSchema, 
  initializeDatabase, 
  validateConnection,
  seedDatabase 
} = require('./migration-utils');

async function main() {
  console.log('🚀 Starting database initialization...\n');
  
  try {
    // Step 1: Detect and validate environment
    const env = detectEnvironment();
    console.log('📋 Environment Configuration:');
    console.log(`   NODE_ENV: ${env.nodeEnv}`);
    console.log(`   DATABASE_PROVIDER: ${env.databaseProvider}`);
    console.log(`   DATABASE_URL: ${env.databaseUrl}`);
    console.log('');
    
    // Step 2: Generate appropriate schema
    console.log('🔧 Generating database schema...');
    generateSchema();
    console.log('');
    
    // Step 3: Initialize database
    console.log('🏗️  Initializing database...');
    initializeDatabase();
    console.log('');
    
    // Step 4: Validate connection
    console.log('🔍 Validating database connection...');
    const isValid = validateConnection();
    if (!isValid) {
      throw new Error('Database connection validation failed');
    }
    console.log('');
    
    // Step 5: Seed database (optional, only in development)
    if (env.isDevelopment) {
      console.log('🌱 Seeding development database...');
      try {
        seedDatabase();
      } catch (error) {
        console.warn(`⚠️  Database seeding failed: ${error.message}`);
        console.warn('   This is not critical for initialization');
      }
      console.log('');
    }
    
    // Success message
    console.log('✅ Database initialization completed successfully!');
    console.log('');
    console.log('Next steps:');
    if (env.isDevelopment) {
      console.log('  - Run `npm run dev` to start the development server');
      console.log('  - Use `npm run db:studio` to open Prisma Studio');
    } else {
      console.log('  - Database is ready for production deployment');
      console.log('  - Ensure all environment variables are configured');
    }
    
  } catch (error) {
    console.error('\n❌ Database initialization failed:');
    console.error(`   ${error.message}`);
    console.error('\nTroubleshooting:');
    console.error('  1. Check your environment variables (.env.local for development)');
    console.error('  2. Ensure database server is running (for PostgreSQL)');
    console.error('  3. Verify database permissions and connectivity');
    console.error('  4. Run `node scripts/migration-utils.js validate` to test connection');
    
    process.exit(1);
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n⚠️  Database initialization interrupted');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Database initialization terminated');
  process.exit(1);
});

// Run the initialization
main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});