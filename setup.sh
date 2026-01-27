#!/bin/bash

echo "🤖 Setting up WALL-E TASK Trading Bot..."

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for database
echo "⏳ Waiting for database..."
sleep 5

# Setup database
echo "🗄️ Setting up database..."
cd packages/database
pnpm db:push
cd ../..

# Seed initial data
echo "🌱 Seeding initial data..."
node scripts/seed.js

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application, run:"
echo "   pnpm dev:api    (in terminal 1)"
echo "   pnpm dev:web    (in terminal 2)"
echo ""
echo "Then open: http://localhost:3001/automation"
