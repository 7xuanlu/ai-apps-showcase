import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')
  
  // Detect environment
  const nodeEnv = process.env.NODE_ENV || 'development'
  const databaseProvider = process.env.DATABASE_PROVIDER || 'sqlite'
  
  console.log(`   Environment: ${nodeEnv}`)
  console.log(`   Database: ${databaseProvider}`)
  console.log('')
  
  try {
    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' }
    })

    if (!existingUser) {
      // Create demo user
      console.log('👤 Creating demo user...')
      const hashedPassword = await bcrypt.hash('demo123', 10)
      
      await prisma.user.create({
        data: {
          name: 'Demo User',
          email: 'demo@example.com',
          password: hashedPassword,
        },
      })

      console.log('✅ Demo user created successfully')
    } else {
      console.log('ℹ️  Demo user already exists')
    }
    
    // Add additional seed data for development
    if (nodeEnv === 'development') {
      await seedDevelopmentData()
    }
    
    // Get final user count
    const userCount = await prisma.user.count()
    console.log(`📊 Total users in database: ${userCount}`)
    console.log('')
    console.log('✅ Database seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Database seeding failed:')
    console.error(`   ${error.message}`)
    throw error
  }
}

async function seedDevelopmentData() {
  console.log('🔧 Adding development-specific seed data...')
  
  // Check if test users already exist
  const testUsers = await prisma.user.findMany({
    where: {
      email: {
        startsWith: 'test'
      }
    }
  })
  
  if (testUsers.length === 0) {
    // Create additional test users for development
    const testUserData = [
      {
        name: 'Test User 1',
        email: 'test1@example.com',
        password: await bcrypt.hash('test123', 10)
      },
      {
        name: 'Test User 2', 
        email: 'test2@example.com',
        password: await bcrypt.hash('test123', 10)
      }
    ]
    
    for (const userData of testUserData) {
      await prisma.user.create({ data: userData })
      console.log(`   Created test user: ${userData.email}`)
    }
    
    console.log('✅ Development test users created')
  } else {
    console.log('ℹ️  Development test users already exist')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 