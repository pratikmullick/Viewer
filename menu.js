const { Menu, app, dialog } = require('electron');

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open Directory',
        accelerator: 'CmdOrCtrl+O',
        click: (menuItem, browserWindow, event) => {
          const { dialog } = require('electron');
          dialog.showOpenDialog({ properties: ['openDirectory'] }).then(result => {
            if (!result.canceled) {
              const directoryPath = result.filePaths[0];
              console.log(directoryPath);
              browserWindow.webContents.send('directory-opened', directoryPath);
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
            message: 'Document Viewer.\nCopyright 2025 Pratik Mullick.\nAll Rights Reserved.',
            buttons: ['OK'],
          });
        }
      }
    ]
  }
];

module.exports = template;