import { create } from 'zustand'
import { useGameStore } from '@/store/gameStore'

/**
 * 단원별 학습 진도 저장소 (학생 + 단원 단위).
 * 오답 노트, 챕터 클리어·별점, XP/레벨, 업적을 한 곳에서 관리한다.
 * 외부 서버 없이 localStorage 에만 저장.
 */
export interface UnitProgress {
  xp: number
  cleared: string[] // chapterId 목록
  stars: Record<string, number> // chapterId -> 0..3
  wrongIds: string[] // 복습할 문제 id
  achievements: string[]
  bestTimeAttack: number
  bestEndless: number
}

export interface AchievementDef {
  id: string
  icon: string
  name: string
  desc: string
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-clear', icon: '🎖️', name: '첫 출동', desc: '챕터를 처음 클리어했어요' },
  { id: 'all-chapters', icon: '🏆', name: '단원 정복', desc: '모든 챕터를 클리어했어요' },
  { id: 'time-30', icon: '⏱', name: '스피드 수호자', desc: '타임어택에서 점수 300 이상' },
  { id: 'endless-10', icon: '🌌', name: '끈기의 수호자', desc: '끝없는 도전 10문제 이상 연속' },
  { id: 'clean-notes', icon: '🧹', name: '오답 정복', desc: '오답 노트를 모두 비웠어요' },
]

const KEY = 'platform-progress'
/** 안정적 참조의 빈 진도 (selector 재렌더 방지용) */
const EMPTY: UnitProgress = Object.freeze({
  xp: 0, cleared: [], stars: {}, wrongIds: [], achievements: [],
  bestTimeAttack: 0, bestEndless: 0,
}) as UnitProgress
const empty = (): UnitProgress => ({
  xp: 0, cleared: [], stars: {}, wrongIds: [], achievements: [],
  bestTimeAttack: 0, bestEndless: 0,
})

const loadAll = (): Record<string, UnitProgress> => {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}
const persist = (data: Record<string, UnitProgress>) => {
  try { localStorage.setItem(KEY, JSON.stringify(data)) } catch { /* 무시 */ }
}
const keyFor = (unitId: string) => {
  let s = 'guest'
  try { s = useGameStore.getState().studentName || 'guest' } catch { /* 무시 */ }
  return `${s}::${unitId}`
}

/** XP → 레벨 (100 XP마다 1레벨) */
export const levelOf = (xp: number) => Math.floor(xp / 100) + 1

interface ProgressState {
  data: Record<string, UnitProgress>
  get: (unitId: string) => UnitProgress
  recordAnswer: (unitId: string, problemId: string, correct: boolean) => void
  recordClear: (unitId: string, chapterId: string, stars: number, totalChapters: number) => void
  removeWrong: (unitId: string, problemId: string) => void
  recordTimeAttack: (unitId: string, score: number) => void
  recordEndless: (unitId: string, best: number) => void
}

export const useProgress = create<ProgressState>((set, getState) => {
  const update = (unitId: string, fn: (p: UnitProgress) => UnitProgress) => {
    set((s) => {
      const k = keyFor(unitId)
      const next = fn(s.data[k] ?? empty())
      const data = { ...s.data, [k]: next }
      persist(data)
      return { data }
    })
  }
  const addAch = (p: UnitProgress, id: string): UnitProgress =>
    p.achievements.includes(id) ? p : { ...p, achievements: [...p.achievements, id] }

  return {
    data: loadAll(),
    get: (unitId) => getState().data[keyFor(unitId)] ?? empty(),

    recordAnswer: (unitId, problemId, correct) =>
      update(unitId, (p) => ({
        ...p,
        xp: p.xp + (correct ? 5 : 0),
        wrongIds: correct
          ? p.wrongIds.filter((id) => id !== problemId)
          : p.wrongIds.includes(problemId) ? p.wrongIds : [...p.wrongIds, problemId],
      })),

    recordClear: (unitId, chapterId, stars, totalChapters) =>
      update(unitId, (p) => {
        let next: UnitProgress = {
          ...p,
          xp: p.xp + 50,
          cleared: p.cleared.includes(chapterId) ? p.cleared : [...p.cleared, chapterId],
          stars: { ...p.stars, [chapterId]: Math.max(p.stars[chapterId] ?? 0, stars) },
        }
        next = addAch(next, 'first-clear')
        if (next.cleared.length >= totalChapters) next = addAch(next, 'all-chapters')
        return next
      }),

    removeWrong: (unitId, problemId) =>
      update(unitId, (p) => {
        const wrongIds = p.wrongIds.filter((id) => id !== problemId)
        let next = { ...p, wrongIds }
        if (wrongIds.length === 0 && p.wrongIds.length > 0) next = addAch(next, 'clean-notes')
        return next
      }),

    recordTimeAttack: (unitId, score) =>
      update(unitId, (p) => {
        let next = { ...p, bestTimeAttack: Math.max(p.bestTimeAttack, score) }
        if (score >= 300) next = addAch(next, 'time-30')
        return next
      }),

    recordEndless: (unitId, best) =>
      update(unitId, (p) => {
        let next = { ...p, bestEndless: Math.max(p.bestEndless, best) }
        if (best >= 10) next = addAch(next, 'endless-10')
        return next
      }),
  }
})

/** 특정 단원의 진도를 구독 (변경 시 자동 리렌더) */
export function useUnitProgress(unitId: string): UnitProgress {
  return useProgress((s) => s.data[keyFor(unitId)] ?? EMPTY)
}
