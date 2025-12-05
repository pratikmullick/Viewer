const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const menuTemplate = require('../shared/menu');
const path = require('path');
const loaderOutput = require('../shared/loader');
const filesystem = require('../shared/filesystem/index');
const { ref } = require('process');

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

}

app.whenReady().then(async () => {
  createWindow();

  try {
    const config = await filesystem.getConfig(configDir, configFile);
    console.log(config);
    if (config.default_directory) {
      await filesystem.loadDirectory(config.default_directory, mainWindow);
    }
  } catch (error) {
    console.error("Error: ", error);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  ipcMain.on('open-external-link', (event, url) => {
    shell.openExternal(url);
  });
});

// Standard behaviour for MacOS. Ignore.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
