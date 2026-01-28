less
!/bin/bash

echo "🤖 WALL-E Trading Bot Launcher"
echo "=============================="
echo ""
echo "Starting WALL-E Trading Bot..."
echo "This will open the web application in your browser."
echo ""

# Navigate to project directory
cd /home/nox/TASK

# Start the web server in background
echo "🚀 Starting web server..."
pnpm dev:web &

# Wait a moment for server to start
sleep 3

# Open browser
echo "🌐 Opening browser..."
xdg-open http://localhost:3001/automation

echo ""
echo "✅ WALL-E Trading Bot is running!"
echo "   Web server: http://localhost:3001"
echo "   Press Ctrl+C in this window to stop the server."
echo ""

# Keep the script running
wait
