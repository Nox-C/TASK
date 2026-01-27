@echo off
echo 🤖 Installing WALL-E Trading Bot Desktop Icon...

REM Create desktop directory if it doesn't exist
if not exist "%APPDATA%\Microsoft\Windows\Start Menu\Programs" mkdir "%APPDATA%\Microsoft\Windows\Start Menu\Programs"

REM Copy the desktop file
copy "apps\web\public\walle-trading-bot.desktop" "%APPDATA%\Microsoft\Windows\Start Menu\Programs\" /Y

REM Create shortcut on desktop
echo Creating desktop shortcut...
powershell "$s=(New-Object -ComObject WScript.Shell).CreateShortcut('%USERPROFILE%\Desktop\WALL-E Trading Bot.lnk', 'http://localhost:3001/automation'); $s.TargetPath = 'firefox.exe'; $s.Save()"

echo ✅ WALL-E Trading Bot desktop icon installed!
echo 🚀 You can now launch it from your Start Menu or Desktop.
echo.
echo 📍 Location: Start Menu > Programs > WALL-E Trading Bot
pause
