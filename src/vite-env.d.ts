/// <reference types="vite/client" />

declare global {
  interface Window {
    api: {
      getSettings: () => Promise<{ hasApiKey: boolean; sunoUrl: string; openaiModel: string }>;
      setApiKey: (apiKey: string) => Promise<{ ok: boolean }>;
      saveTemplate: (name: string, value: string) => Promise<{ ok: boolean }>;
      loadTemplates: () => Promise<Record<string, string>>;
      generateLyrics: (payload: any) => Promise<{ ok: boolean; text: string }>;
      copyToClipboard: (text: string) => Promise<{ ok: boolean }>;
    };
  }
}

export {};
