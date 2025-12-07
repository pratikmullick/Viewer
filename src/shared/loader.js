const { ipcMain } = require('electron');
const fs = require('fs');


let remarkable;

/* Dynamically import Remarkable when needed */
async function loadRemarkable() {
  if (!remarkable) {
    try {
      remarkable = new (require('remarkable').Remarkable)();
    } catch (error) {
      console.error('Error loading Remarkable:', error);
      return null;
    }
  }
  return remarkable;
}

ipcMain.on('file-path', async (event, filePath) => {
  try {
    const fileContent = await fs.promises.readFile(filePath, 'utf8');
    const md = await loadRemarkable();

    if (md) {
      const htmlContent = md.render(fileContent);

      event.sender.send('html-content', htmlContent);
    } else {
      event.sender.send('html-content', 'Error loading Remarkable');
    }
  } catch (error) {
    console.error('Error reading/processing file:', error);
    event.sender.send('html-content', `Error: ${error.message}`);
  }
});
