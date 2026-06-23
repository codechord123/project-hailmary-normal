import type { Fraction } from './fraction'

export type ProblemDifficulty = 1 | 2 | 3

interface BaseProblem {
  id: string
  scenario: string // 우주 서사
  prompt: string // 실제 묻는 질문
  hint: string
  difficulty: ProblemDifficulty
}

export interface FractionAnswerProblem extends BaseProblem {
  kind: 'fraction'
  /** 정답 분수 (값 동등 비교) */
  answer: Fraction
  requireSimplified?: boolean
}

export interface NumericProblem extends BaseProblem {
  kind: 'numeric'
  answer: number
  unit?: string // "개", "" 등
}

export interface MCQProblem extends BaseProblem {
  kind: 'mcq'
  choices: string[]
  /** 정답 인덱스 set. 다중 정답 시 선택 집합 일치 */
  correctIndexes: number[]
  multiple: boolean
}

export interface CompareProblem extends BaseProblem {
  kind: 'compare'
  /** 화면에 표시할 좌/우 — 분수 또는 소수 */
  left: Fraction | { decimal: number }
  right: Fraction | { decimal: number }
  correctOp: '>' | '<' | '='
}

export interface MultiPartProblem extends BaseProblem {
  kind: 'multi'
  /** 학생이 적는 풀이 과정 — 채점하지 않음 */
  workspacePlaceholder: string
  finalAnswer: Fraction
  requireSimplified?: boolean
}

export type Problem =
  | FractionAnswerProblem
  | NumericProblem
  | MCQProblem
  | CompareProblem
  | MultiPartProblem

export type StudentAnswer =
  | { kind: 'fraction'; value: Fraction | null }
  | { kind: 'numeric'; value: number | null }
  | { kind: 'mcq'; values: number[] }
  | { kind: 'compare'; op: '>' | '<' | '=' | null }
  | { kind: 'multi'; value: Fraction | null; workspace: string }
