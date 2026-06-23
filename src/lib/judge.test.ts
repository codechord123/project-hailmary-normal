import { describe, it, expect } from 'vitest'
import { judge, computeRank } from './judge'
import type { Problem } from '@/types/problem'

const base = { id: 'p1', scenario: '', prompt: '', hint: '', difficulty: 1 as const }

describe('judge - fraction', () => {
  const p: Problem = {
    ...base, kind: 'fraction', answer: { numerator: 1, denominator: 2 }, requireSimplified: true,
  }
  it('정답 (기약)', () => {
    expect(judge(p, { kind: 'fraction', value: { numerator: 1, denominator: 2 } })).toEqual({ kind: 'correct' })
  })
  it('등가지만 기약 아님', () => {
    expect(judge(p, { kind: 'fraction', value: { numerator: 2, denominator: 4 } })).toEqual({ kind: 'need-simplify' })
  })
  it('오답', () => {
    const r = judge(p, { kind: 'fraction', value: { numerator: 1, denominator: 3 } })
    expect(r.kind).toBe('wrong')
  })
  it('빈 입력', () => {
    expect(judge(p, { kind: 'fraction', value: null }).kind).toBe('wrong')
  })
})

describe('judge - numeric', () => {
  const p: Problem = { ...base, kind: 'numeric', answer: 6, unit: '개' }
  it('정답', () => {
    expect(judge(p, { kind: 'numeric', value: 6 }).kind).toBe('correct')
  })
  it('오답', () => {
    expect(judge(p, { kind: 'numeric', value: 5 }).kind).toBe('wrong')
  })
  it('빈 입력', () => {
    expect(judge(p, { kind: 'numeric', value: null }).kind).toBe('wrong')
  })
})

describe('judge - mcq', () => {
  const p: Problem = {
    ...base, kind: 'mcq', choices: ['a','b','c','d'], correctIndexes: [0, 2], multiple: true,
  }
  it('정확한 집합', () => {
    expect(judge(p, { kind: 'mcq', values: [0, 2] }).kind).toBe('correct')
  })
  it('순서 무관', () => {
    expect(judge(p, { kind: 'mcq', values: [2, 0] }).kind).toBe('correct')
  })
  it('부분 일치는 오답', () => {
    expect(judge(p, { kind: 'mcq', values: [0] }).kind).toBe('wrong')
  })
})

describe('judge - compare', () => {
  const p: Problem = {
    ...base, kind: 'compare',
    left: { numerator: 4, denominator: 5 }, right: { decimal: 0.7 }, correctOp: '>',
  }
  it('올바른 부등호', () => {
    expect(judge(p, { kind: 'compare', op: '>' }).kind).toBe('correct')
  })
  it('잘못된 부등호', () => {
    expect(judge(p, { kind: 'compare', op: '<' }).kind).toBe('wrong')
  })
  it('등호 정답', () => {
    const eq: Problem = {
      ...base, kind: 'compare',
      left: { numerator: 1, denominator: 2 }, right: { decimal: 0.5 }, correctOp: '=',
    }
    expect(judge(eq, { kind: 'compare', op: '=' }).kind).toBe('correct')
  })
})

describe('judge - multi', () => {
  const p: Problem = {
    ...base, kind: 'multi', workspacePlaceholder: '...',
    finalAnswer: { numerator: 1, denominator: 4 }, requireSimplified: true,
  }
  it('정답', () => {
    expect(judge(p, { kind: 'multi', value: { numerator: 1, denominator: 4 }, workspace: 'any' }).kind).toBe('correct')
  })
  it('기약 미달', () => {
    expect(judge(p, { kind: 'multi', value: { numerator: 2, denominator: 8 }, workspace: '' }).kind).toBe('need-simplify')
  })
})

describe('computeRank', () => {
  it('등급', () => {
    expect(computeRank(100, 100)).toBe('S')
    expect(computeRank(85, 100)).toBe('A')
    expect(computeRank(65, 100)).toBe('B')
    expect(computeRank(30, 100)).toBe('C')
  })
})
