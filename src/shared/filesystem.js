// System Modules
const fs = require('node:fs/promises');
const path = require('node:path');

// String Pattern Matching functions
function matchFirstN(str, pattern, n) {
  if (!str || typeof str !== 'string' || !pattern || typeof pattern !== 'string' || !Number.isInteger(n) || n < 0 || n > str.length) {
    return false;
  }
  return str.substring(0, n) === pattern.substring(0, n);
}

function matchLastN(str, pattern, n) {
  if (!str || typeof str !== 'string' || !pattern || typeof pattern !== 'string' || !Number.isInteger(n) || n < 0 || n > str.length) {
    return false;
  }
  return str.substring(str.length - n) === pattern.substring(pattern.length -n);
}

// Create a recursive object of directories and Markdown files that they contain, ignoring .git
async function listFoldersAndFilesRecursive(directoryPath) {
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
      // If not directory, add file to `files`
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


module.exports = { listFoldersAndFilesRecursive };
