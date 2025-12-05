const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

function matchFirstN(str, pattern, n) {
  // Input validation
  if (!str || typeof str !== 'string' || !pattern || typeof pattern !== 'string' || !Number.isInteger(n) || n < 0 || n > str.length) {
    return false;
  }
  return str.substring(0, n) === pattern.substring(0, n);
}

function matchLastN(str, pattern, n) {
  // Input validation
  if (!str || typeof str !== 'string' || !pattern || typeof pattern !== 'string' || !Number.isInteger(n) || n < 0 || n > str.length) {
    return false;
  }
  return str.substring(str.length - n) === pattern.substring(pattern.length -n);
}

async function listFoldersAndFilesRecursive(directoryPath) {
  /* Only lists markdown files, ignores `.git*` */
  const folders = [];
  const files = [];

  try {
    const items = await fs.readdir(directoryPath);
    const statPromises = items.map(item => fs.stat(path.join(directoryPath, item)));
    const stats = await Promise.all(statPromises);

    for (let i = 0; i < items.length; i++) {
      const itemPath = path.join(directoryPath, items[i]);
      if (stats[i].isDirectory()) {
        if (!matchFirstN(items[i],".git",4)) {
          // Recursive call for subdirectories
          const subDirectory = await listFoldersAndFilesRecursive(itemPath);
          if (subDirectory.folders.length > 0 || subDirectory.files.length > 0)
            folders.push({ name: items[i], items: subDirectory });
        }
      } else if (stats[i].isFile()) {
        if (!matchFirstN(items[i],".",1) && matchLastN(items[i], ".md", 3)) {
          files.push(items[i]);
        }
      }
    }
  } catch (err) {
    console.error("Error reading directory:", err);
    return { folders: [], files: [] };
  }

  return { folders, files };
}

async function getConfig(configPath = '.viewer', configFile = 'config.json')  {
  const confPath = path.join(os.homedir(), configPath, configFile);
  try {
    const data = await fs.readFile(confPath, 'utf-8');
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading config file:`, error);
    return null;
  }
}

async function loadDirectory(directoryPath, browserWindow)  {
  if (!directoryPath)
    return;

  browserWindow.webContents.send('directory-opened', directoryPath);
  try {
    const dirContent = await listFoldersAndFilesRecursive(directoryPath);
    browserWindow.webContents.send('dir-content', dirContent);
  } catch (error) {
    console.error("Error retrieving directory structure: ", error);
  }
}

module.exports = { listFoldersAndFilesRecursive, getConfig, loadDirectory };