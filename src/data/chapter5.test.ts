import { describe, it, expect } from 'vitest'
import { chapter5Breaches, solveBreach } from './chapter5'
import { isSimplified } from '@/lib/fractionMath'

describe('chapter5 breaches — simplify 단계가 항상 의미 있어야 함', () => {
  it.each(chapter5Breaches.map((b) => [b.id, b] as const))(
    '%s — 계산 결과가 NOT 기약 (약분 필요)',
    (_id, breach) => {
      const sol = solveBreach(breach)
      // raw 결과가 기약이면 simplify 단계가 중복 — 반드시 약분 필요해야 함
      expect(isSimplified(sol.result)).toBe(false)
      // 그리고 simplified 는 기약이어야
      expect(isSimplified(sol.simplified)).toBe(true)
      // 두 값이 실제로 다른 형태여야 (의미 있는 약분)
      expect(sol.result.numerator).not.toBe(sol.simplified.numerator)
    },
  )

  it.each(chapter5Breaches.map((b) => [b.id, b] as const))(
    '%s — 독해용 story 필드가 있어야 함',
    (_id, breach) => {
      expect(breach.story).toBeTruthy()
      expect(breach.story.length).toBeGreaterThan(20)
    },
  )
})
