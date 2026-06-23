import type { Fraction } from '@/types/fraction'
import type { SceneThemeId } from '@/components/manipulation/themes'
import type { Problem } from '@/types/problem'

export interface ManipulationProblem {
  kind: 'manipulation'
  id: string
  story: string
  a: Fraction
  b: Fraction
  operation: 'add'
  requireSimplified: boolean
  hint: string
  scene: SceneThemeId
}

export interface ApplicationProblem {
  kind: 'application'
  story: string
  problem: Problem
}

export type Chapter1Problem = ManipulationProblem | ApplicationProblem

// 하위 호환용 alias (기존 코드)
export type FractionProblem = ManipulationProblem

export const chapter1Problems: Chapter1Problem[] = [
  // 이분모 덧셈 5문항 — 모두 통분 + 일부 약분 요구
  {
    kind: 'manipulation',
    id: 'c1-1',
    // 1/2 + 1/3 = 5/6  (서로소, LCM 6, 약분 X)
    story:
      '산소 탱크 A에 1/2, 탱크 B에 1/3 이 남아 있어. 분모가 달라 — 통분해서 합쳐봐!',
    a: { numerator: 1, denominator: 2 },
    b: { numerator: 1, denominator: 3 },
    operation: 'add',
    requireSimplified: true,
    hint: '공통분모 6.',
    scene: 'oxygen',
  },
  {
    kind: 'manipulation',
    id: 'c1-2',
    // 1/4 + 5/12 = 3/12 + 5/12 = 8/12 = 2/3 (배수, 약분 필요)
    story:
      '수경 재배기 1번에 1/4, 2번에 5/12 차 있어. 통분해 한 통에 모아 (기약분수!).',
    a: { numerator: 1, denominator: 4 },
    b: { numerator: 5, denominator: 12 },
    operation: 'add',
    requireSimplified: true,
    hint: '공통분모 12.',
    scene: 'water',
  },
  {
    kind: 'manipulation',
    id: 'c1-3',
    // 3/8 + 1/4 = 5/8 (배수, 약분 X)
    story: '연료 셀1 = 3/8, 셀2 = 1/4 을 합성기에 모아봐. 분모를 맞춰야 해.',
    a: { numerator: 3, denominator: 8 },
    b: { numerator: 1, denominator: 4 },
    operation: 'add',
    requireSimplified: true,
    hint: '공통분모 8.',
    scene: 'fuel',
  },
  {
    kind: 'manipulation',
    id: 'c1-4',
    // 1/2 + 3/10 = 5/10 + 3/10 = 8/10 = 4/5 (배수, 약분 필요)
    story:
      '비상 배터리 A=1/2, B=3/10. 통분해 충전기에 모아봐 (기약분수!).',
    a: { numerator: 1, denominator: 2 },
    b: { numerator: 3, denominator: 10 },
    operation: 'add',
    requireSimplified: true,
    hint: '공통분모 10.',
    scene: 'battery',
  },
  {
    kind: 'manipulation',
    id: 'c1-5',
    // 1/3 + 5/12 = 4/12 + 5/12 = 9/12 = 3/4 (배수, 약분 필요)
    story:
      '항법 코드 조각1=1/3, 조각2=5/12 을 메인 모듈로 옮겨. 가장 작은 공통분모(LCM)를 찾아!',
    a: { numerator: 1, denominator: 3 },
    b: { numerator: 5, denominator: 12 },
    operation: 'add',
    requireSimplified: true,
    hint: '공통분모 12.',
    scene: 'code',
  },
]

/** 챕터 1 응용 문제 풀 — manipulation 5개 끝난 후 풀에서 2개 랜덤 픽.
 *  학생들이 약분/통분에 능숙하므로 다른 분모 위주 응용 문제로 구성. */
