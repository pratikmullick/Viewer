const { Menu, app, dialog } = require('electron');
const helper = require('./helper/index');

let directoryPath = null;

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open Directory',
        id: 'open-directory',
        accelerator: 'CmdOrCtrl+O',
        click: async (menuItem, browserWindow, event) => {
          const { dialog } = require('electron');
          dialog.showOpenDialog({ properties: ['openDirectory'] }).then(async result => {
            if (!result.canceled) {
              directoryPath = result.filePaths[0];
              browserWindow.webContents.send('directory-opened', directoryPath);
              try {
                const dirContent = await helper.listFoldersAndFilesRecursive(directoryPath);
                browserWindow.webContents.send('dir-content', dirContent);
                const refreshMenuItem = Menu.getApplicationMenu().getMenuItemById('refresh-menu-item');
                if (refreshMenuItem)  {
                  refreshMenuItem.enabled = true;
                }
              } catch (error) {
                console.error("Error retrieving directory structure:", error);
              }
            }
          });
        }
      },
      {
        label: 'Refresh Directory',
        accelerator: 'F6',
        enabled: false,
        id: 'refresh-menu-item',
        click: async (menuItem, browserWindow, event) => {
          if (directoryPath)  {
            try {
              const dirContent = await helper.listFoldersAndFilesRecursive(directoryPath);
              browserWindow.webContents.send('dir-content', dirContent);
            } catch (error) {
              console.error("Error retrieving directory structure:", error);
            }
          }
        }
      },
      {
        label: 'Exit',
        id: 'exit',
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
        id: 'about',
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