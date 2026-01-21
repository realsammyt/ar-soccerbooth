import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

// Portrait display dimensions
const DISPLAY_WIDTH = 1080;
const DISPLAY_HEIGHT = 1920;

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: DISPLAY_WIDTH,
    height: DISPLAY_HEIGHT,
    frame: false,           // Frameless for kiosk mode
    fullscreen: true,       // Fullscreen kiosk
    kiosk: true,            // Kiosk mode
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
    },
    backgroundColor: '#000000',
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevent closing with keyboard shortcuts in kiosk mode
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // Block Alt+F4, Ctrl+W, etc. in production
    if (process.env.NODE_ENV !== 'development') {
      if (
        (input.alt && input.key === 'F4') ||
        (input.control && input.key === 'w') ||
        (input.control && input.key === 'q')
      ) {
        event.preventDefault();
      }
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for GCS upload (will be implemented via renderer)
ipcMain.handle('get-app-path', () => {
  return app.getAppPath();
});

ipcMain.handle('get-user-data-path', () => {
  return app.getPath('userData');
});

// Exit kiosk mode handler (for admin/debug)
ipcMain.handle('exit-kiosk', () => {
  if (mainWindow) {
    mainWindow.setKiosk(false);
    mainWindow.setFullScreen(false);
  }
});

// Re-enter kiosk mode
ipcMain.handle('enter-kiosk', () => {
  if (mainWindow) {
    mainWindow.setKiosk(true);
    mainWindow.setFullScreen(true);
  }
});
