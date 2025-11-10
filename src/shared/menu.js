const { Menu, app, dialog } = require('electron');
const helper = require('./helper/index');

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
          const chromiumVersion = process.versions.chrome;
          dialog.showMessageBox({
            type: 'info',
            title: 'About',
            message: `
            Knowledge Viewer.
            Copyright 2025 Pratik Mullick. All Rights Reserved.
            All fonts used are licensed under the SIL Open Font License.
            Chromium Version: ${chromiumVersion}
            `,
            buttons: ['OK'],
          });
        }
      }
    ]
  }
];

module.exports = template;