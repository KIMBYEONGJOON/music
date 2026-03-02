# STRUCTURE_ONLY_REFERENCE_LYRIC_SYSTEM Electron App

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Portable EXE
```bash
npm run dist:portable
```

Output:
- `release_portable/*.exe` (single portable executable)

## Notes
- OpenAI API key can be set in UI modal or `.env`.
- OpenAI calls run only in Electron main process via IPC.
- Electron main/preload are compiled by `tsc` (CommonJS), not bundled.
