const fs = require('node:fs/promises');
const path = require('node:path');

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

async function writeDocTree(directoryPath, statusFile) {
  try {
    const docTree = await listFoldersAndFilesRecursive(directoryPath);
    const filePath = path.join(directoryPath, statusFile);

    //Check if directory exists, and is a directory
    const stats = await fs.stat(directoryPath);
    if (!stats.isDirectory()){
      return "Error: Provided path is not a directory";
    }

    await fs.writeFile(filePath, JSON.stringify(docTree, null, 2));
    return `Successfully wrote directory tree to ${filePath}`;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return `Error: Directory '${directoryPath}' does not exist`;
    } else if (err.code === 'EACCES'){
      return `Error: Permission denied to write to '${directoryPath}'`;
    } else {
      return `Error writing file: ${err.message}`;
    }
  }
}

async function checkDoctreeStatus(dirPath, statusFile) {
    const filePath = path.join(dirPath, statusFile);
    try {
      await fs.access(filePath, fs.constants.F_OK);
      return true;
    } catch (err) {
      return false;
  }
}

module.exports = { listFoldersAndFilesRecursive, checkDoctreeStatus, writeDocTree };