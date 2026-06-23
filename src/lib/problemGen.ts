import type { Problem } from '@/types/problem'
import { addFractions, subtractFractions, gcd, simplify } from './fractionMath'

/** 소수 둘째자리 → 기약분수 변환 문제 생성 */
export const genDecimalToFraction = (difficulty: number): Problem => {
  // 분모 4, 5, 20, 25 류로 떨어지는 깔끔한 소수 둘째자리 후보
  const POOL: Array<{ dec: string; num: number; den: number }> = [
    { dec: '0.25', num: 1, den: 4 },
    { dec: '0.75', num: 3, den: 4 },
    { dec: '0.20', num: 1, den: 5 },
    { dec: '0.40', num: 2, den: 5 },
    { dec: '0.60', num: 3, den: 5 },
    { dec: '0.80', num: 4, den: 5 },
    { dec: '0.05', num: 1, den: 20 },
    { dec: '0.15', num: 3, den: 20 },
    { dec: '0.35', num: 7, den: 20 },
    { dec: '0.45', num: 9, den: 20 },
    { dec: '0.55', num: 11, den: 20 },
    { dec: '0.65', num: 13, den: 20 },
    { dec: '0.85', num: 17, den: 20 },
    { dec: '0.95', num: 19, den: 20 },
    { dec: '0.04', num: 1, den: 25 },
    { dec: '0.08', num: 2, den: 25 },
    { dec: '0.12', num: 3, den: 25 },
    { dec: '0.16', num: 4, den: 25 },
    { dec: '0.24', num: 6, den: 25 },
    { dec: '0.36', num: 9, den: 25 },
    { dec: '0.44', num: 11, den: 25 },
    { dec: '0.56', num: 14, den: 25 },
    { dec: '0.64', num: 16, den: 25 },
    { dec: '0.76', num: 19, den: 25 },
    { dec: '0.84', num: 21, den: 25 },
    { dec: '0.96', num: 24, den: 25 },
    { dec: '0.50', num: 1, den: 2 },
  ]
  // 난이도 ↑ 시 분모 20·25 비중 ↑
  const filtered = difficulty >= 2 ? POOL.filter((p) => p.den >= 20 || p.den === 5) : POOL
  const pick = filtered[Math.floor(Math.random() * filtered.length)]
  return {
    id: nextId(), kind: 'fraction', difficulty: 2,
    scenario: `${pick.dec} 을(를) 기약분수로 바꿔.`,
    prompt: `${pick.dec} = ? (기약)`,
    hint: `${pick.dec} = ${Math.round(parseFloat(pick.dec) * 100)}/100 → 약분.`,
    answer: { numerator: pick.num, denominator: pick.den }, requireSimplified: true,
  }
}

/**
 * 기초연습 모드용 — 통분 LCM 이 99 미만인 모든 이분모 쌍에서 다양하게 픽.
 * 분모 범위 2~30, 서로 다름, LCM < 99 조건.
 */
const BASIC_PAIRS: Array<[number, number]> = (() => {
  const _gcd = (a: number, b: number): number => { while (b) { [a, b] = [b, a % b] } return a }
  const pairs: Array<[number, number]> = []
  for (let d1 = 2; d1 <= 30; d1++) {
    for (let d2 = d1 + 1; d2 <= 30; d2++) {
      const lcmVal = (d1 * d2) / _gcd(d1, d2)
      if (lcmVal < 99) pairs.push([d1, d2])
    }
  }
  return pairs
})()

export const genBasicPracticeAdd = (): Problem => {
  const [d1, d2] = BASIC_PAIRS[Math.floor(Math.random() * BASIC_PAIRS.length)]
  const n1 = rand(1, d1 - 1)
  const n2 = rand(1, d2 - 1)
  const a = { numerator: n1, denominator: d1 }
  const b = { numerator: n2, denominator: d2 }
  const ans = simplify(addFractions(a, b))
  return {
    id: nextId(), kind: 'fraction', difficulty: 1,
    scenario: `${n1}/${d1} + ${n2}/${d2} 을(를) 계산해서 기약분수로 답해.`,
    prompt: '합을 기약분수로',
    hint: `공통분모는 ${(d1 * d2) / gcd(d1, d2)}.`,
    answer: ans, requireSimplified: true,
  }
}

export const genBasicPracticeSub = (): Problem => {
  let a = { numerator: 0, denominator: 1 }
  let b = { numerator: 0, denominator: 1 }
  let result = { numerator: -1, denominator: 1 }
  let guard = 0
  do {
    const [d1, d2] = BASIC_PAIRS[Math.floor(Math.random() * BASIC_PAIRS.length)]
    a = { numerator: rand(1, d1 - 1), denominator: d1 }
    b = { numerator: rand(1, d2 - 1), denominator: d2 }
    result = subtractFractions(a, b)
  } while (result.numerator <= 0 && guard++ < 30)
  if (result.numerator <= 0) {
    a = { numerator: 3, denominator: 4 }
    b = { numerator: 1, denominator: 7 }
    result = subtractFractions(a, b)
  }
  const ans = simplify(result)
  return {
    id: nextId(), kind: 'fraction', difficulty: 1,
    scenario: `${a.numerator}/${a.denominator} − ${b.numerator}/${b.denominator} 을(를) 계산해서 기약분수로 답해.`,
    prompt: '차를 기약분수로',
    hint: `공통분모는 ${(a.denominator * b.denominator) / gcd(a.denominator, b.denominator)}.`,
    answer: ans, requireSimplified: true,
  }
}

