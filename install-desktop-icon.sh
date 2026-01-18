#!/usr/bin/env bash
# Install TASK Control Panel desktop icon
# Run this script on your LOCAL machine, not on the server

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ICON_SOURCE="$SCRIPT_DIR/apps/web/public/wall-e-icon.png"
DESKTOP_SOURCE="$SCRIPT_DIR/apps/web/public/walle-trading-bot.desktop"

# Create directories
mkdir -p ~/.local/share/applications
mkdir -p ~/.local/share/icons

# Copy icon
echo "Installing WALL-E icon..."
cp "$ICON_SOURCE" ~/.local/share/icons/task-walle-icon.png

# Create desktop file with correct paths
echo "Creating desktop launcher..."
cat > ~/.local/share/applications/task-control-panel.desktop <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=TASK Trading Bot Control Panel
Comment=Production-ready trading bot control panel with real-time exchange data, live WebSocket feeds, and strategy backtesting
Exec=$SCRIPT_DIR/task-control-panel.sh
Icon=task-walle-icon
Terminal=false
Categories=Office;Finance;Network;
StartupWMClass=TASK Control Panel
MimeType=text/html;text/xml;application/xhtml_xml;
StartupNotify=true
X-GNOME-Autostart-enabled=false
EOF

chmod +x ~/.local/share/applications/task-control-panel.desktop

# Update desktop database
if command -v update-desktop-database &> /dev/null; then
    echo "Updating desktop database..."
    update-desktop-database ~/.local/share/applications
fi

# Refresh icon cache
if command -v gtk-update-icon-cache &> /dev/null; then
    echo "Updating icon cache..."
    gtk-update-icon-cache -f -t ~/.local/share/icons 2>/dev/null || true
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "The TASK Control Panel icon should now appear in your application menu."
echo "Look for 'TASK Trading Bot Control Panel' in your Whisker Menu or app launcher."
echo ""
echo "If you don't see it immediately, try:"
echo "  1. Log out and log back in"
echo "  2. Or restart your panel: xfce4-panel --restart"
echo ""
