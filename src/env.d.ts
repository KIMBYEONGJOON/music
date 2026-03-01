/// <reference types="vite/client" />

type GeneratePayload = {
  reference_lyrics: string;
  reference_song_metadata: { artist: string; title: string };
  new_song_topic: string;
  suno_settings: {
    genre_primary: string;
    tempo_hint: string;
    explicitness: 'clean';
  };
};

declare global {
  interface Window {
    appApi: {
      generate: (payload: GeneratePayload) => Promise<{ ok: boolean; text?: string; error?: string }>;
      getSettings: () => Promise<{ hasApiKey: boolean; sunoUrl: string; model: string }>;
      saveApiKey: (apiKey: string) => Promise<{ ok: boolean }>;
      saveTemplate: (template: string) => Promise<{ ok: boolean }>;
      loadTemplate: () => Promise<{ template: string }>;
    };
  }
}

export {};