/** 기초연습 — 합/차 무작위 */
export const genBasicPractice = (): Problem => {
  return Math.random() < 0.5 ? genBasicPracticeAdd() : genBasicPracticeSub()
}

/** 분수 vs 소수 크기 비교 */
export const genCompareDecFrac = (_difficulty: number): Problem => {
  const FRAC_POOL = [
    { n: 3, d: 4 }, { n: 5, d: 8 }, { n: 3, d: 5 }, { n: 7, d: 10 },
    { n: 9, d: 20 }, { n: 3, d: 8 }, { n: 7, d: 20 }, { n: 11, d: 25 },
  ]
  const f = FRAC_POOL[Math.floor(Math.random() * FRAC_POOL.length)]
  const fVal = f.n / f.d
  // 차이가 0.05 이상 나도록 소수 선택
  const candidates = [0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8]
    .filter((d) => Math.abs(d - fVal) >= 0.05)
  const dec = candidates[Math.floor(Math.random() * candidates.length)]
  const op: '>' | '<' = fVal > dec ? '>' : '<'
  return {
    id: nextId(), kind: 'compare', difficulty: 2,
    scenario: '두 측정값 비교 — 분수 vs 소수.',
    prompt: `${f.n}/${f.d} ?? ${dec}`,
    hint: `${f.n}/${f.d} ≈ ${fVal.toFixed(3)}.`,
    left: { numerator: f.n, denominator: f.d }, right: { decimal: dec }, correctOp: op,
  }
}

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

let idSeq = 0
const nextId = () => `g-${++idSeq}`

/** 작은 분모 풀 — 7, 9, 15 추가로 서로소·공통인수 패턴 다양화 */
const EASY_DENOMS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15]
const pickTwoDenoms = (difficulty: number): [number, number] => {
  const pool = EASY_DENOMS.slice(0, Math.min(EASY_DENOMS.length, 4 + difficulty))
  const d1 = pool[rand(0, pool.length - 1)]
  let d2 = pool[rand(0, pool.length - 1)]
  let guard = 0
  while (d2 === d1 && guard++ < 20) d2 = pool[rand(0, pool.length - 1)]
  if (d2 === d1) d2 = d1 === 2 ? 3 : 2
  return [d1, d2]
}

/** 세 분수 합 생성기 — 세 분모 통분 연습 */
export const genThreeAdd = (difficulty: number): Problem => {
  const [d1, d2] = pickTwoDenoms(difficulty)
  const pool = EASY_DENOMS.slice(0, Math.min(EASY_DENOMS.length, 4 + difficulty))
  let d3 = pool[rand(0, pool.length - 1)]
  let guard = 0
  while ((d3 === d1 || d3 === d2) && guard++ < 20) d3 = pool[rand(0, pool.length - 1)]
  if (d3 === d1 || d3 === d2) d3 = d1 + d2
  const a = { numerator: rand(1, d1 - 1), denominator: d1 }
  const b = { numerator: rand(1, d2 - 1), denominator: d2 }
  const c = { numerator: rand(1, d3 - 1), denominator: d3 }
  const ab = addFractions(a, b)
  const abc = addFractions(ab, c)
  const ans = simplify(abc)
  return {
    id: nextId(), kind: 'fraction', difficulty: 3,
    scenario: `세 분수 합: ${a.numerator}/${a.denominator} + ${b.numerator}/${b.denominator} + ${c.numerator}/${c.denominator}`,
    prompt: '통분 후 기약분수 (가분수 OK)',
    hint: '세 분모의 공통분모(LCM)를 먼저 찾아.',
    answer: ans, requireSimplified: true,
  }
}

// genSameDenAdd / genSameDenSub 는 이름을 유지하되 통분(이분모) 문제를 생성한다.
export const genSameDenAdd = (difficulty: number): Problem => {
  const [d1, d2] = pickTwoDenoms(difficulty)
  const a = { numerator: rand(1, d1 - 1), denominator: d1 }
  const b = { numerator: rand(1, d2 - 1), denominator: d2 }
  const ans = simplify(addFractions(a, b))
  return {
    id: nextId(), kind: 'fraction', difficulty: 2,
    scenario: `통분 덧셈: ${a.numerator}/${a.denominator} + ${b.numerator}/${b.denominator} = ?`,
    prompt: '통분 후 기약분수로 답해',
    hint: `공통분모를 찾아 통분한 뒤 더해.`,
    answer: ans, requireSimplified: true,
  }
}

