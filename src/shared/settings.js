// System Modules
const { nativeTheme } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
require('process');

// Internal Modules
const { listFoldersAndFilesRecursive } = require('./filesystem');

// Hard-coded default settings directory
const defaultConfDir = 'viewer';
const defaultConfFile = 'config.json';

let confPath;
switch (process.platform)  {
  case 'win32': {
    const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    confPath = path.join(localAppData, defaultConfDir, defaultConfFile);
    break;
  }
  case 'linux': {
    const xdgConfigHome = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
    confPath = path.join(xdgConfigHome, defaultConfDir, defaultConfFile);
    break;
  }
  default: {
    confPath = path.join(os.homedir(), `.${defaultConfDir}`, defaultConfFile);
    break;
  }
}

// Single place to hold current runtime state
const state = {
  currentDirectory: null,
  currentTheme: 'system',
};

async function getConfig(configPath = confPath) {
  try {
    const data = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    console.error(`Error reading config file:`, error);
    return null;
  }
}

async function applyTheme(theme, browserWindow) {
  const allowed = ['dark', 'light', 'system'];
  const t = allowed.includes(theme) ? theme : 'system';
  nativeTheme.themeSource = t;
  state.currentTheme = t;
  if (browserWindow && browserWindow.webContents && !browserWindow.isDestroyed()) {
    browserWindow.webContents.send('theme-update', t);
  }
}

async function loadConfigTheme(browserWindow) {
  try {
    const config = await getConfig();
    const theme = config && typeof config.theme === 'string' ? config.theme.toLowerCase() : 'system';
    await applyTheme(theme, browserWindow);
  } catch {
    await applyTheme('system', browserWindow);
  }
}

async function loadConfigDefaultDir(browserWindow) {
  try {
    const config = await getConfig();
    if (!config || config.default_directory === undefined) throw new Error('Invalid Configuration.');
    const dir = config.default_directory;
    state.currentDirectory = dir;
    browserWindow.webContents.send('directory-opened', dir);
    const dirContent = await listFoldersAndFilesRecursive(dir);
    browserWindow.webContents.send('dir-content', dirContent);
  } catch {
    browserWindow.webContents.send('directory-opened', 'Error: No Default Folder.');
  }
}

async function setConfig(directory, theme) {
  try {
    const existing = await getConfig();
    const dirToSave = directory || state.currentDirectory || (existing && existing.default_directory);
    const themeToSaveRaw = theme || state.currentTheme || (existing && existing.theme) || 'system';
    const allowed = ['dark', 'light', 'system'];
    const themeToSave = allowed.includes(themeToSaveRaw) ? themeToSaveRaw : 'system';
    if (!dirToSave || typeof dirToSave !== 'string') {
      throw new Error('No directory selected to save.');
    }
    const configData = {
      default_directory: dirToSave,
      theme: themeToSave,
    };
    const configDir = path.dirname(confPath);
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(confPath, JSON.stringify(configData, null, 2), 'utf-8');
    } catch (error) {
      console.error(error);
    }
}

module.exports = { confPath, state, getConfig, loadConfigTheme, loadConfigDefaultDir, setConfig, applyTheme };