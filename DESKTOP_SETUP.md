# Desktop Icon Setup Guide

## Quick Installation

Run this command on **your local machine** (not on a server):

```bash
cd /tmp/Nox-C/TASK
./install-desktop-icon.sh
```

This will:
1. Install the WALL-E icon to your system
2. Create a desktop launcher in your application menu
3. Update your desktop database

## If Your Whisker Menu is Missing

If your XFCE Whisker Menu disappeared, here's how to restore it:

### Option 1: Restart the Panel
```bash
xfce4-panel --restart
```

### Option 2: If Panel Won't Start
```bash
killall xfce4-panel
xfce4-panel &
```

### Option 3: Add Whisker Menu Back to Panel
1. Right-click on your XFCE panel
2. Select **Panel** → **Add New Items**
3. Find **Whisker Menu** in the list
4. Click **Add**
5. Drag it to your preferred position (usually top-left)

### Option 4: Reset Panel Configuration (Last Resort)
```bash
# Backup first
cp -r ~/.config/xfce4/panel ~/.config/xfce4/panel.backup

# Reset panel
xfce4-panel --quit
rm -rf ~/.config/xfce4/panel
xfce4-panel &
```

## Finding Your TASK Application

After installation, you can launch TASK Control Panel:

1. **From Whisker Menu**: Search for "TASK Control Panel"
2. **From Command Line**: `./task-control-panel.sh`
3. **Using GTK**: `gtk-launch task-control-panel`

## Troubleshooting

**Icon doesn't appear?**
- Log out and log back in
- Or run: `update-desktop-database ~/.local/share/applications`

**Desktop environment issues?**
- The installation script does NOT modify your desktop environment
- It only adds files to `~/.local/share/applications/` and `~/.local/share/icons/`
- If your desktop environment changed, that's a separate issue

## Notes

- The icon installation is completely separate from your desktop environment configuration
- This script only creates standard `.desktop` files that any Linux desktop can read
- No system files are modified - everything goes in your home directory

## Manual Installation

If the script doesn't work, you can manually:

1. Copy icon:
   ```bash
   cp apps/web/public/wall-e-icon.png ~/.local/share/icons/task-walle-icon.png
   ```

2. Copy desktop file:
   ```bash
   cp apps/web/public/walle-trading-bot.desktop ~/.local/share/applications/task-control-panel.desktop
   ```

3. Update database:
   ```bash
   update-desktop-database ~/.local/share/applications
   ```
