import 'dotenv/config';
import path from 'node:path';
import { app, BrowserWindow, ipcMain, session } from 'electron';
import Store from 'electron-store';
import OpenAI from 'openai';
import { SYSTEM_PROMPT } from '../lib/systemPrompt';
import { validateFormat } from '../lib/validators';

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
const IS_DEV = process.env.NODE_ENV === 'development';
const DEFAULT_SUNO_URL = 'https://suno.com';

type AppStore = {
  apiKey?: string;
  openaiModel?: string;
  sunoUrl?: string;
  template?: string;
};

const store = new Store<AppStore>({
  defaults: {
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    sunoUrl: DEFAULT_SUNO_URL,
    template: '',
  },
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webviewTag: true,
    },
  });

  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  if (IS_DEV) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

function getApiKey() {
  return store.get('apiKey') || process.env.OPENAI_API_KEY;
}

ipcMain.handle('settings:get', async () => ({
  hasApiKey: Boolean(getApiKey()),
  sunoUrl: store.get('sunoUrl') || DEFAULT_SUNO_URL,
  model: store.get('openaiModel') || 'gpt-4o-mini',
}));

ipcMain.handle('settings:saveApiKey', async (_event, apiKey: string) => {
  store.set('apiKey', apiKey.trim());
  return { ok: true };
});

ipcMain.handle('template:save', async (_event, template: string) => {
  store.set('template', template);
  return { ok: true };
});

ipcMain.handle('template:load', async () => ({
  template: store.get('template') || '',
}));

ipcMain.handle('generate', async (_event, payload) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { ok: false, error: 'API 키가 설정되지 않았습니다.' };
  }

  const client = new OpenAI({ apiKey });
  const model = store.get('openaiModel') || process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const userContent = [
    '아래 JSON을 입력으로 사용하세요.',
    'Output ONLY the fixed format. No extra text.',
    JSON.stringify(payload, null, 2),
  ].join('\n\n');

  let lastErrors: string[] = [];
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      temperature: 0.4,
    });

    const text = completion.choices[0]?.message?.content ?? '';
    const result = validateFormat(text);

    if (result.ok) {
      return { ok: true, text };
    }

    lastErrors = result.errors;
  }

  return { ok: false, error: `형식 불일치: ${lastErrors.join('; ')}` };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
