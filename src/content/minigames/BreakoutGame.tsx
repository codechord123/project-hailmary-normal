import { useEffect, useRef, useState } from 'react'
import type { ContentProblem } from '@/content/types'
import { sfx } from '@/lib/sfx'
import { useGameJuice, JuiceOverlay } from '@/content/components/GameJuice'
import { GameResult } from '@/content/components/GameResult'
import { QuickAnswer } from '@/content/components/QuickAnswer'
import { useLives, GameItemBar, HeartBar } from '@/content/components/GameItems'
import { createFx, drawStarfield, makeStars, roundRect } from '@/content/components/canvasFx'
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
type ItemType = 'quiz' | 'points' | 'expand' | 'slow' | 'life' | 'multi' | 'fire' | 'bomb'
type BrickType = 'normal' | 'tough' | 'explosive' | 'steel'

const W = 360
const H = 560
const R = 7
const PW = 76
const PH = 12
const PADDLE_Y = H - 30
const COLS = 12
const ROWS = 10
const BRICK_H = 12
const ITEM_VY = 1.9
const MAX_BALLS = 6
const TOTAL_LEVELS = 3
const QUIZ_EVERY = 4 // 벽돌 4개(연쇄 포함)마다 문제 출제
const PADDLE_SPEED = 8 // 키보드 이동 속도(프레임당)
const START_HEARTS = BALANCE.hearts

const ITEM_EMOJI: Record<ItemType, string> = { quiz: '📝', points: '✨', expand: '⬌', slow: '🐢', life: '❤️', multi: '➕', fire: '🔥', bomb: '💣' }
// 문제(📝)는 아이템으로 떨어지지 않고 별도 큐에 쌓인다. 폭탄은 1개로 빈도↓
const ITEM_BAG: ItemType[] = ['points', 'points', 'expand', 'expand', 'slow', 'slow', 'life', 'multi', 'multi', 'fire', 'fire']

const BRICK: Record<BrickType, { hp: number; pts: number; emoji?: string }> = {
  normal: { hp: 1, pts: 10 },
  tough: { hp: 2, pts: 15 },
  explosive: { hp: 1, pts: 20, emoji: '💥' },
  steel: { hp: 3, pts: 30, emoji: '🔩' },
}

// 레벨별 랜덤 맵 패턴 — (행,열)이 채워지는지 반환
const PATTERNS: ((r: number, c: number) => boolean)[] = [
  () => true,                                                       // 가득
  (r, c) => (r + c) % 2 === 0,                                      // 체커
  (r, c) => Math.abs(c - (COLS - 1) / 2) <= r,                      // 피라미드
  (_r, c) => c % 3 !== 1,                                          // 세로 틈
  (r, c) => Math.abs(c - (COLS - 1) / 2) + Math.abs(r - (ROWS - 1) / 2) <= 6, // 다이아몬드
  (r, c) => r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1 || (r + c) % 2 === 0, // 액자+체커
]

interface Brick { x: number; y: number; w: number; hp: number; hue: number; flash: number; type: BrickType }
interface Item { x: number; y: number; type: ItemType }
interface Ball { x: number; y: number; vx: number; vy: number }
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
 * 벽돌깨기 — 아케이드 + 알고리즘 심화.
 * 3판 랜덤 맵, 작은 벽돌(2배 수), 멀티볼·🔥파이어볼·💣폭탄·💥연쇄·🔩강철, 파워업 HUD.
 */
