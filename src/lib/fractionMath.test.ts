import { describe, it, expect } from 'vitest'
import {
  gcd, lcm, simplify, isSimplified, addFractions, subtractFractions, valueEquals, formatFraction,
} from './fractionMath'

describe('gcd', () => {
  it('일반 케이스', () => {
    expect(gcd(12, 18)).toBe(6)
    expect(gcd(7, 13)).toBe(1)
    expect(gcd(100, 25)).toBe(25)
  })
  it('0 처리', () => {
    expect(gcd(0, 5)).toBe(5)
    expect(gcd(5, 0)).toBe(5)
    expect(gcd(0, 0)).toBe(1) // 안전한 폴백
  })
})

describe('lcm', () => {
  it('일반 케이스', () => {
    expect(lcm(4, 6)).toBe(12)
    expect(lcm(3, 5)).toBe(15)
    expect(lcm(12, 18)).toBe(36)
  })
})

describe('simplify', () => {
  it('약분', () => {
    expect(simplify({ numerator: 6, denominator: 12 })).toEqual({ numerator: 1, denominator: 2 })
    expect(simplify({ numerator: 10, denominator: 15 })).toEqual({ numerator: 2, denominator: 3 })
  })
  it('이미 기약', () => {
    expect(simplify({ numerator: 3, denominator: 7 })).toEqual({ numerator: 3, denominator: 7 })
  })
})

describe('isSimplified', () => {
  it('기약 여부', () => {
    expect(isSimplified({ numerator: 1, denominator: 2 })).toBe(true)
    expect(isSimplified({ numerator: 2, denominator: 4 })).toBe(false)
    expect(isSimplified({ numerator: 7, denominator: 12 })).toBe(true)
  })
})

describe('addFractions', () => {
  it('같은 분모', () => {
    expect(addFractions({ numerator: 1, denominator: 4 }, { numerator: 2, denominator: 4 }))
      .toEqual({ numerator: 3, denominator: 4 })
  })
  it('다른 분모', () => {
    expect(addFractions({ numerator: 1, denominator: 3 }, { numerator: 1, denominator: 4 }))
      .toEqual({ numerator: 7, denominator: 12 })
  })
})

describe('subtractFractions', () => {
  it('같은 분모', () => {
    expect(subtractFractions({ numerator: 5, denominator: 8 }, { numerator: 3, denominator: 8 }))
      .toEqual({ numerator: 2, denominator: 8 })
  })
  it('다른 분모 (lcm 통분 결과)', () => {
    // 5/6 - 1/4: lcm=12, 10/12 - 3/12 = 7/12
    expect(subtractFractions({ numerator: 5, denominator: 6 }, { numerator: 1, denominator: 4 }))
      .toEqual({ numerator: 7, denominator: 12 })
  })
})

describe('valueEquals', () => {
  it('등가 분수', () => {
    expect(valueEquals({ numerator: 1, denominator: 2 }, { numerator: 2, denominator: 4 })).toBe(true)
    expect(valueEquals({ numerator: 3, denominator: 4 }, { numerator: 9, denominator: 12 })).toBe(true)
  })
  it('다른 값', () => {
    expect(valueEquals({ numerator: 1, denominator: 3 }, { numerator: 1, denominator: 4 })).toBe(false)
  })
})

describe('formatFraction', () => {
  it('KaTeX 형식', () => {
    expect(formatFraction({ numerator: 3, denominator: 4 })).toBe('\\dfrac{3}{4}')
  })
})
