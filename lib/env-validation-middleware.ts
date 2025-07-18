/**
 * Environment Variable Validation Middleware
 * 
 * This middleware validates all required environment variables at application startup
 * and provides clear error reporting for missing or invalid variables.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getEnvironmentConfig, detectEnvironment } from './env-config'

// Track if startup validation has been performed
let startupValidationPerformed = false

// Environment variable validation status
let validationStatus: {
  isValid: boolean
  errors: string[]
  warnings: string[]
} = {
  isValid: false,
  errors: [],
  warnings: []
}

/**
 * Validates environment variables and caches the validation result
 */
export function validateEnvironmentVariables(): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  // Return cached result if already validated
  if (validationStatus.isValid || validationStatus.errors.length > 0) {
    return validationStatus
  }

  const errors: string[] = []
  const warnings: string[] = []
  const env = detectEnvironment()

  try {
    // Attempt to load environment config
    getEnvironmentConfig()
    
    // Check for development variables in production
    if (env === 'production') {
      // Check for development-only variables that shouldn't be in production
      if (process.env.DATABASE_PROVIDER === 'sqlite') {
        warnings.push('Using SQLite in production is not recommended. Consider using PostgreSQL for better performance and scalability.')
      }
      
      // Check for insecure or default secrets
      if (process.env.NEXTAUTH_SECRET && 
          (process.env.NEXTAUTH_SECRET.includes('development') || 
           process.env.NEXTAUTH_SECRET === 'MrbVExKCIM00jDrY37PLq4UFXoYqn4PllXx45L26jyg=')) {
        errors.push('Using development NEXTAUTH_SECRET in production. Generate a new secure secret for production.')
      }
    }
    
    // Check for production variables in development
    if (env === 'development') {
      // Warn about unnecessary production variables in development
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        warnings.push('SUPABASE_SERVICE_ROLE_KEY is set in development environment but only needed in production.')
      }
    }
    
    // Validate database URL format
    const databaseUrl = process.env.DATABASE_URL
    const databaseProvider = process.env.DATABASE_PROVIDER
    
    if (databaseUrl && databaseProvider) {
      if (databaseProvider === 'sqlite' && !databaseUrl.startsWith('file:')) {
        errors.push(`Invalid SQLite DATABASE_URL: "${databaseUrl}". Must start with "file:".`)
      } else if (databaseProvider === 'postgresql' && !databaseUrl.startsWith('postgres')) {
        errors.push(`Invalid PostgreSQL DATABASE_URL: "${databaseUrl}". Must start with "postgres".`)
      }
    }
    
    // Validate NextAuth URL format
    const nextAuthUrl = process.env.NEXTAUTH_URL
    if (nextAuthUrl) {
      try {
        new URL(nextAuthUrl)
      } catch (e) {
        errors.push(`Invalid NEXTAUTH_URL: "${nextAuthUrl}". Must be a valid URL.`)
      }
    }
    
    // Update validation status
    validationStatus = {
      isValid: errors.length === 0,
      errors,
      warnings
    }
    
    return validationStatus
  } catch (error) {
    // Catch any errors from the environment config loading
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    validationStatus = {
      isValid: false,
      errors: [errorMessage],
      warnings
    }
    
    return validationStatus
  }
}

/**
 * Middleware to validate environment variables during request processing
 */
