import { useEffect, useRef, useState } from 'react'
import type { ContentProblem } from '@/content/types'
import { sfx } from '@/lib/sfx'
import { useGameJuice, JuiceOverlay } from '@/content/components/GameJuice'
import { GameResult } from '@/content/components/GameResult'
import { QuickAnswer } from '@/content/components/QuickAnswer'
import { useLives, GameItemBar, HeartBar } from '@/content/components/GameItems'
import { createFx } from '@/content/components/canvasFx'
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
const ROAD_X = 30 // 도로 좌우 여백
const START_HEARTS = BALANCE.hearts
const BASE_SPEED = BALANCE.runner.obstacleSpeed
const OBS_MS = BALANCE.runner.obstacleSpawnMs
const CARD_MS = BALANCE.runner.cardSpawnMs
const GOAL = BALANCE.runner.problemsToClear
const OBSTACLES = ['🚧', '🪨', '🛢️', '🚌', '🚙', '⚠️']

interface Ent { id: number; kind: 'obstacle' | 'card'; x: number; y: number; emoji: string; hit: boolean; near: boolean }
interface FloatText { x: number; y: number; text: string; life: number; color: string }

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * 자동차 질주 — 아케이드 리메이크.
 * 스크롤 도로·스피드 라인·차체 기울기/글로우·니어미스 보너스·충돌 폭발.
 */
