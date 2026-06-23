/**
 * 오늘의 챌린지 — 날짜 시드로 모든 학생이 같은 문제 세트를 풀게.
 * 일일 1회 본인 최고기록 기록, 자정에 새 문제로 갱신.
 */

import { ADVANCED_PROBLEMS } from '@/data/advancedPool'
import type { Problem } from '@/types/problem'

const todayKey = (): string => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

/** 1차 LCG — 같은 시드면 항상 같은 시퀀스 */
const seededRandom = (seed: number) => {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

/** seed 기반으로 Math.random 임시 패치 → generator 사용 후 복원 */
const withSeededRandom = <T>(seed: number, fn: () => T): T => {
  const original = Math.random
  const rand = seededRandom(seed)
  Math.random = rand
  try {
    return fn()
  } finally {
    Math.random = original
  }
}

export interface DailyChallenge {
  date: string // YYYYMMDD
  problems: Problem[]
}

export const getDailyChallenge = (date = todayKey()): DailyChallenge => {
  // 날짜 시드로 응용 풀에서 10개 비복원 추출 — 단순 계산 generator 사용 금지.
  const seed = parseInt(date, 10) || 1
  const problems: Problem[] = []
  withSeededRandom(seed, () => {
    const pool = [...ADVANCED_PROBLEMS]
    // Fisher-Yates 셔플
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    for (let i = 0; i < Math.min(10, pool.length); i++) {
      problems.push({ ...pool[i], id: `${pool[i].id}-d${date}-${i}` })
    }
  })
  return { date, problems }
}

export const dailyDateLabel = (date = todayKey()): string => {
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`
}

// === Best score persistence ===
const BEST_KEY = 'hailmary-daily-best'

interface DailyBest {
  date: string
  score: number
  correctCount: number
}

const safeGet = (): DailyBest[] => {
  try {
    const raw = localStorage.getItem(BEST_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const getDailyBest = (date = todayKey()): DailyBest | null => {
  return safeGet().find((b) => b.date === date) ?? null
}

export const recordDailyBest = (score: number, correctCount: number, date = todayKey()) => {
  const all = safeGet()
  const idx = all.findIndex((b) => b.date === date)
  if (idx === -1) {
    all.push({ date, score, correctCount })
  } else if (score > all[idx].score) {
    all[idx] = { date, score, correctCount }
  }
  try {
    localStorage.setItem(BEST_KEY, JSON.stringify(all.slice(-30)))
  } catch {
    /* ignore */
  }
}

export const todayDateKey = todayKey

// === Endless 일일 누적 ===
const ENDLESS_DAILY_KEY = 'hailmary-endless-daily'

interface EndlessDaily {
  date: string
  best: number
}

const readEndlessDaily = (): EndlessDaily[] => {
  try {
    const raw = localStorage.getItem(ENDLESS_DAILY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const recordEndlessDailyBest = (score: number, date = todayKey()) => {
  const all = readEndlessDaily()
  const idx = all.findIndex((b) => b.date === date)
  if (idx === -1) all.push({ date, best: score })
  else if (score > all[idx].best) all[idx] = { date, best: score }
  try {
    localStorage.setItem(ENDLESS_DAILY_KEY, JSON.stringify(all.slice(-30)))
  } catch {
    /* ignore */
  }
}

export const getEndlessDailyBest = (date = todayKey()): number => {
  return readEndlessDaily().find((b) => b.date === date)?.best ?? 0
}

/** 일일 종합 점수 — 챌린지 + 엔들리스 그날 최고 */
export const getDailyCombinedScore = (date = todayKey()): number => {
  const ch = getDailyBest(date)?.score ?? 0
  const en = getEndlessDailyBest(date)
  return ch + en
}
