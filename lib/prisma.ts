import { PrismaClient } from '@prisma/client'

// Define global type for PrismaClient instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configure Prisma Client with logging options based on environment
const prismaClientOptions = process.env.NODE_ENV === 'development' 
  ? {
      log: ['query', 'error', 'warn'],
    }
  : {
      log: ['error'],
    }

// Create or reuse PrismaClient instance
export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions)

// In development, save the PrismaClient instance to avoid multiple instances during hot reloading
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma