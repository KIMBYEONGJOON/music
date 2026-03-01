import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  generate: (payload: unknown) => ipcRenderer.invoke('generate', payload),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings: unknown) => ipcRenderer.invoke('settings:save', settings),
  saveTemplate: (template: string) => ipcRenderer.invoke('template:save', template),
  loadTemplate: () => ipcRenderer.invoke('template:load'),
  copyText: (text: string) => ipcRenderer.invoke('clipboard:copy', text)
});
