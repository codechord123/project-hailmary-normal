import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { findUnit } from '@/content/registry'
import { QuickAnswer } from '@/content/components/QuickAnswer'
import { useProgress, isWeak } from '@/content/progress'
import { awardAnswer } from '@/content/rewards'
import { sfx } from '@/lib/sfx'
import type { ContentProblem } from '@/content/types'

const DURATION = 60 // 초

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 타임어택 — 제한 시간 안에 최대한 많이 맞히기 (활성 단원 문제) */
export function TimeAttackContent() {
  const { unitId = '' } = useParams()
  const unit = findUnit(unitId)
  const [runId, setRunId] = useState(0)

  const pool: ContentProblem[] = useMemo(() => {
    if (!unit) return []
    const base = shuffle(unit.chapters.flatMap((c) => c.problems).filter((p) => p.kind !== 'matching'))
    const prog = useProgress.getState().get(unit.id)
    const weak = base.filter((p) => isWeak(prog, p.id))
    return weak.length ? [...shuffle(weak), ...base] : base
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, runId])

  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [status, setStatus] = useState<'play' | 'done'>('play')
  const [flash, setFlash] = useState<'ok' | 'no' | null>(null)
  const recordAnswer = useProgress((s) => s.recordAnswer)
  const recordTimeAttack = useProgress((s) => s.recordTimeAttack)

  useEffect(() => {
    if (status !== 'play') return
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { setStatus('done'); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [status])

  useEffect(() => {
    if (status === 'done' && unit) recordTimeAttack(unit.id, score)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  if (!unit) return <Navigate to="/subjects" replace />

  const problem = pool[idx % pool.length]

  const handleResult = (ok: boolean) => {
    if (status !== 'play') return
    recordAnswer(unit.id, problem.id, ok)
    awardAnswer(ok)
    setAnswered((a) => a + 1)
    if (ok) {
      sfx.correct()
      const c = combo + 1
      setCombo(c)
      setCorrect((x) => x + 1)
      setScore((s) => s + 10 + c * 2)
      setFlash('ok')
    } else {
      sfx.wrong()
      setCombo(0)
      setTimeLeft((t) => Math.max(0, t - 2)) // 오답 시간 -2초
      setFlash('no')
    }
    setTimeout(() => setFlash(null), 180)
    setIdx((i) => i + 1)
  }

  const restart = () => {
    setRunId((r) => r + 1)
    setIdx(0); setScore(0); setCorrect(0); setAnswered(0); setCombo(0)
    setTimeLeft(DURATION); setStatus('play'); setFlash(null)
  }

  if (status === 'done') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="text-6xl">⏱</div>
        <h1 className="text-2xl font-black text-white">타임 어택 종료!</h1>
        <div className="text-white/70 flex flex-col gap-1">
          <span>점수 {score}</span>
          <span>맞힘 {correct} / {answered}</span>
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
        <div className="text-sm text-white/70 flex gap-3">
          <span>점수 {score}</span><span>콤보 {combo}</span>
        </div>
      </div>

      {/* 시간 바 */}
      <div>
        <div className="flex justify-between text-xs text-white/60 mb-1">
          <span>⏱ 타임 어택</span><span>{timeLeft}s</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 10 ? 'bg-red-500' : 'bg-space-accent'}`}
            style={{ width: `${(timeLeft / DURATION) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
        <QuickAnswer key={idx} problem={problem} onResult={handleResult} />
      </div>
    </div>
  )
}
