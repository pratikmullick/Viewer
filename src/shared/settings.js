// System Modules
const { nativeTheme } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');
require('process');

// Internal Modules
const { listFoldersAndFilesRecursive } = require('./filesystem');

// Hard-coded default settings directory
const defaultConfDir = 'viewer';
const defaultConfFile = 'config.json';
let confPath;
switch (process.platform)  {
  case 'win32':
    const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    confPath = path.join(localAppData, defaultConfDir, defaultConfFile);
    break;
  case 'default':
    confPath = path.join(os.homedir(), `.${defaultConfDir}`, defaultConfFile);
    break;
}

async function getConfig(configPath=confPath)  {
  // Loads configuration file
  try {
    const data = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(data)
  } catch (error) {
    if (error.code === 'ENOENT')  {
      return null;
    } else {
      console.error(`Error reading config file:`, error);
    }
    return null;
  }
}

async function loadConfigTheme(browserWindow) {
  try {
    const config = await getConfig();
    const theme = config && typeof config.theme === 'string' ? config.theme.toLowerCase() : null;
    if (theme === 'dark' || theme === 'light') {
      nativeTheme.themeSource = theme;
      browserWindow.webContents.send('theme-update', theme);
    } else {
      nativeTheme.themeSource = 'system';
    }
  } catch (error) {
    nativeTheme.themeSource = 'system';
  }
}

async function loadConfigDefaultDir(browserWindow) {
  try {
    const config = await getConfig();
    if (!config || config.default_directory === undefined)
      throw new Error('Invalid Configuration.');
    browserWindow.webContents.send('directory-opened', config.default_directory);
    const dirContent = await listFoldersAndFilesRecursive(config.default_directory);
    browserWindow.webContents.send('dir-content', dirContent);
  } catch (error) {
    browserWindow.webContents.send('directory-opened', 'Error: No Default Folder.');
  }
}

module.exports = { confPath, getConfig, loadConfigTheme, loadConfigDefaultDir };