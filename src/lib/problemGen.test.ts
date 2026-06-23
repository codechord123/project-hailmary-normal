import { describe, it, expect } from 'vitest'
import { genSameDenAdd, genSameDenSub, genDiffDenAdd, genDiffDenSub } from './problemGen'

describe('problemGen — 모든 생성기가 이분모(통분) 문제를 만든다', () => {
  const gens = [
    ['genSameDenAdd', genSameDenAdd],
    ['genSameDenSub', genSameDenSub],
    ['genDiffDenAdd', genDiffDenAdd],
    ['genDiffDenSub', genDiffDenSub],
  ] as const

  it.each(gens)('%s — 20회 생성 모두 분모가 서로 다름', (_name, gen) => {
    for (let i = 0; i < 20; i++) {
      const p = gen(2) as any
      // 시나리오 문자열에서 두 분모를 추출
      const m = p.scenario.match(/(\d+)\/(\d+)\s*[+−-]\s*(\d+)\/(\d+)/)
      expect(m).toBeTruthy()
      const d1 = Number(m[2])
      const d2 = Number(m[4])
      expect(d1).not.toBe(d2)
    }
  })

  it('통분 뺄셈 결과는 항상 양수', () => {
    for (let i = 0; i < 30; i++) {
      const p = genSameDenSub(2) as any
      expect(p.answer.numerator).toBeGreaterThan(0)
    }
  })
})
