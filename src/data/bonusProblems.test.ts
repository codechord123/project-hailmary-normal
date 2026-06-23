import { describe, it, expect } from 'vitest'
import { BONUS_PROBLEMS } from './bonusProblems'
import { judge } from '@/lib/judge'

describe('bonus problems — 챕터별 첫 보너스 정답 회귀 방지', () => {
  it.each(Object.entries(BONUS_PROBLEMS))('Ch%s 보너스 — judge correct', (_chap, p) => {
    let ans: any
    switch (p.kind) {
      case 'fraction':
        ans = { kind: 'fraction', value: p.answer }
        break
      case 'numeric':
        ans = { kind: 'numeric', value: p.answer }
        break
      case 'mcq':
        ans = { kind: 'mcq', values: [...p.correctIndexes] }
        break
      case 'compare':
        ans = { kind: 'compare', op: p.correctOp }
        break
      case 'multi':
        ans = { kind: 'multi', value: p.finalAnswer, workspace: '' }
        break
    }
    expect(judge(p, ans).kind).toBe('correct')
  })
})
