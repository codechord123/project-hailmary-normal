import type { ContentProblem } from './types'
import { isWeak, type UnitProgress } from './progress'

/** 제자리 변경 없는 셔플 */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * 약점(오답·저정답률) 문제를 앞쪽에 가중 배치한 출제 풀.
 * matching 문제는 객관식/OX 모드에 부적합하므로 제외.
 * 약점이 없으면 일반 셔플로 폴백.
 */
export function buildWeightedPool(
  problems: ContentProblem[],
  prog: UnitProgress,
): ContentProblem[] {
  const base = shuffle(problems.filter((p) => p.kind !== 'matching'))
  const weak = base.filter((p) => isWeak(prog, p.id))
  return weak.length ? [...shuffle(weak), ...base] : base
}
