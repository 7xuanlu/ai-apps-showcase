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
    throw error
  }
}

/**
 * Enhanced error handling for database operations
 */
export async function connectWithRetry(maxRetries = 3, delay = 1000): Promise<void> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.$connect()
      console.log('✅ Database connected successfully')
      return
    } catch (error) {
      lastError = error as Error
      console.warn(`⚠️  Database connection attempt ${attempt}/${maxRetries} failed:`, error)
      
      if (attempt < maxRetries) {
        console.log(`🔄 Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        delay *= 2 // Exponential backoff
      }
    }
  }
  
  throw new Error(`Failed to connect to database after ${maxRetries} attempts. Last error: ${lastError?.message}`)
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

// Validate database connection on module load (only in production)
if (process.env.NODE_ENV === 'production') {
  connectWithRetry().catch(error => {
    console.error('❌ Critical: Failed to establish database connection on startup:', error)
    process.exit(1)
  })
}