export function envValidationMiddleware(
  request: NextRequest
): NextResponse | undefined {
  // Skip validation for specific paths
  if (shouldSkipValidation(request.nextUrl.pathname)) {
    return
  }

  // Skip validation if we're already on the error page to prevent redirect loops
  if (request.nextUrl.pathname.startsWith('/env-error')) {
    return
  }

  const validation = validateEnvironmentConfiguration()
  
  // If validation fails, redirect to error page with details
  if (!validation.isValid) {
    console.error('🚨 Runtime environment validation failed')
    validation.errors.forEach(error => console.error(`  - ${error}`))
    
    // For security, only show detailed errors in development
    if (process.env.NODE_ENV === 'development') {
      const searchParams = new URLSearchParams()
      searchParams.set('errors', JSON.stringify(validation.errors))
      searchParams.set('warnings', JSON.stringify(validation.warnings))
      searchParams.set('timestamp', new Date().toISOString())
      
      return NextResponse.redirect(
        new URL(`/env-error?${searchParams.toString()}`, request.url)
      )
    } else {
      // In production, show generic error without sensitive details
      const searchParams = new URLSearchParams()
      searchParams.set('production', 'true')
      searchParams.set('timestamp', new Date().toISOString())
      
      return NextResponse.redirect(
        new URL(`/env-error?${searchParams.toString()}`, request.url)
      )
    }
  }
  
  // If there are only warnings, log them but continue
  if (validation.warnings.length > 0 && !hasLoggedWarnings) {
    console.warn('⚠️ Runtime environment configuration warnings:')
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`))
    hasLoggedWarnings = true // Prevent spam in logs
  }
  
  // Continue with the request if validation passes
  return
}

// Track if warnings have been logged to prevent spam
let hasLoggedWarnings = false

/**
 * Determines if validation should be skipped for a given path
 */
function shouldSkipValidation(pathname: string): boolean {
  const skipPatterns = [
    '/_next/',           // Next.js static assets
    '/api/',             // API routes (handle their own validation)
    '/favicon.ico',      // Favicon
    '/robots.txt',       // Robots file
    '/sitemap.xml',      // Sitemap
    '/.well-known/',     // Well-known URIs
  ]
  
  // Skip for static file extensions
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot']
  if (staticExtensions.some(ext => pathname.endsWith(ext))) {
    return true
  }
  
  // Skip for specific patterns
  return skipPatterns.some(pattern => pathname.startsWith(pattern))
}

/**
 * Performs comprehensive startup validation of environment variables
 * This should be called when the application starts up
 */
export function performStartupValidation(): void {
  // Only perform startup validation once
  if (startupValidationPerformed) {
    return
  }

  const env = detectEnvironment()
  console.log(`🚀 Starting application in ${env} mode...`)
  console.log(`📅 Validation timestamp: ${new Date().toISOString()}`)
  
  try {
    // Perform comprehensive validation
    const validation = validateEnvironmentConfiguration()
    
    // Always log the validation summary
    logValidationSummary(env, validation)
    
    if (!validation.isValid) {
      console.error('\n❌ Environment validation failed at startup:')
      validation.errors.forEach((error, index) => {
        console.error(`  ${index + 1}. ${error}`)
      })
      
      if (validation.warnings.length > 0) {
        console.warn('\n⚠️ Environment warnings:')
        validation.warnings.forEach((warning, index) => {
          console.warn(`  ${index + 1}. ${warning}`)
        })
      }
      
      // Provide detailed troubleshooting guidance
      logTroubleshootingGuidance(env)
      
      // Environment-specific error handling
      handleStartupValidationFailure(env, validation)
    } else {
      console.log('\n✅ Environment validation passed successfully')
      
      // Log warnings even if validation passes
      if (validation.warnings.length > 0) {
        console.warn('\n⚠️ Environment configuration warnings:')
        validation.warnings.forEach((warning, index) => {
          console.warn(`  ${index + 1}. ${warning}`)
        })
        
        // Provide guidance for warnings
        console.warn('\n💡 Consider addressing these warnings for optimal configuration.')
      }
      
      // Log detailed configuration summary
      logConfigurationSummary()
    }
    
    startupValidationPerformed = true
  } catch (error) {
    console.error('\n❌ Critical error during environment validation:')
    console.error(error instanceof Error ? error.message : String(error))
    
    // Provide stack trace in development for debugging
    if (env === 'development' && error instanceof Error && error.stack) {
      console.error('\n🔍 Stack trace (development only):')
      console.error(error.stack)
    }
    
    console.error('\n🛑 Application cannot start due to critical environment configuration error.')
    console.error('Please fix the configuration issues and restart the application.')
    process.exit(1)
  }
}

/**
 * Logs a comprehensive validation summary
 */
function logValidationSummary(env: string, validation: { isValid: boolean; errors: string[]; warnings: string[] }): void {
  console.log('\n📋 Environment Validation Summary:')
  console.log(`   Environment: ${env}`)
  console.log(`   Status: ${validation.isValid ? '✅ Valid' : '❌ Invalid'}`)
  console.log(`   Errors: ${validation.errors.length}`)
  console.log(`   Warnings: ${validation.warnings.length}`)
}

/**
 * Logs detailed troubleshooting guidance based on environment
 */
function logTroubleshootingGuidance(env: string): void {
  console.error('\n💡 Troubleshooting Guide:')
  
  if (env === 'development') {
    console.error('   Development Environment:')
    console.error('   1. Check your .env.local file exists and contains required variables')
    console.error('   2. Copy .env.example to .env.local if it doesn\'t exist')
    console.error('   3. Generate NEXTAUTH_SECRET: openssl rand -base64 32')
    console.error('   4. Ensure DATABASE_PROVIDER="sqlite" for local development')
    console.error('   5. Set DATABASE_URL="file:./dev.db" for SQLite')
    console.error('   6. Restart the development server after making changes')
  } else if (env === 'production') {
    console.error('   Production Environment:')
    console.error('   1. Verify all environment variables are set in Vercel dashboard')
    console.error('   2. Ensure DATABASE_PROVIDER="postgresql" for production')
    console.error('   3. Set DATABASE_URL to your Supabase connection string')
    console.error('   4. Configure SUPABASE_URL and SUPABASE_ANON_KEY')
    console.error('   5. Set NEXTAUTH_URL to your production domain')
    console.error('   6. Use a secure NEXTAUTH_SECRET (not development value)')
    console.error('   7. Redeploy after updating environment variables')
  }
  
  console.error('\n   General:')
  console.error('   - See .env.example for complete variable reference')
  console.error('   - Ensure no typos in variable names')
  console.error('   - Check for trailing spaces in variable values')
  console.error('   - Verify URL formats are correct')
}

/**
 * Handles startup validation failure based on environment
 */
function handleStartupValidationFailure(env: string, validation: { errors: string[]; warnings: string[] }): void {
  if (env === 'development') {
    // In development, be more lenient but still fail on critical errors
    const criticalErrors = validation.errors.filter(error => 
      error.includes('DATABASE_URL') || 
      error.includes('NEXTAUTH_SECRET') ||
      error.includes('DATABASE_PROVIDER')
    )
    
    if (criticalErrors.length > 0) {
      console.error('\n🛑 Critical configuration errors detected.')
      console.error('   Development server cannot start with these errors.')
      console.error('   Please fix the critical issues and restart.')
      process.exit(1)
    } else if (validation.errors.length > 0) {
      console.warn('\n⚠️ Non-critical configuration errors detected.')
      console.warn('   Development server will continue but some features may not work.')
      console.warn('   Consider fixing these issues for full functionality.')
    }
  } else if (env === 'production') {
    // In production, any validation error should stop the application
    console.error('\n🛑 Production application cannot start with configuration errors.')
    console.error('   All environment variables must be properly configured for production.')
    console.error('   Please fix all issues and redeploy.')
    process.exit(1)
  } else {
    // Test environment or unknown - be strict
    console.error('\n🛑 Application cannot start due to environment configuration errors.')
    process.exit(1)
  }
}

/**
 * Logs detailed configuration summary
 */
function logConfigurationSummary(): void {
  try {
    const config = getEnvironmentConfig()
    
    console.log('\n📊 Configuration Summary:')
    console.log(`   Environment: ${config.nodeEnv}`)
    console.log(`   Database: ${config.databaseProvider}`)
    
    // Safely log database URL (mask sensitive parts)
    const maskedDbUrl = maskSensitiveUrl(config.databaseUrl)
    console.log(`   Database URL: ${maskedDbUrl}`)
    
    console.log(`   Auth URL: ${config.nextAuthUrl}`)
    console.log(`   Auth Secret: ${config.nextAuthSecret ? '✅ Configured' : '❌ Missing'}`)
    
    if (config.supabaseConfig) {
      console.log('   Supabase: ✅ Configured')
      console.log(`   Supabase URL: ${config.supabaseConfig.url}`)
      console.log(`   Supabase Keys: ${config.supabaseConfig.anonKey ? '✅' : '❌'} Anon, ${config.supabaseConfig.serviceRoleKey ? '✅' : '❌'} Service`)
    } else {
      console.log('   Supabase: ❌ Not configured')
    }
    
    if (config.oauthProviders) {
      const providers = Object.keys(config.oauthProviders)
      console.log(`   OAuth Providers: ${providers.join(', ')}`)
      
      providers.forEach(provider => {
        const providerConfig = config.oauthProviders![provider as keyof typeof config.oauthProviders]
        if (providerConfig) {
          console.log(`   ${provider.toUpperCase()}: ✅ Client ID configured`)
        }
      })
    } else {
      console.log('   OAuth Providers: ❌ None configured')
    }
    
  } catch (error) {
    console.warn('   ⚠️ Could not load full configuration summary')
  }
}

/**
 * Masks sensitive information in URLs for safe logging
 */
function maskSensitiveUrl(url: string): string {
  try {
    if (url.startsWith('file:')) {
      return url // File URLs are safe to show
    }
    
    const urlObj = new URL(url)
    if (urlObj.password) {
      urlObj.password = '***'
    }
    if (urlObj.username && urlObj.username !== 'postgres') {
      urlObj.username = urlObj.username.substring(0, 3) + '***'
    }
    return urlObj.toString()
  } catch {
    // If URL parsing fails, just mask the middle part
    if (url.length > 20) {
      return url.substring(0, 10) + '***' + url.substring(url.length - 10)
    }
    return '***'
  }
}

/**
 * Enhanced validation with comprehensive development vs production checks
 */
function validateEnvironmentConfiguration(): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const validation = validateEnvironmentVariables()
  const env = detectEnvironment()
  
  // Development environment specific checks
  if (env === 'development') {
    validateDevelopmentConfiguration(validation)
  }
  
  // Production environment specific checks
  if (env === 'production') {
    validateProductionConfiguration(validation)
  }
  
  // Cross-environment consistency checks
  validateCrossEnvironmentConsistency(validation, env)
  
  return validation
}

/**
 * Validates development-specific configuration
 */
function validateDevelopmentConfiguration(validation: { errors: string[]; warnings: string[] }): void {
  // Check for production-like configurations in development
  if (process.env.DATABASE_URL?.includes('supabase.co')) {
    validation.warnings.push('Using Supabase database URL in development. Consider using SQLite for faster local development and offline capability.')
  }
  
  // Check for missing development conveniences
  if (process.env.DATABASE_PROVIDER === 'postgresql' && !process.env.DATABASE_URL?.includes('localhost')) {
    validation.warnings.push('Using remote PostgreSQL in development. Consider SQLite for faster local development.')
  }
  
  // Check for overly complex development setup
  if (process.env.SUPABASE_URL && process.env.DATABASE_PROVIDER === 'sqlite') {
    validation.warnings.push('SUPABASE_URL is configured but DATABASE_PROVIDER is sqlite. This configuration may be unnecessary for development.')
  }
  
  // Check for missing .env.local file indicators
  if (!process.env.DATABASE_URL?.startsWith('file:') && process.env.DATABASE_PROVIDER === 'sqlite') {
    validation.warnings.push('DATABASE_PROVIDER is sqlite but DATABASE_URL doesn\'t start with "file:". Check your .env.local configuration.')
  }
  
  // Check for development-specific OAuth setup
  if (process.env.NEXTAUTH_URL?.includes('localhost:3000')) {
    // This is expected in development, but warn about OAuth callback URLs
    if (process.env.GOOGLE_CLIENT_ID || process.env.GITHUB_CLIENT_ID) {
      validation.warnings.push('OAuth providers configured with localhost. Ensure OAuth callback URLs are set to http://localhost:3000/api/auth/callback/[provider].')
    }
  }
  
  // Check for production secrets in development
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length > 50) {
    validation.warnings.push('NEXTAUTH_SECRET appears to be a production-grade secret. You can use a simpler secret for development.')
  }
  
  // Check for missing development database file
  if (process.env.DATABASE_URL?.startsWith('file:')) {
    const dbPath = process.env.DATABASE_URL.replace('file:', '')
    validation.warnings.push(`SQLite database will be created at: ${dbPath}. Run database migrations if this is a new setup.`)
  }
}

/**
 * Validates production-specific configuration
 */
function validateProductionConfiguration(validation: { errors: string[]; warnings: string[] }): void {
  // Check for development configurations in production
  if (process.env.DATABASE_URL?.startsWith('file:')) {
    validation.errors.push('Using SQLite (file: URL) in production is not recommended. Use PostgreSQL with Supabase for production deployments.')
  }
  
  // Check for localhost URLs in production
  if (process.env.NEXTAUTH_URL?.includes('localhost')) {
    validation.errors.push('NEXTAUTH_URL contains localhost in production. Use your actual production domain (e.g., https://yourdomain.com).')
  }
  
  // Check for development secrets in production
  if (process.env.NEXTAUTH_SECRET === 'development-secret' || 
      process.env.NEXTAUTH_SECRET?.includes('dev') ||
      process.env.NEXTAUTH_SECRET?.includes('test')) {
    validation.errors.push('Using development NEXTAUTH_SECRET in production. Generate a secure secret with: openssl rand -base64 32')
  }
  
  // Check for missing production optimizations
  if (!process.env.SUPABASE_URL && process.env.DATABASE_PROVIDER === 'postgresql') {
    validation.warnings.push('Using PostgreSQL without Supabase configuration. Ensure your PostgreSQL setup is production-ready with proper connection pooling and SSL.')
  }
  
  // Check for insecure production settings
  if (process.env.NODE_ENV !== 'production') {
    validation.warnings.push(`NODE_ENV is "${process.env.NODE_ENV}" but should be "production" for production deployments.`)
  }
  
  // Check for missing Supabase configuration in production
  if (process.env.DATABASE_PROVIDER === 'postgresql' && process.env.DATABASE_URL?.includes('supabase.co')) {
    if (!process.env.SUPABASE_URL) {
      validation.errors.push('Using Supabase database but SUPABASE_URL is not configured. This is required for Supabase integration.')
    }
    if (!process.env.SUPABASE_ANON_KEY) {
      validation.errors.push('Using Supabase database but SUPABASE_ANON_KEY is not configured. This is required for Supabase client operations.')
    }
  }
  
  // Check for OAuth configuration in production
  if (process.env.GOOGLE_CLIENT_ID || process.env.GITHUB_CLIENT_ID) {
    if (process.env.NEXTAUTH_URL?.includes('localhost')) {
      validation.errors.push('OAuth providers configured but NEXTAUTH_URL points to localhost. Update OAuth callback URLs to production domain.')
    }
  }
  
  // Check for weak secrets
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    validation.errors.push('NEXTAUTH_SECRET is too short for production. Use at least 32 characters for security.')
  }
  
  // Check for HTTP URLs in production
  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.startsWith('https://')) {
    validation.errors.push('NEXTAUTH_URL should use HTTPS in production for security.')
  }
}

/**
 * Validates cross-environment consistency
 */
function validateCrossEnvironmentConsistency(validation: { errors: string[]; warnings: string[] }, env: string): void {
  // Check database provider and URL consistency
  const provider = process.env.DATABASE_PROVIDER
  const url = process.env.DATABASE_URL
  
  if (provider && url) {
    if (provider === 'sqlite' && !url.startsWith('file:')) {
      validation.errors.push(`DATABASE_PROVIDER is "sqlite" but DATABASE_URL doesn't start with "file:". Got: ${url}`)
    }
    
    if (provider === 'postgresql' && !url.startsWith('postgres')) {
      validation.errors.push(`DATABASE_PROVIDER is "postgresql" but DATABASE_URL doesn't start with "postgres". Got: ${url.substring(0, 20)}...`)
    }
  }
  
  // Check OAuth provider consistency
  const googleId = process.env.GOOGLE_CLIENT_ID
  const googleSecret = process.env.GOOGLE_CLIENT_SECRET
  const githubId = process.env.GITHUB_CLIENT_ID
  const githubSecret = process.env.GITHUB_CLIENT_SECRET
  
  if ((googleId && !googleSecret) || (!googleId && googleSecret)) {
    validation.errors.push('Google OAuth configuration incomplete. Both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required.')
  }
  
  if ((githubId && !githubSecret) || (!githubId && githubSecret)) {
    validation.errors.push('GitHub OAuth configuration incomplete. Both GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are required.')
  }
  
  // Check for environment variable naming consistency
  const envVars = Object.keys(process.env)
  const suspiciousVars = envVars.filter(name => 
    name.includes('_') && 
    (name.toLowerCase().includes('secret') || name.toLowerCase().includes('key')) &&
    !['NEXTAUTH_SECRET', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'GOOGLE_CLIENT_SECRET', 'GITHUB_CLIENT_SECRET'].includes(name)
  )
  
  if (suspiciousVars.length > 0) {
    validation.warnings.push(`Found additional environment variables that may contain secrets: ${suspiciousVars.join(', ')}. Ensure these are properly configured.`)
  }
  
  // Check for common typos in environment variable names
  const commonTypos = [
    { correct: 'DATABASE_URL', typos: ['DATABSE_URL', 'DATABASE_URI', 'DB_URL'] },
    { correct: 'NEXTAUTH_SECRET', typos: ['NEXT_AUTH_SECRET', 'NEXTAUTH_KEY'] },
    { correct: 'NEXTAUTH_URL', typos: ['NEXT_AUTH_URL', 'NEXTAUTH_URI'] },
    { correct: 'SUPABASE_URL', typos: ['SUPABASE_URI', 'SUPA_BASE_URL'] },
  ]
  
  commonTypos.forEach(({ correct, typos }) => {
    typos.forEach(typo => {
      if (process.env[typo]) {
        validation.errors.push(`Found "${typo}" but expected "${correct}". Check for typos in environment variable names.`)
      }
    })
  })
}

/**
 * Helper function to format validation errors for display
 */
export function formatValidationErrors(): string {
  const validation = validateEnvironmentConfiguration()
  
  if (validation.isValid && validation.warnings.length === 0) {
    return 'Environment configuration is valid.'
  }
  
  const messages: string[] = []
  
  if (validation.errors.length > 0) {
    messages.push('## Environment Configuration Errors')
    validation.errors.forEach(error => {
      messages.push(`- ${error}`)
    })
  }
  
  if (validation.warnings.length > 0) {
    messages.push('\n## Environment Configuration Warnings')
    validation.warnings.forEach(warning => {
      messages.push(`- ${warning}`)
    })
  }
  
  messages.push('\n## Troubleshooting')
  messages.push('- Check your .env.local file for development')
  messages.push('- Verify Vercel environment variables for production')
  messages.push('- See .env.example for required variables')
  
  return messages.join('\n')
}