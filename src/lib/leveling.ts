export interface LevelInfo {
  level: number
  xpInLevel: number
  xpToNext: number
  title: string
  titleColor: string
}

const TITLES: Array<{ min: number; name: string; color: string }> = [
  { min: 1, name: '훈련생', color: 'text-slate-300' },
  { min: 4, name: '항해사', color: 'text-cyan-300' },
  { min: 7, name: '부함장', color: 'text-yellow-300' },
  { min: 11, name: '함장', color: 'text-pink-300' },
  { min: 16, name: '전설의 항해사', color: 'text-fuchsia-300' },
]

/** Lv N → Lv N+1 까지 필요한 누적 XP. 100, 250, 450, 700, ... 완만 증가 */
export const xpRequiredForLevel = (level: number): number =>
  level <= 1 ? 0 : 100 + (level - 2) * 150 + Math.max(0, level - 4) * 50

export const totalXpForLevel = (level: number): number => {
  let sum = 0
  for (let i = 1; i <= level; i++) sum += xpRequiredForLevel(i)
  return sum
}

export const computeLevelInfo = (totalXp: number): LevelInfo => {
  let level = 1
  let acc = 0
  while (true) {
    const need = xpRequiredForLevel(level + 1)
    if (acc + need > totalXp) break
    acc += need
    level++
    if (level > 99) break
  }
  const xpInLevel = totalXp - acc
  const xpToNext = xpRequiredForLevel(level + 1)
  const titleEntry = [...TITLES].reverse().find((t) => level >= t.min)!
  return {
    level,
    xpInLevel,
    xpToNext,
    title: titleEntry.name,
    titleColor: titleEntry.color,
  }
}

/** 레벨업 시 부여하는 스탯 포인트 */
export const STAT_POINTS_PER_LEVEL = 1
