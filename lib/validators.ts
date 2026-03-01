const REQUIRED_HEADERS = ['**결과물', '🎵 제목', '🎼 가사', '🎛 프롬프트', 'EXCLUDE'];

export const extractBlock = (text: string, header: string): string => {
  const startIndex = text.indexOf(header);
  if (startIndex === -1) return '';

  const afterStart = text.slice(startIndex + header.length);
  const nextHeaders = REQUIRED_HEADERS.filter((h) => h !== header);
  let nextIndex = -1;

  for (const candidate of nextHeaders) {
    const index = afterStart.indexOf(candidate);
    if (index !== -1 && (nextIndex === -1 || index < nextIndex)) {
      nextIndex = index;
    }
  }

  return (nextIndex === -1 ? afterStart : afterStart.slice(0, nextIndex)).trim();
};

export const validatePromptLength = (text: string): { ok: boolean; length: number } => {
  const promptBlock = extractBlock(text, '🎛 프롬프트');
  const length = promptBlock.length;
  return { ok: length >= 850 && length <= 900, length };
};

export const validateFormat = (text: string): { ok: boolean; errors: string[] } => {
  const errors: string[] = [];
  let cursor = 0;

  for (const header of REQUIRED_HEADERS) {
    const idx = text.indexOf(header, cursor);
    if (idx === -1) {
      errors.push(`누락 블록: ${header}`);
      continue;
    }
    if (idx < cursor) {
      errors.push(`순서 불일치: ${header}`);
    }
    cursor = idx + header.length;
  }

  const promptCheck = validatePromptLength(text);
  if (!promptCheck.ok) {
    errors.push(`프롬프트 길이 불일치: ${promptCheck.length}`);
  }

  return { ok: errors.length === 0, errors };
};
