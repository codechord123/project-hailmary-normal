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
  /** 문항별 시도 통계 (정답수 c / 전체 t) — 문항별 정답률용 */
  attempts: Record<string, { c: number; t: number }>
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
  bestTimeAttack: 0, bestEndless: 0, attempts: {},
}) as UnitProgress
const empty = (): UnitProgress => ({
  xp: 0, cleared: [], stars: {}, wrongIds: [], achievements: [],
  bestTimeAttack: 0, bestEndless: 0, attempts: {},
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
      update(unitId, (p) => {
        const att = p.attempts ?? {}
        const prev = att[problemId] ?? { c: 0, t: 0 }
        return {
          ...p,
          xp: p.xp + (correct ? 5 : 0),
          wrongIds: correct
            ? p.wrongIds.filter((id) => id !== problemId)
            : p.wrongIds.includes(problemId) ? p.wrongIds : [...p.wrongIds, problemId],
          attempts: { ...att, [problemId]: { c: prev.c + (correct ? 1 : 0), t: prev.t + 1 } },
        }
      }),

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

/** 복습 우선순위: 낮을수록 약점(먼저 복습) */
export function weaknessScore(progress: UnitProgress, problemId: string): number {
  const a = progress.attempts?.[problemId]
  const acc = a && a.t > 0 ? a.c / a.t : 1
  return acc + (progress.wrongIds.includes(problemId) ? -0.5 : 0)
}

/** 약점 문제 여부 — 오답 누적 또는 정답률 60% 미만 */
export function isWeak(progress: UnitProgress, problemId: string): boolean {
  if (progress.wrongIds.includes(problemId)) return true
  const a = progress.attempts?.[problemId]
  return !!a && a.t > 0 && a.c / a.t < 0.6
}

export interface StudentUnitRow {
  student: string
  progress: UnitProgress
}

/** 교사용 — 단원 전체 학생의 문항별 정답률 합산 (problemId -> 정답/시도) */
export function problemStatsForUnit(
  data: Record<string, UnitProgress>,
  unitId: string,
): Record<string, { c: number; t: number }> {
  const suffix = `::${unitId}`
  const agg: Record<string, { c: number; t: number }> = {}
  for (const [k, p] of Object.entries(data)) {
    if (!k.endsWith(suffix)) continue
    for (const [pid, s] of Object.entries(p.attempts ?? {})) {
      const a = agg[pid] ?? { c: 0, t: 0 }
      agg[pid] = { c: a.c + s.c, t: a.t + s.t }
    }
  }
  return agg
}

/** 교사용 — 한 단원을 학습한 모든 학생의 진도 (이 단말 기준) */
export function rowsForUnit(
  data: Record<string, UnitProgress>,
  unitId: string,
): StudentUnitRow[] {
  const suffix = `::${unitId}`
  return Object.entries(data)
    .filter(([k]) => k.endsWith(suffix))
    .map(([k, progress]) => ({ student: k.slice(0, k.length - suffix.length), progress }))
    .filter((r) => r.student.length > 0)
    .sort((a, b) => a.student.localeCompare(b.student))
}
