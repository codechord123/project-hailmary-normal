import type { Fraction } from '@/types/fraction'
import { lcm, subtractFractions } from '@/lib/fractionMath'

export interface ReactorBreach {
  id: string
  a: Fraction
  b: Fraction
  /** 누출 위치 */
  location: '냉각 펌프' | '연료 라인' | '추진 노즐' | '생명 유지'
  /** 응용 독해 시나리오 — 단순 계산이 아닌 문맥 문제 */
  story: string
}

/**
 * 챕터 5 — 모든 누출의 계산 결과가 NOT 기약 → 반드시 약분해야 클리어.
 * (이전: 결과가 이미 기약인 경우가 많아 simplify 단계가 중복됐던 버그 수정)
 */
export const chapter5Breaches: ReactorBreach[] = [
  {
    // 5/6 - 1/2 → 2/6 → 1/3
    id: 'c5-1',
    a: { numerator: 5, denominator: 6 }, b: { numerator: 1, denominator: 2 },
    location: '냉각 펌프',
    story:
      '리액터의 핵심 부품인 냉각 펌프는 한 통의 5/6 만큼 액체가 차 있어야 정상 작동해. 그런데 작은 균열이 생겨서 그 중 1/2 통 분량이 새어 나갔어. 펌프를 안정시키려면 지금 남은 액체량을 정확히 알아야 해. 두 분수를 통분해서 빼고, 기약분수로 줄여서 답해줘.',
  },
  {
    // 11/12 - 1/4 → 8/12 → 2/3
    id: 'c5-2',
    a: { numerator: 11, denominator: 12 }, b: { numerator: 1, denominator: 4 },
    location: '연료 라인',
    story:
      '연료 라인은 안전 운영을 위해 한 통의 11/12 만큼 충전돼 있었어. 그런데 응급 추진 명령이 떨어져서 1/4 통 분량이 한꺼번에 소모됐대. 라인의 압력을 안정시키려면 현재 남은 연료 비율을 알아야 해. 통분해서 빼고 기약분수로 줄여서 답해줘.',
  },
  {
    // 9/10 - 2/5 → 5/10 → 1/2
    id: 'c5-3',
    a: { numerator: 9, denominator: 10 }, b: { numerator: 2, denominator: 5 },
    location: '추진 노즐',
    story:
      '추진 노즐의 가스 압력은 전체 단계의 9/10 까지 차 있어서 점화 직전 상태였어. 점화 시퀀스가 한 번 작동하니까 2/5 단계 분량의 가스가 빠르게 빠져나갔지. 다음 점화 가능 여부를 정하려면 현재 압력을 알아야 해. 통분해서 빼고 기약분수로 답해.',
  },
  {
    // 17/20 - 1/4 → 12/20 → 3/5
    id: 'c5-4',
    a: { numerator: 17, denominator: 20 }, b: { numerator: 1, denominator: 4 },
    location: '생명 유지',
    story:
      '생명 유지 시스템은 산소 농도를 보통 한 통의 17/20 만큼 유지해서 항해사가 숨쉬기 편하게 해줘. 그런데 작은 누출이 시작돼서 1/4 만큼 농도가 줄어들었어. 응급 처치 시점을 정하려면 지금 남은 산소 농도를 정확히 알아야 해. 통분해서 빼고 기약분수로 줄여서 답해!',
  },
  {
    // 5/6 - 7/12 → 3/12 → 1/4
    id: 'c5-5',
    a: { numerator: 5, denominator: 6 }, b: { numerator: 7, denominator: 12 },
    location: '냉각 펌프',
    story:
      '냉각 펌프의 백업 라인은 비상시를 대비해 한 통의 5/6 만큼 채워져 있었어. 그런데 메인 라인 정비를 하려고 7/12 만큼을 메인으로 흘려보냈대. 백업이 충분한지 확인해야 다음 점검을 안전하게 진행할 수 있어. 통분해서 빼고 기약분수로 답해줘.',
  },
  {
    // 11/15 - 1/3 → 6/15 → 2/5
    id: 'c5-6',
    a: { numerator: 11, denominator: 15 }, b: { numerator: 1, denominator: 3 },
    location: '연료 라인',
    story:
      '예비 연료 탱크에는 한 통의 11/15 만큼 연료가 보관돼 있었어. 그런데 비상 발전기를 가동하기 위해 1/3 통을 발전기로 옮겨 보내야 했지. 라인 봉인을 풀기 전에 탱크에 남아 있는 양을 확인해 두는 게 안전해. 통분해서 빼고 기약분수로 줄여서 답해.',
  },
  {
    // 13/18 - 1/2 → 4/18 → 2/9
    id: 'c5-7',
    a: { numerator: 13, denominator: 18 }, b: { numerator: 1, denominator: 2 },
    location: '추진 노즐',
    story:
      '추진 노즐 1번은 열량이 한계의 13/18 까지 차 있어서 위험 직전 상태였어. 다행히 방열판을 가동해서 1/2 만큼의 열을 외부로 흘려보냈지. 다음 점화를 안전하게 진행하려면 노즐에 남아 있는 열량이 얼마인지 알아야 해. 통분해서 빼고 기약분수로 답해줘.',
  },
  {
    // 7/12 - 1/4 → 4/12 → 1/3
    id: 'c5-8',
    a: { numerator: 7, denominator: 12 }, b: { numerator: 1, denominator: 4 },
    location: '생명 유지',
    story:
      '생명 유지 모듈의 정수 필터는 항해 시작 시 한 통의 7/12 가 깨끗한 상태였어. 그런데 사용 도중 1/4 통 분량이 오염되어 사용할 수 없게 됐대. 깨끗한 정수가 얼마나 남았는지 알아야 비상 식수 계획을 세울 수 있어. 통분해서 빼고 기약분수로 줄여서 답해!',
  },
]

export interface BreachSolution {
  commonDenom: number // 통분
  result: Fraction // 계산 결과 (약분 전)
  simplified: Fraction // 기약
}

export const solveBreach = (b: ReactorBreach): BreachSolution => {
  const commonDenom = lcm(b.a.denominator, b.b.denominator)
  const raw = subtractFractions(b.a, b.b) // already gives lcm denom by current impl
  const r = { numerator: raw.numerator, denominator: raw.denominator }
  // 약분 — gcd 사용
  const gcd = (x: number, y: number): number => {
    x = Math.abs(x); y = Math.abs(y)
    while (y !== 0) { [x, y] = [y, x % y] }
    return x || 1
  }
  const g = gcd(r.numerator, r.denominator)
  return {
    commonDenom,
    result: { numerator: r.numerator, denominator: r.denominator },
    simplified: { numerator: r.numerator / g, denominator: r.denominator / g },
  }
}
