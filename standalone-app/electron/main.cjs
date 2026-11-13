const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = process.env.ELECTRON_DEV === '1';
let mainWindow = null;
let serverInstance = null;

function createApplicationMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' }
            ]
          }
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Print / Save PDF',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.print({ printBackground: true });
            }
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
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
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [{ type: 'separator' }, { role: 'front' }] : [{ role: 'close' }])
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

async function startEmbeddedBackend() {
  process.env.NODE_ENV = 'production';
  process.env.S2R_STANDALONE = '1';
  process.env.S2R_APP_ROOT = path.join(__dirname, '..');
  process.env.S2R_DIST_DIR = path.join(__dirname, '..', 'dist');

  const bundledServerPath = path.join(__dirname, '..', 'dist-electron', 'server.cjs');
  if (!fs.existsSync(bundledServerPath)) {
    throw new Error(`Bundled server missing at ${bundledServerPath}. Run "npm run build" first.`);
  }

  const serverModule = require(bundledServerPath);
  const startFn = serverModule.startStandaloneServer || (serverModule.default && serverModule.default.startStandaloneServer);
  if (typeof startFn !== 'function') {
    throw new Error('startStandaloneServer export not found in dist-electron/server.cjs');
  }

  const { server, port } = await startFn(0, '127.0.0.1');
  serverInstance = server;
  return `http://127.0.0.1:${port}`;
}

async function createWindow() {
  let targetUrl = 'http://localhost:3000';

  if (!isDev) {
    try {
      targetUrl = await startEmbeddedBackend();
    } catch (err) {
      dialog.showErrorBox('S2RFilm Studio Desktop — Startup Error', err.message || String(err));
      app.quit();
      return;
    }
  }

  const isMac = process.platform === 'darwin';
  const iconPath = isMac
    ? path.join(__dirname, '..', 'public', 'pwa-512x512.png')
    : path.join(__dirname, '..', 'public', 'icon.ico');

  mainWindow = new BrowserWindow({
    width: 1420,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'S2RFilm Studio Desktop',
    backgroundColor: '#09090b',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    trafficLightPosition: isMac ? { x: 14, y: 14 } : undefined,
    autoHideMenuBar: !isMac,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.loadURL(targetUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createApplicationMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (serverInstance && typeof serverInstance.close === 'function') {
    serverInstance.close();
  }
});
