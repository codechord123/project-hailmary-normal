import { describe, it, expect } from 'vitest'
import { ADVANCED_PROBLEMS } from './advancedPool'
import { judge } from '@/lib/judge'

describe('advanced pool — 의도된 정답 검증', () => {
  it.each(ADVANCED_PROBLEMS.map((p) => [p.id, p] as const))(
    '%s — judge correct',
    (_id, p) => {
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
    },
  )
})
