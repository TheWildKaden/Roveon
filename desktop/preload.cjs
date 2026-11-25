const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('roveon', Object.freeze({
  open: () => ipcRenderer.invoke('workspace:open'),
  list: () => ipcRenderer.invoke('workspace:list'),
  read: path => ipcRenderer.invoke('workspace:read', path),
  write: (path, text, modified) => ipcRenderer.invoke('workspace:write', path, text, modified),
}));
