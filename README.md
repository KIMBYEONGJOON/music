# STRUCTURE_ONLY_REFERENCE_LYRIC_SYSTEM Desktop

## Install
```bash
npm install
```

## Dev
```bash
npm run dev
```

## Build
```bash
npm run build
```

## Package (Windows exe)
```bash
npm run dist
```

## Notes
- API key can be set in app UI (`API Key 설정`) or via `.env`.
- OpenAI API call runs only in Electron main process through IPC.
- Before generation, paste the full original `STRUCTURE_ONLY_REFERENCE_LYRIC_SYSTEM` prompt into `lib/systemPrompt.ts`.
