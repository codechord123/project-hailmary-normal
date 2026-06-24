import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
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

type Mcq = Extract<ContentProblem, { kind: 'mcq' }>

const START_HEARTS = BALANCE.hearts
const GOAL = 8
const HINTS = 3

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * 오답 탐정 (챕터 「인권을 지킨 사람들」).
 * 사건(질문)을 보고 용의자(보기) 중 범인(정답)을 지목한다.
 * "🔍 단서"로 오답 하나를 제거할 수 있다(한정). 시간 압박 없는 추리형 — 보스전과 차별.
 */
export function DetectiveGame({ problems, title, intro, onClear, onExit, onAnswer }: Props) {
  const pool = useMemo(
    () => problems.filter((p): p is Mcq => p.kind === 'mcq' && !p.multiple),
    [problems],
  )
  const queueRef = useRef<Mcq[]>([])
  const nextCase = (): Mcq => {
    if (queueRef.current.length === 0) queueRef.current = shuffle(pool)
    return queueRef.current.shift()!
  }

  const [problem, setProblem] = useState<Mcq | null>(() => {
    if (pool.length === 0) return null
    queueRef.current = shuffle(pool)
    return queueRef.current.shift()!
  })
  const [eliminated, setEliminated] = useState<number[]>([])
  const [picked, setPicked] = useState<number | null>(null)
  const lives = useLives(START_HEARTS)
  const [solved, setSolved] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [score, setScore] = useState(0)
  const [hintsLeft, setHintsLeft] = useState(HINTS)
  const [status, setStatus] = useState<'play' | 'clear' | 'over'>('play')
  const juice = useGameJuice()

  if (pool.length === 0 || !problem) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-white/70">
        <p>이 챕터에는 수사할 사건(객관식)이 없어요.</p>
        <button onClick={onExit} className="underline">← 나가기</button>
      </div>
    )
  }

  const goal = Math.min(GOAL, Math.max(3, pool.length))
  const stars = starsFromHearts(lives.hearts, lives.startHearts)
  const answerIdx = problem.correctIndexes[0]

  const advance = () => {
    setPicked(null)
    setEliminated([])
    setProblem(nextCase())
  }

  const useHint = () => {
    if (hintsLeft <= 0 || picked !== null) return
    const wrong = problem.choices
      .map((_, i) => i)
      .filter((i) => i !== answerIdx && !eliminated.includes(i))
    if (wrong.length <= 1) return // 정답+1만 남기면 너무 쉬움 → 중단
    const drop = wrong[Math.floor(Math.random() * wrong.length)]
    setEliminated((e) => [...e, drop])
    setHintsLeft((h) => h - 1)
    setScore((s) => Math.max(0, s - 10))
  }

  const accuse = (i: number) => {
    if (picked !== null || eliminated.includes(i)) return
    setPicked(i)
    const correct = i === answerIdx
    onAnswer?.(problem.id, correct)
    if (correct) {
      sfx.correct()
      const c = combo + 1
      setCombo(c)
      setBestCombo((b) => Math.max(b, c))
      juice.correct(c, { x: 0.5 })
      setScore((s) => s + 100 + c * 20)
      setSolved((n) => {
        const ns = n + 1
        if (ns >= goal) { setStatus('clear'); sfx.clear() }
        return ns
      })
      setTimeout(() => { if (solved + 1 < goal) advance() }, 700)
    } else {
      sfx.wrong()
      setCombo(0)
      const dead = lives.lose()
      if (dead) setStatus('over')
      setTimeout(() => { if (!dead) advance() }, 1100)
    }
  }

  const restart = () => {
    queueRef.current = shuffle(pool)
    setProblem(queueRef.current.shift()!)
    setEliminated([]); setPicked(null); lives.reset(); setSolved(0)
    setCombo(0); setBestCombo(0); setScore(0); setHintsLeft(HINTS); setStatus('play')
  }

  if (status === 'clear') {
    return (
      <GameResult emoji="🕵️" title="사건 해결!" confetti stars={stars}
        lines={[`해결 ${solved}`, `최고 콤보 ${bestCombo}`, `점수 ${score}`]}
        primary={{ label: '완료', onClick: () => onClear({ score, bestCombo, stars }) }}
        secondary={{ label: '다시 하기', onClick: restart }} />
    )
  }
  if (status === 'over') {
    return (
      <GameResult emoji="🛑" title="수사 종료…"
        lines={[`해결 ${solved} / ${goal}`, '다시 도전해 볼까요?']}
        primary={{ label: '다시 수사', onClick: restart }}
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
        <div className="text-sm font-bold text-indigo-200">🕵️ {title}</div>
        <div className="text-xs text-white/60 mt-0.5">용의자 중 범인(정답)을 지목하세요. 콤보 {combo}</div>
      </div>

      <div className="mt-2">
        <GameItemBar items={[
          { id: 'shield', icon: '🛡️ 보호막', label: '오답 1회 무효', cost: 8, onBuy: lives.arm, disabled: lives.shielded },
          { id: 'life', icon: '❤️ 생명', label: '생명 +1', cost: 15, onBuy: lives.addLife },
        ]} />
      </div>

      {/* 사건 파일 */}
      <div className="mt-3 rounded-xl border border-amber-300/30 bg-amber-300/5 p-3">
        <div className="text-[11px] text-amber-200/80 font-bold mb-1">🔍 사건 파일</div>
        {problem.scenario && <p className="text-xs text-white/75 mb-1">{problem.scenario}</p>}
        <p className="font-bold text-white">{problem.prompt}</p>
      </div>

      {/* 용의자 */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {problem.choices.map((choice, i) => {
          const isOut = eliminated.includes(i)
          const isPicked = picked === i
          const reveal = picked !== null
          const cls = reveal && i === answerIdx
            ? 'border-green-400 bg-green-400/15 text-white'
            : isPicked
              ? 'border-red-400 bg-red-400/15 text-white'
              : isOut
                ? 'border-white/10 bg-white/5 text-white/30 line-through'
                : 'border-white/15 bg-white/5 text-white/90 hover:bg-white/10'
          return (
            <motion.button
              key={i}
              onClick={() => accuse(i)}
              disabled={picked !== null || isOut}
              whileTap={{ scale: 0.97 }}
              className={`text-left px-4 py-3 rounded-xl border-2 transition flex items-center gap-2 ${cls}`}
            >
              <span className="text-lg">{reveal && i === answerIdx ? '🔦' : isOut ? '🚫' : '🕶️'}</span>
              <span>{choice}</span>
            </motion.button>
          )
        })}
      </div>

      {/* 단서 */}
      <button
        onClick={useHint}
        disabled={hintsLeft <= 0 || picked !== null}
        className="mt-3 self-center px-4 py-2 rounded-xl text-sm font-bold bg-amber-400/15 text-amber-100 border border-amber-300/40 disabled:opacity-30"
      >
        🔍 단서 — 오답 하나 제거 (남은 {hintsLeft})
      </button>

      {intro && solved === 0 && picked === null && (
        <p className="mt-3 text-center text-xs text-white/45 leading-relaxed">{intro}</p>
      )}
    </div>
  )
}
