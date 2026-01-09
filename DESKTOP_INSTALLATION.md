# 🖥️ Desktop Installation Guide

## WALL-E Trading Bot Control Panel Desktop Setup

### 🌐 Browser Installation (Recommended)

1. **Open the app** in Chrome, Edge, or Firefox
2. **Look for "Install" button** in the address bar
3. **Click Install** - creates desktop shortcut automatically
4. **Launch from desktop** - opens as standalone app

### 🐧 Linux Manual Installation

If the browser installation doesn't work, you can manually add it to your Whisker menu:

#### Step 1: Copy Desktop File
```bash
cp apps/web/public/walle-trading-bot.desktop ~/.local/share/applications/
```

#### Step 2: Update Icon Path (Optional)
Edit the desktop file to point to your custom WALL-E icon:
```bash
nano ~/.local/share/applications/walle-trading-bot.desktop
```

Change the `Icon=` line to your icon path:
```
Icon=/path/to/your/walle-icon.png
```

#### Step 3: Update Application Database
```bash
update-desktop-database ~/.local/share/applications/
```

#### Step 4: Make Executable
```bash
chmod +x ~/.local/share/applications/walle-trading-bot.desktop
```

### 🔧 Customization

#### Browser Options
The desktop file supports multiple browsers. Edit the `Exec=` line:

- **Chrome**: `google-chrome --app=http://localhost:3000`
- **Firefox**: `firefox --new-window http://localhost:3000`
- **Edge**: `microsoft-edge --app=http://localhost:3000`
- **Chromium**: `chromium --app=http://localhost:3000`

#### Production Deployment
For production, update the URL in the desktop file:
```
Exec=google-chrome --app=https://your-domain.com
```

### 📱 Features

Once installed, the WALL-E Trading Bot will:
- ✅ Open as a standalone application
- ✅ Appear in your applications menu under "Finance"
- ✅ Support all PWA features (offline capability, notifications)
- ✅ Maintain separate window from browser
- ✅ Auto-update when you update the web app

### 🎯 Categories

The app will appear in these menu categories:
- **Office** - Productivity applications
- **Finance** - Financial and trading tools

### 🔍 Troubleshooting

**App doesn't appear in menu?**
- Run `update-desktop-database ~/.local/share/applications/`
- Log out and back in
- Check file permissions with `ls -la ~/.local/share/applications/walle-trading-bot.desktop`

**Icon not showing?**
- Ensure icon path is correct in the desktop file
- Use absolute path to icon file
- Common icon locations: `/usr/share/icons/`, `~/.local/share/icons/`

**App won't launch?**
- Check if the browser is installed
- Verify the URL is accessible
- Try different browser in the `Exec=` line
