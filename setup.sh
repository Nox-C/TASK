#!/bin/bash

echo "🚀 Setting up TASK Control Panel MVP..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "📦 Installing dependencies..."
pnpm install

echo "🐘 Starting PostgreSQL database..."
cd infra/docker
docker-compose up -d
cd ../..

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

echo "🗄️ Running database migrations..."
cd apps/api
pnpm prisma migrate dev --name init
pnpm prisma generate
cd ../..

echo "🏗️ Building packages..."
pnpm build

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Start the API: pnpm dev:api"
echo "2. Start the web app: pnpm dev:web"
echo "3. Start the worker: pnpm dev:worker"
echo ""
echo "🌐 Access the app at: http://localhost:3000"
echo "📡 API available at: http://localhost:3001"