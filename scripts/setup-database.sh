#!/usr/bin/env bash
set -euo pipefail

echo "🔧 TASK Database Setup"
echo "====================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Must be run from the TASK root directory"
  exit 1
fi

# Check if docker is running
if ! docker info >/dev/null 2>&1; then
  echo "❌ Error: Docker is not running"
  exit 1
fi

echo "📦 Step 1: Starting PostgreSQL database..."
docker compose up -d db
echo "✅ Database container started"
echo ""

echo "⏳ Step 2: Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
  if docker compose exec -T db pg_isready -U postgres >/dev/null 2>&1; then
    echo "✅ PostgreSQL is ready"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "❌ Error: PostgreSQL failed to start within 30 seconds"
    exit 1
  fi
  sleep 1
done
echo ""

echo "🔨 Step 3: Running Prisma migrations..."
cd apps/api
pnpm prisma migrate deploy
echo "✅ Database schema is up to date"
echo ""

echo "🌱 Step 4: Generating Prisma Client..."
pnpm prisma generate
echo "✅ Prisma Client generated"
echo ""

echo "🎉 Database setup complete!"
echo ""
echo "📊 To view your database, run:"
echo "   cd apps/api && pnpm prisma studio"
echo ""
