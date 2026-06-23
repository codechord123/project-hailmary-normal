import type { UnitDef } from './types'
import { lawAndRightsUnit } from './units/lawAndRights'

/**
 * 책꽂이 등록부.
 * 과목(SubjectGroup) 안에 단원을 꽂아두면 과목→단원 선택 화면에 자동으로 나타난다.
 *
 * 단원은 두 종류:
 *  - content: 우리 ContentProblem 콘텐츠 팩 (예: 법과 인권) → /unit/:id 로 진입
 *  - legacy : 기존 헤일메리 엔진(수학) 그대로 → 지정 route 로 진입
 */
export type RegistryUnit =
  | { kind: 'content'; def: UnitDef }
  | {
      kind: 'legacy'
      id: string
      grade: string
      title: string
      theme: string
      /** 진입 경로 (기존 게임 허브) */
      route: string
    }

export interface SubjectGroup {
  id: string
  name: string
  icon: string
  units: RegistryUnit[]
}

export const SUBJECTS: SubjectGroup[] = [
  {
    id: 'math',
    name: '수학',
    icon: '🚀',
    units: [
      {
        kind: 'legacy',
        id: 'math-5-1-fraction',
        grade: '5-1',
        title: '헤일메리 분수 미션',
        theme: '우주 항해사',
        // 기존 게임 허브(MainMenu) — 항해 시작·타임어택·끝없는 항해 등 전체 시스템
        route: '/math',
      },
    ],
  },
  {
    id: 'social',
    name: '사회',
    icon: '⚖️',
    units: [{ kind: 'content', def: lawAndRightsUnit }],
  },
]

export function findSubject(subjectId: string): SubjectGroup | undefined {
  return SUBJECTS.find((s) => s.id === subjectId)
}

/** content 단원만 조회 (게임 콘텐츠 팩) */
export function findUnit(unitId: string): UnitDef | undefined {
  for (const s of SUBJECTS) {
    for (const u of s.units) {
      if (u.kind === 'content' && u.def.id === unitId) return u.def
    }
  }
  return undefined
}

/** 단원이 속한 과목 찾기 (뒤로가기 경로용) */
export function subjectOfUnit(unitId: string): SubjectGroup | undefined {
  return SUBJECTS.find((s) =>
    s.units.some((u) => (u.kind === 'content' ? u.def.id : u.id) === unitId),
  )
}
