import { defineConfig } from 'prisma/config'

export default defineConfig({
  datasource: {
    databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres'
  }
})