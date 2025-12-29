#!/bin/bash

# TASK Trading Control Panel Launcher
echo "Starting TASK Trading Control Panel..."

# Start API server
echo "Starting API server..."
cd /home/nox/TASK/apps/api && pnpm dev > /home/nox/.gemini/tmp/16adbad4f176fcee630383230fde24ced64e4d0efba4180ce2a8c4ad4e8ec387/api.log 2>&1 &
API_PID=$!

# Start Web server  
echo "Starting Web server..."
cd /home/nox/TASK/apps/web && pnpm dev > /home/nox/.gemini/tmp/16adbad4f176fcee630383230fde24ced64e4d0efba4180ce2a8c4ad4e8ec387/web.log 2>&1 &
WEB_PID=$!

# Wait for servers to start
echo "Waiting for servers to start..."
sleep 5

# Open browser
echo "Opening TASK Control Panel in browser..."
firefox http://localhost:3000 &

echo "TASK Trading Control Panel started!"
echo "API PID: $API_PID"
echo "Web PID: $WEB_PID"
echo "Access at: http://localhost:3000"
echo ""
echo "To stop servers:"
echo "kill $API_PID $WEB_PID"
