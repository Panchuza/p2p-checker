const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let backendReady = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#1a1a1a',
    show: false // Ocultar hasta que el backend esté listo
  });

  // Verificar estado del backend cada segundo
  const checkBackend = setInterval(() => {
    fetch('http://localhost:3000/p2pAlerts/active')
      .then(() => {
        if (!backendReady) {
          backendReady = true;
          mainWindow.webContents.send('backend-ready');
          mainWindow.show();
          clearInterval(checkBackend);
        }
      })
      .catch(() => {});
  }, 1000);

  mainWindow.loadFile('index.html');
  mainWindow.webContents.openDevTools();
}

// IPC Handlers
ipcMain.handle('get-backend-status', () => backendReady);

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});