const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient({
  accelerateUrl: 'prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19tbUZkX1I5MlgzcmRCSDhQV3IyS3QiLCJhcGlfa2V5IjoiMDFLRE1QNUIyS002QjFYQzYxQURYRlpYSEIiLCJ0ZW5hbnRfaWQiOiI3YTA2ZTNiYmI1ODk5NjE1MDVlNjJhNTJiNjBlZjc4OTI0YWRhYzVhZWVhZDgwYWUyNTEwNTAyMTljZTEwMTljIiwiaW50ZXJuYWxfc2VjcmV0IjoiODJkOGM3MzUtMWI4NC00ZjY5LWI0ZjAtMDQyYjJiNmUzNWEyIn0.TviZgN8tM01yAuyNu6SKheVRM2ovf9JI0dqVCaZoajM'
});

prisma.user.create({
  data: {
    name: 'Test User',
    email: 'test@task.com'
  }
}).then(console.log).finally(() => prisma.$disconnect());