export function RunnerGame({ problems, title, intro, onClear, onExit, onAnswer }: Props) {
  const quizPool = problems.filter((p): p is Quizable => p.kind === 'mcq' || p.kind === 'ox')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const carX = useRef(W / 2)
  const prevCarX = useRef(W / 2)
  const ents = useRef<Ent[]>([])
  const floats = useRef<FloatText[]>([])
  const idRef = useRef(0)
  const invulnRef = useRef(0)
  const obsTimer = useRef(0)
  const cardTimer = useRef(0)
  const elapsedRef = useRef(0)
  const roadOff = useRef(0)
  const pausedRef = useRef(false)
  const runningRef = useRef(true)
  const rafRef = useRef(0)
  const queue = useRef<Quizable[]>([])
  const fx = useRef(createFx()).current

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
    carX.current = Math.max(ROAD_X + CAR_W / 2, Math.min(W - ROAD_X - CAR_W / 2, x))
  }
  const nudge = (dx: number) => { carX.current = Math.max(ROAD_X + CAR_W / 2, Math.min(W - ROAD_X - CAR_W / 2, carX.current + dx)) }
  const nextQuiz = (): Quizable => { if (queue.current.length === 0) queue.current = shuffle(quizPool); return queue.current.shift()! }
  const addFloat = (x: number, y: number, text: string, color: string) => floats.current.push({ x, y, text, life: 40, color })

  useEffect(() => {
    if (quizPool.length === 0) return
    queue.current = shuffle(quizPool)
    const ctx = canvasRef.current?.getContext('2d')
    let last = performance.now()

    const step = (t: number) => {
      const dt = Math.min(48, t - last)
      last = t
      const sim = fx.tick()
      let speed = BASE_SPEED
      if (runningRef.current && !pausedRef.current && sim) {
        elapsedRef.current += dt
        if (invulnRef.current > 0) invulnRef.current -= 1
        speed = BASE_SPEED + Math.min(2.6, elapsedRef.current / 18000)
        roadOff.current = (roadOff.current + speed * 2) % 60

        obsTimer.current += dt
        if (obsTimer.current >= OBS_MS) {
          obsTimer.current = 0
          ents.current.push({ id: ++idRef.current, kind: 'obstacle', x: ROAD_X + 16 + Math.random() * (W - ROAD_X * 2 - 32), y: -20, emoji: OBSTACLES[idRef.current % OBSTACLES.length], hit: false, near: false })
        }
        cardTimer.current += dt
        if (cardTimer.current >= CARD_MS) {
          cardTimer.current = 0
          ents.current.push({ id: ++idRef.current, kind: 'card', x: ROAD_X + 20 + Math.random() * (W - ROAD_X * 2 - 40), y: -20, emoji: '📝', hit: false, near: false })
        }

        for (const e of ents.current) {
          e.y += e.kind === 'card' ? speed * 0.85 : speed
          const dx = Math.abs(e.x - carX.current)
          if (!e.hit && e.y > CAR_Y - 24 && e.y < CAR_Y + 24 && dx < CAR_W / 2 + 16) {
            if (e.kind === 'obstacle') {
              if (invulnRef.current <= 0) {
                e.hit = true
                invulnRef.current = 70
                setCombo(0)
                sfx.wrong()
                fx.shake(15); fx.freeze(5); fx.screenFlash(0.5, '244,63,94')
                fx.burst(carX.current, CAR_Y, { count: 22, color: ['#fb7185', '#fbbf24', '#fff'], speed: 4, gravity: 0.18, shape: 'spark' })
                if (lives.lose()) { runningRef.current = false; setStatus('over') }
              }
            } else {
              e.hit = true
              pausedRef.current = true
              fx.burst(e.x, e.y, { count: 12, color: ['#34d399', '#fff'], speed: 2.8 })
              setQuiz(nextQuiz())
              sfx.tick?.()
            }
          }
          // 니어미스: 장애물이 차 옆을 아슬아슬하게 지나감
          if (e.kind === 'obstacle' && !e.hit && !e.near && e.y > CAR_Y + 18 && dx < CAR_W / 2 + 30) {
            e.near = true
            setScore((s) => s + 15)
            addFloat(e.x, CAR_Y - 10, 'NEAR! +15', '#fde047')
            sfx.tick?.()
          }
        }
        ents.current = ents.current.filter((e) => e.y < H + 30 && !e.hit)
        setScore((s) => s + 1)
      }

      for (let i = floats.current.length - 1; i >= 0; i--) { const f = floats.current[i]; f.y -= 0.7; f.life--; if (f.life <= 0) floats.current.splice(i, 1) }

      if (ctx) {
        // ── 도로 ──
        const gr = ctx.createLinearGradient(0, 0, 0, H)
        gr.addColorStop(0, '#0a1020'); gr.addColorStop(1, '#11182f')
        ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H)
        // 갓길(잔디 느낌 네온 엣지)
        ctx.fillStyle = '#1f2937'; ctx.fillRect(ROAD_X, 0, W - ROAD_X * 2, H)
        ctx.fillStyle = 'rgba(56,189,248,0.5)'
        ctx.fillRect(ROAD_X - 3, 0, 3, H); ctx.fillRect(W - ROAD_X, 0, 3, H)
        // 중앙 점선 (스크롤)
        ctx.fillStyle = 'rgba(253,224,71,0.8)'
        for (let y = -60 + roadOff.current; y < H; y += 60) ctx.fillRect(W / 2 - 3, y, 6, 32)
        // 스피드 라인 (속도감)
        const sl = Math.min(1, (speed - BASE_SPEED) / 2.6)
        ctx.strokeStyle = `rgba(255,255,255,${0.05 + sl * 0.12})`; ctx.lineWidth = 2
        for (let i = 0; i < 6; i++) {
          const lx = ROAD_X + 14 + i * ((W - ROAD_X * 2 - 28) / 5)
          const ly = (roadOff.current * 4 + i * 90) % H
          ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, ly + 18 + sl * 26); ctx.stroke()
        }

        fx.begin(ctx)
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        for (const e of ents.current) {
          ctx.save(); ctx.translate(e.x, e.y)
          ctx.font = '30px serif'; ctx.fillText(e.emoji, 0, 0)
          ctx.restore()
        }
        // 차체 (좌우 이동 기울기 + 글로우 + 피격 점멸)
        const vx = carX.current - prevCarX.current
        prevCarX.current = carX.current
        const tilt = Math.max(-0.32, Math.min(0.32, vx * 0.03))
        if (invulnRef.current <= 0 || Math.floor(invulnRef.current / 5) % 2 === 0) {
          ctx.save(); ctx.translate(carX.current, CAR_Y); ctx.rotate(tilt)
          ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 14
          ctx.font = '38px serif'; ctx.fillText('🚗', 0, 0)
          ctx.restore(); ctx.shadowBlur = 0
        }
        fx.drawParticles(ctx)
        ctx.font = 'bold 13px sans-serif'
        for (const f of floats.current) { ctx.globalAlpha = Math.min(1, f.life / 18); ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y) }
        ctx.globalAlpha = 1
        if (combo >= 2) { ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = '#fde047'; ctx.fillText(`COMBO ${combo}`, 10, 18) }
        fx.end(ctx, W, H)
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
    ents.current = []; floats.current = []; carX.current = W / 2; prevCarX.current = W / 2; invulnRef.current = 0
    obsTimer.current = 0; cardTimer.current = 0; elapsedRef.current = 0; roadOff.current = 0
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
      <JuiceOverlay floaters={juice.floaters} grade={juice.grade} combo={combo} confetti={juice.confetti} />
      <header className="flex items-center justify-between">
        <button onClick={onExit} className="text-white/60 hover:text-white text-sm">← 나가기</button>
        <div className="text-sm flex gap-3 items-center">
          <HeartBar hearts={lives.hearts} max={lives.MAX_HEARTS} shielded={lives.shielded} />
          <span className="text-white/60 text-xs">📝 {solved}/{GOAL} · 점수 {score}</span>
        </div>
      </header>

      <div className="mt-1 text-center text-sm font-bold text-indigo-200">🚗 {title}</div>
      <div className="text-center text-[11px] text-white/45">차를 끌어 장애물은 아슬아슬 피하고(니어미스 보너스!), 📝 카드는 받아서 푸세요!</div>

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
        className="mt-2 w-full rounded-xl border-2 border-white/15 bg-black touch-none cursor-grab active:cursor-grabbing shadow-[0_0_30px_rgba(56,189,248,0.15)]"
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