export const genSameDenSub = (difficulty: number): Problem => {
  let a = { numerator: 0, denominator: 1 }
  let b = { numerator: 0, denominator: 1 }
  let sub = { numerator: -1, denominator: 1 }
  let guard = 0
  do {
    const [d1, d2] = pickTwoDenoms(difficulty)
    a = { numerator: rand(1, d1 - 1), denominator: d1 }
    b = { numerator: rand(1, d2 - 1), denominator: d2 }
    sub = subtractFractions(a, b)
  } while (sub.numerator <= 0 && guard++ < 20)
  if (sub.numerator <= 0) {
    a = { numerator: 2, denominator: 3 }
    b = { numerator: 1, denominator: 4 }
    sub = subtractFractions(a, b)
  }
  const ans = simplify(sub)
  return {
    id: nextId(), kind: 'fraction', difficulty: 2,
    scenario: `통분 뺄셈: ${a.numerator}/${a.denominator} − ${b.numerator}/${b.denominator} = ?`,
    prompt: '통분 후 기약분수로 답해',
    hint: `공통분모로 통분한 뒤 빼.`,
    answer: ans, requireSimplified: true,
  }
}

export const genDiffDenAdd = (difficulty: number): Problem => {
  const d1 = rand(2, 3 + Math.floor(difficulty / 2))
  let d2 = rand(2, 4 + Math.floor(difficulty / 2))
  while (d2 === d1 || gcd(d1, d2) > 1) d2 = rand(2, 6 + difficulty)
  const a = { numerator: rand(1, d1 - 1), denominator: d1 }
  const b = { numerator: rand(1, d2 - 1), denominator: d2 }
  const ans = simplify(addFractions(a, b))
  return {
    id: nextId(), kind: 'fraction', difficulty: 2,
    scenario: `다른 분모 덧셈: ${a.numerator}/${a.denominator} + ${b.numerator}/${b.denominator}`,
    prompt: '기약분수로',
    hint: '통분 먼저.',
    answer: ans, requireSimplified: true,
  }
}

export const genDiffDenSub = (difficulty: number): Problem => {
  const d1 = rand(3, 4 + Math.floor(difficulty / 2))
  let d2 = rand(2, 3 + Math.floor(difficulty / 2))
  while (d2 === d1) d2 = rand(2, 5 + difficulty)
  const a = { numerator: rand(2, d1 - 1), denominator: d1 }
  const b = { numerator: 1, denominator: d2 }
  const sub = subtractFractions(a, b)
  if (sub.numerator <= 0) return genDiffDenAdd(difficulty)
  const ans = simplify(sub)
  return {
    id: nextId(), kind: 'fraction', difficulty: 2,
    scenario: `다른 분모 뺄셈: ${a.numerator}/${a.denominator} − ${b.numerator}/${b.denominator}`,
    prompt: '기약분수로',
    hint: '통분 후 빼.',
    answer: ans, requireSimplified: true,
  }
}

export const genCompare = (_difficulty: number): Problem => {
  const d1 = rand(3, 8)
  const d2 = rand(3, 8)
  const n1 = rand(1, d1 - 1)
  const n2 = rand(1, d2 - 1)
  const v1 = n1 / d1
  const v2 = n2 / d2
  const correctOp: '>' | '<' | '=' = Math.abs(v1 - v2) < 1e-9 ? '=' : v1 > v2 ? '>' : '<'
  return {
    id: nextId(), kind: 'compare', difficulty: 1,
    scenario: '크기 비교!',
    prompt: `${n1}/${d1} ?? ${n2}/${d2}`,
    hint: '통분 또는 소수 변환.',
    left: { numerator: n1, denominator: d1 },
    right: { numerator: n2, denominator: d2 },
    correctOp,
  }
}

export const genNumericNatCount = (_difficulty: number): Problem => {
  // X/N < □/M < Y/N 같은 형태
  const d = rand(8, 14)
  const lo = rand(2, Math.floor(d / 2))
  const hi = rand(lo + 2, d - 1)
  return {
    id: nextId(), kind: 'numeric', difficulty: 2,
    scenario: '범위 안의 자연수 개수를 세어.',
    prompt: `${lo}/${d} < □/${d} < ${hi}/${d}을 만족하는 자연수 □는 몇 개?`,
    hint: `${lo + 1}부터 ${hi - 1}까지.`,
    answer: hi - lo - 1, unit: '개',
  }
}

import { ADVANCED_PROBLEMS } from '@/data/advancedPool'

export const genRandom = (difficulty: number): Problem => {
  // 응용 풀 100% — 단순 계산 generator 추방, 독해 응용만 출제.
  const pool = difficulty >= 2
    ? ADVANCED_PROBLEMS.filter((p) => (p.difficulty ?? 1) >= 2)
    : ADVANCED_PROBLEMS
  const adv = pool[Math.floor(Math.random() * pool.length)]
  return { ...adv, id: `${adv.id}-${nextId()}` }
}

/** 응용 풀에서만 픽 — TimeAttack/BossRush/Daily/Endless 가 쓸 단일 진입점 */
export const genApplied = (difficulty: number): Problem => genRandom(difficulty)
