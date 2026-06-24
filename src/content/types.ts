/**
 * 범용 단원 콘텐츠 틀 ("책꽂이" 구조).
 *
 * 분수 게임 엔진(src/data, src/types/problem.ts)과는 별개로,
 * 사회 등 새 단원을 끼워 넣기 위한 일반 콘텐츠 포맷이다.
 * 한 번 정한 이 틀에 hwp 문제를 계속 부어 넣는다 → 구조는 안 바뀌고 문제만 늘어난다.
 */

export type Difficulty = 1 | 2 | 3

/** 챕터에 입히는 미니게임 메커니즘 */
export type MechanicId = 'runner' | 'defense' | 'sorting' | 'matching' | 'memory' | 'oxrush' | 'detective' | 'boss' | 'finalboss' | 'breakout' | 'timeline'

interface BaseProblem {
  id: string
  /** 권리 수호자 히어로 서사 도입부 (없어도 됨) */
  scenario?: string
  /** 그림/자료 설명 — 있으면 화면에 자료 카드로 보여줌 */
  figure?: string
  hint?: string
  /** 오답을 학습으로 되돌리는 한 줄 해설 (정답의 근거·핵심 개념). 풀이 후 표시 */
  explain?: string
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

/**
 * 순서 맞추기 — 타임라인 미니게임용.
 * steps는 "올바른 순서대로" 저장한다(게임에서 섞어 출제, 원래 순서가 정답).
 * 예) 재판 과정, 법 제정 과정, 인권 구제 절차.
 */
export interface OrderProblem extends BaseProblem {
  kind: 'order'
  prompt: string
  steps: string[]
}

export type ContentProblem = MCQProblem | OXProblem | MatchingProblem | OrderProblem

export interface ChapterDef {
  id: string
  title: string
  mechanic: MechanicId
  /** 챕터 도입 서사 (게임 안 한 줄 안내) */
  intro?: string
  /** 챕터 시작 스토리 대사 (시작 전 오버레이로 표시) */
  story?: string[]
  /** 문제 통(pool) — 계속 추가만 하면 됨 */
  problems: ContentProblem[]
}

/**
 * 단원별 세계관·서사(컨셉).
 * 구조(템플릿)는 모든 단원이 같고, 이 부분만 단원마다 갈아끼운다.
 * 예) 수학=우주 항해사 / 사회=권리 수호자.
 */
export interface UnitNarrative {
  /** 주인공 호칭 (예: "권리 수호자", "우주 항해사") */
  hero: string
  /** 허브 화면 부제 (한 줄 소개) */
  tagline: string
  /** 모험 시작 버튼 문구 (예: "🛡️ 모험 시작", "🚀 항해 시작") */
  startLabel: string
  /** 자원/생명 이름 (예: "정의 에너지", "산소") */
  resourceName?: string
  /** 레벨별 칭호 (RPG 성장감). level 이상일 때 해당 칭호 적용 */
  ranks?: { level: number; title: string }[]
}

/** 현재 레벨에 맞는 칭호 (가장 높은 충족 등급) */
export function rankTitle(narrative: UnitNarrative | undefined, level: number): string {
  const ranks = narrative?.ranks
  if (!ranks || ranks.length === 0) return narrative?.hero ?? ''
  let title = ranks[0].title
  for (const r of ranks) if (level >= r.level) title = r.title
  return title
}

export interface UnitDef {
  id: string
  subject: string
  grade: string
  title: string
  /** 세계관 테마 (짧은 키워드) */
  theme: string
  /** 세계관·서사 상세 (허브 화면 등에 사용) */
  narrative?: UnitNarrative
  chapters: ChapterDef[]
}
