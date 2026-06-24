import { describe, it, expect } from 'vitest'
import { lawAndRightsUnit } from './index'
import { judgeContent, type ContentAnswer } from '@/content/judge'
import { findUnit } from '@/content/registry'
import { explainFor } from './explanations'

const all = lawAndRightsUnit.chapters.flatMap((c) => c.problems)

describe('법과 인권 — 정답 판정·미니게임 데이터 적합성', () => {
  it('모든 문제의 "정답"이 judge 에서 정답으로 처리된다', () => {
    for (const p of all) {
      let ans: ContentAnswer
      if (p.kind === 'mcq') ans = { kind: 'mcq', values: [...p.correctIndexes] }
      else if (p.kind === 'ox') ans = { kind: 'ox', value: p.answer }
      else if (p.kind === 'order') ans = { kind: 'order', order: p.steps.map((_, i) => i) }
      else {
        const map: Record<number, number> = {}
        p.pairs.forEach((_, i) => (map[i] = i))
        ans = { kind: 'matching', map }
      }
      expect(judgeContent(p, ans), `정답 처리 실패: ${p.id}`).toBe(true)
    }
  })

  it('분류·매칭·메모리 챕터에는 matching 문제가 있다', () => {
    for (const c of lawAndRightsUnit.chapters) {
      if (c.mechanic === 'sorting' || c.mechanic === 'matching' || c.mechanic === 'memory') {
        expect(c.problems.some((p) => p.kind === 'matching'), `${c.title}`).toBe(true)
      }
    }
  })

  it('OX 번개 챕터에는 OX 문제가 충분히(5+) 있다', () => {
    const oxChapter = lawAndRightsUnit.chapters.find((c) => c.mechanic === 'oxrush')
    const oxCount = oxChapter?.problems.filter((p) => p.kind === 'ox').length ?? 0
    expect(oxCount).toBeGreaterThanOrEqual(5)
  })

  it('타임라인 챕터에는 order 문제가 있고, 순서가 틀리면 오답 처리된다', () => {
    const tl = lawAndRightsUnit.chapters.find((c) => c.mechanic === 'timeline')
    const orders = tl?.problems.filter((p) => p.kind === 'order') ?? []
    expect(orders.length).toBeGreaterThanOrEqual(3)
    for (const p of orders) {
      if (p.kind !== 'order') continue
      expect(p.steps.length).toBeGreaterThanOrEqual(3)
      // 두 단계를 뒤바꾼 순서는 오답이어야 한다
      const wrong = p.steps.map((_, i) => i)
      ;[wrong[0], wrong[1]] = [wrong[1], wrong[0]]
      expect(judgeContent(p, { kind: 'order', order: wrong }), `${p.id} 오답 판정 실패`).toBe(false)
    }
  })

  it('대부분의 문항에 해설(explain) 또는 힌트가 연결돼 있다', () => {
    const withExplain = all.filter((p) => explainFor(p) !== undefined || p.hint).length
    // 문항의 90% 이상이 풀이 후 학습 피드백을 갖는다
    expect(withExplain / all.length).toBeGreaterThanOrEqual(0.9)
  })

  it('등록부에서 단원을 id로 찾을 수 있다', () => {
    expect(findUnit(lawAndRightsUnit.id)?.title).toBe(lawAndRightsUnit.title)
  })
})
