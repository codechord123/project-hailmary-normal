import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

type Mcq = Extract<ContentProblem, { kind: 'mcq' }>
interface Gate {
  uid: number
  problem: Mcq
  /** 각 레인에 배치된 보기 인덱스 (3개) */
  laneChoiceIdxs: number[]
  correctLane: number
  spawnTime: number
}

const LANES = 3
const GATE_MS = 6000 // 관문 도달까지 시간(읽고 조향)
const START_HEARTS = BALANCE.hearts
const GOAL = 8 // 통과할 관문 수

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * 퀴즈 러너 (챕터 「법이 뭐길래?」).
 * 자동으로 달리며 다가오는 3갈래 관문 중 "정답 레인"으로 조향한다.
 * (조작: 실시간 좌우 조향 — 다른 게임과 차별). 객관식(단일·보기 3+) 문제 사용.
 */
export function RunnerGame({ problems, title, intro, onClear, onExit, onAnswer }: Props) {
  const pool = problems.filter(
    (p): p is Mcq => p.kind === 'mcq' && !p.multiple && p.choices.length >= LANES,
  )
  const queueRef = useRef<Mcq[]>([])
  const uidRef = useRef(0)
  const playerLaneRef = useRef(1)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const makeGate = useCallback((): Gate => {
    if (queueRef.current.length === 0) queueRef.current = shuffle(pool)
    const problem = queueRef.current.shift()!
    const correctIdx = problem.correctIndexes[0]
    const wrong = problem.choices.map((_, i) => i).filter((i) => i !== correctIdx)
    const distractors = shuffle(wrong).slice(0, LANES - 1)
    const laneChoiceIdxs = shuffle([correctIdx, ...distractors])
    return { uid: ++uidRef.current, problem, laneChoiceIdxs, correctLane: laneChoiceIdxs.indexOf(correctIdx), spawnTime: Date.now() }
  }, [pool])

  const [gate, setGate] = useState<Gate | null>(null)
  const [playerLane, setPlayerLane] = useState(1)
  const [now, setNow] = useState(Date.now())
  const [hearts, setHearts] = useState(START_HEARTS)
  const [killed, setKilled] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<'pass' | 'crash' | null>(null)
  const [status, setStatus] = useState<'play' | 'clear' | 'over'>('play')
  const juice = useGameJuice()

  const move = (lane: number) => {
    playerLaneRef.current = lane
    setPlayerLane(lane)
  }

  // 관문 도달 처리 → 다음 관문 예약
  const resolveGate = useCallback((g: Gate) => {
    const correct = playerLaneRef.current === g.correctLane
    onAnswer?.(g.problem.id, correct)
    if (correct) {
      sfx.correct()
      setCombo((c) => {
        const nc = c + 1
        setBestCombo((b) => Math.max(b, nc))
        juice.correct(nc, { x: (playerLaneRef.current + 0.5) / LANES })
        setScore((s) => s + 100 + nc * 20)
        return nc
      })
      setFeedback('pass')
      setKilled((k) => {
        const nk = k + 1
        if (nk >= Math.min(GOAL, Math.max(3, pool.length))) { setStatus('clear'); sfx.clear() }
        return nk
      })
    } else {
      sfx.wrong()
      setCombo(0)
      setFeedback('crash')
      setHearts((h) => {
        const n = h - 1
        if (n <= 0) setStatus('over')
        return n
      })
    }
    setTimeout(() => setFeedback(null), 500)
  }, [juice, onAnswer, pool.length])

  // 관문 스폰 + 타이머
  useEffect(() => {
    if (status !== 'play') return
    if (!gate) {
      const g = makeGate()
      setGate(g)
      timerRef.current = setTimeout(() => { resolveGate(g); setGate(null) }, GATE_MS)
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [gate, status, makeGate, resolveGate])

  // 진행 바 tick
  useEffect(() => {
    if (status !== 'play') return
    const id = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [status])

  if (pool.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-white/70">
        <p>이 챕터에는 러너에 쓸 객관식(보기 3개+) 문제가 없어요.</p>
        <button onClick={onExit} className="underline">← 나가기</button>
      </div>
    )
  }

  const stars = starsFromHearts(hearts, START_HEARTS)
  const restart = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    queueRef.current = []; playerLaneRef.current = 1
    setGate(null); setPlayerLane(1); setHearts(START_HEARTS); setKilled(0)
    setCombo(0); setBestCombo(0); setScore(0); setFeedback(null); setStatus('play')
  }

  if (status === 'clear') {
    return (
      <GameResult emoji="🏁" title="결승선 통과!" confetti stars={stars}
        lines={[`통과 ${killed}`, `최고 콤보 ${bestCombo}`, `점수 ${score}`]}
        primary={{ label: '완료', onClick: () => onClear({ score, bestCombo, stars }) }}
        secondary={{ label: '다시 하기', onClick: restart }} />
    )
  }
  if (status === 'over') {
    return (
      <GameResult emoji="🛑" title="앗, 부딪혔어요…"
        lines={[`통과 ${killed}`, '다시 도전해 볼까요?']}
        primary={{ label: '다시 도전', onClick: restart }}
        secondary={{ label: '나가기', onClick: onExit }} />
    )
  }

  const progress = gate ? Math.min(1, (now - gate.spawnTime) / GATE_MS) : 0
  const goal = Math.min(GOAL, Math.max(3, pool.length))

  return (
    <div className={`min-h-screen px-4 sm:px-6 py-4 max-w-2xl mx-auto flex flex-col relative transition-colors ${
      feedback === 'crash' ? 'bg-red-500/5' : ''
    }`}>
      <JuiceOverlay floaters={juice.floaters} grade={juice.grade} combo={combo} />
      <header className="flex items-center justify-between">
        <button onClick={onExit} className="text-white/60 hover:text-white text-sm">← 나가기</button>
        <div className="text-sm text-rose-300">{'❤️'.repeat(hearts)}{'🤍'.repeat(Math.max(0, START_HEARTS - hearts))}</div>
      </header>

      <div className="mt-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 flex items-center justify-between">
        <div className="text-sm font-bold text-indigo-200">🏃 {title}</div>
        <div className="text-xs text-white/60 flex gap-3"><span>통과 {killed}/{goal}</span><span>콤보 {combo}</span></div>
      </div>

      {/* 질문 */}
      {gate && (
        <p className="mt-3 text-center font-bold text-white">
          {gate.problem.scenario && <span className="block text-xs font-normal text-white/70 mb-1">{gate.problem.scenario}</span>}
          {gate.problem.prompt}
        </p>
      )}

      {/* 트랙 (3레인) */}
      <div className="mt-3 relative rounded-2xl border-2 border-white/15 bg-black/30 overflow-hidden" style={{ height: '50vh', minHeight: 320 }}>
        {/* 다가오는 관문 */}
        <AnimatePresence>
          {gate && (
            <div key={gate.uid} className="absolute inset-0 grid grid-cols-3">
              {gate.laneChoiceIdxs.map((choiceIdx, lane) => (
                <div key={lane} className="relative border-r last:border-r-0 border-white/10 flex justify-center">
                  <motion.div
                    initial={{ top: '-18%' }}
                    animate={{ top: `${progress * 70}%` }}
                    transition={{ duration: 0.1, ease: 'linear' }}
                    className="absolute w-[92%] px-2 py-2 rounded-lg bg-gradient-to-br from-indigo-500/40 to-violet-700/40 border border-indigo-300/40 text-white text-xs sm:text-sm text-center font-bold"
                  >
                    {gate.problem.choices[choiceIdx]}
                  </motion.div>
                </div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* 플레이어 */}
        <motion.div
          className="absolute bottom-3 text-4xl"
          animate={{ left: `${(playerLane + 0.5) * (100 / LANES)}%` }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{ translateX: '-50%' }}
        >
          {feedback === 'crash' ? '💥' : '🏃'}
        </motion.div>
      </div>

      {/* 조향 버튼 */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {Array.from({ length: LANES }, (_, lane) => (
          <button
            key={lane}
            onClick={() => move(lane)}
            aria-label={`${lane + 1}번 레인으로`}
            className={`py-3 rounded-xl font-bold border-2 transition active:scale-95 ${
              playerLane === lane ? 'border-yellow-300 bg-yellow-300/15 text-white' : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10'
            }`}
          >
            {['◀ 왼쪽', '▲ 가운데', '오른쪽 ▶'][lane]}
          </button>
        ))}
      </div>

      {intro && killed === 0 && (
        <p className="mt-3 text-center text-xs text-white/45 leading-relaxed">{intro}</p>
      )}
    </div>
  )
}
