#!/bin/bash

echo "🚀 Starting TASK Control Panel in development mode..."

# Start all services in parallel
echo "Starting API server..."
pnpm dev:api &
API_PID=$!

echo "Starting web application..."
pnpm dev:web &
WEB_PID=$!

echo "Starting worker..."
pnpm dev:worker &
WORKER_PID=$!

echo ""
echo "✅ All services started!"
echo "🌐 Web app: http://localhost:3000"
echo "📡 API: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt signal
trap 'echo "Stopping services..."; kill $API_PID $WEB_PID $WORKER_PID; exit' INT
wait