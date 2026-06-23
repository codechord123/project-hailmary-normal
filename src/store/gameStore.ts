import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ItemId } from '@/data/items'
import { SUITS, HELMETS } from '@/data/cosmetics'
import { computeLevelInfo, STAT_POINTS_PER_LEVEL } from '@/lib/leveling'
import { unlock as unlockAchievement } from '@/lib/achievements'

export interface Stats {
  lung: number // 폐활량 (산소 최대치 +10 / point)
  reflex: number // 반응속도 (문제 시간 +3초 / point)
  intuition: number // 직감 (힌트 비용 -1 at 2pt)
  luck: number // 행운 (보너스 XP 확률 % / point)
}

export interface Cosmetics {
  suit: string
  helmet: string
}

interface ChapterClearRecord {
  stars: number
  bestCombo: number
  elapsedMs?: number
  accuracy?: number // 0~1
  attempts?: number
}

interface GameState {
  // 자원
  oxygen: number
  energy: number
  bond: number
  // 진행
  clearedChapters: number[]
  chapterRecords: Record<number, ChapterClearRecord>
  // RPG
  totalXp: number
  statPoints: number
  stats: Stats
  cosmetics: Cosmetics
  items: Partial<Record<ItemId, number>>
  // 설정
  muted: boolean
  studentName: string
  classCode: string
  presentationMode: boolean
  bgmEnabled: boolean
  bgmVolume: number // 0..1

  // actions
  setStudentName: (name: string) => void
  setClassCode: (code: string) => void
  togglePresentationMode: () => void
  toggleBgmEnabled: () => void
  setBgmVolume: (v: number) => void
  addOxygen: (delta: number) => void
  setOxygen: (v: number) => void
  addEnergy: (delta: number) => void
  addBond: (delta: number) => void
  addXp: (amount: number) => { leveledUp: boolean; newLevel: number }
  allocateStat: (key: keyof Stats) => boolean
  resetStats: () => void
  setCosmetic: (key: keyof Cosmetics, id: string) => void
  giveItem: (id: ItemId, qty?: number) => void
  useItem: (id: ItemId) => boolean
  recordChapter: (chapter: number, stars: number, bestCombo: number, extras?: { elapsedMs?: number; accuracy?: number }) => void
  clearChapter: (chapter: number) => void
  resetForChapter: () => void
  toggleMute: () => void
  reset: () => void
  maxOxygen: () => number
  baseTimePerProblem: () => number
}

const INITIAL_STATS: Stats = { lung: 0, reflex: 0, intuition: 0, luck: 0 }
const INITIAL_COSMETICS: Cosmetics = { suit: 'white', helmet: 'round' }

const INITIAL = {
  oxygen: 100,
  energy: 0,
  bond: 0,
  clearedChapters: [] as number[],
  chapterRecords: {} as Record<number, ChapterClearRecord>,
  totalXp: 0,
  statPoints: 0,
  stats: { ...INITIAL_STATS },
  cosmetics: { ...INITIAL_COSMETICS },
  items: {} as Partial<Record<ItemId, number>>,
  muted: false,
  studentName: '',
  classCode: '',
  presentationMode: false,
  bgmEnabled: true,
  bgmVolume: 0.5,
}

