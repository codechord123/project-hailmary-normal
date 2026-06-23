import { describe, it, expect } from 'vitest'
import { CHAPTER1_APPLICATION_POOL } from './chapter1'
import { judge } from '@/lib/judge'

describe('chapter1 application pool — 정답 회귀 방지', () => {
  it.each(CHAPTER1_APPLICATION_POOL.map((p) => [p.problem.id, p] as const))(
    '%s — judge가 의도된 정답을 통과시킴',
    (_id, app) => {
      const p = app.problem
      let studentAns: any
      switch (p.kind) {
        case 'fraction':
          studentAns = { kind: 'fraction', value: p.answer }
          break
        case 'numeric':
          studentAns = { kind: 'numeric', value: p.answer }
          break
        case 'mcq':
          studentAns = { kind: 'mcq', values: [...p.correctIndexes] }
          break
        case 'compare':
          studentAns = { kind: 'compare', op: p.correctOp }
          break
        case 'multi':
          studentAns = { kind: 'multi', value: p.finalAnswer, workspace: '' }
          break
      }
      expect(judge(p, studentAns).kind).toBe('correct')
    },
  )
})
