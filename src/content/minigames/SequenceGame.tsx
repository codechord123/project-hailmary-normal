import { useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ContentProblem } from '@/content/types'
import { sfx } from '@/lib/sfx'
import { useGameJuice, JuiceOverlay } from '@/content/components/GameJuice'
import { GameResult } from '@/content/components/GameResult'
import { useLives, GameItemBar, HeartBar } from '@/content/components/GameItems'
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

type Order = Extract<ContentProblem, { kind: 'order' }>

const START_HEARTS = BALANCE.hearts
const GOAL = 5

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * 타임라인 — 순서 맞추기 미니게임.
 * 섞인 단계를 올바른 순서대로 눌러 배열한다(재판 과정·법 제정 등 절차 학습).
 * 다른 게임과 차별: 시간 압박 없이 "과정"을 머릿속으로 재구성하는 추론형.
 */
export function SequenceGame({ problems, title, intro, onClear, onExit, onAnswer }: Props) {
  const pool = useMemo(
    () => problems.filter((p): p is Order => p.kind === 'order'),
    [problems],
  )
  const queueRef = useRef<Order[]>([])
  const nextOne = (): Order => {
    if (queueRef.current.length === 0) queueRef.current = shuffle(pool)
    return queueRef.current.shift()!
  }

  const [problem, setProblem] = useState<Order | null>(() => {
    if (pool.length === 0) return null
    queueRef.current = shuffle(pool)
    return queueRef.current.shift()!
  })
  // 섞인 보기: 원래 인덱스(origIdx)를 기억한 채로 표시
  const [shuffled, setShuffled] = useState<number[]>(() =>
    problem ? shuffle(problem.steps.map((_, i) => i)) : [],
  )
  const [placed, setPlaced] = useState<number[]>([]) // 학생이 누른 순서(origIdx)
  const [reveal, setReveal] = useState(false)
  const lives = useLives(START_HEARTS)
  const [solved, setSolved] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [score, setScore] = useState(0)
  const [status, setStatus] = useState<'play' | 'clear' | 'over'>('play')
  const juice = useGameJuice()

  if (pool.length === 0 || !problem) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-white/70">
        <p>이 챕터에는 순서 맞추기 문제가 없어요.</p>
        <button onClick={onExit} className="underline">← 나가기</button>
      </div>
    )
  }

  const goal = Math.min(GOAL, Math.max(3, pool.length))
  const stars = starsFromHearts(lives.hearts, lives.startHearts)

  const loadNext = () => {
    const np = nextOne()
    setProblem(np)
    setShuffled(shuffle(np.steps.map((_, i) => i)))
    setPlaced([])
    setReveal(false)
  }

  const remaining = shuffled.filter((idx) => !placed.includes(idx))

  const pick = (origIdx: number) => {
    if (status !== 'play' || reveal || placed.includes(origIdx)) return
    const next = [...placed, origIdx]
    setPlaced(next)
    if (next.length < problem.steps.length) {
      sfx.tick?.()
      return
    }
    // 모두 배열됨 → 채점 (정답 순서는 0,1,2,…)
    const correct = next.every((v, i) => v === i)
    onAnswer?.(problem.id, correct)
    if (correct) {
      sfx.correct()
      const c = combo + 1
      setCombo(c)
      setBestCombo((b) => Math.max(b, c))
      juice.correct(c, { x: 0.5 })
      setScore((s) => s + 120 + c * 20)
      setSolved((n) => {
        const ns = n + 1
        if (ns >= goal) { setStatus('clear'); sfx.clear() }
        return ns
      })
      setTimeout(() => { if (solved + 1 < goal) loadNext() }, 750)
    } else {
      sfx.wrong()
      setCombo(0)
      setReveal(true)
      const dead = lives.lose()
      if (dead) setStatus('over')
      setTimeout(() => { if (!dead) loadNext() }, 1600)
    }
  }

  const undo = () => {
    if (reveal || placed.length === 0) return
    setPlaced((p) => p.slice(0, -1))
  }

  const restart = () => {
    queueRef.current = shuffle(pool)
    const np = queueRef.current.shift()!
    setProblem(np)
    setShuffled(shuffle(np.steps.map((_, i) => i)))
    setPlaced([]); setReveal(false); lives.reset()
    setSolved(0); setCombo(0); setBestCombo(0); setScore(0); setStatus('play')
  }

  if (status === 'clear') {
    return (
      <GameResult emoji="⏱" title="순서를 모두 맞췄어요!" confetti stars={stars}
        lines={[`해결 ${solved}`, `최고 콤보 ${bestCombo}`, `점수 ${score}`]}
        primary={{ label: '완료', onClick: () => onClear({ score, bestCombo, stars }) }}
        secondary={{ label: '다시 하기', onClick: restart }} />
    )
  }
  if (status === 'over') {
    return (
      <GameResult emoji="🛑" title="하트를 다 썼어요…"
        lines={[`해결 ${solved} / ${goal}`, '다시 도전해 볼까요?']}
        primary={{ label: '다시 도전', onClick: restart }}
        secondary={{ label: '나가기', onClick: onExit }} />
    )
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-4 max-w-2xl mx-auto flex flex-col relative">
      <JuiceOverlay floaters={juice.floaters} grade={juice.grade} combo={combo} />
      <header className="flex items-center justify-between">
        <button onClick={onExit} className="text-white/60 hover:text-white text-sm">← 나가기</button>
        <div className="text-sm flex gap-3 items-center">
          <HeartBar hearts={lives.hearts} max={lives.MAX_HEARTS} shielded={lives.shielded} />
          <span className="text-white/60 text-xs">해결 {solved}/{goal}</span>
        </div>
      </header>

      <div className="mt-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2">
        <div className="text-sm font-bold text-indigo-200">⏱ {title}</div>
        <div className="text-xs text-white/60 mt-0.5">{problem.prompt} · 콤보 {combo}</div>
      </div>

      <div className="mt-2">
        <GameItemBar items={[
          { id: 'shield', icon: '🛡️ 보호막', label: '실수 1회 무효', cost: 8, onBuy: lives.arm, disabled: lives.shielded },
          { id: 'life', icon: '❤️ 생명', label: '생명 +1', cost: 15, onBuy: lives.addLife },
        ]} />
      </div>

      {/* 내가 배열한 순서 */}
      <div className="mt-3">
        <div className="text-[11px] text-white/40 font-bold mb-1">내 순서 (위 → 아래)</div>
        <ol className="flex flex-col gap-1.5 min-h-[3rem]">
          <AnimatePresence initial={false}>
            {placed.map((origIdx, i) => {
              const isWrongSpot = reveal && origIdx !== i
              return (
                <motion.li
                  key={origIdx}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 ${
                    reveal
                      ? isWrongSpot
                        ? 'border-red-400/70 bg-red-400/10'
                        : 'border-green-400/70 bg-green-400/10'
                      : 'border-indigo-400/50 bg-indigo-400/10'
                  }`}
                >
                  <span className="w-6 h-6 shrink-0 grid place-items-center rounded-full bg-indigo-500/40 text-indigo-50 text-xs font-bold">{i + 1}</span>
                  <span className="text-sm text-white/90">{problem.steps[origIdx]}</span>
                  {reveal && <span className="ml-auto text-xs">{isWrongSpot ? '✗' : '✓'}</span>}
                </motion.li>
              )
            })}
          </AnimatePresence>
          {placed.length === 0 && (
            <li className="text-white/35 text-sm px-1">아래 단계를 올바른 순서대로 눌러요.</li>
          )}
        </ol>
        {placed.length > 0 && !reveal && (
          <button onClick={undo} className="mt-1 text-xs text-white/50 hover:text-white underline">↩ 마지막 하나 빼기</button>
        )}
      </div>

      {reveal && (
        <div className="mt-2 p-2 rounded-lg bg-amber-400/15 text-amber-100 border border-amber-300/40 text-xs text-center font-bold">
          올바른 순서를 확인하고 다시 도전해요!
        </div>
      )}

      {/* 남은 단계 보기 (섞인 상태) */}
      <div className="mt-3">
        <div className="text-[11px] text-white/40 font-bold mb-1">단계 (눌러서 순서대로 배열)</div>
        <div className="flex flex-wrap gap-2">
          {remaining.map((origIdx) => (
            <motion.button
              key={origIdx}
              whileTap={{ scale: 0.96 }}
              onClick={() => pick(origIdx)}
              disabled={reveal}
              className="px-3 py-2 rounded-lg text-sm border border-white/15 bg-white/5 text-white/90 hover:bg-white/10 disabled:opacity-40 transition text-left"
            >
              {problem.steps[origIdx]}
            </motion.button>
          ))}
          {remaining.length === 0 && <span className="text-white/35 text-sm">모든 단계를 배열했어요!</span>}
        </div>
      </div>

      {intro && solved === 0 && placed.length === 0 && (
        <p className="mt-3 text-center text-xs text-white/45 leading-relaxed">{intro}</p>
      )}
    </div>
  )
}
