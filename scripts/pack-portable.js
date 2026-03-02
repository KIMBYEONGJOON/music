#!/usr/bin/env node
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const appPkg = path.join(root, 'app-pkg');

function run(cmd, cwd = root) {
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function clean() {
  ['dist', 'dist-electron', 'app-pkg', 'release_portable'].forEach((d) => {
    fs.rmSync(path.join(root, d), { recursive: true, force: true });
  });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

clean();
run('npx vite build');
run('npx tsc -p electron/tsconfig.electron.json');

fs.mkdirSync(appPkg, { recursive: true });
copyDir(path.join(root, 'dist'), path.join(appPkg, 'dist'));
copyDir(path.join(root, 'dist-electron'), path.join(appPkg, 'dist-electron'));
copyDir(path.join(root, 'lib'), path.join(appPkg, 'lib'));

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'));
const minimalPkg = {
  name: pkg.name,
  version: pkg.version,
  main: 'dist-electron/main.js',
  dependencies: {
    dotenv: pkg.dependencies.dotenv,
    'electron-store': pkg.dependencies['electron-store'],
    openai: pkg.dependencies.openai
  }
};
fs.writeFileSync(path.join(appPkg, 'package.json'), JSON.stringify(minimalPkg, null, 2));
fs.writeFileSync(path.join(appPkg, '.env.example'), 'OPENAI_API_KEY=\nOPENAI_MODEL=\n');

run('npm install --omit=dev', appPkg);
run('npx electron-builder --config eb.config.json --win portable');
run('node scripts/verify-asar.js');
