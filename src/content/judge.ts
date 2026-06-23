import type { ContentProblem } from './types'

/** 학생이 고른 답 (문제 유형별) */
export type ContentAnswer =
  | { kind: 'mcq'; values: number[] }
  | { kind: 'ox'; value: boolean | null }
  /** matching: leftIndex → 학생이 고른 rightIndex */
  | { kind: 'matching'; map: Record<number, number> }

const sameSet = (a: number[], b: number[]): boolean => {
  if (a.length !== b.length) return false
  const sb = new Set(b)
  return a.every((x) => sb.has(x))
}

/** 답이 비어 있는지 (제출 가능 여부 판단용) */
export function isAnswered(problem: ContentProblem, ans: ContentAnswer): boolean {
  switch (ans.kind) {
    case 'mcq':
      return ans.values.length > 0
    case 'ox':
      return ans.value !== null
    case 'matching':
      return (
        problem.kind === 'matching' &&
        problem.pairs.every((_, i) => ans.map[i] !== undefined)
      )
  }
}

/** 정답 여부 판정 */
export function judgeContent(problem: ContentProblem, ans: ContentAnswer): boolean {
  if (problem.kind === 'mcq' && ans.kind === 'mcq') {
    return sameSet(problem.correctIndexes, ans.values)
  }
  if (problem.kind === 'ox' && ans.kind === 'ox') {
    return ans.value === problem.answer
  }
  if (problem.kind === 'matching' && ans.kind === 'matching') {
    // left[i] 의 정답은 right[i] (같은 인덱스끼리 짝)
    return problem.pairs.every((_, i) => ans.map[i] === i)
  }
  return false
}
