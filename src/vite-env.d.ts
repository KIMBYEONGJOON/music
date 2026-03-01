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

type GenerateResult = {
  ok: boolean;
  text?: string;
  error?: string;
};

type AppSettings = {
  apiKey: string;
  model: string;
  sunoUrl: string;
};

declare global {
  interface Window {
    electronAPI: {
      generate: (payload: GeneratePayload) => Promise<GenerateResult>;
      getSettings: () => Promise<AppSettings>;
      saveSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>;
      saveTemplate: (template: string) => Promise<void>;
      loadTemplate: () => Promise<string>;
      copyText: (text: string) => Promise<void>;
    };
  }
}

export {};

declare namespace JSX {
  interface IntrinsicElements {
    webview: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src: string;
      allowpopups?: string;
    };
  }
}
