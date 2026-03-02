const { app, BrowserWindow, BrowserView, ipcMain, clipboard } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const dotenv = require('dotenv');
const Store = require('electron-store');
const { SYSTEM_PROMPT } = require('../lib/systemPrompt');
const { validateFormat } = require('../lib/validators');

dotenv.config();

const store = new Store({
  name: 'settings',
  defaults: {
    sunoUrl: 'https://suno.com/',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    templates: {},
    apiKey: process.env.OPENAI_API_KEY || ''
  }
});

let mainWindow: any = null;
let sunoView: any = null;

function getAppUrl() {
  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) return devUrl;
  return `file://${path.join(__dirname, '../dist/index.html')}`;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  sunoView = new BrowserView({
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.setBrowserView(sunoView);

  const resizeViews = () => {
    if (!mainWindow || !sunoView) return;
    const [width, height] = mainWindow.getContentSize();
    sunoView.setBounds({ x: 0, y: 0, width: Math.floor(width / 2), height });
    sunoView.setAutoResize({ width: true, height: true });
  };

  mainWindow.on('resize', resizeViews);
  mainWindow.on('ready-to-show', resizeViews);

  const sunoUrl = store.get('sunoUrl');
  sunoView.webContents.loadURL(sunoUrl);
  mainWindow.loadURL(getAppUrl());
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('settings:get', () => {
  return {
    hasApiKey: Boolean(store.get('apiKey')),
    sunoUrl: store.get('sunoUrl'),
    openaiModel: store.get('openaiModel')
  };
});

ipcMain.handle('settings:setApiKey', (_e: any, apiKey: string) => {
  store.set('apiKey', apiKey.trim());
  return { ok: true };
});

ipcMain.handle('templates:save', (_e: any, name: string, value: string) => {
  const templates = store.get('templates');
  templates[name] = value;
  store.set('templates', templates);
  return { ok: true };
});

ipcMain.handle('templates:load', () => {
  return store.get('templates');
});

ipcMain.handle('clipboard:copy', (_e: any, text: string) => {
  clipboard.writeText(text || '');
  return { ok: true };
});

ipcMain.handle('generate:lyrics', async (_event: any, payload: any) => {
  const apiKey = (store.get('apiKey') || process.env.OPENAI_API_KEY || '').trim();
  if (!apiKey) throw new Error('API key missing');

  const model = store.get('openaiModel') || process.env.OPENAI_MODEL || 'gpt-4.1-mini';
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey });

  const userContent = `${JSON.stringify(payload, null, 2)}\n\nOutput ONLY the fixed format. No extra text.`;

  let lastError = 'Unknown';
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await client.responses.create({
      model,
      input: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent }
      ]
    });

    const text = response.output_text || '';
    const validation = validateFormat(text);
    if (validation.ok) {
      return { ok: true, text };
    }
    lastError = validation.errors.join(', ');
  }

  throw new Error(`형식 불일치: ${lastError}`);
});
