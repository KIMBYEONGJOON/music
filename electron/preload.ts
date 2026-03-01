import { contextBridge, ipcRenderer } from 'electron';

export type GeneratePayload = {
  reference_lyrics: string;
  reference_song_metadata: { artist: string; title: string };
  new_song_topic: string;
  suno_settings: {
    genre_primary: string;
    tempo_hint: string;
    explicitness: 'clean';
  };
};

const api = {
  generate: (payload: GeneratePayload) => ipcRenderer.invoke('generate', payload),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveApiKey: (apiKey: string) => ipcRenderer.invoke('settings:saveApiKey', apiKey),
  saveTemplate: (template: string) => ipcRenderer.invoke('template:save', template),
  loadTemplate: () => ipcRenderer.invoke('template:load'),
};

contextBridge.exposeInMainWorld('appApi', api);

declare global {
  interface Window {
    appApi: typeof api;
  }
}
