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
const R = 7 // 공 반지름
const PW = 76 // 패들 너비
const PH = 12
const PADDLE_Y = H - 34
const SPEED = 4.2
const COLS = 6
const ROWS = 4
const BRICK_H = 20
const ITEM_VY = 2.4
const START_HEARTS = BALANCE.hearts

interface Brick { x: number; y: number; w: number; alive: boolean; hue: number }
interface Item { x: number; y: number }
interface Ball { x: number; y: number; vx: number; vy: number }

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * 벽돌깨기 + 퀴즈 게이트 (챕터 6 클라이맥스).
 * 벽돌을 깨면 아이템이 떨어지고, 받으면 문제가 나와 정답이어야 보상을 얻는다.
 */
export function BreakoutGame({ problems, title, intro, onClear, onExit, onAnswer }: Props) {
  const quizPool = problems.filter((p): p is Quizable => p.kind === 'mcq' || p.kind === 'ox')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // 가변 게임 상태 (ref — 매 프레임 갱신, 리렌더 X)
  const paddleX = useRef(W / 2)
  const ball = useRef<Ball>({ x: W / 2, y: PADDLE_Y - R - 1, vx: SPEED * 0.4, vy: -SPEED })
  const bricks = useRef<Brick[]>([])
  const items = useRef<Item[]>([])
  const pausedRef = useRef(false)
  const runningRef = useRef(true)
  const rafRef = useRef(0)
  const quizQueue = useRef<Quizable[]>([])
  const bricksLeftRef = useRef(0)

  const [hearts, setHearts] = useState(START_HEARTS)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [bricksLeft, setBricksLeft] = useState(0)
  const [quiz, setQuiz] = useState<Quizable | null>(null)
  const [status, setStatus] = useState<'play' | 'clear' | 'over'>('play')
  const juice = useGameJuice()

  const initBricks = () => {
    const margin = 16
    const gap = 6
    const bw = (W - margin * 2 - gap * (COLS - 1)) / COLS
    const list: Brick[] = []
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        list.push({ x: margin + c * (bw + gap), y: 50 + r * (BRICK_H + gap), w: bw, alive: true, hue: 200 + r * 30 })
      }
    }
    bricks.current = list
    bricksLeftRef.current = list.length
    setBricksLeft(list.length)
  }

  const resetBall = () => {
    ball.current = { x: paddleX.current, y: PADDLE_Y - R - 1, vx: SPEED * (Math.random() > 0.5 ? 0.4 : -0.4), vy: -SPEED }
  }

  const nextQuiz = (): Quizable => {
    if (quizQueue.current.length === 0) quizQueue.current = shuffle(quizPool)
    return quizQueue.current.shift()!
  }

  // 게임 루프
  useEffect(() => {
    if (quizPool.length === 0) return
    initBricks()
    quizQueue.current = shuffle(quizPool)
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const bw = bricks.current[0]?.w ?? 40

    const loseLife = () => {
      setCombo(0)
      sfx.wrong()
      setHearts((h) => {
        const n = h - 1
        if (n <= 0) { runningRef.current = false; setStatus('over') }
        return n
      })
      resetBall()
    }

    const step = () => {
      if (runningRef.current && !pausedRef.current) {
        const b = ball.current
        b.x += b.vx; b.y += b.vy
        if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx) }
        if (b.x > W - R) { b.x = W - R; b.vx = -Math.abs(b.vx) }
        if (b.y < R) { b.y = R; b.vy = Math.abs(b.vy) }

        // 패들 충돌
        if (b.vy > 0 && b.y > PADDLE_Y - R && b.y < PADDLE_Y + PH && b.x > paddleX.current - PW / 2 && b.x < paddleX.current + PW / 2) {
          b.y = PADDLE_Y - R
          const rel = Math.max(-0.9, Math.min(0.9, (b.x - paddleX.current) / (PW / 2)))
          b.vx = SPEED * rel
          b.vy = -Math.sqrt(Math.max(SPEED * SPEED - b.vx * b.vx, (SPEED * 0.45) ** 2))
        }

        // 벽돌 충돌 (프레임당 1개)
        for (const br of bricks.current) {
          if (!br.alive) continue
          if (b.x > br.x && b.x < br.x + br.w && b.y > br.y && b.y < br.y + BRICK_H) {
            br.alive = false
            b.vy = -b.vy
            bricksLeftRef.current -= 1
            setBricksLeft(bricksLeftRef.current)
            setScore((s) => s + 10)
            if (Math.random() < 0.32) items.current.push({ x: br.x + br.w / 2, y: br.y })
            if (bricksLeftRef.current <= 0) { runningRef.current = false; setStatus('clear'); sfx.clear() }
            break
          }
        }

        // 바닥
        if (b.y > H + R) loseLife()

        // 아이템 낙하 / 받기
        for (let i = items.current.length - 1; i >= 0; i--) {
          const it = items.current[i]
          it.y += ITEM_VY
          const caught = it.y > PADDLE_Y - 8 && it.y < PADDLE_Y + PH + 8 && Math.abs(it.x - paddleX.current) < PW / 2 + 6
          if (caught) {
            items.current.splice(i, 1)
            pausedRef.current = true
            setQuiz(nextQuiz())
            sfx.tick?.()
          } else if (it.y > H) {
            items.current.splice(i, 1)
          }
        }
      }

      // 그리기
      if (ctx) {
        ctx.clearRect(0, 0, W, H)
        ctx.fillStyle = 'rgba(255,255,255,0.04)'
        ctx.fillRect(0, 0, W, H)
        for (const br of bricks.current) {
          if (!br.alive) continue
          ctx.fillStyle = `hsl(${br.hue} 70% 55%)`
          ctx.fillRect(br.x, br.y, br.w, BRICK_H)
        }
        // 패들
        ctx.fillStyle = '#fbbf24'
        ctx.fillRect(paddleX.current - PW / 2, PADDLE_Y, PW, PH)
        // 공
        ctx.beginPath()
        ctx.fillStyle = '#fff'
        ctx.arc(ball.current.x, ball.current.y, R, 0, Math.PI * 2)
        ctx.fill()
        // 아이템
        ctx.font = '18px serif'
        ctx.textAlign = 'center'
        for (const it of items.current) ctx.fillText('⭐', it.x, it.y)
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    void bw
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (quizPool.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-white/70">
        <p>이 챕터에는 벽돌깨기에 쓸 문제가 없어요.</p>
        <button onClick={onExit} className="underline">← 나가기</button>
      </div>
    )
  }

  const stars = starsFromHearts(hearts, START_HEARTS)

  const restart = () => {
    initBricks()
    resetBall()
    items.current = []
    quizQueue.current = shuffle(quizPool)
    pausedRef.current = false
    runningRef.current = true
    setHearts(START_HEARTS); setScore(0); setCombo(0); setBestCombo(0)
    setQuiz(null); setStatus('play')
  }

  const onQuizResult = (correct: boolean) => {
    if (quiz) onAnswer?.(quiz.id, correct)
    if (correct) {
      sfx.correct()
      setCombo((c) => {
        const nc = c + 1
        setBestCombo((b) => Math.max(b, nc))
        juice.correct(nc, { x: 0.5 })
        return nc
      })
      setScore((s) => s + 100)
      // 보상: 남은 벽돌 최대 3개 추가 파괴
      const alive = bricks.current.filter((br) => br.alive)
      shuffle(alive).slice(0, 3).forEach((br) => { br.alive = false; bricksLeftRef.current -= 1 })
      setBricksLeft(bricksLeftRef.current)
      if (bricksLeftRef.current <= 0) { runningRef.current = false; setStatus('clear'); sfx.clear() }
    } else {
      sfx.wrong()
      setCombo(0)
    }
    setQuiz(null)
    pausedRef.current = false
  }

  const pointerMove = (clientX: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = (clientX - rect.left) * (W / rect.width)
    paddleX.current = Math.max(PW / 2, Math.min(W - PW / 2, x))
  }

  if (status === 'clear') {
    return (
      <GameResult emoji="🧱" title="벽돌을 다 깼어요!" confetti stars={stars}
        lines={[`최고 콤보 ${bestCombo}`, `점수 ${score}`]}
        primary={{ label: '완료', onClick: () => onClear({ score, bestCombo, stars }) }}
        secondary={{ label: '다시 하기', onClick: restart }} />
    )
  }
  if (status === 'over') {
    return (
      <GameResult emoji="🛑" title="공을 모두 놓쳤어요…"
        lines={[`점수 ${score}`, '다시 도전해 볼까요?']}
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
          <span className="text-white/60 text-xs">벽돌 {bricksLeft} · 점수 {score}</span>
        </div>
      </header>

      <div className="mt-1 text-center text-sm font-bold text-indigo-200">🧱 {title}</div>

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onPointerMove={(e) => pointerMove(e.clientX)}
        onPointerDown={(e) => pointerMove(e.clientX)}
        className="mt-2 w-full rounded-xl border-2 border-white/15 bg-black/40 touch-none"
        style={{ aspectRatio: `${W} / ${H}` }}
      />
      <p className="mt-2 text-center text-xs text-white/45">
        막대를 좌우로 움직여 공을 튕기고, 떨어지는 ⭐를 받으면 문제가 나와요!
      </p>
      {intro && <p className="mt-1 text-center text-[11px] text-white/35">{intro}</p>}

      {/* 퀴즈 오버레이 */}
      {quiz && (
        <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl bg-space-900 border border-white/15 p-5">
            <div className="text-center text-sm font-bold text-amber-200 mb-2">⭐ 아이템 획득 문제!</div>
            <QuickAnswer key={quiz.id} problem={quiz} onResult={onQuizResult} />
          </div>
        </div>
      )}
    </div>
  )
}
