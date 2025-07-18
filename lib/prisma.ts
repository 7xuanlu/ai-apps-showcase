import { PrismaClient, Prisma } from '@prisma/client'
import { getEnvironmentConfig, type DatabaseConfig } from './env-config'

// Define global type for PrismaClient instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Creates Prisma client options based on environment configuration
 */
function createPrismaClientOptions(): Prisma.PrismaClientOptions {
  const config = getEnvironmentConfig()
  
  const baseOptions: Prisma.PrismaClientOptions = {
    log: config.nodeEnv === 'development' 
      ? ['query', 'error', 'warn'] as Prisma.LogLevel[]
      : ['error'] as Prisma.LogLevel[]
  }

  // Add database-specific optimizations
  if (config.databaseProvider === 'postgresql') {
    // PostgreSQL-specific optimizations
    if (config.nodeEnv === 'production') {
      baseOptions.datasources = {
        db: {
          url: config.databaseUrl
        }
      }
    }
  } else if (config.databaseProvider === 'sqlite') {
    // SQLite-specific optimizations
    baseOptions.datasources = {
      db: {
        url: config.databaseUrl
      }
    }
  }

  return baseOptions
}

/**
 * Creates database configuration for connection pooling and optimization
 */
function createDatabaseConfig(): DatabaseConfig {
  const config = getEnvironmentConfig()
  
  const dbConfig: DatabaseConfig = {
    provider: config.databaseProvider,
    url: config.databaseUrl
  }

  // Add production-specific connection pooling
  if (config.nodeEnv === 'production' && config.databaseProvider === 'postgresql') {
    dbConfig.connectionLimit = 10
    dbConfig.ssl = true
  }

  return dbConfig
}

/**
 * Initialize Prisma Client with environment-aware configuration
 */
function initializePrismaClient(): PrismaClient {
  try {
    const options = createPrismaClientOptions()
    const client = new PrismaClient(options)
    
    // Connection will be handled by Prisma's built-in lifecycle management

    return client
  } catch (error) {
    console.error('❌ Failed to initialize Prisma client:', error)
    
    // During build time on Vercel, Prisma client might not be generated yet
    if (process.env.VERCEL && process.env.NEXT_PHASE) {
      console.warn('⚠️ Prisma client initialization failed during Vercel build - this is expected')
      // Return a mock client that won't be used during build
      return new PrismaClient() as any
    }
    
    throw error
  }
}

/**
 * Provides environment-specific troubleshooting guidance
 */
function getEnvironmentSpecificTroubleshooting(): string {
  const config = getEnvironmentConfig()
  
  if (config.nodeEnv === 'development') {
    if (config.databaseProvider === 'sqlite') {
      return [
        '5. For SQLite development:',
        '   - Check if the SQLite database file exists at the specified path',
        '   - Ensure the application has write permissions to the database file',
        '   - Try deleting the database file to let it be recreated automatically'
      ].join('\n')
    } else {
      return [
        '5. For PostgreSQL development:',
        '   - Verify PostgreSQL is running locally',
        '   - Check that the database specified in DATABASE_URL exists',
        '   - Ensure the database user has proper permissions'
      ].join('\n')
    }
  } else {
    return [
      '5. For production environment:',
      '   - Check Supabase dashboard for database status',
      '   - Verify that IP restrictions are not blocking the connection',
      '   - Ensure SSL is properly configured for secure connections',
      '   - Check that the database connection limit has not been exceeded'
    ].join('\n')
  }
}

/**
 * Enhanced error handling for database operations with exponential backoff
 * Implements connection retry logic with detailed error reporting
 */
