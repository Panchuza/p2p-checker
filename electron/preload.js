const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onBackendReady: (callback) => {
    ipcRenderer.on('backend-ready', callback);
  },
  getBackendStatus: () => ipcRenderer.invoke('get-backend-status')
});