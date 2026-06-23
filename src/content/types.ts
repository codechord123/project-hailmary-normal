/**
 * 범용 단원 콘텐츠 틀 ("책꽂이" 구조).
 *
 * 분수 게임 엔진(src/data, src/types/problem.ts)과는 별개로,
 * 사회 등 새 단원을 끼워 넣기 위한 일반 콘텐츠 포맷이다.
 * 한 번 정한 이 틀에 hwp 문제를 계속 부어 넣는다 → 구조는 안 바뀌고 문제만 늘어난다.
 */

export type Difficulty = 1 | 2 | 3

/** 챕터에 입히는 미니게임 메커니즘 */
export type MechanicId = 'defense' | 'matching' | 'boss' | 'finalboss'

interface BaseProblem {
  id: string
  /** 권리 수호자 히어로 서사 도입부 (없어도 됨) */
  scenario?: string
  /** 그림/자료 설명 — 있으면 화면에 자료 카드로 보여줌 */
  figure?: string
  hint?: string
  difficulty: Difficulty
  /** 출처 메모 (예: "1회 7번") — 관리용, 화면 표시 X */
  source?: string
}

/** 객관식 (단일/복수 정답) — OX·둘 중 고르기도 보기 2개짜리로 표현 */
export interface MCQProblem extends BaseProblem {
  kind: 'mcq'
  prompt: string
  choices: string[]
  /** 정답 보기 인덱스(0부터). 복수정답이면 여러 개 */
  correctIndexes: number[]
  /** 보기를 여러 개 골라야 하는 문제인지 */
  multiple: boolean
}

/** OX 판단 — 진술이 맞으면 O(true), 틀리면 X(false) */
export interface OXProblem extends BaseProblem {
  kind: 'ox'
  statement: string
  answer: boolean
}

export interface MatchingPair {
  left: string
  right: string
}

/** 짝짓기 — 매칭 미니게임용 (법 ↔ 역할 등) */
export interface MatchingProblem extends BaseProblem {
  kind: 'matching'
  prompt: string
  pairs: MatchingPair[]
}

export type ContentProblem = MCQProblem | OXProblem | MatchingProblem

export interface ChapterDef {
  id: string
  title: string
  mechanic: MechanicId
  /** 챕터 도입 서사 (히어로 톤) */
  intro?: string
  /** 문제 통(pool) — 계속 추가만 하면 됨 */
  problems: ContentProblem[]
}

export interface UnitDef {
  id: string
  subject: string
  grade: string
  title: string
  /** 세계관 테마 */
  theme: string
  chapters: ChapterDef[]
}
