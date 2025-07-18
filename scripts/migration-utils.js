#!/usr/bin/env node

/**
 * Cross-Database Migration Utilities
 * 
 * This module provides utilities for managing database migrations that work
 * with both SQLite (development) and PostgreSQL (production) environments.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment configuration
function loadEnvironmentConfig() {
  // Load from .env.local if it exists
  const envLocalPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf8');
    const envLines = envContent.split('\n');
    
    envLines.forEach(line => {
      if (!line || line.startsWith('#')) return;
      const match = line.match(/^\s*([\w.-]+)\s*=\s*"?([^"]*)"?\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2];
      }
    });
  }
}

// Detect current environment and database provider
function detectEnvironment() {
  loadEnvironmentConfig();
  
  const nodeEnv = process.env.NODE_ENV || 'development';
  const databaseProvider = process.env.DATABASE_PROVIDER || 'sqlite';
  const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
  
  return {
    nodeEnv,
    databaseProvider,
    databaseUrl,
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production'
  };
}

// Generate schema based on environment
function generateSchema(provider = null) {
  const env = detectEnvironment();
  const targetProvider = provider || env.databaseProvider;
  
  console.log(`🔧 Generating Prisma schema for ${targetProvider}...`);
  
  try {
    // Use the existing generate-schema script
    const command = `cross-env DATABASE_PROVIDER=${targetProvider} node scripts/generate-schema.js`;
    execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log(`✅ Schema generated successfully for ${targetProvider}`);
  } catch (error) {
    console.error(`❌ Failed to generate schema: ${error.message}`);
    throw error;
  }
}

// Initialize database (create if doesn't exist)
function initializeDatabase() {
  const env = detectEnvironment();
  
  console.log(`🚀 Initializing ${env.databaseProvider} database...`);
  
  try {
    if (env.databaseProvider === 'sqlite') {
      // For SQLite, ensure the directory exists
      const dbPath = env.databaseUrl.replace('file:', '');
      const dbDir = path.dirname(path.resolve(dbPath));
      
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        console.log(`📁 Created database directory: ${dbDir}`);
      }
    }
    
    // Generate Prisma client
    execSync('npx prisma generate', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('✅ Prisma client generated');
    
    // Push schema to database (creates tables if they don't exist)
    execSync('npx prisma db push', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('✅ Database schema synchronized');
    
  } catch (error) {
    console.error(`❌ Database initialization failed: ${error.message}`);
    throw error;
  }
}

// Run migrations
function runMigrations(environment = null) {
  const env = detectEnvironment();
  const targetEnv = environment || env.nodeEnv;
  
  console.log(`🔄 Running migrations for ${targetEnv} environment...`);
  
  try {
    if (targetEnv === 'development') {
      // For development, use migrate dev which handles schema changes
      execSync('npx prisma migrate dev --name auto-migration', { 
        stdio: 'inherit', 
        cwd: path.join(__dirname, '..') 
      });
    } else {
      // For production, use migrate deploy which only applies existing migrations
      execSync('npx prisma migrate deploy', { 
        stdio: 'inherit', 
        cwd: path.join(__dirname, '..') 
      });
    }
    
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error(`❌ Migration failed: ${error.message}`);
    throw error;
  }
}

// Reset database (development only)
function resetDatabase() {
  const env = detectEnvironment();
  
  if (!env.isDevelopment) {
    throw new Error('Database reset is only allowed in development environment');
  }
  
  console.log('🔄 Resetting development database...');
  
  try {
    // Reset the database
    execSync('npx prisma migrate reset --force', { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, '..') 
    });
    
    console.log('✅ Database reset completed');
  } catch (error) {
    console.error(`❌ Database reset failed: ${error.message}`);
    throw error;
  }
}

// Seed database
function seedDatabase() {
  const env = detectEnvironment();
  
  console.log(`🌱 Seeding ${env.databaseProvider} database...`);
  
  try {
    execSync('npm run db:seed', { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, '..') 
    });
    
    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error(`❌ Database seeding failed: ${error.message}`);
    throw error;
  }
}

// Validate database connection
function validateConnection() {
  const env = detectEnvironment();
  
  console.log(`🔍 Validating ${env.databaseProvider} database connection...`);
  
  try {
    // Use Prisma's introspection to validate connection
    execSync('npx prisma db pull --print', { 
      stdio: 'pipe', 
      cwd: path.join(__dirname, '..') 
    });
    
    console.log('✅ Database connection validated');
    return true;
  } catch (error) {
    console.error(`❌ Database connection failed: ${error.message}`);
    return false;
  }
}

// Create migration for cross-database compatibility
function createMigration(name) {
  if (!name) {
    throw new Error('Migration name is required');
  }
  
  const env = detectEnvironment();
  
  console.log(`📝 Creating migration: ${name}`);
  
  try {
    // Create migration with descriptive name
    execSync(`npx prisma migrate dev --name ${name} --create-only`, { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, '..') 
    });
    
    console.log('✅ Migration created successfully');
    console.log('⚠️  Please review the generated migration files before applying');
  } catch (error) {
    console.error(`❌ Migration creation failed: ${error.message}`);
    throw error;
  }
}

// Export functions for use in other scripts
module.exports = {
  detectEnvironment,
  generateSchema,
  initializeDatabase,
  runMigrations,
  resetDatabase,
  seedDatabase,
  validateConnection,
  createMigration
};

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  try {
    switch (command) {
      case 'detect':
        const env = detectEnvironment();
        console.log('Environment Configuration:');
        console.log(`  NODE_ENV: ${env.nodeEnv}`);
        console.log(`  DATABASE_PROVIDER: ${env.databaseProvider}`);
        console.log(`  DATABASE_URL: ${env.databaseUrl}`);
        break;
        
      case 'generate-schema':
        generateSchema(args[0]);
        break;
        
      case 'init':
        initializeDatabase();
        break;
        
      case 'migrate':
        runMigrations(args[0]);
        break;
        
      case 'reset':
        resetDatabase();
        break;
        
      case 'seed':
        seedDatabase();
        break;
        
      case 'validate':
        const isValid = validateConnection();
        process.exit(isValid ? 0 : 1);
        break;
        
      case 'create-migration':
        createMigration(args[0]);
        break;
        
      default:
        console.log('Usage: node migration-utils.js <command> [args]');
        console.log('');
        console.log('Commands:');
        console.log('  detect                    - Show current environment configuration');
        console.log('  generate-schema [provider] - Generate Prisma schema for provider');
        console.log('  init                      - Initialize database and generate client');
        console.log('  migrate [environment]     - Run database migrations');
        console.log('  reset                     - Reset database (development only)');
        console.log('  seed                      - Seed database with initial data');
        console.log('  validate                  - Validate database connection');
        console.log('  create-migration <name>   - Create new migration file');
        process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Command failed: ${error.message}`);
    process.exit(1);
  }
}