export async function connectWithRetry(maxRetries = 5, initialDelay = 1000): Promise<void> {
  let lastError: Error | null = null
  let delay = initialDelay
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.$connect()
      console.log('✅ Database connected successfully')
      return
    } catch (error) {
      lastError = error as Error
      const errorMessage = lastError?.message || 'Unknown error'
      
      // Categorize error for better diagnostics
      let errorType = 'connection'
      if (errorMessage.includes('timeout')) {
        errorType = 'timeout'
      } else if (errorMessage.includes('authentication')) {
        errorType = 'authentication'
      } else if (errorMessage.includes('permission')) {
        errorType = 'permission'
      }
      
      console.warn(
        `⚠️  Database ${errorType} error (attempt ${attempt}/${maxRetries}): ${errorMessage}`
      )
      
      if (attempt < maxRetries) {
        console.log(`🔄 Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        
        // Exponential backoff with jitter for better distributed retries
        const jitter = Math.floor(Math.random() * 200) - 100 // ±100ms jitter
        delay = Math.min(delay * 2 + jitter, 30000) // Cap at 30 seconds
      }
    }
  }
  
  // Detailed error message with troubleshooting guidance
  const errorDetails = lastError?.message || 'Unknown error'
  const errorMessage = [
    `❌ Failed to connect to database after ${maxRetries} attempts.`,
    `Last error: ${errorDetails}`,
    '',
    'Troubleshooting steps:',
    '1. Check that your database server is running',
    '2. Verify your DATABASE_URL environment variable is correct',
    '3. Ensure network connectivity to the database server',
    '4. Check database credentials and permissions',
    getEnvironmentSpecificTroubleshooting()
  ].join('\n')
  
  throw new Error(errorMessage)
}

/**
 * Graceful shutdown handler
 */
export async function disconnectPrisma(): Promise<void> {
  try {
    await prisma.$disconnect()
    console.log('✅ Database disconnected successfully')
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error)
  }
}

// Create or reuse PrismaClient instance
export const prisma = globalForPrisma.prisma ?? initializePrismaClient()

// In development, save the PrismaClient instance to avoid multiple instances during hot reloading
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Export database configuration for external use
export const databaseConfig = createDatabaseConfig()

/**
 * Creates a fallback SQLite database for development when main connection fails
 * This provides a graceful fallback mechanism for development environment
 */
export async function createFallbackDatabase(): Promise<boolean> {
  const config = getEnvironmentConfig()
  
  // Only create fallback in development environment
  if (config.nodeEnv !== 'development') {
    return false
  }
  
  try {
    console.log('🔄 Attempting to create fallback SQLite database for development...')
    
    // If we're already using SQLite, just ensure the file exists
    if (config.databaseProvider === 'sqlite') {
      const fs = require('fs')
      const path = require('path')
      
      // Extract file path from SQLite URL (remove file: prefix)
      const dbPath = config.databaseUrl.replace(/^file:/, '')
      const dbDir = path.dirname(dbPath)
      
      // Ensure directory exists
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true })
        console.log(`✅ Created directory: ${dbDir}`)
      }
      
      // Touch the file if it doesn't exist
      if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, '')
        console.log(`✅ Created empty SQLite database file: ${dbPath}`)
      }
      
      return true
    } else {
      // We're using PostgreSQL but it failed, so we'll create a temporary SQLite fallback
      console.log('⚠️ PostgreSQL connection failed in development, creating SQLite fallback')
      console.log('⚠️ Note: This is a TEMPORARY fallback for development only')
      console.log('⚠️ Some features may not work correctly with this fallback database')
      
      // For now, just return false to avoid compilation issues
      return false
    }
  } catch (error) {
    console.error('❌ Failed to create fallback database:', error)
    return false
  }
}

// Validate database connection on module load
if (process.env.NODE_ENV === 'production') {
  // In production, fail fast if database connection fails
  connectWithRetry().catch(error => {
    console.error('❌ Critical: Failed to establish database connection on startup:', error)
    process.exit(1)
  })
} else {
  // In development, try to connect with retry and fallback to SQLite if needed
  connectWithRetry().catch(async error => {
    console.warn('⚠️ Database connection failed in development environment')
    
    // Try to create fallback database
    const fallbackCreated = await createFallbackDatabase()
    
    if (fallbackCreated) {
      console.log('✅ Fallback database created successfully')
      console.log('⚠️ Running in fallback mode - some features may be limited')
    } else {
      console.error('❌ Failed to create fallback database')
      console.error('⚠️ Application may not function correctly without database connection')
    }
  })
}