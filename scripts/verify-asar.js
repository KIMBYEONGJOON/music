#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const asarPath = path.join(process.cwd(), 'release_portable', 'win-unpacked', 'resources', 'app.asar');
if (!fs.existsSync(asarPath)) {
  throw new Error(`app.asar not found: ${asarPath}`);
}
const content = fs.readFileSync(asarPath, 'utf8');
const forbidden = [
  'node_modules/electron/index.js',
  'Electron failed to install correctly',
  'electron:'
];

for (const token of forbidden) {
  if (content.includes(token)) {
    throw new Error(`Forbidden token found in app.asar: ${token}`);
  }
}
console.log('verify-asar: OK');
