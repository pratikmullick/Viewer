// System Modules
const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('node:path');
const os = require('node:os');
require('process');

// Internal Modules
const menuTemplate = require('../shared/menu');
const settings = require('../shared/settings');
require('../shared/loader');

// Start Main Window
let mainWindow;

async function applySettings()  {
  if (!mainWindow || mainWindow.isDestroyed())
    return;
  await settings.loadConfigTheme(mainWindow);
  await settings.loadConfigDefaultDir(mainWindow);
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  mainWindow.webContents.once('did-finish-load', async () => {
    try {
      await applySettings();
    } finally {
      if (!mainWindow.isDestroyed())  {
        if (process.argv.includes('--devtools')) {
          mainWindow.webContents.openDevTools();
        }
      mainWindow.show();
      }
    }
  });
  return mainWindow;
}

// Post MainWindow Load
app.whenReady().then(async () => {
  await createWindow();
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow()
    } else {
      if (mainWindow && !mainWindow.isDestroyed())  {
        if (mainWindow.webContents.isLoading()) {
          mainWindow.webContents.once('did-finish-load', applySettings);
        } else {
          await applySettings();
        }
      }
    }
  });
  ipcMain.on('open-external-link', (event, url) => {
    shell.openExternal(url);
  });
  ipcMain.on('theme-update', async () => {
    if (mainWindow && mainWindow.webContents && !mainWindow.isDestroyed())  {
      mainWindow.webContents.reloadIgnoringCache();
    }
  });
});

// For MacOS. Does not kill process, keeps it loaded in the dock
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