export function BreakoutGame({ problems, title, intro, onClear, onExit, onAnswer }: Props) {
  const quizPool = problems.filter((p): p is Quizable => p.kind === 'mcq' || p.kind === 'ox')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const paddleX = useRef(W / 2)
  const keysRef = useRef({ left: false, right: false })
  const pwRef = useRef(PW)
  const expandFrames = useRef(0)
  const slowFrames = useRef(0)
  const fireFrames = useRef(0)
  const slowMul = useRef(1)
  const paddleHit = useRef(0)
  const balls = useRef<Ball[]>([])
  const trails = useRef<Map<Ball, { x: number; y: number }[]>>(new Map())
  const bricks = useRef<Brick[]>([])
  const items = useRef<Item[]>([])
  const floats = useRef<FloatText[]>([])
  const comboRef = useRef(0)
  const destroyedRef = useRef(0) // 마지막 적립 이후 깬 벽돌 수
  const pendingRef = useRef(0) // 쌓인(아직 안 푼) 문제 수
  const levelRef = useRef(1)
  const prevPattern = useRef(-1)
  const pausedRef = useRef(false)
  const runningRef = useRef(true)
  const rafRef = useRef(0)
  const quizQueue = useRef<Quizable[]>([])
  const bricksLeftRef = useRef(0)
  const fx = useRef(createFx({ maxParticles: 260 })).current
  const stars = useRef(makeStars(W, H, 46)).current

  const lives = useLives(START_HEARTS)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [bricksLeft, setBricksLeft] = useState(0)
  const [ballCount, setBallCount] = useState(1)
  const [pending, setPending] = useState(0) // 쌓인 문제 수(UI)
  const [level, setLevel] = useState(1)
  const [buffs, setBuffs] = useState<{ expand: boolean; slow: boolean; fire: boolean }>({ expand: false, slow: false, fire: false })
  const [buff, setBuff] = useState<string | null>(null)
  const [quiz, setQuiz] = useState<Quizable | null>(null)
  const [status, setStatus] = useState<'play' | 'clear' | 'over'>('play')
  const juice = useGameJuice()

  const pickType = (row: number): BrickType => {
    const lv = levelRef.current
    if (row < 2) return Math.random() < 0.32 + lv * 0.06 ? 'steel' : 'tough'
    const r = Math.random()
    if (r < 0.04 + lv * 0.01) return 'explosive'
    if (r < 0.16 + lv * 0.04) return 'steel'
    return 'normal'
  }
  const initBricks = () => {
    let pat = Math.floor(Math.random() * PATTERNS.length)
    if (pat === prevPattern.current) pat = (pat + 1) % PATTERNS.length
    prevPattern.current = pat
    const fill = PATTERNS[pat]
    const margin = 10, gap = 3
    const bw = (W - margin * 2 - gap * (COLS - 1)) / COLS
    const list: Brick[] = []
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!fill(r, c)) continue
        const type = pickType(r)
        list.push({ x: margin + c * (bw + gap), y: 40 + r * (BRICK_H + gap), w: bw, hp: BRICK[type].hp, hue: 190 + r * 20, flash: 0, type })
      }
    }
    bricks.current = list
    // 특수 벽돌 최소 보장 — 맵마다 폭발·강철이 확실히 등장하도록 강제 변환
    const ensure = (type: BrickType, frac: number, min: number) => {
      const want = Math.max(min, Math.round(list.length * frac))
      let have = list.filter((b) => b.type === type).length
      for (const b of shuffle(list.filter((b) => b.type === 'normal'))) {
        if (have >= want) break
        b.type = type; b.hp = BRICK[type].hp; have++
      }
    }
    ensure('explosive', 0.05, 2) // 폭발 벽돌은 드물게
    ensure('steel', 0.12, 3)
    bricksLeftRef.current = list.length
    setBricksLeft(list.length)
  }
  const baseSpeed = () => 5.2 + (levelRef.current - 1) * 0.7
  const spawnBall = () => {
    const s = baseSpeed()
    const b: Ball = { x: paddleX.current, y: PADDLE_Y - R - 1, vx: s * (Math.random() > 0.5 ? 0.4 : -0.4), vy: -s }
    balls.current = [b]; trails.current = new Map(); setBallCount(1)
  }
  const nextQuiz = (): Quizable => { if (quizQueue.current.length === 0) quizQueue.current = shuffle(quizPool); return quizQueue.current.shift()! }
  const flashBuff = (msg: string) => { setBuff(msg); setTimeout(() => setBuff(null), 1300) }
  const addFloat = (x: number, y: number, text: string, color = '#fff') => floats.current.push({ x, y, text, life: 42, color })
  const mult = () => 1 + Math.min(5, Math.floor(comboRef.current / 8))

  useEffect(() => {
    if (quizPool.length === 0) return
    levelRef.current = 1; setLevel(1)
    initBricks(); spawnBall()
    quizQueue.current = shuffle(quizPool)
    const ctx = canvasRef.current?.getContext('2d')
    let frame = 0

    const destroyBrick = (br: Brick, chained = false, suppressChain = false) => {
      if (br.hp <= 0) return
      br.hp = 0
      bricksLeftRef.current -= 1
      const cx = br.x + br.w / 2, cy = br.y + BRICK_H / 2
      fx.burst(cx, cy, { count: chained ? 9 : 14, color: [`hsl(${br.hue} 90% 65%)`, `hsl(${br.hue} 90% 82%)`, '#fff'], speed: 3.4, gravity: 0.16, size: 3 })
      if (!chained) {
        comboRef.current++
        const m = mult()
        const gain = BRICK[br.type].pts * m
        setScore((s) => s + gain)
        setCombo(comboRef.current)
        setBestCombo((bc) => Math.max(bc, comboRef.current))
        addFloat(cx, cy, m > 1 ? `+${gain} x${m}` : `+${gain}`, m > 1 ? '#fde047' : '#fff')
      } else setScore((s) => s + BRICK[br.type].pts)
      destroyedRef.current++ // 연쇄·일반 모두 문제 카운터에 반영 → 문제가 더 자주
      const dropChance = br.type === 'explosive' || br.type === 'steel' ? 0.1 : chained ? 0 : 0.03
      if (Math.random() < dropChance)
        items.current.push({ x: cx, y: br.y, type: ITEM_BAG[Math.floor(Math.random() * ITEM_BAG.length)] })
      // 폭발 연쇄 — 폭탄(suppressChain)으로 파괴될 땐 연쇄 안 일으킴
      if (br.type === 'explosive' && !suppressChain) {
        fx.shake(8); fx.freeze(4); fx.screenFlash(0.25, '251,146,60'); sfx.crit()
        for (const o of bricks.current) {
          if (o.hp <= 0 || o === br) continue
          if (Math.hypot((o.x + o.w / 2) - cx, (o.y + BRICK_H / 2) - cy) < 36) destroyBrick(o, true)
        }
      }
    }

    const bomb = () => {
      const alive = bricks.current.filter((b) => b.hp > 0)
      if (alive.length === 0) return
      const t = alive[Math.floor(Math.random() * alive.length)]
      const cx = t.x + t.w / 2, cy = t.y + BRICK_H / 2
      fx.shake(4); fx.freeze(2); fx.screenFlash(0.15, '244,63,94'); sfx.crit()
      // 아주 좁은 범위만 + 폭발 연쇄 억제(폭탄이 연쇄로 커지지 않게)
      for (const o of bricks.current) {
        if (o.hp <= 0) continue
        if (Math.hypot((o.x + o.w / 2) - cx, (o.y + BRICK_H / 2) - cy) < 18) destroyBrick(o, true, true)
      }
    }

    const advanceLevel = () => {
      if (levelRef.current < TOTAL_LEVELS) {
        levelRef.current++; setLevel(levelRef.current); destroyedRef.current = 0
        initBricks(); spawnBall(); items.current = []
        pwRef.current = PW; expandFrames.current = 0; slowFrames.current = 0; fireFrames.current = 0; slowMul.current = 1
        setBuffs({ expand: false, slow: false, fire: false })
        fx.screenFlash(0.5, '134,239,172'); flashBuff(`레벨 ${levelRef.current} / ${TOTAL_LEVELS}!`); sfx.clear()
      } else {
        runningRef.current = false; setStatus('clear'); fx.screenFlash(0.6, '134,239,172'); sfx.clear()
      }
    }

    const loseLife = () => {
      comboRef.current = 0; setCombo(0); sfx.wrong()
      fx.shake(14); fx.freeze(6); fx.screenFlash(0.5, '244,63,94')
      fx.burst(W / 2, H - 6, { count: 24, color: ['#fb7185', '#fff'], speed: 4, spread: -Math.PI / 2, cone: Math.PI, gravity: 0.2, shape: 'spark' })
      if (lives.lose()) { runningRef.current = false; setStatus('over') }
      else spawnBall()
    }

    const step = () => {
      try {
      frame++
      const sim = fx.tick()
      if (runningRef.current && !pausedRef.current && sim) {
        if (paddleHit.current > 0) paddleHit.current--
        // 키보드 패들 이동(누르고 있는 동안 매 프레임)
        const ks = keysRef.current
        if (ks.left !== ks.right) {
          const dir = ks.right ? 1 : -1
          paddleX.current = Math.max(pwRef.current / 2, Math.min(W - pwRef.current / 2, paddleX.current + dir * PADDLE_SPEED))
        }
        if (expandFrames.current > 0 && --expandFrames.current === 0) { pwRef.current = PW; setBuffs((b) => ({ ...b, expand: false })) }
        if (slowFrames.current > 0 && --slowFrames.current === 0) { slowMul.current = 1; setBuffs((b) => ({ ...b, slow: false })) }
        if (fireFrames.current > 0 && --fireFrames.current === 0) setBuffs((b) => ({ ...b, fire: false }))
        const half = pwRef.current / 2
        const fire = fireFrames.current > 0

        for (let bi = balls.current.length - 1; bi >= 0; bi--) {
          const b = balls.current[bi]
          let tr = trails.current.get(b); if (!tr) { tr = []; trails.current.set(b, tr) }
          tr.push({ x: b.x, y: b.y }); if (tr.length > 10) tr.shift()
          b.x += b.vx * slowMul.current; b.y += b.vy * slowMul.current
          if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx); fx.shake(2) }
          if (b.x > W - R) { b.x = W - R; b.vx = -Math.abs(b.vx); fx.shake(2) }
          if (b.y < R) { b.y = R; b.vy = Math.abs(b.vy); fx.shake(2) }

          if (b.vy > 0 && b.y > PADDLE_Y - R && b.y < PADDLE_Y + PH && b.x > paddleX.current - half && b.x < paddleX.current + half) {
            b.y = PADDLE_Y - R
            const rel = Math.max(-0.9, Math.min(0.9, (b.x - paddleX.current) / half))
            const mag = Math.hypot(b.vx, b.vy) || baseSpeed()
            b.vx = mag * rel
            b.vy = -Math.sqrt(Math.max(mag * mag - b.vx * b.vx, (mag * 0.6) ** 2))
            paddleHit.current = 8; sfx.tick?.()
            fx.burst(b.x, PADDLE_Y, { count: 5, color: '#fbbf24', speed: 2.2, spread: -Math.PI / 2, cone: Math.PI * 0.7, gravity: 0.05 })
          }

          for (const br of bricks.current) {
            if (br.hp <= 0) continue
            if (b.x > br.x && b.x < br.x + br.w && b.y > br.y && b.y < br.y + BRICK_H) {
              if (fire) {
                // 파이어볼: 관통하며 즉시 파괴(튕기지 않음)
                br.flash = 6; destroyBrick(br); sfx.hit()
                continue
              }
              br.flash = 6; b.vy = -b.vy; fx.shake(3)
              if (br.hp <= 1) {
                // 파괴 직전 — hp가 아직 1일 때 destroyBrick 호출(본문 실행 보장)
                fx.freeze(2); destroyBrick(br); if (mult() >= 3) sfx.crit(); else sfx.hit()
              } else {
                br.hp -= 1
                fx.burst(br.x + br.w / 2, br.y + BRICK_H / 2, { count: 4, color: '#fff', speed: 2 }); setScore((s) => s + 5); sfx.hit()
              }
              break
            }
          }

          if (b.y > H + R) { balls.current.splice(bi, 1); trails.current.delete(b); setBallCount(balls.current.length) }
        }

        if (runningRef.current && bricksLeftRef.current <= 0) advanceLevel()
        else if (runningRef.current && balls.current.length === 0) loseLife()

        // 일정 수의 벽돌을 깰 때마다 즉시 문제 팝업 — 풀어야 게임 진행
        if (runningRef.current && destroyedRef.current >= QUIZ_EVERY) {
          destroyedRef.current = 0
          pendingRef.current++
          setPending(pendingRef.current)
          if (!pausedRef.current) { pausedRef.current = true; setQuiz(nextQuiz()) }
          sfx.tick?.()
        }

        const half2 = pwRef.current / 2
        for (let i = items.current.length - 1; i >= 0; i--) {
          const it = items.current[i]
          it.y += ITEM_VY
          const caught = it.y > PADDLE_Y - 14 && it.y < PADDLE_Y + PH + 16 && Math.abs(it.x - paddleX.current) < half2 + 16
          if (caught) {
            items.current.splice(i, 1)
            fx.burst(it.x, PADDLE_Y, { count: 10, color: ['#fde047', '#fff'], speed: 2.6 })
            switch (it.type) {
              case 'points': setScore((s) => s + 50); addFloat(it.x, PADDLE_Y - 14, '+50', '#fde047'); flashBuff('✨ +50점'); sfx.powerUp(); break
              case 'life': lives.addLife(); flashBuff('❤️ 생명 +1'); sfx.lifeUp(); break
              case 'expand': pwRef.current = PW * 1.6; expandFrames.current = 540; setBuffs((b) => ({ ...b, expand: true })); flashBuff('⬌ 패들 확장!'); sfx.powerUp(); break
              case 'slow': slowMul.current = 0.62; slowFrames.current = 420; setBuffs((b) => ({ ...b, slow: true })); flashBuff('🐢 공 느려짐'); sfx.powerUp(); break
              case 'fire': fireFrames.current = 480; setBuffs((b) => ({ ...b, fire: true })); flashBuff('🔥 파이어볼! 관통'); sfx.powerUp(); break
              case 'bomb': bomb(); flashBuff('💣 폭탄!'); break
              case 'multi': {
                const base = balls.current.slice(0, 3)
                for (const src of base) {
                  if (balls.current.length >= MAX_BALLS) break
                  const mag = Math.hypot(src.vx, src.vy) || baseSpeed()
                  const ang = Math.atan2(src.vy, src.vx) + (Math.random() - 0.5)
                  balls.current.push({ x: src.x, y: src.y, vx: Math.cos(ang) * mag, vy: -Math.abs(Math.sin(ang) * mag) })
                }
                setBallCount(balls.current.length); flashBuff('➕ 멀티볼!'); sfx.powerUp(); break
              }
            }
          } else if (it.y > H) items.current.splice(i, 1)
        }
      }

      for (let i = floats.current.length - 1; i >= 0; i--) { const f = floats.current[i]; f.y -= 0.8; f.life--; if (f.life <= 0) floats.current.splice(i, 1) }
      for (const br of bricks.current) if (br.flash > 0) br.flash--

      if (ctx) {
        drawStarfield(ctx, W, H, frame, stars)
        fx.begin(ctx)
        for (const br of bricks.current) {
          if (br.hp <= 0) continue
          const lum = br.type === 'steel' ? 30 + (3 - br.hp) * 9 : br.hp >= 2 ? 52 : 62
          const baseHue = br.type === 'explosive' ? 24 : br.type === 'steel' ? 210 : br.hue
          roundRect(ctx, br.x, br.y, br.w, BRICK_H, 3)
          const g = ctx.createLinearGradient(br.x, br.y, br.x, br.y + BRICK_H)
          g.addColorStop(0, `hsl(${baseHue} ${br.type === 'steel' ? 12 : 90}% ${lum + 12}%)`)
          g.addColorStop(1, `hsl(${baseHue} ${br.type === 'steel' ? 10 : 85}% ${lum - 8}%)`)
          ctx.fillStyle = g
          ctx.shadowColor = `hsl(${baseHue} 90% 60%)`; ctx.shadowBlur = br.type === 'explosive' ? 10 : 6
          ctx.fill(); ctx.shadowBlur = 0
          ctx.fillStyle = 'rgba(255,255,255,0.3)'; roundRect(ctx, br.x + 2, br.y + 1.5, br.w - 4, 2.5, 1.5); ctx.fill()
          if (br.hp >= 2) { ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.2; roundRect(ctx, br.x, br.y, br.w, BRICK_H, 3); ctx.stroke() }
          if (BRICK[br.type].emoji) {
            ctx.font = '13px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
            if (br.type === 'explosive') { ctx.shadowColor = '#f97316'; ctx.shadowBlur = 6 + Math.sin(frame * 0.2) * 4 }
            ctx.fillText(BRICK[br.type].emoji!, br.x + br.w / 2, br.y + BRICK_H / 2)
            ctx.shadowBlur = 0
          }
          if (br.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${br.flash / 12})`; roundRect(ctx, br.x, br.y, br.w, BRICK_H, 3); ctx.fill() }
        }
        const fireOn = fireFrames.current > 0
        for (const b of balls.current) {
          const tr = trails.current.get(b) ?? []
          for (let i = 0; i < tr.length; i++) {
            ctx.globalAlpha = (i / tr.length) * 0.4
            ctx.fillStyle = fireOn ? '#fb923c' : slowFrames.current > 0 ? '#86efac' : '#7dd3fc'
            ctx.beginPath(); ctx.arc(tr[i].x, tr[i].y, R * (i / tr.length), 0, Math.PI * 2); ctx.fill()
          }
        }
        ctx.globalAlpha = 1
        const sq = paddleHit.current > 0 ? paddleHit.current / 8 : 0
        const ph = PH + sq * 4, pw = pwRef.current - sq * 6
        ctx.fillStyle = '#fbbf24'; ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 12
        roundRect(ctx, paddleX.current - pw / 2, PADDLE_Y - (ph - PH), pw, ph, 6); ctx.fill(); ctx.shadowBlur = 0
        for (const b of balls.current) {
          ctx.fillStyle = fireOn ? '#fdba74' : slowFrames.current > 0 ? '#86efac' : '#fff'
          ctx.shadowColor = fireOn ? '#f97316' : slowFrames.current > 0 ? '#86efac' : '#7dd3fc'; ctx.shadowBlur = fireOn ? 20 : 16
          ctx.beginPath(); ctx.arc(b.x, b.y, fireOn ? R + 1 : R, 0, Math.PI * 2); ctx.fill()
        }
        ctx.shadowBlur = 0
        // 아이템 — 눈에 띄는 발광 캡슐
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        for (const it of items.current) {
          const pulse = 11 + Math.sin(frame * 0.18) * 1.5
          ctx.fillStyle = 'rgba(8,12,28,0.7)'
          ctx.shadowColor = '#fde047'; ctx.shadowBlur = 14
          ctx.beginPath(); ctx.arc(it.x, it.y, pulse + 3, 0, Math.PI * 2); ctx.fill()
          ctx.shadowBlur = 0
          ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2
          ctx.beginPath(); ctx.arc(it.x, it.y, pulse + 3, 0, Math.PI * 2); ctx.stroke()
          ctx.font = '17px serif'; ctx.fillText(ITEM_EMOJI[it.type], it.x, it.y)
        }
        fx.drawParticles(ctx)
        ctx.font = 'bold 13px sans-serif'
        for (const f of floats.current) { ctx.globalAlpha = Math.min(1, f.life / 20); ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y) }
        ctx.globalAlpha = 1
        if (comboRef.current >= 2) { ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = mult() > 1 ? '#fde047' : '#e2e8f0'; ctx.fillText(`COMBO ${comboRef.current}${mult() > 1 ? `  x${mult()}` : ''}`, 10, 16) }
        fx.end(ctx, W, H)
      }
      } catch (err) {
        if (typeof console !== 'undefined') console.error('[Breakout] step error:', err)
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 키보드 조작 — ← →(또는 A/D)로 패들 이동
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { keysRef.current.left = true; e.preventDefault() }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { keysRef.current.right = true; e.preventDefault() }
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = false
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  if (quizPool.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-white/70">
        <p>이 챕터에는 벽돌깨기에 쓸 문제가 없어요.</p>
        <button onClick={onExit} className="underline">← 나가기</button>
      </div>
    )
  }

  const starCount = starsFromHearts(lives.hearts, lives.startHearts)

  const restart = () => {
    levelRef.current = 1; setLevel(1); prevPattern.current = -1; destroyedRef.current = 0; pendingRef.current = 0
    initBricks(); spawnBall(); items.current = []; floats.current = []; comboRef.current = 0
    quizQueue.current = shuffle(quizPool)
    pwRef.current = PW; expandFrames.current = 0; slowFrames.current = 0; fireFrames.current = 0; slowMul.current = 1
    setBuffs({ expand: false, slow: false, fire: false })
    pausedRef.current = false; runningRef.current = true
    lives.reset(); setScore(0); setCombo(0); setBestCombo(0); setPending(0); setQuiz(null); setStatus('play')
  }

  const onQuizResult = (correct: boolean) => {
    if (quiz) onAnswer?.(quiz.id, correct)
    if (correct) {
      sfx.correct(comboRef.current + 1)
      juice.correct(comboRef.current + 1, { x: 0.5 })
      setScore((s) => s + 100)
      shuffle(bricks.current.filter((br) => br.hp > 0)).slice(0, 5).forEach((br) => {
        fx.burst(br.x + br.w / 2, br.y + BRICK_H / 2, { count: 10, color: [`hsl(${br.hue} 90% 70%)`, '#fff'], speed: 3.2, gravity: 0.15 })
        br.hp = 0; bricksLeftRef.current -= 1
      })
      fx.shake(8); fx.screenFlash(0.4, '253,224,71')
      setBricksLeft(bricksLeftRef.current)
    } else { sfx.wrong(); comboRef.current = 0; setCombo(0) }
    // 큐에서 하나 소진 → 남았으면 다음 문제, 없으면 게임 재개
    pendingRef.current = Math.max(0, pendingRef.current - 1)
    setPending(pendingRef.current)
    if (pendingRef.current > 0) {
      setQuiz(nextQuiz())
    } else {
      setQuiz(null); pausedRef.current = false
    }
  }

  const pointerMove = (clientX: number) => {
    const c = canvasRef.current; if (!c) return
    const rect = c.getBoundingClientRect()
    const x = (clientX - rect.left) * (W / rect.width)
    paddleX.current = Math.max(pwRef.current / 2, Math.min(W - pwRef.current / 2, x))
  }

  if (status === 'clear') {
    return (
      <GameResult emoji="🏆" title={`${TOTAL_LEVELS}판 모두 클리어!`} confetti stars={starCount}
        lines={[`최고 콤보 ${bestCombo}`, `점수 ${score}`]}
        primary={{ label: '완료', onClick: () => onClear({ score, bestCombo, stars: starCount }) }}
        secondary={{ label: '다시 하기', onClick: restart }} />
    )
  }
  if (status === 'over') {
    return (
      <GameResult emoji="🛑" title="공을 모두 놓쳤어요…"
        lines={[`레벨 ${level} · 점수 ${score}`, '다시 도전해 볼까요?']}
        primary={{ label: '다시 도전', onClick: restart }}
        secondary={{ label: '나가기', onClick: onExit }} />
    )
  }

  const activeBuffs = [
    buffs.expand && '⬌ 확장',
    buffs.slow && '🐢 슬로우',
    buffs.fire && '🔥 파이어볼',
  ].filter(Boolean) as string[]

  return (
    <div className="min-h-screen px-4 py-4 max-w-md mx-auto flex flex-col relative">
      <JuiceOverlay floaters={juice.floaters} grade={juice.grade} combo={combo} confetti={juice.confetti} />
      <header className="flex items-center justify-between">
        <button onClick={onExit} className="text-white/60 hover:text-white text-sm">← 나가기</button>
        <div className="text-sm flex gap-3 items-center">
          <HeartBar hearts={lives.hearts} max={lives.MAX_HEARTS} shielded={lives.shielded} />
          <span className="text-white/60 text-xs">Lv {level}/{TOTAL_LEVELS} · 벽돌 {bricksLeft}{ballCount > 1 ? ` · 🔵×${ballCount}` : ''} · {score}</span>
        </div>
      </header>
      <div className="mt-1 text-center text-sm font-bold text-indigo-200">🧱 {title}</div>

      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1">
          <GameItemBar items={[
            { id: 'shield', icon: '🛡️ 보호막', label: '공 놓침 1회 무효', cost: 8, onBuy: lives.arm, disabled: lives.shielded },
            { id: 'life', icon: '❤️ 생명', label: '생명 +1', cost: 15, onBuy: lives.addLife },
          ]} />
        </div>
      </div>

      {/* 파워업 HUD */}
      <div className="mt-1 h-5 flex items-center justify-center gap-2 text-[11px] font-bold">
        {activeBuffs.length > 0
          ? activeBuffs.map((b) => <span key={b} className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-100 border border-cyan-300/40">{b}</span>)
          : <span className="text-amber-200">{buff}</span>}
      </div>

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onPointerMove={(e) => pointerMove(e.clientX)}
        onPointerDown={(e) => pointerMove(e.clientX)}
        className="mt-1 w-full rounded-xl border-2 border-white/15 bg-black touch-none shadow-[0_0_30px_rgba(59,130,246,0.15)]"
        style={{ aspectRatio: `${W} / ${H}` }}
      />
      <p className="mt-1 text-center text-[11px] text-white/40">🖱️ 끌기 또는 ⌨️ ← → (A/D) 로 이동 · ✨점수 ⬌확장 🐢슬로우 ❤️생명 ➕멀티볼 🔥파이어볼 💣폭탄</p>
      {intro && <p className="text-center text-[11px] text-white/30">{intro}</p>}

      {quiz && (
        <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl bg-space-900 border border-white/15 p-5">
            <div className="text-center text-sm font-bold text-amber-200 mb-1">📝 문제를 풀어야 계속할 수 있어요!</div>
            {pending > 1 && <div className="text-center text-[11px] text-white/50 mb-2">남은 문제 {pending}개 · 차례로 풀어요</div>}
            <QuickAnswer key={quiz.id} problem={quiz} onResult={onQuizResult} />
          </div>
        </div>
      )}
    </div>
  )
}
