// System Modules
const { app, dialog } = require('electron');

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
        click: async (menuItem, browserWindow) => {
          dialog.showOpenDialog({ properties: ['openDirectory'] }).then(async result => {
            try {
              if (!result.canceled) {
                const directoryPath = result.filePaths[0];
                settings.state.currentDirectory = directoryPath;
                browserWindow.webContents.send('directory-opened', directoryPath);
                const dirContent = await filesystem.listFoldersAndFilesRecursive(directoryPath);
                browserWindow.webContents.send('dir-content', dirContent);
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
        id: 'refresh-menu-item',
        // Always enabled and can reload from current or default config
        enabled: true,
        click: async (menuItem, browserWindow) => {
          try {
            let directoryPath = settings.state.currentDirectory;
            if (!directoryPath) {
              const config = await settings.getConfig();
              if (config && config.default_directory) {
                directoryPath = config.default_directory;
                settings.state.currentDirectory = directoryPath;
                browserWindow.webContents.send('directory-opened', directoryPath);
              }
            }
            if (directoryPath) {
              const dirContent = await filesystem.listFoldersAndFilesRecursive(directoryPath);
              browserWindow.webContents.send('dir-content', dirContent);
            } else {
              browserWindow.webContents.send('directory-opened', 'Error: No Directory to Refresh.');
            }
          } catch (error) {
            console.error("Error retrieving directory structure:", error);
          }
        }
      },
      {
        label: 'Reset',
        accelerator: 'F6',
        id: 'reset',
        click: (menuItem, browserWindow) => {
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
            click: async (menuItem, browserWindow) => {
              await settings.applyTheme('dark', browserWindow);
            }
          },
          {
            label: 'Light Theme',
            click: async (menuItem, browserWindow) => {
              await settings.applyTheme('light', browserWindow);
            }
          },
          {
            label: 'System Theme',
            click: async (menuItem, browserWindow) => {
              await settings.applyTheme('system', browserWindow);
            }
          }
        ]
      },
      {
        label: 'Load Default Configuration',
        id: 'load-default-config',
        enabled: true,
        click: async (menuItem, browserWindow) => {
          await settings.loadConfigTheme(browserWindow);
          await settings.loadConfigDefaultDir(browserWindow);
        }
      },
      {
        label: 'Save Current Configuration as Default',
        id: 'save-current-config',
        enabled: true,
        click: async () => {
          try {
            await settings.setConfig();
            dialog.showMessageBox({
              type: 'info',
              title: 'Configuration Saved',
              message: `Configuration saved to:\n${settings.confPath}`,
              buttons: ['OK'],
            });
          } catch (error) {
            dialog.showErrorBox("Error", "Failed to save configuration. Select or load a directory first.");
          }
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
            Viewer - A Markdown-based Document Viewer.
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