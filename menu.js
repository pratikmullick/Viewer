const { Menu, app, dialog } = require('electron');
const helper = require('./helper');

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open Directory',
        accelerator: 'CmdOrCtrl+O',
        click: async (menuItem, browserWindow, event) => {
          const { dialog } = require('electron');
          dialog.showOpenDialog({ properties: ['openDirectory'] }).then(async result => {
            if (!result.canceled) {
              const directoryPath = result.filePaths[0];
              browserWindow.webContents.send('directory-opened', directoryPath);
              try {
                const dirContent = await helper.listFoldersAndFilesRecursive(directoryPath);
                browserWindow.webContents.send('dir-content', dirContent);
              } catch (error) {
                console.error("Error retrieving directory structure:", error);
              }
            }
          });
        }
      },
      {
        label: 'Exit',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          app.quit();
        }
      }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'About',
        click: () => {
          dialog.showMessageBox({
            type: 'info',
            title: 'About',
            message: 'Document Viewer.\nCopyright 2025\nAll Rights Reserved.',
            buttons: ['OK'],
          });
        }
      }
    ]
  }
];

module.exports = template;