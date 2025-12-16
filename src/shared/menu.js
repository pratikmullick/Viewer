// System Modules
const { Menu, app, dialog, nativeTheme } = require('electron');

// Internal Modules
const filesystem = require('./filesystem');
const settings = require('./settings');

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open Directory',
        id: 'open-directory',
        accelerator: 'CmdOrCtrl+O',
        click: async (menuItem, browserWindow, event) => {
          dialog.showOpenDialog({ properties: ['openDirectory'] }).then(async result => {
            try {
              if (!result.canceled) {
                const directoryPath = result.filePaths[0];
                browserWindow.webContents.send('directory-opened', directoryPath);
                const dirContent = await filesystem.listFoldersAndFilesRecursive(directoryPath);
                browserWindow.webContents.send('dir-content', dirContent);
                const refreshMenuItem = Menu.getApplicationMenu().getMenuItemById('refresh-menu-item');
                if (refreshMenuItem)  {
                  refreshMenuItem.enabled = true;
                }
              }
            } catch (error) {
              console.error(`Error: Unable to Load Directory from Menu: ${error}`);
            }
          });
        }
      },
      {
        label: 'Refresh',
        accelerator: 'F5',
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
        label: 'Reset',
        accelerator: 'F6',
        id: 'reset',
        click: (menuItem, browserWindow, event) => {
          browserWindow.webContents.send('html-content', '');
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
    label: 'Settings',
    submenu: [
      {
        label: 'Theme',
        submenu: [
          {
            label: 'Dark Theme',
            click: async (menuItem, browserWindow, event) => {
              const theme = 'dark';
              nativeTheme.themeSource = theme;
              browserWindow.webContents.send('theme-update', theme);
            }
          },
          {
            label: 'Light Theme',
            click: async (menuItem, browserWindow, event) => {
              const theme = 'light';
              nativeTheme.themeSource = theme;
              browserWindow.webContents.send('theme-update', theme);
            }
          },
          {
            label: 'System Theme',
            click: async (menuItem, browserWindow, event) => {
              const theme = 'system';
              nativeTheme.themeSource = theme;
              browserWindow.webContents.send('theme-update', theme);
            }
          }
        ]
      },
      {
        label: 'Load Default Configuration',
        id: 'load-default-config',
        enabled: false,
        click: async (menuItem, browserWindow, event) => {
          await settings.loadConfigTheme(browserWindow);
          await settings.loadConfigDefaultDir(browserWindow);
        }
      },
      {
        label: 'Save Current Configuration as Default',
        id: 'save-current-config',
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
            Viewer - A Markdown-based Document Viewer.
            Copyright 2025 Pratik Mullick. Licensed under GNU GPL v3.
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
