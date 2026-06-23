import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { findUnit } from '@/content/registry'
import { QuickAnswer } from '@/content/components/QuickAnswer'
import { useProgress } from '@/content/progress'
import { buildWeightedPool } from '@/content/pool'
import { awardAnswer } from '@/content/rewards'
import { sfx } from '@/lib/sfx'
import type { ContentProblem } from '@/content/types'

const START_HEARTS = 3

/** 끝없는 도전 — 틀리면 하트 차감, 최대한 길게 이어 가기 (활성 단원 문제) */
export function EndlessContent() {
  const { unitId = '' } = useParams()
  const unit = findUnit(unitId)
  const [runId, setRunId] = useState(0)

  const pool: ContentProblem[] = useMemo(() => {
    if (!unit) return []
    return buildWeightedPool(unit.chapters.flatMap((c) => c.problems), useProgress.getState().get(unit.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, runId])

  const [idx, setIdx] = useState(0)
  const [hearts, setHearts] = useState(START_HEARTS)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const [solved, setSolved] = useState(0)
  const [flash, setFlash] = useState<'ok' | 'no' | null>(null)
  const [status, setStatus] = useState<'play' | 'done'>('play')
  const recordAnswer = useProgress((s) => s.recordAnswer)
  const recordEndless = useProgress((s) => s.recordEndless)

  useEffect(() => {
    if (status === 'done' && unit) recordEndless(unit.id, best)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  if (!unit) return <Navigate to="/subjects" replace />

  const problem = pool[idx % pool.length]

  const handleResult = (ok: boolean) => {
    if (status !== 'play') return
    recordAnswer(unit.id, problem.id, ok)
    awardAnswer(ok)
    if (ok) {
      sfx.correct()
      const s = streak + 1
      setStreak(s)
      setBest((b) => Math.max(b, s))
      setSolved((x) => x + 1)
      setFlash('ok')
    } else {
      sfx.wrong()
      setStreak(0)
      setFlash('no')
      setHearts((h) => {
        const next = h - 1
        if (next <= 0) setStatus('done')
        return next
      })
    }
    setTimeout(() => setFlash(null), 180)
    setIdx((i) => i + 1)
  }

  const restart = () => {
    setRunId((r) => r + 1)
    setIdx(0); setHearts(START_HEARTS); setStreak(0); setBest(0); setSolved(0)
    setStatus('play'); setFlash(null)
  }

  if (status === 'done') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="text-6xl">🌌</div>
        <h1 className="text-2xl font-black text-white">끝없는 도전 종료!</h1>
        <div className="text-white/70 flex flex-col gap-1">
          <span>푼 문제 {solved}</span>
          <span>최고 연속 {best}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={restart} className="px-6 py-3 rounded-xl font-bold bg-indigo-500 hover:bg-indigo-400 transition">다시 도전</button>
          <Link to={`/unit/${unit.id}`} className="px-6 py-3 rounded-xl font-bold bg-white/10 hover:bg-white/20 transition">허브로</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen px-4 py-5 max-w-xl mx-auto flex flex-col gap-4 transition-colors ${
      flash === 'ok' ? 'bg-emerald-500/5' : flash === 'no' ? 'bg-red-500/5' : ''
    }`}>
      <div className="flex items-center justify-between">
        <Link to={`/unit/${unit.id}`} className="text-sm text-white/60 hover:text-white">← 나가기</Link>
        <div className="text-sm flex gap-3 items-center">
          <span className="text-rose-300">{'❤️'.repeat(hearts)}{'🤍'.repeat(Math.max(0, START_HEARTS - hearts))}</span>
          <span className="text-white/70">연속 {streak}</span>
        </div>
      </div>

      <div className="text-xs text-white/60">🌌 끝없는 도전 · 푼 문제 {solved}</div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
        <QuickAnswer key={idx} problem={problem} onResult={handleResult} />
      </div>
    </div>
  )
}
