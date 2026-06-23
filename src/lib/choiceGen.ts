import type { Fraction } from '@/types/fraction'
import { simplify, valueEquals } from './fractionMath'

/** 정답 근처의 그럴듯한 오답 3개 생성 */
export const buildFractionChoices = (correct: Fraction): Fraction[] => {
  const simp = simplify(correct)
  const choices: Fraction[] = [simp]
  const tries = [
    { numerator: simp.numerator + 1, denominator: simp.denominator },
    { numerator: simp.numerator, denominator: simp.denominator + 1 },
    { numerator: simp.numerator - 1, denominator: simp.denominator },
    { numerator: simp.numerator + 1, denominator: simp.denominator + 1 },
    { numerator: simp.numerator + 2, denominator: simp.denominator },
    { numerator: simp.numerator, denominator: simp.denominator + 2 },
    { numerator: Math.max(1, simp.numerator - 1), denominator: Math.max(2, simp.denominator - 1) },
  ]
  for (const t of tries) {
    if (t.numerator < 1 || t.denominator < 2) continue
    if (choices.some((c) => valueEquals(c, t))) continue
    choices.push(t)
    if (choices.length === 4) break
  }
  // 4개 미만이면 큰 분모 변형 추가
  let k = 1
  while (choices.length < 4) {
    const t = { numerator: simp.numerator + k * 2, denominator: simp.denominator }
    if (!choices.some((c) => valueEquals(c, t))) choices.push(t)
    k++
    if (k > 20) break
  }
  // Fisher-Yates shuffle
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[choices[i], choices[j]] = [choices[j], choices[i]]
  }
  return choices
}

export const findCorrectIndex = (choices: Fraction[], correct: Fraction): number =>
  choices.findIndex((c) => valueEquals(c, correct))
