const { app, BrowserWindow, Menu } = require('electron');
const menuTemplate = require('./menu');
const path = require('path');

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

  mainWindow.loadFile('index.html');
  mainWindow.webContents.openDevTools();

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  /*
  mainWindow.webContents.on('did-finish-load', () => {
    // Listen for the 'directory-opened' event from the menu
    mainWindow.webContents.on('directory-opened', (event, directoryPath) => {
      mainWindow.webContents.send('directory-opened', directoryPath);
    });
  });

  mainWindow.webContents.on('ipc-message', (event, channel, data) => {
    if (channel === 'myChannelResponse') {
        console.log('Received from renderer:', data)
    }
  });
  */
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Standard behaviour for MacOS. Ignore.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
