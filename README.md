# STRUCTURE_ONLY_REFERENCE_LYRIC_SYSTEM Desktop (Electron)

## 1) 설치
```bash
npm install
```

## 2) 개발 실행
```bash
npm run dev
```

## 3) 빌드
```bash
npm run build
```

## 4) Windows exe 패키징
```bash
npm run dist
```

생성물은 `release/` 폴더에 생성됩니다. (NSIS installer + portable exe)

## 환경변수
`.env.example`를 복사하여 `.env` 작성:
```bash
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
```

> API 키는 앱 내 "API Key 설정" 모달을 통해 저장할 수도 있습니다.

## 구조
- `electron/main.ts`: BrowserWindow 생성, IPC, OpenAI 호출, 응답 검증/재시도
- `electron/preload.ts`: 안전한 IPC 브리지 노출
- `src/App.tsx`: 2컬럼 UI(webview + 입력/결과)
- `lib/systemPrompt.ts`: SYSTEM_PROMPT 원문 위치
- `lib/validators.ts`: 형식/길이 검증
