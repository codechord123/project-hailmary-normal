import type { UnitDef } from './types'
import { lawAndRightsUnit } from './units/lawAndRights'

/**
 * 책꽂이 등록부.
 * 과목(SubjectGroup) 안에 단원(UnitDef)을 꽂아두면
 * 과목→단원 선택 화면에 자동으로 나타난다.
 * 새 단원을 만들면 여기 units 배열에 한 줄 추가만 하면 됨.
 */
export interface SubjectGroup {
  id: string
  name: string
  icon: string
  units: UnitDef[]
}

export const SUBJECTS: SubjectGroup[] = [
  {
    id: 'social',
    name: '사회',
    icon: '⚖️',
    units: [lawAndRightsUnit],
  },
]

export function findSubject(subjectId: string): SubjectGroup | undefined {
  return SUBJECTS.find((s) => s.id === subjectId)
}

export function findUnit(unitId: string): UnitDef | undefined {
  for (const s of SUBJECTS) {
    const u = s.units.find((unit) => unit.id === unitId)
    if (u) return u
  }
  return undefined
}

/** 단원이 속한 과목 찾기 (뒤로가기 경로용) */
export function subjectOfUnit(unitId: string): SubjectGroup | undefined {
  return SUBJECTS.find((s) => s.units.some((u) => u.id === unitId))
}
