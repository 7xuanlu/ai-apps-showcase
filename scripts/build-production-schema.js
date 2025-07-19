#!/usr/bin/env node

/**
 * Production Schema Builder for Vercel
 * 
 * This script explicitly generates a PostgreSQL schema for production builds
 * without relying on runtime environment variables that might not be available
 * during the Vercel build process.
 */

const fs = require('fs');
const path = require('path');

console.log('🏗️  Building production schema for Vercel deployment...');

// Force PostgreSQL configuration for production builds
const databaseProvider = 'postgresql';

// Define paths
const schemaTemplatePath = path.join(__dirname, '..', 'prisma', 'schema.template.prisma');
const schemaOutputPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

try {
  // Read the template
  let schemaTemplate = fs.readFileSync(schemaTemplatePath, 'utf8');
  
  console.log('📝 Generating PostgreSQL schema for production...');
  
  // Force PostgreSQL configuration
  let generatedSchema = schemaTemplate.replace('PROVIDER_PLACEHOLDER', databaseProvider);
  
  // Apply PostgreSQL-specific transformations
  generatedSchema = generatedSchema
    .replace(/createdAt DateTime @default\(now\(\)\)/g, 'created_at DateTime @default(now()) @db.Timestamptz(6)')
    .replace(/updatedAt DateTime @updatedAt/g, 'updated_at DateTime @updatedAt @db.Timestamptz(6)')
    // Add directUrl for Supabase connection pooling
    .replace(/url\s+= env\("DATABASE_URL"\)/g, 'url       = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")');
  
  // Write the generated schema
  fs.writeFileSync(schemaOutputPath, generatedSchema);
  
  console.log('✅ Production PostgreSQL schema generated successfully!');
  console.log('📄 Schema features:');
  console.log('   • Provider: postgresql');
  console.log('   • Field naming: snake_case (created_at, updated_at)');
  console.log('   • Timezone support: @db.Timestamptz(6)');
  console.log('   • Connection pooling: directUrl configured');
  console.log('');
  
} catch (error) {
  console.error('❌ Failed to generate production schema:', error.message);
  process.exit(1);
} 