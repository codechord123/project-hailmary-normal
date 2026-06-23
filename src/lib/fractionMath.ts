import type { Fraction } from '@/types/fraction'

export const gcd = (a: number, b: number): number => {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b !== 0) {
    ;[a, b] = [b, a % b]
  }
  return a || 1
}

export const lcm = (a: number, b: number): number => Math.abs(a * b) / gcd(a, b)

export const simplify = (f: Fraction): Fraction => {
  const d = gcd(f.numerator, f.denominator)
  return { numerator: f.numerator / d, denominator: f.denominator / d }
}

export const isSimplified = (f: Fraction): boolean =>
  gcd(f.numerator, f.denominator) === 1

export const addFractions = (a: Fraction, b: Fraction): Fraction => {
  const denom = lcm(a.denominator, b.denominator)
  const numer =
    a.numerator * (denom / a.denominator) + b.numerator * (denom / b.denominator)
  return { numerator: numer, denominator: denom }
}

export const subtractFractions = (a: Fraction, b: Fraction): Fraction => {
  const denom = lcm(a.denominator, b.denominator)
  const numer =
    a.numerator * (denom / a.denominator) - b.numerator * (denom / b.denominator)
  return { numerator: numer, denominator: denom }
}

/** 수학적으로 같은 값인지 (약분 형태와 무관) */
export const valueEquals = (a: Fraction, b: Fraction): boolean => {
  if (b.denominator === 0) return false
  const sa = simplify(a)
  const sb = simplify(b)
  return sa.numerator === sb.numerator && sa.denominator === sb.denominator
}

export const formatFraction = (f: Fraction): string =>
  `\\dfrac{${f.numerator}}{${f.denominator}}`
