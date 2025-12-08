const { contextBridge, ipcRenderer } = require('electron');

const sendChannels = [
  'file-path',
  'directory-opened',
  'dir-content',
  'open-external-link',
  'html-content-callcount'
];

const receiveChannels = [
  'html-content',
  'directory-opened',
  'dir-content',
  'theme-update'
]

contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => {
    if (sendChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    if (receiveChannels.includes(channel)) {
      /* Deliberately strip event as it includes `sender` */
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});

