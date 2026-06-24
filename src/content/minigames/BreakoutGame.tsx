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
type ItemType = 'quiz' | 'points' | 'expand' | 'slow' | 'life'

const W = 360
const H = 540
const R = 7
const PW = 76
const PH = 12
const PADDLE_Y = H - 34
const SPEED = 4.2
const COLS = 7
const ROWS = 6
const BRICK_H = 18
const ITEM_VY = 2.3
const START_HEARTS = BALANCE.hearts

const ITEM_EMOJI: Record<ItemType, string> = { quiz: '📝', points: '✨', expand: '⬌', slow: '🐢', life: '❤️' }
// 가중 추첨용 풀
const ITEM_BAG: ItemType[] = ['quiz', 'quiz', 'quiz', 'quiz', 'quiz', 'points', 'points', 'expand', 'slow', 'life']

interface Brick { x: number; y: number; w: number; hp: number; hue: number }
interface Item { x: number; y: number; type: ItemType }
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
 * 벽돌깨기 + 아이템 + 퀴즈 게이트 (챕터 6 클라이맥스).
 * 튼튼한 벽돌(위쪽 2히트), 여러 아이템(📝문제·✨점수·⬌패들확장·🐢슬로우·❤️생명).
 */
export function BreakoutGame({ problems, title, intro, onClear, onExit, onAnswer }: Props) {
  const quizPool = problems.filter((p): p is Quizable => p.kind === 'mcq' || p.kind === 'ox')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const paddleX = useRef(W / 2)
  const pwRef = useRef(PW)
  const expandFrames = useRef(0)
  const slowFrames = useRef(0)
  const ball = useRef<Ball>({ x: W / 2, y: PADDLE_Y - R - 1, vx: SPEED * 0.4, vy: -SPEED })
  const bricks = useRef<Brick[]>([])
  const items = useRef<Item[]>([])
  const pausedRef = useRef(false)
  const runningRef = useRef(true)
  const rafRef = useRef(0)
  const quizQueue = useRef<Quizable[]>([])
  const bricksLeftRef = useRef(0)

  const lives = useLives(START_HEARTS)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [bricksLeft, setBricksLeft] = useState(0)
  const [buff, setBuff] = useState<string | null>(null)
  const [quiz, setQuiz] = useState<Quizable | null>(null)
  const [status, setStatus] = useState<'play' | 'clear' | 'over'>('play')
  const juice = useGameJuice()

  const initBricks = () => {
    const margin = 14, gap = 5
    const bw = (W - margin * 2 - gap * (COLS - 1)) / COLS
    const list: Brick[] = []
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        list.push({ x: margin + c * (bw + gap), y: 46 + r * (BRICK_H + gap), w: bw, hp: r < 2 ? 2 : 1, hue: 200 + r * 22 })
      }
    }
    bricks.current = list
    bricksLeftRef.current = list.length
    setBricksLeft(list.length)
  }
  const resetBall = () => { ball.current = { x: paddleX.current, y: PADDLE_Y - R - 1, vx: SPEED * (Math.random() > 0.5 ? 0.4 : -0.4), vy: -SPEED } }
  const nextQuiz = (): Quizable => { if (quizQueue.current.length === 0) quizQueue.current = shuffle(quizPool); return quizQueue.current.shift()! }

  const flashBuff = (msg: string) => { setBuff(msg); setTimeout(() => setBuff(null), 1200) }

  useEffect(() => {
    if (quizPool.length === 0) return
    initBricks()
    quizQueue.current = shuffle(quizPool)
    const ctx = canvasRef.current?.getContext('2d')

    const loseLife = () => {
      setCombo(0); sfx.wrong()
      if (lives.lose()) { runningRef.current = false; setStatus('over') }
      resetBall()
    }

    const step = () => {
      if (runningRef.current && !pausedRef.current) {
        // 버프 타이머
        if (expandFrames.current > 0 && --expandFrames.current === 0) pwRef.current = PW
        if (slowFrames.current > 0 && --slowFrames.current === 0) { ball.current.vx /= 0.7; ball.current.vy /= 0.7 }

        const b = ball.current
        b.x += b.vx; b.y += b.vy
        if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx) }
        if (b.x > W - R) { b.x = W - R; b.vx = -Math.abs(b.vx) }
        if (b.y < R) { b.y = R; b.vy = Math.abs(b.vy) }

        const half = pwRef.current / 2
        if (b.vy > 0 && b.y > PADDLE_Y - R && b.y < PADDLE_Y + PH && b.x > paddleX.current - half && b.x < paddleX.current + half) {
          b.y = PADDLE_Y - R
          const rel = Math.max(-0.9, Math.min(0.9, (b.x - paddleX.current) / half))
          const mag = Math.hypot(b.vx, b.vy) || SPEED
          b.vx = mag * rel
          b.vy = -Math.sqrt(Math.max(mag * mag - b.vx * b.vx, (mag * 0.45) ** 2))
        }

        for (const br of bricks.current) {
          if (br.hp <= 0) continue
          if (b.x > br.x && b.x < br.x + br.w && b.y > br.y && b.y < br.y + BRICK_H) {
            br.hp -= 1
            b.vy = -b.vy
            setScore((s) => s + 10)
            if (br.hp <= 0) {
              bricksLeftRef.current -= 1
              setBricksLeft(bricksLeftRef.current)
              if (Math.random() < 0.55) items.current.push({ x: br.x + br.w / 2, y: br.y, type: ITEM_BAG[Math.floor(Math.random() * ITEM_BAG.length)] })
              if (bricksLeftRef.current <= 0) { runningRef.current = false; setStatus('clear'); sfx.clear() }
            }
            break
          }
        }

        if (b.y > H + R) loseLife()

        for (let i = items.current.length - 1; i >= 0; i--) {
          const it = items.current[i]
          it.y += ITEM_VY
          const caught = it.y > PADDLE_Y - 8 && it.y < PADDLE_Y + PH + 10 && Math.abs(it.x - paddleX.current) < half + 8
          if (caught) {
            items.current.splice(i, 1)
            if (it.type === 'quiz') { pausedRef.current = true; setQuiz(nextQuiz()); sfx.tick?.() }
            else if (it.type === 'points') { setScore((s) => s + 50); flashBuff('✨ +50점'); sfx.powerUp() }
            else if (it.type === 'life') { lives.addLife(); flashBuff('❤️ 생명 +1'); sfx.lifeUp() }
            else if (it.type === 'expand') { pwRef.current = PW * 1.6; expandFrames.current = 480; flashBuff('⬌ 패들 확장!'); sfx.powerUp() }
            else if (it.type === 'slow') { if (slowFrames.current === 0) { ball.current.vx *= 0.7; ball.current.vy *= 0.7 } slowFrames.current = 360; flashBuff('🐢 공 느려짐'); sfx.powerUp() }
          } else if (it.y > H) items.current.splice(i, 1)
        }
      }

      if (ctx) {
        ctx.clearRect(0, 0, W, H)
        ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(0, 0, W, H)
        for (const br of bricks.current) {
          if (br.hp <= 0) continue
          ctx.fillStyle = `hsl(${br.hue} 70% ${br.hp >= 2 ? 42 : 56}%)`
          ctx.fillRect(br.x, br.y, br.w, BRICK_H)
          if (br.hp >= 2) { ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(br.x, br.y, br.w, 4) }
        }
        ctx.fillStyle = '#fbbf24'
        ctx.fillRect(paddleX.current - pwRef.current / 2, PADDLE_Y, pwRef.current, PH)
        ctx.beginPath(); ctx.fillStyle = slowFrames.current > 0 ? '#86efac' : '#fff'
        ctx.arc(ball.current.x, ball.current.y, R, 0, Math.PI * 2); ctx.fill()
        ctx.font = '17px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        for (const it of items.current) ctx.fillText(ITEM_EMOJI[it.type], it.x, it.y)
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
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

  const stars = starsFromHearts(lives.hearts, lives.startHearts)

  const restart = () => {
    initBricks(); resetBall(); items.current = []; quizQueue.current = shuffle(quizPool)
    pwRef.current = PW; expandFrames.current = 0; slowFrames.current = 0
    pausedRef.current = false; runningRef.current = true
    lives.reset(); setScore(0); setCombo(0); setBestCombo(0); setQuiz(null); setStatus('play')
  }

  const onQuizResult = (correct: boolean) => {
    if (quiz) onAnswer?.(quiz.id, correct)
    if (correct) {
      sfx.correct()
      setCombo((c) => { const nc = c + 1; setBestCombo((b) => Math.max(b, nc)); juice.correct(nc, { x: 0.5 }); return nc })
      setScore((s) => s + 100)
      // 보상: 남은 벽돌 최대 4개 즉시 파괴
      shuffle(bricks.current.filter((br) => br.hp > 0)).slice(0, 4).forEach((br) => { br.hp = 0; bricksLeftRef.current -= 1 })
      setBricksLeft(bricksLeftRef.current)
      if (bricksLeftRef.current <= 0) { runningRef.current = false; setStatus('clear'); sfx.clear() }
    } else { sfx.wrong(); setCombo(0) }
    setQuiz(null); pausedRef.current = false
  }

  const pointerMove = (clientX: number) => {
    const c = canvasRef.current; if (!c) return
    const rect = c.getBoundingClientRect()
    const x = (clientX - rect.left) * (W / rect.width)
    paddleX.current = Math.max(pwRef.current / 2, Math.min(W - pwRef.current / 2, x))
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
          <HeartBar hearts={lives.hearts} max={lives.MAX_HEARTS} shielded={lives.shielded} />
          <span className="text-white/60 text-xs">벽돌 {bricksLeft} · 점수 {score}</span>
        </div>
      </header>
      <div className="mt-1 text-center text-sm font-bold text-indigo-200">🧱 {title}</div>

      <div className="mt-2">
        <GameItemBar items={[
          { id: 'shield', icon: '🛡️ 보호막', label: '공 놓침 1회 무효', cost: 8, onBuy: lives.arm, disabled: lives.shielded },
          { id: 'life', icon: '❤️ 생명', label: '생명 +1', cost: 15, onBuy: lives.addLife },
        ]} />
      </div>

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onPointerMove={(e) => pointerMove(e.clientX)}
        onPointerDown={(e) => pointerMove(e.clientX)}
        className="mt-2 w-full rounded-xl border-2 border-white/15 bg-black/40 touch-none"
        style={{ aspectRatio: `${W} / ${H}` }}
      />
      <div className="mt-1 h-5 text-center text-xs font-bold text-amber-200">{buff}</div>
      <p className="text-center text-[11px] text-white/40">📝문제 ✨점수 ⬌패들확장 🐢슬로우 ❤️생명 — 떨어지는 아이템을 받으세요!</p>
      {intro && <p className="text-center text-[11px] text-white/30">{intro}</p>}

      {quiz && (
        <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl bg-space-900 border border-white/15 p-5">
            <div className="text-center text-sm font-bold text-amber-200 mb-2">📝 문제를 풀면 벽돌이 와르르!</div>
            <QuickAnswer key={quiz.id} problem={quiz} onResult={onQuizResult} />
          </div>
        </div>
      )}
    </div>
  )
}
