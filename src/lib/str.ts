export function progressBar(cur: number, max: number, steps = 10): string {

  if (max === 0) return '';

  const percent = Math.floor((cur / max) * 100);
  const missingPercent = Math.ceil(100 - percent);

  return [
    percent + '% [',
    '█'.repeat(Math.floor(percent / steps)),
    '░'.repeat(Math.ceil(missingPercent / steps)),
    ']',
  ].join('');
}

export function checkmark(bool: boolean) {
  return bool ? '✓' : 'X';
  return bool ? 'Yes' : 'No';
}