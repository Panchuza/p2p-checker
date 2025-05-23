const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onBackendReady: (callback) => {
    ipcRenderer.on('backend-ready', callback);
  },
  getBackendStatus: () => ipcRenderer.invoke('get-backend-status'),

  // 🚀 Nuevo método para obtener la lista de fiats desde el backend
  getFiats: () => ipcRenderer.invoke('get-fiats'),
  getConfig: () => ipcRenderer.invoke('get-config'),
  getMethods: () => ipcRenderer.invoke('get-methods')
});
