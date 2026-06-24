import type { ContentProblem } from '@/content/types'

/**
 * 「법의 역할과 인권」 단원 문항 해설 모음.
 * 문항 본체를 건드리지 않고 id로 해설을 덧입힌다(코드/콘텐츠 분리).
 * 풀이 후(오답 노트·문제 카드)에 "왜 그 답이 정답인지"를 보여 학습으로 잇는다.
 */
export const EXPLANATIONS: Record<string, string> = {
  // 워크플로(챕터별 교사 에이전트)로 생성해 채운다.
}

/** 문항에 직접 단 explain을 우선, 없으면 단원 해설 맵에서 찾는다 */
export function explainFor(problem: Pick<ContentProblem, 'id' | 'explain'>): string | undefined {
  return problem.explain ?? EXPLANATIONS[problem.id]
}
