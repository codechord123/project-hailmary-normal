import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { findUnit } from '@/content/registry'
import { QuickAnswer } from '@/content/components/QuickAnswer'
import { useProgress } from '@/content/progress'
import { awardAnswer } from '@/content/rewards'
import { useGameStore } from '@/store/gameStore'
import { sfx } from '@/lib/sfx'
import type { ContentProblem } from '@/content/types'

const COUNT = 5 // 오늘의 도전 문항 수
const BONUS_XP = 40
const BONUS_ENERGY = 20

/** 'YYYY-M-D' 오늘 키 */
const todayKey = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

/** 날짜+단원 시드 — 모든 학생이 같은 날 같은 문제를 푼다 */
const seedFrom = (s: string): number => {
  let h = 0
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h || 1
}

const doneKey = (unitId: string) => `hailmary-daily-content-${unitId}`
const isDoneToday = (unitId: string): boolean => {
  try { return localStorage.getItem(doneKey(unitId)) === todayKey() } catch { return false }
}
const markDoneToday = (unitId: string) => {
  try { localStorage.setItem(doneKey(unitId), todayKey()) } catch { /* ignore */ }
}

/**
 * 오늘의 도전 — 날짜 시드로 고른 단원 문제 5개를 푼다.
 * 하루 한 번 완료 보너스(XP·에너지). 연속 출석(streak)과 함께 매일 돌아올 이유.
 */
export function DailyChallengeContent() {
  const { unitId = '' } = useParams()
  const unit = findUnit(unitId)
  const recordAnswer = useProgress((s) => s.recordAnswer)

  // 날짜 시드로 mcq/ox 문제 중 COUNT개를 결정적으로 선택
  const todaysProblems: ContentProblem[] = useMemo(() => {
    if (!unit) return []
    const pool = unit.chapters
      .flatMap((c) => c.problems)
      .filter((p) => p.kind === 'mcq' || p.kind === 'ox')
    let s = seedFrom(`${todayKey()}-${unit.id}`)
    const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
    const arr = [...pool]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr.slice(0, Math.min(COUNT, arr.length))
  }, [unit])

  const [idx, setIdx] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [status, setStatus] = useState<'play' | 'done'>(() =>
    unit && isDoneToday(unit.id) ? 'done' : 'play',
  )
  const [alreadyDone] = useState(() => (unit ? isDoneToday(unit.id) : false))
  const [bonus, setBonus] = useState<{ xp: number; energy: number } | null>(null)

  if (!unit) return <Navigate to="/subjects" replace />
  if (todaysProblems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-white/70">
        <p>오늘의 도전 문제를 준비하지 못했어요.</p>
        <Link to={`/unit/${unit.id}`} className="underline">← 허브로</Link>
      </div>
    )
  }

  const problem = todaysProblems[idx]

  const finish = (finalCorrect: number) => {
    setStatus('done')
    if (!isDoneToday(unit.id)) {
      markDoneToday(unit.id)
      // 완료 보너스 (정답 비례 약간 가산)
      const s = useGameStore.getState()
      const xp = BONUS_XP + finalCorrect * 5
      const energy = BONUS_ENERGY + finalCorrect * 2
      s.addEnergy(energy)
      const r = s.addXp(xp)
      if (r.leveledUp) sfx.levelUp()
      else sfx.clear()
      setBonus({ xp, energy })
    }
  }

  const handleResult = (ok: boolean) => {
    if (status !== 'play') return
    recordAnswer(unit.id, problem.id, ok)
    awardAnswer(ok)
    const nextCorrect = correct + (ok ? 1 : 0)
    setCorrect(nextCorrect)
    if (idx + 1 >= todaysProblems.length) finish(nextCorrect)
    else setIdx((i) => i + 1)
  }

  if (status === 'done') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="text-6xl">📅</div>
        <h1 className="text-2xl font-black text-white">오늘의 도전 완료!</h1>
        {alreadyDone && !bonus ? (
          <p className="text-white/70">오늘 보상은 이미 받았어요. 내일 새로운 문제로 또 만나요! 🔥</p>
        ) : (
          <div className="text-white/70 flex flex-col gap-1">
            <span>맞힘 {correct} / {todaysProblems.length}</span>
            {bonus && <span className="text-yellow-200 font-bold">🎁 보너스 +{bonus.xp} XP · ⚡ +{bonus.energy}</span>}
          </div>
        )}
        <p className="text-xs text-white/40">매일 자정에 새 문제로 바뀌어요.</p>
        <Link to={`/unit/${unit.id}`} className="px-6 py-3 rounded-xl font-bold bg-indigo-500 hover:bg-indigo-400 transition">허브로</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-5 max-w-xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link to={`/unit/${unit.id}`} className="text-sm text-white/60 hover:text-white">← 나가기</Link>
        <span className="text-sm text-white/70">📅 오늘의 도전 {idx + 1} / {todaysProblems.length}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
          style={{ width: `${(idx / todaysProblems.length) * 100}%` }} />
      </div>
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
        <QuickAnswer key={idx} problem={problem} onResult={handleResult} />
      </div>
    </div>
  )
}
