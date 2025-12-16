const { app, BrowserWindow, Menu, shell, ipcMain, nativeTheme, dialog } = require('electron');
const menuTemplate = require('../shared/menu');
const path = require('path');
const filesystem = require('../shared/filesystem/index');
const { ref } = require('process');
const loaderOutput = require('../shared/loader');

const configDir = '.viewer'
const configFile = 'config.json'

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

async function loadDefaults(browserWindow) {
  try {
    const config = await filesystem.getConfig(configDir, configFile);
    console.log(`Load default directory: ${config.default_directory}`);
    if (config === null || config.default_directory === undefined)
      throw new Error("Invalid Configuration.");
    browserWindow.webContents.send('directory-opened', config.default_directory);
    const dirContent = await filesystem.listFoldersAndFilesRecursive(config.default_directory);
    mainWindow.webContents.send('dir-content', dirContent);
  } catch (error) {
    mainWindow.webContents.send('directory-opened', `Error: No Default Folder.`);
  }
}

app.whenReady().then(async () => {
  await createWindow();
  if (mainWindow.webContents) {
    mainWindow.webContents.send('theme-update', nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
    await loadDefaults(mainWindow);
  }

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow()
    } else {
      await loadDefaults(mainWindow);
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
