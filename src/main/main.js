const { app, BrowserWindow, Menu, shell, ipcMain, nativeTheme } = require('electron');
const menuTemplate = require('../shared/menu');
const path = require('path');
const filesystem = require('../shared/filesystem/index');
const { ref } = require('process');
const loaderOutput = require('../shared/loader');

const configDir = '.viewer'
const configFile = 'config.json'

function createWindow() {
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
  //mainWindow.webContents.openDevTools();

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('theme-update', nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
  });
}

app.whenReady().then(async () => {
  createWindow();
  try {
    const config = await filesystem.getConfig(configDir, configFile);
    if (config.default_directory) {
      await filesystem.loadDirectory(config.default_directory, mainWindow);
    }
  } catch (error) {
    console.error("Error: ", error);
  }

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      try {
        const config = await filesystem.getConfig(configDir, configFile);
        if (config.default_directory) {
          await filesystem.loadDirectory(config.default_directory, mainWindow);
        }
      } catch (error) {
        console.error("Error: ", error);
      }
    }
  });

  ipcMain.on('open-external-link', (event, url) => {
    shell.openExternal(url);
  });

  nativeTheme.on('updated', () => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('theme-update', nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
    }
  });
});

/* Standard behaviour for MacOS. Ignore. */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

