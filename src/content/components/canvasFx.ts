/**
 * 캔버스 게임용 공용 게임필(juice) 엔진 — 파티클·화면 흔들림·히트스톱·잔상.
 * rAF 루프 안에서 순수하게 동작하도록 클로저로 구성. (외부 에셋 없이 캔버스 드로잉만)
 */

export interface Particle {
  x: number; y: number
  vx: number; vy: number
  life: number; max: number
  size: number
  color: string
  gravity: number
  spin: number
  rot: number
  shape: 'rect' | 'circle' | 'spark'
}

interface BurstOpts {
  count?: number
  color?: string | string[]
  speed?: number
  spread?: number // 방향(라디안) 중심; 생략 시 360°
  cone?: number // spread 폭(라디안)
  gravity?: number
  size?: number
  life?: number
  shape?: Particle['shape']
}

const rand = (a: number, b: number) => a + Math.random() * (b - a)

export function createFx(opts?: { maxParticles?: number }) {
  const MAX = opts?.maxParticles ?? 160
  const particles: Particle[] = []
  let shakeMag = 0
  let hitStop = 0
  let flash = 0 // 0..1 화면 전체 플래시
  let flashColor = '255,255,255'

  const burst = (x: number, y: number, o: BurstOpts = {}) => {
    const count = o.count ?? 14
    const colors = Array.isArray(o.color) ? o.color : [o.color ?? '#fff']
    const baseAng = o.spread ?? 0
    const cone = o.cone ?? Math.PI * 2
    const speed = o.speed ?? 3
    for (let i = 0; i < count; i++) {
      if (particles.length >= MAX) particles.shift()
      const ang = o.spread !== undefined ? baseAng + rand(-cone / 2, cone / 2) : rand(0, Math.PI * 2)
      const sp = speed * rand(0.4, 1.2)
      const life = (o.life ?? 28) * rand(0.7, 1.1)
      particles.push({
        x, y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp,
        life, max: life,
        size: (o.size ?? 3) * rand(0.7, 1.3),
        color: colors[(Math.random() * colors.length) | 0],
        gravity: o.gravity ?? 0.12,
        spin: rand(-0.3, 0.3),
        rot: rand(0, Math.PI),
        shape: o.shape ?? 'rect',
      })
    }
  }

  const shake = (mag: number) => { shakeMag = Math.max(shakeMag, mag) }
  const freeze = (frames: number) => { hitStop = Math.max(hitStop, frames) }
  const screenFlash = (a: number, color = '255,255,255') => { flash = Math.max(flash, a); flashColor = color }

  /** 물리 업데이트. 히트스톱 중이면 false 반환(게임 물리 건너뛰기용) */
  const tick = (): boolean => {
    // 파티클은 히트스톱 중에도 살짝 진행
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.x += p.vx; p.y += p.vy
      p.vy += p.gravity
      p.vx *= 0.985
      p.rot += p.spin
      p.life--
      if (p.life <= 0) particles.splice(i, 1)
    }
    shakeMag *= 0.86
    if (shakeMag < 0.3) shakeMag = 0
    flash *= 0.85
    if (flash < 0.02) flash = 0
    if (hitStop > 0) { hitStop--; return false }
    return true
  }

  /** 카메라 흔들림 적용 — draw 시작에 호출하고, 끝에 restore() */
  const begin = (ctx: CanvasRenderingContext2D) => {
    ctx.save()
    if (shakeMag > 0) ctx.translate(rand(-shakeMag, shakeMag), rand(-shakeMag, shakeMag))
  }

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    for (const p of particles) {
      const a = Math.max(0, p.life / p.max)
      ctx.globalAlpha = a
      ctx.fillStyle = p.color
      if (p.shape === 'circle') {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
      } else if (p.shape === 'spark') {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot)
        ctx.fillRect(-p.size * 1.6, -p.size * 0.35, p.size * 3.2, p.size * 0.7)
        ctx.restore()
      } else {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot)
        ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2)
        ctx.restore()
      }
    }
    ctx.globalAlpha = 1
  }

  /** 흔들림 복원 + 화면 플래시 */
  const end = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.restore()
    if (flash > 0) {
      ctx.fillStyle = `rgba(${flashColor},${flash})`
      ctx.fillRect(0, 0, w, h)
    }
  }

  return { particles, burst, shake, freeze, screenFlash, tick, begin, drawParticles, end,
    get shakeMag() { return shakeMag }, get hitStop() { return hitStop } }
}

export type Fx = ReturnType<typeof createFx>

/** 부드러운 별/그리드 배경을 그린다(은은한 우주/네온 느낌) */
export function drawStarfield(
  ctx: CanvasRenderingContext2D, w: number, h: number, t: number,
  stars: { x: number; y: number; z: number }[],
) {
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#0b1026')
  grad.addColorStop(1, '#05070f')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
  for (const s of stars) {
    const y = (s.y + t * s.z * 0.4) % h
    ctx.globalAlpha = 0.3 + s.z * 0.5
    ctx.fillStyle = '#9bb6ff'
    ctx.fillRect(s.x, y, s.z * 1.6, s.z * 1.6)
  }
  ctx.globalAlpha = 1
}

export function makeStars(w: number, h: number, n: number) {
  return Array.from({ length: n }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    z: 0.4 + Math.random() * 1.4,
  }))
}

/** 둥근 사각형 경로 */
export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}
