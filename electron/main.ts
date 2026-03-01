import path from 'node:path';
import { app, BrowserWindow, clipboard, ipcMain, session } from 'electron';
import Store from 'electron-store';
import OpenAI from 'openai';
import { SYSTEM_PROMPT } from '../lib/systemPrompt';
import { validateFormat } from '../lib/validators';

type AppStore = {
  apiKey: string;
  model: string;
  sunoUrl: string;
  template: string;
};

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

const store = new Store<AppStore>({
  defaults: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
    model: process.env.OPENAI_MODEL ?? 'gpt-4.1-mini',
    sunoUrl: 'https://suno.com',
    template: ''
  }
});

const createWindow = async () => {
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webviewTag: true
    }
  });

  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => {
    callback(false);
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    await win.loadURL(devServerUrl);
  } else {
    await win.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'));
  }
};

const getSettings = () => ({
  apiKey: store.get('apiKey'),
  model: store.get('model'),
  sunoUrl: store.get('sunoUrl')
});

const runGeneration = async (payload: GeneratePayload) => {
  const apiKey = store.get('apiKey') || process.env.OPENAI_API_KEY;
  const model = store.get('model') || process.env.OPENAI_MODEL || 'gpt-4.1-mini';

  if (!apiKey) {
    return { ok: false, error: 'API 키가 설정되지 않았습니다.' };
  }

  const client = new OpenAI({ apiKey });
  const userInput = `${JSON.stringify(payload, null, 2)}\n\nOutput ONLY the fixed format. No extra text.`;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const completion = await client.responses.create({
      model,
      input: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userInput }
      ]
    });

    const text = completion.output_text ?? '';
    const validation = validateFormat(text);
    if (validation.ok) {
      return { ok: true, text };
    }
  }

  return { ok: false, error: '형식 불일치' };
};

app.whenReady().then(async () => {
  ipcMain.handle('generate', async (_evt, payload: GeneratePayload) => runGeneration(payload));
  ipcMain.handle('settings:get', async () => getSettings());
  ipcMain.handle('settings:save', async (_evt, settings: Partial<AppStore>) => {
    if (typeof settings.apiKey === 'string') store.set('apiKey', settings.apiKey.trim());
    if (typeof settings.model === 'string') store.set('model', settings.model.trim());
    if (typeof settings.sunoUrl === 'string') store.set('sunoUrl', settings.sunoUrl.trim());
    return getSettings();
  });
  ipcMain.handle('template:save', async (_evt, template: string) => {
    store.set('template', template);
  });
  ipcMain.handle('template:load', async () => store.get('template'));
  ipcMain.handle('clipboard:copy', async (_evt, text: string) => {
    clipboard.writeText(text);
  });

  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
