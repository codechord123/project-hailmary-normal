import { useEffect, useRef, useState } from 'react'
import type { ContentProblem } from '@/content/types'
import { sfx } from '@/lib/sfx'
import { useGameJuice, JuiceOverlay } from '@/content/components/GameJuice'
import { GameResult } from '@/content/components/GameResult'
import { QuickAnswer } from '@/content/components/QuickAnswer'
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

type Quizable = Extract<ContentProblem, { kind: 'mcq' | 'ox' }>

const W = 360
const H = 520
const CAR_Y = H - 64
const CAR_W = 40
const START_HEARTS = BALANCE.hearts
const BASE_SPEED = BALANCE.runner.obstacleSpeed
const OBS_MS = BALANCE.runner.obstacleSpawnMs
const CARD_MS = BALANCE.runner.cardSpawnMs
const GOAL = BALANCE.runner.problemsToClear
const OBSTACLES = ['🚧', '🪨', '🛢️', '🚌', '🚙', '⚠️']

interface Ent { id: number; kind: 'obstacle' | 'card'; x: number; y: number; emoji: string; hit: boolean }

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * 자동차 질주 (챕터 「법이 뭐길래?」).
 * 차를 자유롭게 좌우로 움직여 장애물은 피하고, 문제 카드(📝)는 일부러 받아 푼다.
 * 캔버스+rAF, 시간이 갈수록 빨라지는 긴장감. 목숨/점수.
 */
