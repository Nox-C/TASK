#!/bin/bash

# WALL-E Trading Dashboard - Render Deployment Script
# EVE Red Eye Production Deployment

echo "🤖 WALL-E DEPLOYMENT INITIATED..."
echo "🔧 EVE Red Eye System: ACTIVATED"

# Check if we're in production environment
if [ "$NODE_ENV" = "production" ]; then
    echo "✅ Production Environment Detected"
    echo "🌐 Deploying to Render Free Tier"
else
    echo "⚠️  Development Environment - Use for testing only"
fi

# Install dependencies with pnpm
echo "📦 Installing dependencies with pnpm..."
pnpm install

if [ $? -ne 0 ]; then
    echo "❌ pnpm install failed - EVE Red Eye Activated"
    exit 1
fi

# Build the application
echo "🔨 Building Production Bundle..."
pnpm run build

if [ $? -eq 0 ]; then
    echo "✅ Build Successful - EVE Systems Online"
else
    echo "❌ Build Failed - EVE Red Eye Activated"
    exit 1
fi

# Environment Variables Check
echo "🔍 Checking Environment Configuration..."

if [ -z "$NEXT_PUBLIC_API_URL" ]; then
    echo "⚠️  NEXT_PUBLIC_API_URL not set - Using default"
fi

if [ -z "$NEXT_PUBLIC_WS_URL" ]; then
    echo "⚠️  NEXT_PUBLIC_WS_URL not set - Using default"
fi

if [ -z "$NEXT_PUBLIC_WS_ENDPOINT" ]; then
    echo "⚠️  NEXT_PUBLIC_WS_ENDPOINT not set - Using Binance default"
fi

echo "🚀 Ready for Render Deployment!"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Push to GitHub repository"
echo "2. Connect to Render dashboard"
echo "3. Create New Web Service"
echo "4. Configure environment variables:"
echo "   - NEXT_PUBLIC_API_URL=https://your-app.onrender.com"
echo "   - NEXT_PUBLIC_WS_URL=wss://your-app.onrender.com"
echo "   - NEXT_PUBLIC_WS_ENDPOINT=wss://stream.binance.com:9443/ws"
echo "5. Deploy and test EVE Red Eye system"
echo ""
echo "🎯 AUTO-PING CONFIGURATION:"
echo "• Set up cron-job.org for every 14 minutes"
echo "• Target: https://your-app.onrender.com/api/health"
echo "• Prevents free tier sleep issues"
echo ""
echo "📦 PNPM CONFIGURATION:"
echo "• Package manager: pnpm"
echo "• Lock file: pnpm-lock.yaml"
echo "• Node modules: .pnpm-store"
echo ""
echo "✨ EVE Red Eye Self-Healing System Ready!"
