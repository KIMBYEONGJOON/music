function extractBlock(text, header) {
  const escaped = header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`${escaped}([\\s\\S]*?)(?=\\n(?:\\*\\*결과물|🎵 제목|🎼 가사|🎛 프롬프트|EXCLUDE)|$)`);
  const match = text.match(pattern);
  return match ? match[1].trim() : '';
}

function validatePromptLength(text) {
  const promptBlock = extractBlock(text, '🎛 프롬프트');
  const length = promptBlock.length;
  return { ok: length >= 850 && length <= 900, length };
}

function validateFormat(text) {
  const required = ['**결과물', '🎵 제목', '🎼 가사', '🎛 프롬프트', 'EXCLUDE'];
  const errors = [];
  let prev = -1;

  for (const token of required) {
    const idx = text.indexOf(token);
    if (idx === -1) {
      errors.push(`Missing block: ${token}`);
      continue;
    }
    if (idx < prev) errors.push(`Order mismatch at block: ${token}`);
    prev = idx;
  }

  const promptLen = validatePromptLength(text);
  if (!promptLen.ok) errors.push(`Prompt length invalid: ${promptLen.length}`);
  return { ok: errors.length === 0, errors };
}

module.exports = { extractBlock, validateFormat, validatePromptLength };
