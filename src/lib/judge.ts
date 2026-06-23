import type { Problem, StudentAnswer } from '@/types/problem'
import type { Fraction } from '@/types/fraction'
import { valueEquals, isSimplified } from './fractionMath'

const decOf = (f: Fraction | { decimal: number }): number =>
  'decimal' in f ? f.decimal : f.numerator / f.denominator

export type JudgeResult =
  | { kind: 'correct' }
  | { kind: 'need-simplify' }
  | { kind: 'wrong'; reason: string }

const setEq = (a: number[], b: number[]) => {
  if (a.length !== b.length) return false
  const sa = [...a].sort()
  const sb = [...b].sort()
  return sa.every((v, i) => v === sb[i])
}

export const judge = (p: Problem, ans: StudentAnswer): JudgeResult => {
  switch (p.kind) {
    case 'fraction': {
      if (ans.kind !== 'fraction' || !ans.value)
        return { kind: 'wrong', reason: '답을 입력해줘.' }
      if (!valueEquals(ans.value, p.answer))
        return { kind: 'wrong', reason: '값이 달라.' }
      if (p.requireSimplified && !isSimplified(ans.value))
        return { kind: 'need-simplify' }
      return { kind: 'correct' }
    }
    case 'numeric': {
      if (ans.kind !== 'numeric' || ans.value === null)
        return { kind: 'wrong', reason: '답을 입력해줘.' }
      if (ans.value !== p.answer) return { kind: 'wrong', reason: '답이 달라.' }
      return { kind: 'correct' }
    }
    case 'mcq': {
      if (ans.kind !== 'mcq') return { kind: 'wrong', reason: '선택지를 골라줘.' }
      if (!setEq(ans.values, p.correctIndexes))
        return { kind: 'wrong', reason: '선택이 달라.' }
      return { kind: 'correct' }
    }
    case 'compare': {
      if (ans.kind !== 'compare' || !ans.op)
        return { kind: 'wrong', reason: '부등호를 골라줘.' }
      const l = decOf(p.left)
      const r = decOf(p.right)
      const actual: '>' | '<' | '=' =
        Math.abs(l - r) < 1e-9 ? '=' : l > r ? '>' : '<'
      if (actual !== p.correctOp || actual !== ans.op)
        return { kind: 'wrong', reason: '크기 비교가 달라.' }
      return { kind: 'correct' }
    }
    case 'multi': {
      if (ans.kind !== 'multi' || !ans.value)
        return { kind: 'wrong', reason: '답을 입력해줘.' }
      if (!valueEquals(ans.value, p.finalAnswer))
        return { kind: 'wrong', reason: '값이 달라.' }
      if (p.requireSimplified && !isSimplified(ans.value))
        return { kind: 'need-simplify' }
      return { kind: 'correct' }
    }
  }
}

export type Rank = 'S' | 'A' | 'B' | 'C'

export const computeRank = (score: number, maxScore: number): Rank => {
  const pct = score / maxScore
  if (pct >= 0.95) return 'S'
  if (pct >= 0.8) return 'A'
  if (pct >= 0.6) return 'B'
  return 'C'
}

/** 학생 답안을 사람이 읽기 좋은 텍스트로 변환 */
export const answerToText = (a: StudentAnswer): string => {
  switch (a.kind) {
    case 'fraction':
      return a.value ? `${a.value.numerator}/${a.value.denominator}` : '(미입력)'
    case 'numeric':
      return a.value != null ? String(a.value) : '(미입력)'
    case 'mcq':
      return a.values.length === 0
        ? '(미선택)'
        : a.values.map((i) => ['①','②','③','④','⑤'][i] ?? `${i + 1}`).join(' ')
    case 'compare':
      return a.op ?? '(미선택)'
    case 'multi':
      return a.value ? `${a.value.numerator}/${a.value.denominator}` : '(미입력)'
  }
}

/** 문제의 정답을 사람이 읽기 좋은 텍스트로 */
export const problemAnswerText = (p: Problem): string => {
  switch (p.kind) {
    case 'fraction':
      return `${p.answer.numerator}/${p.answer.denominator}`
    case 'numeric':
      return `${p.answer}${p.unit ?? ''}`
    case 'mcq':
      return p.correctIndexes.map((i) => ['①','②','③','④','⑤'][i] ?? `${i + 1}`).join(' ')
    case 'compare':
      return p.correctOp
    case 'multi':
      return `${p.finalAnswer.numerator}/${p.finalAnswer.denominator}`
  }
}

/** 자석 아이템: 문제의 정답을 그대로 학생 답안 형태로 변환 */
export const correctAnswerFor = (p: Problem): StudentAnswer => {
  switch (p.kind) {
    case 'fraction': return { kind: 'fraction', value: p.answer }
    case 'numeric': return { kind: 'numeric', value: p.answer }
    case 'mcq': return { kind: 'mcq', values: [...p.correctIndexes] }
    case 'compare': return { kind: 'compare', op: p.correctOp }
    case 'multi': return { kind: 'multi', value: p.finalAnswer, workspace: '자석으로 자동 풀이' }
  }
}
