import { describe, it, expect } from 'vitest'
import { computeStars, comboBonusXp } from './scoring'

describe('computeStars', () => {
  it('완벽 = 3성', () => {
    expect(computeStars({ correctCount: 5, wrongCount: 0, totalProblems: 5, maxCombo: 5, timeoutCount: 0 })).toBe(3)
  })
  it('60% 이상 = 2성', () => {
    expect(computeStars({ correctCount: 3, wrongCount: 2, totalProblems: 5, maxCombo: 2, timeoutCount: 0 })).toBe(2)
  })
  it('낮은 정답률 = 1성', () => {
    expect(computeStars({ correctCount: 1, wrongCount: 4, totalProblems: 5, maxCombo: 1, timeoutCount: 0 })).toBe(1)
  })
  it('타임아웃 1회만 있어도 3성 박탈', () => {
    expect(computeStars({ correctCount: 5, wrongCount: 0, totalProblems: 5, maxCombo: 5, timeoutCount: 1 })).not.toBe(3)
  })
})

describe('comboBonusXp', () => {
  it('단계별', () => {
    expect(comboBonusXp(1)).toBe(0)
    expect(comboBonusXp(2)).toBeGreaterThan(0)
    expect(comboBonusXp(3)).toBeGreaterThan(comboBonusXp(2))
    expect(comboBonusXp(5)).toBeGreaterThan(comboBonusXp(3))
  })
})
