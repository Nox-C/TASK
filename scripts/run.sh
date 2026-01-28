#!/bin/bash

echo "🤖 Starting WALL-E TASK Trading Bot..."

# Start Docker services if not running
docker-compose up -d

# Start API in background
echo "🚀 Starting API..."
cd apps/api
pnpm dev &
API_PID=$!
cd ../..

# Wait a bit for API to start
sleep 3

# Start Web
echo "🌐 Starting Web UI..."
cd apps/web
pnpm dev

# Cleanup on exit
trap "kill $API_PID" EXIT
