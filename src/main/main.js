const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const menuTemplate = require('../shared/menu');
const path = require('path');
const loaderOutput = require('../shared/loader');

let mainWindow;

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

app.whenReady().then(() => {
  createWindow();

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
