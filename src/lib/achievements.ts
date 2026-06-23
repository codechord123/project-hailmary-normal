/**
 * 업적 시스템 — 학생 성취 추적.
 * 조건이 충족되면 자동 해금, 토스트로 알림.
 */

const KEY = 'hailmary-achievements'

export interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string
  category: 'progress' | 'mastery' | 'collection' | 'challenge'
  hidden?: boolean // 미해금 시 가려짐
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // 진행
  { id: 'first-launch', name: '항해 시작', description: '첫 발을 디뎠어!', icon: '🚀', category: 'progress' },
  { id: 'chapter1', name: '깨어남', description: '챕터 1을 클리어했어', icon: '🌅', category: 'progress' },
  { id: 'chapter3', name: '미지의 신호', description: '챕터 3을 클리어했어', icon: '📡', category: 'progress' },
  { id: 'all-chapters', name: '귀환자', description: '모든 챕터를 클리어!', icon: '🏆', category: 'progress' },

  // 숙달
  { id: 'first-combo', name: '연속 명중', description: '3 연속 정답', icon: '🔥', category: 'mastery' },
  { id: 'combo-10', name: '폭주', description: '10 연속 정답', icon: '⚡', category: 'mastery' },
  { id: 'simplify-master', name: '약분 마스터', description: '기약분수 50번 정답', icon: '🧮', category: 'mastery' },
  { id: 'common-denom', name: '통분 마스터', description: '통분 문제 30번 정답', icon: '🔄', category: 'mastery' },
  { id: 'no-wrong-clear', name: '완벽주의자', description: '오답 없이 챕터 클리어', icon: '💎', category: 'mastery' },

  // 수집
  { id: 'first-item', name: '첫 보상', description: '아이템을 처음 받았어', icon: '🎁', category: 'collection' },
  { id: 'level-5', name: '항해사', description: 'Lv.5 달성', icon: '⭐', category: 'collection' },
  { id: 'level-10', name: '베테랑', description: 'Lv.10 달성', icon: '🌟', category: 'collection' },
  { id: 'all-suits', name: '패션 항해사', description: '모든 우주복 해금', icon: '👕', category: 'collection' },

  // 도전
  { id: 'daily-done', name: '오늘의 도전', description: '오늘의 챌린지 완료', icon: '🌞', category: 'challenge', hidden: true },
  { id: 'endless-50', name: '인내', description: '엔들리스 50문제 연속', icon: '♾', category: 'challenge', hidden: true },
  { id: 'notebook-cleared', name: '오답 정복자', description: '미해결 오답 0 달성', icon: '✅', category: 'challenge', hidden: true },
  { id: 'time-attack-1k', name: '시간의 지배자', description: '타임 어택 1,000점 돌파', icon: '⏱', category: 'challenge', hidden: true },
  { id: 'boss-rush-clear', name: '챔피언', description: 'Boss Rush 클리어', icon: '👑', category: 'challenge', hidden: true },
  { id: 'boss-rush-s', name: 'S랭크 챔피언', description: 'Boss Rush S랭크 달성', icon: '🏅', category: 'challenge', hidden: true },
  { id: 'fever-time', name: '피버 진입', description: '타임 어택 10콤보 피버', icon: '🔥', category: 'challenge', hidden: true },
]

interface State {
  unlocked: Record<string, number> // id → 해금 시각
  correctSimplifiedCount: number
  correctDiffDenCount: number
}

const initial: State = { unlocked: {}, correctSimplifiedCount: 0, correctDiffDenCount: 0 }

const read = (): State => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...initial }
    return { ...initial, ...JSON.parse(raw) }
  } catch {
    return { ...initial }
  }
}

const write = (s: State) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}

type Listener = (id: string) => void
const listeners = new Set<Listener>()

export const onUnlock = (cb: Listener) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

const fire = (id: string) => {
  listeners.forEach((l) => l(id))
}

/** id 업적 해금 시도. 이미 해금되었으면 무시. 새로 해금 시 true 반환 */
export const unlock = (id: string): boolean => {
  const s = read()
  if (s.unlocked[id]) return false
  if (!ACHIEVEMENTS.find((a) => a.id === id)) return false
  s.unlocked[id] = Date.now()
  write(s)
  fire(id)
  return true
}

export const isUnlocked = (id: string): boolean => Boolean(read().unlocked[id])

export const listAll = () => ACHIEVEMENTS
export const getUnlockedMap = () => read().unlocked

// === 누적 카운트 ===
export const trackCorrectSimplified = () => {
  const s = read()
  s.correctSimplifiedCount += 1
  write(s)
  if (s.correctSimplifiedCount >= 50) unlock('simplify-master')
}

export const trackCorrectDiffDen = () => {
  const s = read()
  s.correctDiffDenCount += 1
  write(s)
  if (s.correctDiffDenCount >= 30) unlock('common-denom')
}

export const getCounters = () => {
  const s = read()
  return {
    simplified: s.correctSimplifiedCount,
    diffDen: s.correctDiffDenCount,
  }
}
