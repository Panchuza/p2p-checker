const { app, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
const axios = require("axios")

let mainWindow
let backendReady = false

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    backgroundColor: "#1a1a1a",
    show: false,
  })

  const checkBackend = setInterval(() => {
    fetch("http://localhost:3000/p2pAlerts/active")
      .then(() => {
        if (!backendReady) {
          backendReady = true
          mainWindow.webContents.send("backend-ready")
          mainWindow.show()
          clearInterval(checkBackend)
        }
      })
      .catch(() => {})
  }, 1000)

  mainWindow.loadFile("index.html")
  mainWindow.webContents.openDevTools()
}

// IPC Handlers
ipcMain.handle("get-backend-status", () => backendReady)

ipcMain.handle("get-fiats", async () => {
  const response = await axios.get("http://localhost:3000/p2pAlerts/fiat-list")
  return response.data
})

ipcMain.handle("get-config", async () => {
  const response = await axios.get("http://localhost:3000/p2pAlerts/config")
  return response.data
})

ipcMain.handle("get-methods", async (event, fiat = "ARS") => {
  const response = await axios.get(`http://localhost:3000/p2pAlerts/filter-conditions?fiat=${fiat}`)
  return response.data
})

// 🚀 Nuevo handler para generar seguimiento
ipcMain.handle("generate-tracking", async (event, params) => {
  try {
    const response = await axios.get("http://localhost:3000/p2pAlerts/getAlerts", {
      params: params,
    })
    return response.data
  } catch (error) {
    console.error("Error al generar seguimiento:", error)
    throw error
  }
})

app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
