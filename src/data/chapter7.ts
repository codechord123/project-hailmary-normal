import type { Problem } from '@/types/problem'

/**
 * 챕터 7 — 「귀환 미션」 메가 보스전.
 * 모든 문제: 단순 계산식 제거. 우주 서사 독해 응용 + 소수↔분수 혼합 + 이분모 범위 문제.
 * 분수 다양화: 매 페이즈별로 분모를 다르게 선정.
 */
export const chapter7Phases: { name: string; subtitle: string; problems: Problem[] }[] = [
  {
    name: 'PHASE 1 · 정탐',
    subtitle: '응용 독해 — 이분모 + 소수 변환',
    problems: [
      {
        // 0.36 → 9/25
        id: 'c7-1', kind: 'fraction', difficulty: 2,
        scenario:
          '여왕의 정찰선이 0.36 광년 거리에 머무르고 있어. 통신을 잠그려면 같은 값을 기약분수로 변환해야 해. 0.36 을 분모 25 형태의 기약분수로!',
        prompt: '같은 값을 기약분수로',
        hint: '0.36 = 36/100 → ÷4.',
        answer: { numerator: 9, denominator: 25 }, requireSimplified: true,
      },
      {
        // 분수 vs 소수 비교 — 항로 분석
        id: 'c7-2', kind: 'compare', difficulty: 2,
        scenario:
          '여왕 함대까지 가는 두 항로 — 위쪽은 7/16 광년, 아래쪽은 0.5 광년이야. 짧은 쪽으로 진입해야 기습이 가능해. 어느 쪽이 짧을까?',
        prompt: '더 큰 쪽 (= 이면 등호) 선택',
        hint: '7/16 = 0.4375.',
        left: { numerator: 7, denominator: 16 }, right: { decimal: 0.5 }, correctOp: '<',
      },
      {
        // 이분모 범위 — 자연수 카운트 (1/3 < □/15 < 4/5)
        id: 'c7-3', kind: 'numeric', difficulty: 3,
        scenario:
          '여왕 함대의 안전 회피 범위는 1/3 광년 ~ 4/5 광년 사이. 우리 분모 15 의 항로 후보 중 이 범위에 들어가는 분자 □ 는 몇 개일까?',
        prompt: '식: 1/3 < □/15 < 4/5 — 자연수 □ 의 개수',
        hint: '1/3 = 5/15, 4/5 = 12/15.',
        answer: 6, unit: '개',
      },
    ],
  },
  {
    name: 'PHASE 2 · 광폭화',
    subtitle: '소수+분수 혼합 응용 — 자원 / 항로 / 비교',
    problems: [
      {
        // 0.6 + 1/4 = 17/20
        id: 'c7-4', kind: 'fraction', difficulty: 3,
        scenario:
          '여왕의 광역 공격! 회피하려면 0.6 광년 워프 + 1/4 광년 슬립 점프를 연속 해야 해. 두 거리의 합을 기약분수로 계산해!',
        prompt: '기약분수로 답해',
        hint: '0.6 = 3/5. 3/5 + 1/4 = 12/20 + 5/20.',
        answer: { numerator: 17, denominator: 20 }, requireSimplified: true,
      },
      {
        // 분수 vs 소수 — 미션 진행 비교
        id: 'c7-5', kind: 'compare', difficulty: 3,
        scenario:
          '항해사는 귀환 임무의 7/18 을 완료했고, 로키는 0.4 만큼을 완료했어. 누가 더 많이 진행했을까?',
        prompt: '더 큰 쪽 (= 이면 등호) 선택',
        hint: '7/18 ≈ 0.389.',
        left: { numerator: 7, denominator: 18 }, right: { decimal: 0.4 }, correctOp: '<',
      },
      {
        // 0.84 = 21/25 — 소수 변환
        id: 'c7-6', kind: 'fraction', difficulty: 3,
        scenario:
          '여왕의 환영이 0.84 광년 거리에 떠 있어. 봉인 마법을 풀려면 분모 25 의 기약분수로 환영의 거리를 입력해야 해.',
        prompt: '같은 값을 기약분수로',
        hint: '0.84 = 84/100 → ÷4.',
        answer: { numerator: 21, denominator: 25 }, requireSimplified: true,
      },
    ],
  },
  {
    name: 'PHASE 3 · 최후',
    subtitle: '다단계 응용 — 결계 해제',
    problems: [
      {
        // 다단계 역산
        id: 'c7-7', kind: 'multi', difficulty: 3,
        scenario:
          '여왕의 결계 — 결계 코드는 어떤 분수의 분자에 5 를 더하고 분모를 2 배로 했을 때 7/12 가 되는 그 분수야. 원래 분수를 기약으로!',
        prompt: '풀이 + 기약 답',
        hint: '(X분자+5)/(X분모×2) = 7/12. X분모×2 = 12 → 6. X분자+5 = 7 → 2. 원래 2/6',
        workspacePlaceholder: '여기에 풀이 과정을 적어 보세요 (선택)',
        finalAnswer: { numerator: 1, denominator: 3 }, requireSimplified: true,
      },
      {
        // 항해사 + 동맹 합산 응용 (가분수)
        id: 'c7-8', kind: 'fraction', difficulty: 3,
        scenario:
          '여왕을 봉인하려면 항해사와 동맹의 마력을 합쳐야 해. 항해사 마력은 1¾, 동맹 마력은 2⅔. 둘의 합을 가분수 기약으로!',
        prompt: '기약 가분수로 답해',
        hint: '7/4 + 8/3 = 21/12 + 32/12.',
        answer: { numerator: 53, denominator: 12 }, requireSimplified: true,
      },
      {
        // 마지막 일격 — 응용 차
        id: 'c7-9', kind: 'fraction', difficulty: 3,
        scenario:
          '여왕의 잔여 체력은 3⅖ 인데, 마지막 일격으로 1¾ 만큼을 깎아낼 수 있어. 봉인 후 남는 체력을 가분수 기약으로!',
        prompt: '기약 가분수로 답해',
        hint: '17/5 - 7/4 = 68/20 - 35/20.',
        answer: { numerator: 33, denominator: 20 }, requireSimplified: true,
      },
    ],
  },
]

export const QUEEN = {
  name: '아스트로파지 여왕',
  maxHp: 300,
}
