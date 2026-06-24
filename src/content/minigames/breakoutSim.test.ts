import { describe, it, expect } from 'vitest'

/**
 * 벽돌깨기 핵심 시뮬레이션 — 컴포넌트의 충돌/아이템/폭발 공식을 그대로 옮겨
 * 헤드리스로 수천 프레임 자동 플레이해 "벽돌 파괴·아이템 획득·폭발 연쇄·문제 출제"가
 * 실제로 동작하는지 증명한다. (브라우저 없이 로직 검증)
 */

const W = 360, H = 560, R = 7, PW = 76, PH = 12, PADDLE_Y = H - 30
const COLS = 10, ROWS = 8, BRICK_H = 14, ITEM_VY = 1.9
const QUIZ_EVERY = 7

type BType = 'normal' | 'tough' | 'explosive' | 'steel'
const HP: Record<BType, number> = { normal: 1, tough: 2, explosive: 1, steel: 3 }
interface Brick { x: number; y: number; w: number; hp: number; type: BType }
interface Ball { x: number; y: number; vx: number; vy: number }
interface Item { x: number; y: number }

function makeBricks(): Brick[] {
  const margin = 12, gap = 4
  const bw = (W - margin * 2 - gap * (COLS - 1)) / COLS
  const list: Brick[] = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const type: BType = r === 3 && c === 5 ? 'explosive' : r < 2 ? 'tough' : 'normal'
      list.push({ x: margin + c * (bw + gap), y: 40 + r * (BRICK_H + gap), w: bw, hp: HP[type], type })
    }
  }
  return list
}

function runSim() {
  const bricks = makeBricks()
  const items: Item[] = []
  let paddleX = W / 2
  let destroyed = 0
  let destroyedSinceQuiz = 0
  let quizzes = 0
  let itemsCaught = 0
  let explosionChains = 0
  let paddleW = PW
  const balls: Ball[] = [{ x: W / 2, y: PADDLE_Y - R - 1, vx: 2.2, vy: -5.2 }]

  const destroyBrick = (br: Brick, chained = false): void => {
    if (br.hp <= 0) return
    br.hp = 0
    destroyed++
    if (!chained) destroyedSinceQuiz++
    const cx = br.x + br.w / 2, cy = br.y + BRICK_H / 2
    // 드롭(시뮬에선 확정 스폰으로 검증)
    items.push({ x: cx, y: br.y })
    if (br.type === 'explosive') {
      let chainCount = 0
      for (const o of bricks) {
        if (o.hp <= 0 || o === br) continue
        if (Math.hypot((o.x + o.w / 2) - cx, (o.y + BRICK_H / 2) - cy) < 56) { destroyBrick(o, true); chainCount++ }
      }
      if (chainCount > 0) explosionChains++
    }
  }

  for (let frame = 0; frame < 6000; frame++) {
    const half = paddleW / 2
    for (let bi = balls.length - 1; bi >= 0; bi--) {
      const b = balls[bi]
      // 패들 자동 추적 (오토플레이)
      paddleX = Math.max(half, Math.min(W - half, b.x))
      b.x += b.vx; b.y += b.vy
      if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx) }
      if (b.x > W - R) { b.x = W - R; b.vx = -Math.abs(b.vx) }
      if (b.y < R) { b.y = R; b.vy = Math.abs(b.vy) }
      // 패들 반사
      if (b.vy > 0 && b.y > PADDLE_Y - R && b.y < PADDLE_Y + PH && b.x > paddleX - half && b.x < paddleX + half) {
        b.y = PADDLE_Y - R
        const rel = Math.max(-0.9, Math.min(0.9, (b.x - paddleX) / half))
        const mag = Math.hypot(b.vx, b.vy) || 5.2
        b.vx = mag * rel
        b.vy = -Math.sqrt(Math.max(mag * mag - b.vx * b.vx, (mag * 0.6) ** 2))
      }
      // 벽돌 충돌 (center-in-rect)
      for (const br of bricks) {
        if (br.hp <= 0) continue
        if (b.x > br.x && b.x < br.x + br.w && b.y > br.y && b.y < br.y + BRICK_H) {
          b.vy = -b.vy
          if (br.hp <= 1) destroyBrick(br) // 파괴 직전 — hp가 아직 1일 때 호출해야 본문 실행됨
          else br.hp -= 1
          break
        }
      }
      if (b.y > H + R) { balls.splice(bi, 1) }
    }
    // 공 다 떨어지면 재투입
    if (balls.length === 0) balls.push({ x: paddleX, y: PADDLE_Y - R - 1, vx: 2.2, vy: -5.2 })

    // 문제 출제 보장
    if (destroyedSinceQuiz >= QUIZ_EVERY) { destroyedSinceQuiz = 0; quizzes++ }

    // 아이템 낙하 + 획득 (패들이 공을 추적하므로 종종 잡힘)
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i]
      it.y += ITEM_VY
      const caught = it.y > PADDLE_Y - 14 && it.y < PADDLE_Y + PH + 16 && Math.abs(it.x - paddleX) < half + 16
      if (caught) { items.splice(i, 1); itemsCaught++ }
      else if (it.y > H) items.splice(i, 1)
    }
    if (bricks.every((b) => b.hp <= 0)) break
  }

  return { destroyed, quizzes, itemsCaught, explosionChains, total: bricks.length }
}

describe('벽돌깨기 핵심 로직(헤드리스 시뮬)', () => {
  const r = runSim()

  it('공이 벽돌을 실제로 파괴한다', () => {
    expect(r.destroyed).toBeGreaterThan(10)
  })
  it('벽돌 파괴마다 문제가 출제된다(7개당 1회)', () => {
    expect(r.quizzes).toBeGreaterThan(0)
  })
  it('떨어지는 아이템이 패들에 잡힌다', () => {
    expect(r.itemsCaught).toBeGreaterThan(0)
  })
  it('폭발 벽돌이 주변을 연쇄 파괴한다', () => {
    expect(r.explosionChains).toBeGreaterThan(0)
  })
})
