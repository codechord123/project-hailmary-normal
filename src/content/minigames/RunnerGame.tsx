import { useEffect, useRef, useState } from 'react'
import type { ContentProblem } from '@/content/types'
import { sfx } from '@/lib/sfx'
import { useGameJuice, JuiceOverlay } from '@/content/components/GameJuice'
import { GameResult } from '@/content/components/GameResult'
import { QuickAnswer } from '@/content/components/QuickAnswer'
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

type Quizable = Extract<ContentProblem, { kind: 'mcq' | 'ox' }>

const W = 360
const H = 520
const LANES = 3
const laneX = (i: number) => (i + 0.5) * (W / LANES)
const CAR_Y = H - 70
const SPEED = BALANCE.runner.obstacleSpeed
const SPAWN_MS = BALANCE.runner.spawnMs
const PER_CHECK = BALANCE.runner.dodgePerCheckpoint
const GOAL = BALANCE.runner.checkpoints
const START_HEARTS = BALANCE.hearts
const OBSTACLES = ['🚧', '🪨', '🛢️', '🚌', '⚠️']

interface Obstacle { id: number; lane: number; y: number; emoji: string; hit: boolean; passed: boolean }

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * 자동차 장애물 피하기 + 체크포인트 퀴즈 (챕터 「법이 뭐길래?」).
 * 차를 좌우 차선으로 옮겨 장애물을 피하고, 일정 수를 피하면 체크포인트에서 문제를 푼다.
 * 캔버스+rAF로 끊김 없이 흐른다.
 */
