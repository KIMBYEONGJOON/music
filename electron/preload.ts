const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setApiKey: (apiKey: string) => ipcRenderer.invoke('settings:setApiKey', apiKey),
  saveTemplate: (name: string, value: string) => ipcRenderer.invoke('templates:save', name, value),
  loadTemplates: () => ipcRenderer.invoke('templates:load'),
  generateLyrics: (payload: any) => ipcRenderer.invoke('generate:lyrics', payload),
  copyToClipboard: (text: string) => ipcRenderer.invoke('clipboard:copy', text)
});