export function RunnerGame({ problems, title, intro, onClear, onExit, onAnswer }: Props) {
  const quizPool = problems.filter((p): p is Quizable => p.kind === 'mcq' || p.kind === 'ox')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const carX = useRef(W / 2)
  const ents = useRef<Ent[]>([])
  const idRef = useRef(0)
  const invulnRef = useRef(0)
  const obsTimer = useRef(0)
  const cardTimer = useRef(0)
  const elapsedRef = useRef(0)
  const pausedRef = useRef(false)
  const runningRef = useRef(true)
  const rafRef = useRef(0)
  const queue = useRef<Quizable[]>([])

  const lives = useLives(START_HEARTS)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [solved, setSolved] = useState(0)
  const [quiz, setQuiz] = useState<Quizable | null>(null)
  const [status, setStatus] = useState<'play' | 'clear' | 'over'>('play')
  const juice = useGameJuice()

  const moveTo = (clientX: number) => {
    const c = canvasRef.current
    if (!c) return
    const rect = c.getBoundingClientRect()
    const x = (clientX - rect.left) * (W / rect.width)
    carX.current = Math.max(CAR_W / 2, Math.min(W - CAR_W / 2, x))
  }
  const nudge = (dx: number) => { carX.current = Math.max(CAR_W / 2, Math.min(W - CAR_W / 2, carX.current + dx)) }

  const nextQuiz = (): Quizable => {
    if (queue.current.length === 0) queue.current = shuffle(quizPool)
    return queue.current.shift()!
  }

  useEffect(() => {
    if (quizPool.length === 0) return
    queue.current = shuffle(quizPool)
    const ctx = canvasRef.current?.getContext('2d')
    let last = performance.now()

    const step = (t: number) => {
      const dt = t - last
      last = t
      if (runningRef.current && !pausedRef.current) {
        elapsedRef.current += dt
        if (invulnRef.current > 0) invulnRef.current -= 1
        const speed = BASE_SPEED + Math.min(2.4, elapsedRef.current / 20000) // 점점 빨라짐

        obsTimer.current += dt
        if (obsTimer.current >= OBS_MS) {
          obsTimer.current = 0
          ents.current.push({ id: ++idRef.current, kind: 'obstacle', x: 24 + Math.random() * (W - 48), y: -20, emoji: OBSTACLES[idRef.current % OBSTACLES.length], hit: false })
        }
        cardTimer.current += dt
        if (cardTimer.current >= CARD_MS) {
          cardTimer.current = 0
          ents.current.push({ id: ++idRef.current, kind: 'card', x: 30 + Math.random() * (W - 60), y: -20, emoji: '📝', hit: false })
        }

        for (const e of ents.current) {
          e.y += e.kind === 'card' ? speed * 0.85 : speed
          if (!e.hit && e.y > CAR_Y - 24 && e.y < CAR_Y + 24 && Math.abs(e.x - carX.current) < CAR_W / 2 + 16) {
            if (e.kind === 'obstacle') {
              if (invulnRef.current <= 0) {
                e.hit = true
                invulnRef.current = 70
                setCombo(0)
                sfx.wrong()
                if (lives.lose()) { runningRef.current = false; setStatus('over') }
              }
            } else {
              e.hit = true
              pausedRef.current = true
              setQuiz(nextQuiz())
              sfx.tick?.()
            }
          }
        }
        ents.current = ents.current.filter((e) => e.y < H + 30 && !e.hit)
        setScore((s) => s + 1) // 거리 점수
      }

      if (ctx) {
        ctx.clearRect(0, 0, W, H)
        ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(0, 0, W, H)
        ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.setLineDash([14, 16])
        ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.setLineDash([])
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        for (const e of ents.current) {
          ctx.font = e.kind === 'card' ? '30px serif' : '30px serif'
          ctx.fillText(e.emoji, e.x, e.y)
        }
        if (invulnRef.current <= 0 || Math.floor(invulnRef.current / 6) % 2 === 0) {
          ctx.font = '36px serif'; ctx.fillText('🚗', carX.current, CAR_Y)
        }
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') nudge(-26)
      if (e.key === 'ArrowRight') nudge(26)
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

  const stars = starsFromHearts(lives.hearts, lives.startHearts)

  const restart = () => {
    ents.current = []; carX.current = W / 2; invulnRef.current = 0
    obsTimer.current = 0; cardTimer.current = 0; elapsedRef.current = 0
    queue.current = shuffle(quizPool); pausedRef.current = false; runningRef.current = true
    lives.reset(); setScore(0); setCombo(0); setBestCombo(0); setSolved(0)
    setQuiz(null); setStatus('play')
  }

  const onQuizResult = (correct: boolean) => {
    if (quiz) onAnswer?.(quiz.id, correct)
    if (correct) {
      sfx.correct()
      setCombo((c) => { const nc = c + 1; setBestCombo((b) => Math.max(b, nc)); juice.correct(nc, { x: 0.5 }); return nc })
      setScore((s) => s + 150)
      setSolved((n) => { const ns = n + 1; if (ns >= GOAL) { runningRef.current = false; setStatus('clear'); sfx.clear() } return ns })
    } else {
      sfx.wrong()
      setCombo(0)
      if (lives.lose()) { runningRef.current = false; setStatus('over') }
    }
    setQuiz(null)
    pausedRef.current = false
  }

  if (status === 'clear') {
    return (
      <GameResult emoji="🏁" title="결승선 도착!" confetti stars={stars}
        lines={[`해결한 문제 ${solved}`, `최고 콤보 ${bestCombo}`, `점수 ${score}`]}
        primary={{ label: '완료', onClick: () => onClear({ score, bestCombo, stars }) }}
        secondary={{ label: '다시 하기', onClick: restart }} />
    )
  }
  if (status === 'over') {
    return (
      <GameResult emoji="🛑" title="충돌!"
        lines={[`해결한 문제 ${solved}/${GOAL}`, '다시 도전해 볼까요?']}
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
          <HeartBar hearts={lives.hearts} max={lives.MAX_HEARTS} shielded={lives.shielded} />
          <span className="text-white/60 text-xs">📝 {solved}/{GOAL} · 점수 {score}</span>
        </div>
      </header>

      <div className="mt-1 text-center text-sm font-bold text-indigo-200">🚗 {title}</div>
      <div className="text-center text-[11px] text-white/45">차를 끌어 장애물은 피하고, 📝 문제 카드는 받아서 푸세요!</div>

      <div className="mt-2">
        <GameItemBar items={[
          { id: 'shield', icon: '🛡️ 보호막', label: '충돌 1회 무효', cost: 8, onBuy: lives.arm, disabled: lives.shielded },
          { id: 'life', icon: '❤️ 생명', label: '생명 +1', cost: 15, onBuy: lives.addLife },
        ]} />
      </div>

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onPointerMove={(e) => { if (e.buttons || e.pointerType === 'touch') moveTo(e.clientX) }}
        onPointerDown={(e) => moveTo(e.clientX)}
        className="mt-2 w-full rounded-xl border-2 border-white/15 bg-black/40 touch-none cursor-grab active:cursor-grabbing"
        style={{ aspectRatio: `${W} / ${H}` }}
      />

      {intro && <p className="mt-2 text-center text-[11px] text-white/35">{intro}</p>}

      {quiz && (
        <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl bg-space-900 border border-white/15 p-5">
            <div className="text-center text-sm font-bold text-amber-200 mb-2">📝 문제 카드!</div>
            <QuickAnswer key={quiz.id} problem={quiz} onResult={onQuizResult} />
          </div>
        </div>
      )}
    </div>
  )
}
