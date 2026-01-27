#!/bin/bash

echo "🤖 Installing WALL-E Trading Bot Desktop Icon..."

# Create desktop applications directory if it doesn't exist
mkdir -p ~/.local/share/applications

# Copy the desktop file
cp apps/web/public/walle-trading-bot.desktop ~/.local/share/applications/

# Copy icon to icons directory
mkdir -p ~/.local/share/icons/hicolor/512x512/apps
cp apps/web/public/icon-512.png ~/.local/share/icons/hicolor/512x512/apps/walle-trading-bot.png

mkdir -p ~/.local/share/icons/hicolor/192x192/apps
cp apps/web/public/icon-192.png ~/.local/share/icons/hicolor/192x192/apps/walle-trading-bot.png

# Update desktop database
update-desktop-database ~/.local/share/applications/

echo "✅ WALL-E Trading Bot desktop icon installed!"
echo "🚀 You can now launch it from your applications menu."
echo ""
echo "📍 Location: ~/.local/share/applications/walle-trading-bot.desktop"
