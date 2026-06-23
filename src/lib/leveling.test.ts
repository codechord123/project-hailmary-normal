import { describe, it, expect } from 'vitest'
import { computeLevelInfo, xpRequiredForLevel } from './leveling'

describe('xpRequiredForLevel', () => {
  it('Lv1은 0', () => {
    expect(xpRequiredForLevel(1)).toBe(0)
  })
  it('Lv2 시작 비용', () => {
    expect(xpRequiredForLevel(2)).toBeGreaterThan(0)
  })
  it('상위 레벨은 더 비쌈', () => {
    expect(xpRequiredForLevel(5)).toBeGreaterThan(xpRequiredForLevel(2))
    expect(xpRequiredForLevel(10)).toBeGreaterThan(xpRequiredForLevel(5))
  })
})

describe('computeLevelInfo', () => {
  it('0 XP = Lv1 훈련생', () => {
    const info = computeLevelInfo(0)
    expect(info.level).toBe(1)
    expect(info.title).toBe('훈련생')
  })
  it('칭호 진행', () => {
    // 충분한 xp 부여 후 칭호 검증
    let xp = 0
    for (let lv = 2; lv <= 12; lv++) xp += xpRequiredForLevel(lv)
    const info = computeLevelInfo(xp)
    expect(info.level).toBeGreaterThanOrEqual(11)
    expect(['부함장', '함장', '전설의 항해사']).toContain(info.title)
  })
  it('XP 0이면 진행도 0/100', () => {
    const info = computeLevelInfo(0)
    expect(info.xpInLevel).toBe(0)
    expect(info.xpToNext).toBeGreaterThan(0)
  })
})
