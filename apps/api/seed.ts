import { PrismaClient } from './generated/prisma/index.js'

const prisma = new PrismaClient({
  accelerateUrl: 'prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19tbUZkX1I5MlgzcmRCSDhQV3IyS3QiLCJhcGlfa2V5IjoiMDFLRE1QNUIyS002QjFYQzYxQURYRlpYSEIiLCJ0ZW5hbnRfaWQiOiI3YTA2ZTNiYmI1ODk5NjE1MDVlNjJhNTJiNjBlZjc4OTI0YWRhYzVhZWVhZDgwYWUyNTEwNTAyMTljZTEwMTljIiwiaW50ZXJuYWxfc2VjcmV0IjoiODJkOGM3MzUtMWI4NC00ZjY5LWI0ZjAtMDQyYjJiNmUzNWEyIn0.TviZgN8tM01yAuyNu6SKheVRM2ovf9JI0dqVCaZoajM'
})

async function main() {
  // Create a test user
  const user = await prisma.user.create({
    data: {
      name: 'TASK Admin',
      email: 'admin@task.com',
    },
  })

  // Create a strategy
  const strategy = await prisma.strategy.create({
    data: {
      name: 'Simple Moving Average',
      description: 'Basic SMA trading strategy',
    },
  })

  // Create a bot
  const bot = await prisma.bot.create({
    data: {
      name: 'WALLe Bot #1',
      ownerId: user.id,
      strategyId: strategy.id,
      active: false,
    },
  })

  console.log('Seed data created:', { user, strategy, bot })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })