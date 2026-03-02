export function extractBlock(text: string, header: string): string {
  const escaped = header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`${escaped}([\\s\\S]*?)(?=\\n(?:\\*\\*결과물|🎵 제목|🎼 가사|🎛 프롬프트|EXCLUDE)|$)`);
  const match = text.match(pattern);
  return match ? match[1].trim() : '';
}

export function validatePromptLength(text: string): { ok: boolean; length: number } {
  const promptBlock = extractBlock(text, '🎛 프롬프트');
  const length = promptBlock.length;
  return { ok: length >= 850 && length <= 900, length };
}

export function validateFormat(text: string): { ok: boolean; errors: string[] } {
  const required = ['**결과물', '🎵 제목', '🎼 가사', '🎛 프롬프트', 'EXCLUDE'];
  const errors: string[] = [];

  let prev = -1;
  for (const token of required) {
    const idx = text.indexOf(token);
    if (idx === -1) {
      errors.push(`Missing block: ${token}`);
      continue;
    }
    if (idx < prev) {
      errors.push(`Order mismatch at block: ${token}`);
    }
    prev = idx;
  }

  const promptLen = validatePromptLength(text);
  if (!promptLen.ok) {
    errors.push(`Prompt length invalid: ${promptLen.length}`);
  }

  return { ok: errors.length === 0, errors };
}
