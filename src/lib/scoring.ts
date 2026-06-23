export interface ChapterRunStats {
  correctCount: number
  wrongCount: number
  totalProblems: number
  maxCombo: number
  timeoutCount: number
}

export const computeStars = (s: ChapterRunStats): 1 | 2 | 3 => {
  const accuracy = s.correctCount / s.totalProblems
  if (s.wrongCount === 0 && s.timeoutCount === 0) return 3
  if (accuracy >= 0.6) return 2
  return 1
}

export const comboBonusXp = (combo: number): number => {
  if (combo >= 5) return 30
  if (combo >= 3) return 15
  if (combo >= 2) return 5
  return 0
}
