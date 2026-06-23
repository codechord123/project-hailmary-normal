/**
 * 학급 로컬 명부 — 한 단말에 여러 학생 프로파일을 보관.
 * Firebase 등 외부 연동 없이 동작하며, 추후 sync 레이어로 교체 가능한 구조.
 */

const ROSTER_KEY = 'hailmary-class-roster'

export interface RosterEntry {
  name: string
  classCode: string
  level: number
  title: string
  totalXp: number
  clearedCount: number
  totalStars: number
  endlessBest: number
  lastUpdated: number
}

const safeGet = (): RosterEntry[] => {
  try {
    const raw = localStorage.getItem(ROSTER_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const safeSet = (entries: RosterEntry[]) => {
  try {
    localStorage.setItem(ROSTER_KEY, JSON.stringify(entries))
  } catch {
    /* ignore */
  }
}

export const listRoster = (classCode?: string): RosterEntry[] => {
  const all = safeGet()
  return classCode ? all.filter((e) => e.classCode === classCode) : all
}

/** 동일 (name, classCode) 키로 덮어쓰기 */
export const upsertRoster = (entry: RosterEntry) => {
  if (!entry.name.trim()) return
  const all = safeGet().filter(
    (e) => !(e.name === entry.name && e.classCode === entry.classCode),
  )
  all.push({ ...entry, lastUpdated: Date.now() })
  safeSet(all)
}

export const removeRoster = (name: string, classCode: string) => {
  const all = safeGet().filter((e) => !(e.name === name && e.classCode === classCode))
  safeSet(all)
}

export const clearRoster = () => {
  try {
    localStorage.removeItem(ROSTER_KEY)
  } catch {
    /* ignore */
  }
}

export const leaderboardByStars = (classCode?: string): RosterEntry[] =>
  [...listRoster(classCode)].sort(
    (a, b) => b.totalStars - a.totalStars || b.level - a.level || b.totalXp - a.totalXp,
  )

export const leaderboardByEndless = (classCode?: string): RosterEntry[] =>
  [...listRoster(classCode)].sort((a, b) => b.endlessBest - a.endlessBest)
