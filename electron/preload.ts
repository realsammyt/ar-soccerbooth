import { contextBridge, ipcRenderer } from 'electron';

// Expose safe APIs to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  exitKiosk: () => ipcRenderer.invoke('exit-kiosk'),
  enterKiosk: () => ipcRenderer.invoke('enter-kiosk'),
});

// Type declarations
declare global {
  interface Window {
    electronAPI: {
      getAppPath: () => Promise<string>;
      getUserDataPath: () => Promise<string>;
      exitKiosk: () => Promise<void>;
      enterKiosk: () => Promise<void>;
    };
  }
}
