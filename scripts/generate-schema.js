#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Command line arguments take precedence over environment variables
// This ensures that cross-env settings override .env.local
const cliDatabaseProvider = process.env.DATABASE_PROVIDER;

// Only load from .env.local if we don't have a provider from command line
if (!cliDatabaseProvider) {
  try {
    const envLocalPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envLocalPath)) {
      // Simple parsing of .env file without requiring dotenv
      const envContent = fs.readFileSync(envLocalPath, 'utf8');
      const envLines = envContent.split('\n');
      
      envLines.forEach(line => {
        // Skip comments and empty lines
        if (!line || line.startsWith('#')) return;
        
        // Parse key=value pairs
        const match = line.match(/^\s*([\w.-]+)\s*=\s*"?([^"]*)"?\s*$/);
        if (match) {
          const key = match[1];
          const value = match[2];
          // Don't override existing environment variables
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
      
      console.log('Loaded environment variables from .env.local');
    }
  } catch (error) {
    console.warn('Warning: Could not load .env.local file:', error.message);
  }
}

// Get the database provider from environment variable
const databaseProvider = process.env.DATABASE_PROVIDER || 'sqlite';

// Validate provider
if (!['sqlite', 'postgresql'].includes(databaseProvider)) {
  console.error('DATABASE_PROVIDER must be either "sqlite" or "postgresql"');
  process.exit(1);
}

// Read the base schema template
const schemaTemplatePath = path.join(__dirname, '..', 'prisma', 'schema.template.prisma');
const schemaOutputPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

try {
  let schemaTemplate = fs.readFileSync(schemaTemplatePath, 'utf8');
  
  // Replace the provider placeholder with the actual provider
  const generatedSchema = schemaTemplate.replace('PROVIDER_PLACEHOLDER', databaseProvider);
  
  // Write the generated schema
  fs.writeFileSync(schemaOutputPath, generatedSchema);
  
  console.log(`Generated Prisma schema with provider: ${databaseProvider}`);
  console.log(`Database URL format: ${databaseProvider === 'sqlite' ? 'file:./dev.db' : 'postgresql://user:password@host:port/database'}`);
} catch (error) {
  console.error('Error generating schema:', error.message);
  process.exit(1);
}