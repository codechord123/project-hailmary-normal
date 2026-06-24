import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { ContentProblem } from '@/content/types'
import { sfx } from '@/lib/sfx'
import { useGameJuice, JuiceOverlay } from '@/content/components/GameJuice'
import { GameResult } from '@/content/components/GameResult'
import { starsFromHearts } from '@/content/score'
import { BALANCE } from '@/content/balance'

interface Props {
  problems: ContentProblem[]
  title: string
  intro?: string
  onClear: (result: { score: number; bestCombo: number; stars: number }) => void
  onExit: () => void
  onAnswer?: (problemId: string, correct: boolean) => void
}

const START_HEARTS = BALANCE.hearts
const GOAL = BALANCE.oxrush.goal // 정답 N개면 클리어
const Q_BASE = BALANCE.oxrush.qBaseSec // 문항 기본 제한시간(초)
const Q_MIN = BALANCE.oxrush.qMinSec // 문항 최소 제한시간(초)
const qDurFor = (correctCount: number) =>
  Math.max(Q_MIN, Q_BASE - Math.floor(correctCount * BALANCE.oxrush.qRampPerCorrect))

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * OX 번개 미니게임 (챕터 4 — 「인권이란 무엇일까」).
 * 빠르게 지나가는 진술을 O/X로 판단. 객관식 OX 문제 풀을 순환 소비.
 */
export function OxRushGame({ problems, title, intro, onClear, onExit, onAnswer }: Props) {
  const pool = useMemo(
    () => shuffle(problems.filter((p): p is Extract<ContentProblem, { kind: 'ox' }> => p.kind === 'ox')),
    [problems],
  )
  const [idx, setIdx] = useState(0)
  const [hearts, setHearts] = useState(START_HEARTS)
  const [correctCount, setCorrectCount] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [score, setScore] = useState(0)
  const [flash, setFlash] = useState<'ok' | 'no' | null>(null)
  const [status, setStatus] = useState<'play' | 'clear' | 'over'>('play')
  const [qTime, setQTime] = useState(Q_BASE)
  const juice = useGameJuice()

  // 문항이 바뀌면 제한시간 재설정 (진행할수록 단축)
  useEffect(() => {
    setQTime(qDurFor(correctCount))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  // 문항 카운트다운 — 0이면 콤보만 리셋하고 다음 문제(하트 차감 없음, 소프트락 방지)
  useEffect(() => {
    if (status !== 'play') return
    if (qTime <= 0) {
      setCombo(0)
      setFlash('no')
      setTimeout(() => setFlash(null), 160)
      setIdx((i) => i + 1)
      return
    }
    const id = setTimeout(() => setQTime((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [qTime, status])

  if (pool.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-white/70">
        <p>이 챕터에는 아직 OX 문제가 없어요.</p>
        <button onClick={onExit} className="underline">← 나가기</button>
      </div>
    )
  }

  const problem = pool[idx % pool.length]
  const goal = Math.min(GOAL, Math.max(5, pool.length))

  const answer = (v: boolean) => {
    if (status !== 'play') return
    const ok = v === problem.answer
    onAnswer?.(problem.id, ok)
    sfx[ok ? 'correct' : 'wrong']()
    setFlash(ok ? 'ok' : 'no')
    setTimeout(() => setFlash(null), 160)
    if (ok) {
      const c = combo + 1
      setCombo(c)
      setBestCombo((b) => Math.max(b, c))
      setScore((s) => s + 10 + c * 2)
      juice.correct(c, { x: 0.5 })
      const cc = correctCount + 1
      setCorrectCount(cc)
      if (cc >= goal) { setStatus('clear'); sfx.clear() }
    } else {
      setCombo(0)
      setHearts((h) => {
        const n = h - 1
        if (n <= 0) setStatus('over')
        return n
      })
    }
    setIdx((i) => i + 1)
  }

  const restart = () => {
    setIdx(0); setHearts(START_HEARTS); setCorrectCount(0); setCombo(0)
    setBestCombo(0); setScore(0); setFlash(null); setStatus('play')
  }

  if (status === 'clear') {
    return (
      <GameResult emoji="⚡" title="번개처럼 통과!" confetti
        stars={starsFromHearts(hearts, START_HEARTS)}
        lines={[`정답 ${correctCount}`, `최고 콤보 ${bestCombo}`, `점수 ${score}`]}
        primary={{ label: '완료', onClick: () => onClear({ score, bestCombo, stars: starsFromHearts(hearts, START_HEARTS) }) }}
        secondary={{ label: '다시 하기', onClick: restart }} />
    )
  }
  if (status === 'over') {
    return (
      <GameResult emoji="🛑" title="앗, 하트를 다 썼어요"
        lines={[`정답 ${correctCount} / ${goal}`, '다시 도전해 볼까요?']}
        primary={{ label: '다시 도전', onClick: restart }}
        secondary={{ label: '나가기', onClick: onExit }} />
    )
  }

  return (
    <div className={`min-h-screen px-4 py-6 max-w-xl mx-auto flex flex-col gap-5 transition-colors relative ${
      flash === 'ok' ? 'bg-emerald-500/5' : flash === 'no' ? 'bg-red-500/5' : ''
    }`}>
      <JuiceOverlay floaters={juice.floaters} grade={juice.grade} combo={combo} />
      <header className="flex items-center justify-between">
        <button onClick={onExit} className="text-white/60 hover:text-white text-sm">← 나가기</button>
        <div className="text-sm flex gap-3 items-center">
          <span className="text-rose-300">{'❤️'.repeat(hearts)}{'🤍'.repeat(Math.max(0, START_HEARTS - hearts))}</span>
          <span className="text-white/70">콤보 {combo}</span>
        </div>
      </header>

      <div className="text-center text-sm font-bold text-indigo-200">⚡ {title}</div>
      <div className="text-center text-xs text-white/55">정답 {correctCount} / {goal} · 점수 {score}</div>

      {/* 문항 제한시간 바 */}
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${qTime <= 2 ? 'bg-red-500' : 'bg-space-accent'}`}
          style={{ width: `${(qTime / qDurFor(correctCount)) * 100}%` }}
        />
      </div>

      <motion.div
        key={idx}
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="rounded-2xl bg-white/5 border border-white/10 p-6 min-h-[7rem] flex items-center justify-center text-center"
      >
        <p className="text-lg font-bold text-white leading-relaxed">{problem.statement}</p>
      </motion.div>

      <div className="flex gap-4 justify-center">
        <button aria-label="맞음 (O)" onClick={() => answer(true)} className="w-28 h-28 rounded-3xl text-5xl font-black border-2 border-white/20 bg-white/5 hover:bg-emerald-400/15 hover:border-emerald-300 transition active:scale-95">⭕</button>
        <button aria-label="틀림 (X)" onClick={() => answer(false)} className="w-28 h-28 rounded-3xl text-5xl font-black border-2 border-white/20 bg-white/5 hover:bg-red-400/15 hover:border-red-300 transition active:scale-95">❌</button>
      </div>

      {intro && correctCount === 0 && (
        <p className="text-center text-xs text-white/45 leading-relaxed">{intro}</p>
      )}
    </div>
  )
}
