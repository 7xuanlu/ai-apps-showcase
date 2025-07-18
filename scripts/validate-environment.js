#!/usr/bin/env node

/**
 * Environment Validation Script
 * 
 * This script can be run independently to validate environment configuration
 * without starting the full application. Useful for debugging and CI/CD.
 * 
 * Usage:
 *   node scripts/validate-environment.js
 *   npm run env:validate
 */

// Load environment variables first
require('dotenv').config({ path: '.env.local' })

/**
 * Detects the current environment from NODE_ENV
 */
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
      console.warn(`⚠️  Unknown NODE_ENV: "${nodeEnv}", defaulting to development`)
      return 'development'
  }
}

/**
 * Validates environment variables
 */
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
    
    if (id && !secret) {
      errors.push(`${idVar} is set but ${secretVar} is missing`)
    } else if (!id && secret) {
      errors.push(`${secretVar} is set but ${idVar} is missing`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`
}

function printHeader() {
  console.log(colorize('=' .repeat(60), 'cyan'))
  console.log(colorize('🔍 Environment Configuration Validator', 'bright'))
  console.log(colorize('=' .repeat(60), 'cyan'))
  console.log()
}

function printSeparator() {
  console.log(colorize('-'.repeat(60), 'blue'))
}

async function main() {
  printHeader()
  
  try {
    const env = detectEnvironment()
    console.log(colorize(`Environment: ${env}`, 'bright'))
    console.log(colorize(`Timestamp: ${new Date().toISOString()}`, 'blue'))
    console.log()
    
    printSeparator()
    console.log(colorize('🧪 Running Environment Validation...', 'bright'))
    console.log()
    
    // Run the validation
    const validation = validateEnvironmentVariables()
    
    // Print results
    if (validation.isValid) {
      console.log(colorize('✅ Environment validation PASSED', 'green'))
      
      if (validation.warnings.length > 0) {
        console.log()
        console.log(colorize('⚠️  Warnings:', 'yellow'))
        validation.warnings.forEach((warning, index) => {
          console.log(colorize(`  ${index + 1}. ${warning}`, 'yellow'))
        })
      }
    } else {
      console.log(colorize('❌ Environment validation FAILED', 'red'))
      console.log()
      console.log(colorize('Errors:', 'red'))
      validation.errors.forEach((error, index) => {
        console.log(colorize(`  ${index + 1}. ${error}`, 'red'))
      })
      
      if (validation.warnings.length > 0) {
        console.log()
        console.log(colorize('Warnings:', 'yellow'))
        validation.warnings.forEach((warning, index) => {
          console.log(colorize(`  ${index + 1}. ${warning}`, 'yellow'))
        })
      }
    }
    
    printSeparator()
    
    // Print environment variable summary
    console.log(colorize('📋 Environment Variables Summary:', 'bright'))
    console.log()
    
    const requiredVars = [
      'NODE_ENV',
      'DATABASE_PROVIDER', 
      'DATABASE_URL',
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET'
    ]
    
    const optionalVars = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GITHUB_CLIENT_ID',
      'GITHUB_CLIENT_SECRET'
    ]
    
    console.log(colorize('Required Variables:', 'bright'))
    requiredVars.forEach(varName => {
      const value = process.env[varName]
      const status = value ? colorize('✅ Set', 'green') : colorize('❌ Missing', 'red')
      const displayValue = value ? maskSensitiveValue(varName, value) : colorize('(not set)', 'red')
      console.log(`  ${varName}: ${status} - ${displayValue}`)
    })
    
    console.log()
    console.log(colorize('Optional Variables:', 'bright'))
    optionalVars.forEach(varName => {
      const value = process.env[varName]
      const status = value ? colorize('✅ Set', 'green') : colorize('⚪ Not set', 'blue')
      const displayValue = value ? maskSensitiveValue(varName, value) : colorize('(not set)', 'blue')
      console.log(`  ${varName}: ${status} - ${displayValue}`)
    })
    
    printSeparator()
    
    // Print recommendations
    console.log(colorize('💡 Recommendations:', 'bright'))
    console.log()
    
    if (env === 'development') {
      console.log(colorize('Development Environment:', 'cyan'))
      console.log('  • Use SQLite for faster local development')
      console.log('  • Set DATABASE_PROVIDER="sqlite" and DATABASE_URL="file:./dev.db"')
      console.log('  • Generate NEXTAUTH_SECRET with: openssl rand -base64 32')
      console.log('  • Use http://localhost:3000 for NEXTAUTH_URL')
    } else if (env === 'production') {
      console.log(colorize('Production Environment:', 'cyan'))
      console.log('  • Use PostgreSQL with Supabase for scalability')
      console.log('  • Set DATABASE_PROVIDER="postgresql"')
      console.log('  • Configure SUPABASE_URL and SUPABASE_ANON_KEY')
      console.log('  • Use HTTPS for NEXTAUTH_URL')
      console.log('  • Use a secure NEXTAUTH_SECRET (32+ characters)')
    }
    
    console.log()
    console.log(colorize('General:', 'cyan'))
    console.log('  • See .env.example for complete configuration reference')
    console.log('  • Never commit .env.local or production secrets to version control')
    console.log('  • Rotate secrets regularly in production')
    
    printSeparator()
    
    // Exit with appropriate code
    if (validation.isValid) {
      console.log(colorize('🎉 Validation completed successfully!', 'green'))
      process.exit(0)
    } else {
      console.log(colorize('💥 Validation failed. Please fix the errors above.', 'red'))
      process.exit(1)
    }
    
  } catch (error) {
    console.error(colorize('💥 Critical error during validation:', 'red'))
    console.error(error.message)
    
    if (process.env.NODE_ENV === 'development') {
      console.error()
      console.error(colorize('Stack trace (development only):', 'red'))
      console.error(error.stack)
    }
    
    process.exit(1)
  }
}

/**
 * Masks sensitive values for safe display
 */
function maskSensitiveValue(varName, value) {
  const sensitiveVars = ['SECRET', 'KEY', 'PASSWORD', 'TOKEN']
  
  if (sensitiveVars.some(sensitive => varName.includes(sensitive))) {
    if (value.length <= 8) {
      return '***'
    }
    return value.substring(0, 4) + '***' + value.substring(value.length - 4)
  }
  
  // For URLs, mask passwords
  if (varName.includes('URL') && value.includes('@')) {
    try {
      const url = new URL(value)
      if (url.password) {
        url.password = '***'
      }
      return url.toString()
    } catch {
      return value
    }
  }
  
  return value
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error(colorize('💥 Unhandled Promise Rejection:', 'red'))
  console.error(reason)
  process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(colorize('💥 Uncaught Exception:', 'red'))
  console.error(error.message)
  process.exit(1)
})

// Run the validation
main()