const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let devServers = [];

// Start dev servers in development
function startDevServers() {
  if (!isDev) return;

  console.log('🚀 Starting development servers...');
  
  // Start Next.js on port 3001
  const nextServer = spawn('pnpm', ['--filter', '@task/web', 'dev', '--', '-p', '3001'], {
    cwd: path.join(__dirname, '../../..'),
    stdio: 'inherit',
    shell: true
  });
  devServers.push(nextServer);
  console.log('📱 Next.js starting on http://localhost:3001');

  // Start API on port 3000
  const apiServer = spawn('pnpm', ['--filter', '@task/api', 'dev'], {
    cwd: path.join(__dirname, '../../..'),
    stdio: 'inherit',
    shell: true
  });
  devServers.push(apiServer);
  console.log('🤖 API starting on http://localhost:3000');
}

// Stop all dev servers on exit
function stopDevServers() {
  devServers.forEach(server => {
    if (server && !server.killed) {
      server.kill();
    }
  });
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'wall-e-icon.png'),
    show: false, // Don't show until ready-to-show
    titleBarStyle: 'hiddenInset', // macOS style
    frame: true // Keep frame for now
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:3001' 
    : `file://${path.join(__dirname, '../.next/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Create custom menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/settings');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Wallet',
      submenu: [
        {
          label: 'Connect Wallet',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            mainWindow.webContents.send('connect-wallet');
          }
        },
        {
          label: 'Disconnect Wallet',
          accelerator: 'CmdOrCtrl+Shift+W',
          click: () => {
            mainWindow.webContents.send('disconnect-wallet');
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/about');
          }
        },
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://github.com/Nox-C/TASK');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  startDevServers();
  
  // Wait a moment for servers to start
  setTimeout(() => {
    createWindow();
    createMenu();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopDevServers();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopDevServers();
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-platform', () => {
  return process.platform;
});
