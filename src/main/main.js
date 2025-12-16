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
  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  if (process.argv.includes('--devtools')) {
    mainWindow.webContents.openDevTools();
  }
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  return mainWindow;
}

// Post MainWindow Load
app.whenReady().then(async () => {
  await createWindow();
  if (await settings.getConfig()) {
    loadDefaultConfigMenuItem = Menu.getApplicationMenu().getMenuItemById('load-default-config');
    loadDefaultConfigMenuItem.enabled = true;
    await settings.loadConfigTheme(mainWindow);
    await settings.loadConfigDefaultDir(mainWindow);
  }
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow()
    } else {
      await settings.loadConfigDefaultDir(mainWindow);
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