export const CHAPTER1_APPLICATION_POOL: ApplicationProblem[] = [
  {
    kind: 'application',
    story: '로키와 산소 자원 합치기.',
    problem: {
      id: 'c1-app-1',
      kind: 'fraction', difficulty: 2,
      scenario: '로키의 산소가 1/3, 너의 산소가 1/6 남았어. 두 자원을 합치면 (기약)?',
      prompt: '합 (기약분수)',
      hint: '공통분모 6.',
      answer: { numerator: 1, denominator: 2 }, requireSimplified: true,
    },
  },
  {
    kind: 'application',
    story: '식량 분해 작업.',
    problem: {
      id: 'c1-app-2',
      kind: 'fraction', difficulty: 2,
      scenario: '식량 비축 2/5에서 1/10을 사용했어. 남은 양 (기약)?',
      prompt: '남은 양을 기약분수로',
      hint: '공통분모 10.',
      answer: { numerator: 3, denominator: 10 }, requireSimplified: true,
    },
  },
  {
    kind: 'application',
    story: '항법 코드 변환.',
    problem: {
      id: 'c1-app-3',
      kind: 'numeric', difficulty: 2,
      scenario: '1/4 와 같은 값을 분모 12로 표현할 때 분자는 얼마?',
      prompt: '분자 = ?',
      hint: '1/4 = X/12. 분모 4를 12로 만들려면 ×3.',
      answer: 3, unit: '',
    },
  },
  {
    kind: 'application',
    story: '미지의 신호 — 다단계 해독.',
    problem: {
      id: 'c1-app-4',
      kind: 'multi', difficulty: 3,
      scenario: '어떤 분수의 분자에 2를 더하고 5로 약분했더니 1/3이 됐어. 원래 분수를 기약으로 알려줘.',
      prompt: '풀이 과정 + 최종 기약 답',
      hint: '5로 약분 후 1/3 → 약분 전 5/15. 분자 -2 = 3 → 3/15.',
      workspacePlaceholder: '여기에 풀이 과정을 적어 보세요 (선택)',
      finalAnswer: { numerator: 1, denominator: 5 }, requireSimplified: true,
    },
  },
  {
    kind: 'application',
    story: '복합 임무 — 세 자원 합산.',
    problem: {
      id: 'c1-app-5',
      kind: 'fraction', difficulty: 3,
      scenario: '식량 1/2, 산소 1/3, 연료 1/4 를 합치면 한 단위를 넘는다. 총합을 기약 가분수로 적어.',
      prompt: '기약 가분수로 답해',
      hint: '공통분모 12.',
      answer: { numerator: 13, denominator: 12 }, requireSimplified: true,
    },
  },
  {
    kind: 'application',
    story: '로키의 함정 — 동치 분수 골라내기.',
    problem: {
      id: 'c1-app-6',
      kind: 'mcq', difficulty: 2,
      scenario: '아래 중 3/4 와 크기가 같은 분수만 모두 골라.',
      prompt: '같은 값을 가지는 분수를 모두 선택',
      hint: '분자·분모에 같은 수를 곱하거나 나눠 검산.',
      choices: ['6/8', '9/12', '12/16', '10/14', '15/20'],
      correctIndexes: [0, 1, 2, 4], multiple: true,
    },
  },
  {
    kind: 'application',
    story: '비상 연산 — 분수와 자연수.',
    problem: {
      id: 'c1-app-7',
      kind: 'numeric', difficulty: 3,
      scenario: '1/3 < □/12 < 5/6 을 만족하는 자연수 □의 개수는?',
      prompt: '식: 1/3 < □/12 < 5/6 — 자연수 □ 의 개수',
      hint: '1/3 = 4/12, 5/6 = 10/12. 그 사이 정수 분자.',
      answer: 5, unit: '개',
    },
  },
  // 소수↔분수 변환 응용 3종
  {
    kind: 'application',
    story: '계측기 소수 신호.',
    problem: {
      id: 'c1-app-8',
      kind: 'fraction', difficulty: 2,
      scenario: '로키의 산소 계측기는 0.45 를 가리켜. 같은 값을 기약분수로 표시하면?',
      prompt: '같은 값을 기약분수로',
      hint: '0.45 = 45/100 → ÷5.',
      answer: { numerator: 9, denominator: 20 }, requireSimplified: true,
    },
  },
  {
    kind: 'application',
    story: '연료 0.36 / 분수 통합.',
    problem: {
      id: 'c1-app-9',
      kind: 'fraction', difficulty: 3,
      scenario: '연료 탱크에 0.36 L 와 1/4 L 가 따로 있어. 합치면 기약분수로 얼마야?',
      prompt: '기약분수로 답해',
      hint: '0.36 = 9/25, 1/4 = 25/100. 9/25 + 1/4 = 36/100 + 25/100.',
      answer: { numerator: 61, denominator: 100 }, requireSimplified: true,
    },
  },
  {
    kind: 'application',
    story: '계측기 크기 비교.',
    problem: {
      id: 'c1-app-10',
      kind: 'compare', difficulty: 2,
      scenario: '우리 계측기는 3/8, 로키 계측기는 0.4 야. 누가 더 클까?',
      prompt: '더 큰 쪽 (= 이면 등호) 선택',
      hint: '3/8 = 0.375.',
      left: { numerator: 3, denominator: 8 },
      right: { decimal: 0.4 },
      correctOp: '<',
    },
  },
  // 이분모 응용 강화
  {
    kind: 'application',
    story: '서로소 분모 — 통신 자원 합산.',
    problem: {
      id: 'c1-app-11',
      kind: 'fraction', difficulty: 3,
      scenario: '통신 라인 A 에 5/8, B 에 1/3 만큼 신호가 남아 있어. 두 신호를 합하면? (기약)',
      prompt: '기약분수로 답해',
      hint: '공통분모 24.',
      answer: { numerator: 23, denominator: 24 }, requireSimplified: true,
    },
  },
  {
    kind: 'application',
    story: '서로소 분모 — 자원 손실.',
    problem: {
      id: 'c1-app-12',
      kind: 'fraction', difficulty: 3,
      scenario: '식수 4/5 L 에서 1/3 L 가 새어 나갔어. 남은 양 (기약)?',
      prompt: '기약분수로 답해',
      hint: '공통분모 15.',
      answer: { numerator: 7, denominator: 15 }, requireSimplified: true,
    },
  },
]

/** 풀에서 N개 비복원 추출 (Fisher-Yates 셔플 기반) */
export const pickApplicationProblems = (n = 2): ApplicationProblem[] => {
  const pool = [...CHAPTER1_APPLICATION_POOL]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, Math.min(n, pool.length))
}
