/**
 * 성과 기반 별점(1~3) 산정 — 저장은 Math.max(기존, 신규)라 기존 기록과 호환.
 */
export function starsFromAccuracy(correct: number, total: number): number {
  if (total <= 0) return 3
  const acc = correct / total
  return acc >= 0.9 ? 3 : acc >= 0.6 ? 2 : 1
}

export function starsFromMistakes(mistakes: number): number {
  return mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1
}

export function starsFromHearts(hearts: number, max: number): number {
  if (hearts <= 0) return 1
  if (hearts >= max) return 3
  return hearts >= Math.ceil(max / 2) ? 2 : 1
}
