import { describe, it, expect } from 'vitest'
import { lawAndRightsUnit } from './index'
import type { ContentProblem } from '@/content/types'

const allProblems: ContentProblem[] = lawAndRightsUnit.chapters.flatMap((c) => c.problems)

describe('법의 역할과 인권 — 콘텐츠 데이터 무결성', () => {
  it('문제 id가 모두 고유하다', () => {
    const ids = allProblems.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('객관식 정답 인덱스가 보기 범위 안에 있고 비어 있지 않다', () => {
    for (const p of allProblems) {
      if (p.kind !== 'mcq') continue
      expect(p.correctIndexes.length).toBeGreaterThan(0)
      for (const i of p.correctIndexes) {
        expect(i).toBeGreaterThanOrEqual(0)
        expect(i).toBeLessThan(p.choices.length)
      }
      // 단일정답인데 정답이 2개 이상이면 모순
      if (!p.multiple) expect(p.correctIndexes.length).toBe(1)
    }
  })

  it('짝짓기 문제는 짝이 2개 이상이고, 좌/우가 모두 채워져 있다', () => {
    for (const p of allProblems) {
      if (p.kind !== 'matching') continue
      expect(p.pairs.length).toBeGreaterThanOrEqual(2)
      for (const pair of p.pairs) {
        expect(pair.left.trim().length).toBeGreaterThan(0)
        expect(pair.right.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('여섯 챕터가 의도한 미니게임 순서로 매핑돼 있다', () => {
    const mechanics = lawAndRightsUnit.chapters.map((c) => c.mechanic)
    expect(mechanics).toEqual(['runner', 'sorting', 'memory', 'oxrush', 'detective', 'breakout'])
  })

  it('단원 전체 문항이 100개 이상이다', () => {
    expect(allProblems.length).toBeGreaterThanOrEqual(100)
  })

  it('OX 문항의 정답은 boolean 이다', () => {
    for (const p of allProblems) {
      if (p.kind !== 'ox') continue
      expect(typeof p.answer).toBe('boolean')
    }
  })
})
