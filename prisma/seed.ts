import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Check if demo user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'demo@example.com' }
  })

  if (!existingUser) {
    // Create demo user
    const hashedPassword = await bcrypt.hash('demo123', 10)
    
    await prisma.user.create({
      data: {
        name: 'Demo User',
        email: 'demo@example.com',
        password: hashedPassword,
      },
    })

    console.log('Demo user created successfully')
  } else {
    console.log('Demo user already exists')
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