export function RunnerGame({ problems, title, intro, onClear, onExit, onAnswer }: Props) {
  const quizPool = problems.filter((p): p is Quizable => p.kind === 'mcq' || p.kind === 'ox')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const carLane = useRef(1)
  const obstacles = useRef<Obstacle[]>([])
  const oidRef = useRef(0)
  const dodgedRef = useRef(0)
  const nextCheckRef = useRef(PER_CHECK)
  const invulnRef = useRef(0) // 남은 무적 프레임
  const lastSpawnRef = useRef(0)
  const pausedRef = useRef(false)
  const runningRef = useRef(true)
  const rafRef = useRef(0)
  const quizQueue = useRef<Quizable[]>([])

  const [carLaneState, setCarLaneState] = useState(1)
  const [hearts, setHearts] = useState(START_HEARTS)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [passed, setPassed] = useState(0)
  const [dodged, setDodged] = useState(0)
  const [quiz, setQuiz] = useState<Quizable | null>(null)
  const [status, setStatus] = useState<'play' | 'clear' | 'over'>('play')
  const juice = useGameJuice()

  const move = (lane: number) => {
    const l = Math.max(0, Math.min(LANES - 1, lane))
    carLane.current = l
    setCarLaneState(l)
  }

  const nextQuiz = (): Quizable => {
    if (quizQueue.current.length === 0) quizQueue.current = shuffle(quizPool)
    return quizQueue.current.shift()!
  }

  useEffect(() => {
    if (quizPool.length === 0) return
    quizQueue.current = shuffle(quizPool)
    const ctx = canvasRef.current?.getContext('2d')
    let last = performance.now()

    const step = (t: number) => {
      const dt = t - last
      last = t
      if (runningRef.current && !pausedRef.current) {
        if (invulnRef.current > 0) invulnRef.current -= 1

        // 스폰
        lastSpawnRef.current += dt
        if (lastSpawnRef.current >= SPAWN_MS) {
          lastSpawnRef.current = 0
          const lane = Math.floor(Math.random() * LANES)
          obstacles.current.push({ id: ++oidRef.current, lane, y: -20, emoji: OBSTACLES[oidRef.current % OBSTACLES.length], hit: false, passed: false })
        }

        // 이동/충돌/통과
        for (const o of obstacles.current) {
          o.y += SPEED
          if (!o.hit && !o.passed && invulnRef.current <= 0 && o.lane === carLane.current && o.y > CAR_Y - 22 && o.y < CAR_Y + 22) {
            o.hit = true
            invulnRef.current = 60 // ~1초 무적
            setCombo(0)
            sfx.wrong()
            setHearts((h) => { const n = h - 1; if (n <= 0) { runningRef.current = false; setStatus('over') } return n })
          }
          if (!o.passed && o.y > H + 20) {
            o.passed = true
            if (!o.hit) {
              dodgedRef.current += 1
              setDodged(dodgedRef.current)
              setScore((s) => s + 10)
              if (dodgedRef.current >= nextCheckRef.current) {
                nextCheckRef.current += PER_CHECK
                pausedRef.current = true
                setQuiz(nextQuiz())
                sfx.tick?.()
              }
            }
          }
        }
        obstacles.current = obstacles.current.filter((o) => o.y < H + 40)
      }

      if (ctx) {
        ctx.clearRect(0, 0, W, H)
        // 도로
        ctx.fillStyle = 'rgba(255,255,255,0.04)'
        ctx.fillRect(0, 0, W, H)
        ctx.strokeStyle = 'rgba(255,255,255,0.12)'
        ctx.setLineDash([12, 14])
        for (let i = 1; i < LANES; i++) {
          ctx.beginPath(); ctx.moveTo((i * W) / LANES, 0); ctx.lineTo((i * W) / LANES, H); ctx.stroke()
        }
        ctx.setLineDash([])
        ctx.font = '30px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        for (const o of obstacles.current) if (!o.hit) ctx.fillText(o.emoji, laneX(o.lane), o.y)
        // 차 (무적이면 깜빡)
        if (invulnRef.current <= 0 || Math.floor(invulnRef.current / 6) % 2 === 0) {
          ctx.font = '36px serif'
          ctx.fillText('🚗', laneX(carLane.current), CAR_Y)
        }
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 키보드 조작
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') move(carLane.current - 1)
      if (e.key === 'ArrowRight') move(carLane.current + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (quizPool.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-white/70">
        <p>이 챕터에는 사용할 문제가 없어요.</p>
        <button onClick={onExit} className="underline">← 나가기</button>
      </div>
    )
  }

  const stars = starsFromHearts(hearts, START_HEARTS)

  const restart = () => {
    obstacles.current = []; carLane.current = 1; dodgedRef.current = 0
    nextCheckRef.current = PER_CHECK; invulnRef.current = 0; lastSpawnRef.current = 0
    quizQueue.current = shuffle(quizPool); pausedRef.current = false; runningRef.current = true
    setCarLaneState(1); setHearts(START_HEARTS); setScore(0); setCombo(0); setBestCombo(0)
    setPassed(0); setDodged(0); setQuiz(null); setStatus('play')
  }

  const onQuizResult = (correct: boolean) => {
    if (quiz) onAnswer?.(quiz.id, correct)
    if (correct) {
      sfx.correct()
      setCombo((c) => { const nc = c + 1; setBestCombo((b) => Math.max(b, nc)); juice.correct(nc, { x: 0.5 }); return nc })
      setScore((s) => s + 100)
      obstacles.current = [] // 체크포인트 통과 — 화면 정리
      setPassed((p) => {
        const np = p + 1
        if (np >= GOAL) { runningRef.current = false; setStatus('clear'); sfx.clear() }
        return np
      })
    } else {
      sfx.wrong()
      setCombo(0)
      setHearts((h) => { const n = h - 1; if (n <= 0) { runningRef.current = false; setStatus('over') } return n })
    }
    setQuiz(null)
    pausedRef.current = false
  }

  if (status === 'clear') {
    return (
      <GameResult emoji="🏁" title="결승선 도착!" confetti stars={stars}
        lines={[`체크포인트 ${passed}`, `최고 콤보 ${bestCombo}`, `점수 ${score}`]}
        primary={{ label: '완료', onClick: () => onClear({ score, bestCombo, stars }) }}
        secondary={{ label: '다시 하기', onClick: restart }} />
    )
  }
  if (status === 'over') {
    return (
      <GameResult emoji="🛑" title="충돌!"
        lines={[`체크포인트 ${passed}/${GOAL}`, '다시 도전해 볼까요?']}
        primary={{ label: '다시 도전', onClick: restart }}
        secondary={{ label: '나가기', onClick: onExit }} />
    )
  }

  return (
    <div className="min-h-screen px-4 py-4 max-w-md mx-auto flex flex-col relative">
      <JuiceOverlay floaters={juice.floaters} grade={juice.grade} combo={combo} />
      <header className="flex items-center justify-between">
        <button onClick={onExit} className="text-white/60 hover:text-white text-sm">← 나가기</button>
        <div className="text-sm flex gap-3 items-center">
          <span className="text-rose-300">{'❤️'.repeat(hearts)}{'🤍'.repeat(Math.max(0, START_HEARTS - hearts))}</span>
          <span className="text-white/60 text-xs">체크포인트 {passed}/{GOAL}</span>
        </div>
      </header>

      <div className="mt-1 text-center text-sm font-bold text-indigo-200">🚗 {title}</div>
      <div className="text-center text-[11px] text-white/45">다음 문제까지 {Math.max(0, nextCheckRef.current - dodged)}개 피하기 · 점수 {score}</div>

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="mt-2 w-full rounded-xl border-2 border-white/15 bg-black/40 touch-none"
        style={{ aspectRatio: `${W} / ${H}` }}
      />

      {/* 조향 버튼 */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {Array.from({ length: LANES }, (_, lane) => (
          <button
            key={lane}
            onClick={() => move(lane)}
            aria-label={`${lane + 1}번 차선으로`}
            className={`py-4 rounded-xl font-bold border-2 transition active:scale-95 ${
              carLaneState === lane ? 'border-yellow-300 bg-yellow-300/15 text-white' : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10'
            }`}
          >
            {['◀ 왼쪽', '▲ 가운데', '오른쪽 ▶'][lane]}
          </button>
        ))}
      </div>

      {intro && <p className="mt-2 text-center text-[11px] text-white/35">{intro}</p>}

      {quiz && (
        <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl bg-space-900 border border-white/15 p-5">
            <div className="text-center text-sm font-bold text-amber-200 mb-2">🚦 체크포인트 문제!</div>
            <QuickAnswer key={quiz.id} problem={quiz} onResult={onQuizResult} />
          </div>
        </div>
      )}
    </div>
  )
}
