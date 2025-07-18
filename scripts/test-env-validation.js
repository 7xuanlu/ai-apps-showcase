#!/usr/bin/env node

/**
 * Test Environment Validation
 * 
 * This script tests the environment validation by temporarily modifying
 * environment variables to simulate various error conditions.
 */

// Load environment variables first
require('dotenv').config({ path: '.env.local' })

// Store original values
const originalEnv = { ...process.env }

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`
}

// Define validation function inline for testing
function validateEnvironmentVariables() {
  const errors = []
  const warnings = []
  const env = detectEnvironment()
  
  // Required variables for all environments
  const baseRequired = [
    'NODE_ENV',
    'DATABASE_PROVIDER',
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
  ]
  
  // Environment-specific required variables
  const envRequired = {
    development: [],
    production: ['SUPABASE_URL', 'SUPABASE_ANON_KEY'],
    test: []
  }
  
  // Check required variables
  const requiredVars = [...baseRequired, ...(envRequired[env] || [])]
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`)
    }
  }
  
  // Validate database configuration
  const provider = process.env.DATABASE_PROVIDER
  const url = process.env.DATABASE_URL
  
  if (provider && !['sqlite', 'postgresql'].includes(provider)) {
    errors.push(`Invalid DATABASE_PROVIDER: "${provider}". Must be "sqlite" or "postgresql"`)
  }
  
  if (provider === 'sqlite' && url && !url.startsWith('file:')) {
    errors.push(`SQLite DATABASE_URL must start with "file:" but got: "${url}"`)
  }
  
  if (provider === 'postgresql' && url && !url.startsWith('postgres')) {
    errors.push(`PostgreSQL DATABASE_URL must start with "postgres" but got: "${url.substring(0, 20)}..."`)
  }
  
  // Environment-specific validations
  if (env === 'development') {
    if (url?.includes('supabase.co')) {
      warnings.push('Using Supabase database URL in development. Consider using SQLite for faster local development.')
    }
    
    if (provider === 'postgresql' && !url?.includes('localhost')) {
      warnings.push('Using remote PostgreSQL in development. Consider SQLite for faster local development.')
    }
  }
  
  if (env === 'production') {
    if (url?.startsWith('file:')) {
      errors.push('Using SQLite (file: URL) in production is not recommended. Use PostgreSQL for production deployments.')
    }
    
    if (process.env.NEXTAUTH_URL?.includes('localhost')) {
      errors.push('NEXTAUTH_URL contains localhost in production. Use your actual production domain.')
    }
    
    if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
      errors.push('NEXTAUTH_SECRET is too short for production. Use at least 32 characters for security.')
    }
  }
  
  // OAuth validation
  const oauthPairs = [
    ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET']
  ]
  
  for (const [idVar, secretVar] of oauthPairs) {
    const id = process.env[idVar]
    const secret = process.env[secretVar]
    
    if ((id && !secret) || (!id && secret)) {
      errors.push(`OAuth configuration incomplete: Both ${idVar} and ${secretVar} are required, or neither should be set`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

function detectEnvironment() {
  const nodeEnv = process.env.NODE_ENV?.toLowerCase()
  
  switch (nodeEnv) {
    case 'development':
      return 'development'
    case 'production':
      return 'production'
    case 'test':
      return 'test'
    default:
      return 'development'
  }
}

function runTest(testName, setupFn, expectedResult) {
  console.log(colorize(`\n🧪 Test: ${testName}`, 'cyan'))
  console.log(colorize('-'.repeat(50), 'blue'))
  
  // Reset environment - clear all non-system variables first
  Object.keys(process.env).forEach(key => {
    // Keep system variables but clear our test variables
    if (!['PATH', 'HOME', 'USER', 'USERPROFILE', 'TEMP', 'TMP', 'APPDATA', 'LOCALAPPDATA', 'PROGRAMFILES', 'SYSTEMROOT', 'WINDIR'].includes(key)) {
      delete process.env[key]
    }
  })
  
  // Restore original environment
  Object.keys(originalEnv).forEach(key => {
    if (originalEnv[key] !== undefined) {
      process.env[key] = originalEnv[key]
    }
  })
  
  // Apply test setup
  setupFn()
  
  // Run validation
  const result = validateEnvironmentVariables()
  
  // Check result
  const passed = result.isValid === expectedResult.isValid &&
                 result.errors.length >= expectedResult.minErrors &&
                 result.warnings.length >= expectedResult.minWarnings
  
  console.log(`Status: ${result.isValid ? colorize('✅ Valid', 'green') : colorize('❌ Invalid', 'red')}`)
  console.log(`Errors: ${result.errors.length}`)
  console.log(`Warnings: ${result.warnings.length}`)
  
  if (result.errors.length > 0) {
    console.log(colorize('Errors:', 'red'))
    result.errors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`))
  }
  
  if (result.warnings.length > 0) {
    console.log(colorize('Warnings:', 'yellow'))
    result.warnings.forEach((warning, i) => console.log(`  ${i + 1}. ${warning}`))
  }
  
  console.log(`Test Result: ${passed ? colorize('✅ PASSED', 'green') : colorize('❌ FAILED', 'red')}`)
  
  return passed
}

async function main() {
  console.log(colorize('🔬 Environment Validation Test Suite', 'bright'))
  console.log(colorize('='.repeat(60), 'cyan'))
  
  const tests = []
  
  // Test 1: Valid development configuration
  tests.push(runTest(
    'Valid Development Configuration',
    () => {
      process.env.NODE_ENV = 'development'
      process.env.DATABASE_PROVIDER = 'sqlite'
      process.env.DATABASE_URL = 'file:./dev.db'
      process.env.NEXTAUTH_URL = 'http://localhost:3000'
      process.env.NEXTAUTH_SECRET = 'development-secret-key-12345678'
    },
    { isValid: true, minErrors: 0, minWarnings: 0 }
  ))
  
  // Test 2: Missing required variables
  tests.push(runTest(
    'Missing Required Variables',
    () => {
      process.env.NODE_ENV = 'development'
      delete process.env.DATABASE_URL
      delete process.env.NEXTAUTH_SECRET
    },
    { isValid: false, minErrors: 2, minWarnings: 0 }
  ))
  
  // Test 3: Invalid database provider
  tests.push(runTest(
    'Invalid Database Provider',
    () => {
      process.env.NODE_ENV = 'development'
      process.env.DATABASE_PROVIDER = 'mysql'
      process.env.DATABASE_URL = 'mysql://localhost/test'
      process.env.NEXTAUTH_URL = 'http://localhost:3000'
      process.env.NEXTAUTH_SECRET = 'development-secret-key-12345678'
    },
    { isValid: false, minErrors: 1, minWarnings: 0 }
  ))
  
  // Test 4: SQLite with wrong URL format
  tests.push(runTest(
    'SQLite with Wrong URL Format',
    () => {
      process.env.NODE_ENV = 'development'
      process.env.DATABASE_PROVIDER = 'sqlite'
      process.env.DATABASE_URL = 'sqlite://./dev.db'
      process.env.NEXTAUTH_URL = 'http://localhost:3000'
      process.env.NEXTAUTH_SECRET = 'development-secret-key-12345678'
    },
    { isValid: false, minErrors: 1, minWarnings: 0 }
  ))
  
  // Test 5: Production with SQLite (should error)
  tests.push(runTest(
    'Production with SQLite',
    () => {
      process.env.NODE_ENV = 'production'
      process.env.DATABASE_PROVIDER = 'sqlite'
      process.env.DATABASE_URL = 'file:./prod.db'
      process.env.NEXTAUTH_URL = 'https://myapp.com'
      process.env.NEXTAUTH_SECRET = 'production-secret-key-very-long-and-secure'
      process.env.SUPABASE_URL = 'https://project.supabase.co'
      process.env.SUPABASE_ANON_KEY = 'anon-key'
    },
    { isValid: false, minErrors: 1, minWarnings: 0 }
  ))
  
  // Test 6: Production with localhost URL (should error)
  tests.push(runTest(
    'Production with Localhost URL',
    () => {
      process.env.NODE_ENV = 'production'
      process.env.DATABASE_PROVIDER = 'postgresql'
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost/db'
      process.env.NEXTAUTH_URL = 'http://localhost:3000'
      process.env.NEXTAUTH_SECRET = 'short'
      process.env.SUPABASE_URL = 'https://project.supabase.co'
      process.env.SUPABASE_ANON_KEY = 'anon-key'
    },
    { isValid: false, minErrors: 2, minWarnings: 0 }
  ))
  
  // Test 7: Incomplete OAuth configuration
  tests.push(runTest(
    'Incomplete OAuth Configuration',
    () => {
      process.env.NODE_ENV = 'development'
      process.env.DATABASE_PROVIDER = 'sqlite'
      process.env.DATABASE_URL = 'file:./dev.db'
      process.env.NEXTAUTH_URL = 'http://localhost:3000'
      process.env.NEXTAUTH_SECRET = 'development-secret-key-12345678'
      process.env.GOOGLE_CLIENT_ID = 'client-id'
      // Explicitly delete GOOGLE_CLIENT_SECRET to test incomplete config
      delete process.env.GOOGLE_CLIENT_SECRET
      delete process.env.GITHUB_CLIENT_ID
      delete process.env.GITHUB_CLIENT_SECRET
    },
    { isValid: false, minErrors: 1, minWarnings: 0 }
  ))
  
  // Test 8: Development with Supabase URL (should warn)
  tests.push(runTest(
    'Development with Supabase URL',
    () => {
      process.env.NODE_ENV = 'development'
      process.env.DATABASE_PROVIDER = 'postgresql'
      process.env.DATABASE_URL = 'postgresql://user:pass@db.supabase.co/postgres'
      process.env.NEXTAUTH_URL = 'http://localhost:3000'
      process.env.NEXTAUTH_SECRET = 'development-secret-key-12345678'
    },
    { isValid: true, minErrors: 0, minWarnings: 1 }
  ))
  
  // Summary
  const passedTests = tests.filter(Boolean).length
  const totalTests = tests.length
  
  console.log(colorize('\n📊 Test Summary', 'bright'))
  console.log(colorize('='.repeat(60), 'cyan'))
  console.log(`Total Tests: ${totalTests}`)
  console.log(`Passed: ${colorize(passedTests, 'green')}`)
  console.log(`Failed: ${colorize(totalTests - passedTests, 'red')}`)
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`)
  
  if (passedTests === totalTests) {
    console.log(colorize('\n🎉 All tests passed!', 'green'))
    process.exit(0)
  } else {
    console.log(colorize('\n💥 Some tests failed!', 'red'))
    process.exit(1)
  }
}

// Restore original environment on exit
process.on('exit', () => {
  Object.keys(process.env).forEach(key => {
    if (!originalEnv[key]) {
      delete process.env[key]
    } else {
      process.env[key] = originalEnv[key]
    }
  })
})

main().catch(error => {
  console.error(colorize('💥 Test suite failed:', 'red'))
  console.error(error)
  process.exit(1)
})