const safeStorage = createJSONStorage(() => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage
    }
  } catch {
    /* localStorage 비활성 */
  }
  const mem: Record<string, string> = {}
  return {
    getItem: (k: string) => mem[k] ?? null,
    setItem: (k: string, v: string) => {
      mem[k] = v
    },
    removeItem: (k: string) => {
      delete mem[k]
    },
  }
})

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...INITIAL,
      maxOxygen: () => 100 + get().stats.lung * 10,
      baseTimePerProblem: () => 50 + get().stats.reflex * 4,
      addOxygen: (delta) =>
        set((s) => ({
          oxygen: Math.max(0, Math.min(s.maxOxygen(), s.oxygen + delta)),
        })),
      setOxygen: (v) =>
        set((s) => ({ oxygen: Math.max(0, Math.min(s.maxOxygen(), v)) })),
      addEnergy: (delta) => set((s) => ({ energy: Math.max(0, s.energy + delta) })),
      addBond: (delta) => set((s) => ({ bond: Math.max(0, s.bond + delta) })),
      addXp: (amount) => {
        const before = computeLevelInfo(get().totalXp).level
        set((s) => ({ totalXp: s.totalXp + amount }))
        const after = computeLevelInfo(get().totalXp).level
        if (after >= 5) unlockAchievement('level-5')
        if (after >= 10) unlockAchievement('level-10')
        if (after > before) {
          const gained = (after - before) * STAT_POINTS_PER_LEVEL
          set((s) => ({ statPoints: s.statPoints + gained }))
          return { leveledUp: true, newLevel: after }
        }
        return { leveledUp: false, newLevel: after }
      },
      allocateStat: (key) => {
        if (get().statPoints < 1) return false
        set((s) => ({
          statPoints: s.statPoints - 1,
          stats: { ...s.stats, [key]: s.stats[key] + 1 },
        }))
        return true
      },
      resetStats: () =>
        set((s) => {
          const used = s.stats.lung + s.stats.reflex + s.stats.intuition + s.stats.luck
          return {
            stats: { ...INITIAL_STATS },
            statPoints: s.statPoints + used,
          }
        }),
      setCosmetic: (key, id) => {
        const validList = key === 'suit' ? SUITS : HELMETS
        if (!validList.some((x) => x.id === id)) return
        set((s) => ({ cosmetics: { ...s.cosmetics, [key]: id } }))
      },
      giveItem: (id, qty = 1) =>
        set((s) => ({ items: { ...s.items, [id]: (s.items[id] ?? 0) + qty } })),
      useItem: (id) => {
        const have = get().items[id] ?? 0
        if (have < 1) return false
        set((s) => ({ items: { ...s.items, [id]: (s.items[id] ?? 0) - 1 } }))
        return true
      },
      recordChapter: (chapter, stars, bestCombo, extras) =>
        set((s) => {
          const prev = s.chapterRecords[chapter]
          // 통계는 본 시도 값 또는 이전 최고 (시간은 더 짧은 쪽, accuracy는 더 높은 쪽)
          const newElapsed = extras?.elapsedMs
          const prevElapsed = prev?.elapsedMs
          const bestElapsed =
            newElapsed && prevElapsed
              ? Math.min(newElapsed, prevElapsed)
              : newElapsed ?? prevElapsed
          const newAccuracy = extras?.accuracy
          const bestAccuracy =
            newAccuracy != null && prev?.accuracy != null
              ? Math.max(newAccuracy, prev.accuracy)
              : newAccuracy ?? prev?.accuracy
          const next: ChapterClearRecord = {
            stars: Math.max(prev?.stars ?? 0, stars),
            bestCombo: Math.max(prev?.bestCombo ?? 0, bestCombo),
            elapsedMs: bestElapsed,
            accuracy: bestAccuracy,
            attempts: (prev?.attempts ?? 0) + 1,
          }
          return { chapterRecords: { ...s.chapterRecords, [chapter]: next } }
        }),
      clearChapter: (chapter) =>
        set((s) => ({
          clearedChapters: s.clearedChapters.includes(chapter)
            ? s.clearedChapters
            : [...s.clearedChapters, chapter],
        })),
      resetForChapter: () => set((s) => ({ oxygen: s.maxOxygen(), energy: s.energy })),
      toggleMute: () => set((s) => ({ muted: !s.muted })),
      setStudentName: (name) => set({ studentName: name.slice(0, 16) }),
      setClassCode: (code) => set({ classCode: code.slice(0, 16) }),
      togglePresentationMode: () => set((s) => ({ presentationMode: !s.presentationMode })),
      toggleBgmEnabled: () => set((s) => ({ bgmEnabled: !s.bgmEnabled })),
      setBgmVolume: (v) => set({ bgmVolume: Math.max(0, Math.min(1, v)) }),
      reset: () => set({ ...INITIAL }),
    }),
    {
      name: 'hailmary-save',
      version: 5,
      storage: safeStorage,
      migrate: (persisted: any, version) => {
        if (!persisted) return persisted
        let p = persisted
        if (version < 2) {
          p = {
            ...INITIAL,
            ...p,
            chapterRecords: p.chapterRecords ?? {},
            totalXp: p.totalXp ?? 0,
            statPoints: p.statPoints ?? 0,
            stats: { ...INITIAL_STATS, ...(p.stats ?? {}) },
            cosmetics: { ...INITIAL_COSMETICS, ...(p.cosmetics ?? {}) },
            items: p.items ?? {},
            muted: p.muted ?? false,
          }
        }
        if (version < 3) {
          p = {
            ...p,
            studentName: p.studentName ?? '',
            classCode: p.classCode ?? '',
            presentationMode: p.presentationMode ?? false,
          }
        }
        if (version < 4) {
          p = {
            ...p,
            bgmEnabled: p.bgmEnabled ?? true,
            bgmVolume: p.bgmVolume ?? 0.5,
          }
        }
        if (version < 5) {
          // chapterRecords에 elapsedMs/accuracy/attempts 필드 없는 옛 데이터 호환
          p = { ...p, chapterRecords: p.chapterRecords ?? {} }
        }
        return p
      },
    },
  ),
)
