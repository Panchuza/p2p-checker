const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {
  onBackendReady: (callback) => {
    ipcRenderer.on("backend-ready", callback)
  },
  getBackendStatus: () => ipcRenderer.invoke("get-backend-status"),
  getFiats: () => ipcRenderer.invoke("get-fiats"),
  getConfig: () => ipcRenderer.invoke("get-config"),
  getMethods: (fiat) => ipcRenderer.invoke("get-methods", fiat),
  generateTracking: (params) => ipcRenderer.invoke("generate-tracking", params),
})
