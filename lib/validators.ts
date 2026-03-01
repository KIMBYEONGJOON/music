const REQUIRED_HEADERS = ['**결과물', '🎵 제목', '🎼 가사', '🎛 프롬프트', 'EXCLUDE'] as const;

export function extractBlock(text: string, header: string): string {
  const start = text.indexOf(header);
  if (start === -1) {
    return '';
  }

  const startAt = start + header.length;
  const nextHeaderIndices = REQUIRED_HEADERS
    .filter((h) => h !== header)
    .map((h) => text.indexOf(h, startAt))
    .filter((idx) => idx !== -1)
    .sort((a, b) => a - b);

  const end = nextHeaderIndices.length > 0 ? nextHeaderIndices[0] : text.length;
  return text.slice(startAt, end).trim();
}

export function validatePromptLength(text: string): { ok: boolean; length: number } {
  const promptBlock = extractBlock(text, '🎛 프롬프트');
  const length = promptBlock.length;
  return { ok: length >= 850 && length <= 900, length };
}

export function validateFormat(text: string): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  let currentIndex = -1;

  for (const header of REQUIRED_HEADERS) {
    const idx = text.indexOf(header);
    if (idx === -1) {
      errors.push(`Missing block: ${header}`);
      continue;
    }

    if (idx < currentIndex) {
      errors.push(`Block order invalid at: ${header}`);
    }

    currentIndex = idx;
  }

  const promptLength = validatePromptLength(text);
  if (!promptLength.ok) {
    errors.push(`Prompt length out of range: ${promptLength.length} (expected 850~900)`);
  }

  return { ok: errors.length === 0, errors };
}
