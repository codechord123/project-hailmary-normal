import type { Problem } from '@/types/problem'

/**
 * 챕터 3 — 「미지의 신호」 (이분모 응용 종합)
 * 5학년 1학기 4단원 심화 패턴 — 이분모 덧·뺄셈, 분수↔소수 변환, 비교, 다단계 역산.
 * 모든 문제는 통분 또는 소수↔분수 변환이 핵심.
 */
export const chapter3Problems: Problem[] = [
  {
    id: 'c3-1', // 이분모 덧셈 응용 (C 공통인수, 약분 X)
    kind: 'fraction',
    scenario:
      '로키의 우주선과 우리 우주선의 산소를 합쳐 비상 대비를 하려고 해. 로키는 자기 산소통의 5/12 만큼, 우리는 우리 산소통의 3/8 만큼이 남아 있어. 두 통을 하나로 합쳤을 때 총 산소량이 얼마인지 알아야 다음 항해 일정을 정할 수 있어. 두 분수를 통분해서 더한 뒤 기약분수로 답해줘.',
    prompt: '기약분수로 답해',
    hint: '공통분모 24. 10/24 + 9/24.',
    difficulty: 2,
    answer: { numerator: 19, denominator: 24 },
    requireSimplified: true,
  },
  {
    id: 'c3-2', // 소수 둘째자리 → 분수 변환
    kind: 'fraction',
    scenario:
      '로키의 우주선 계측기가 0.36 이라는 값을 계속 보내오고 있어. 그런데 우리 메인 컴퓨터는 분수만 받아들이도록 만들어졌기 때문에, 같은 값을 분모 25 형태의 기약분수로 변환해 입력해야 해. 0.36 과 같은 값을 가지는 기약분수가 무엇일지 적어줘.',
    prompt: '같은 값을 기약분수로',
    hint: '0.36 = 36/100 → ÷4.',
    difficulty: 2,
    answer: { numerator: 9, denominator: 25 },
    requireSimplified: true,
  },
  {
    id: 'c3-3', // 이분모 뺄셈 응용 (C 공통인수)
    kind: 'fraction',
    scenario:
      '항해 시작 때 연료 탱크는 한 통의 11/12 만큼 가득 채워져 있었어. 그런데 정찰병의 위치를 추적하는 과정에서 5/8 통 분량의 연료를 사용해야 했지. 다음 작전을 계획하려면 탱크에 남아 있는 연료의 비율을 정확히 알아야 해. 통분해서 빼고 기약분수로 답해줘.',
    prompt: '기약분수로 답해',
    hint: '공통분모 24. 22/24 − 15/24.',
    difficulty: 3,
    answer: { numerator: 7, denominator: 24 },
    requireSimplified: true,
  },
  {
    id: 'c3-4', // 다단계 역산 (이분모)
    kind: 'multi',
    scenario:
      '항법 모듈 잠금: 어떤 분수의 분자에 4를 더하고 결과를 6으로 약분했더니 3/4가 됐어. 원래 분수를 기약분수로!',
    prompt: '풀이 + 기약 답',
    hint: '6으로 약분해서 3/4 → 약분 전 18/24. 분자 −4 = 14 → 14/24 → ÷2.',
    difficulty: 3,
    workspacePlaceholder: '여기에 풀이 과정을 적어 보세요 (선택)',
    finalAnswer: { numerator: 7, denominator: 12 },
    requireSimplified: true,
  },
  {
    id: 'c3-5', // 분수 vs 소수 비교
    kind: 'compare',
    scenario:
      '동력실에서 두 개의 센서가 동시에 측정값을 보내왔어. 우리 센서는 7/20 이라는 분수 값을, 로키의 센서는 0.4 라는 소수 값을 표시하고 있지. 두 측정치 중 어느 쪽이 더 큰지 알아야 어느 센서의 값을 메인 시스템에 입력해야 할지 결정할 수 있어. 두 값을 같은 형태로 바꿔서 비교해줘.',
    prompt: '더 큰 쪽 (= 이면 등호) 선택',
    hint: '7/20 = 0.35.',
    difficulty: 2,
    left: { numerator: 7, denominator: 20 },
    right: { decimal: 0.4 },
    correctOp: '<',
  },
  {
    id: 'c3-6', // 두 분수 비교 (이분모)
    kind: 'compare',
    scenario:
      '먼 우주에서 두 개의 신호가 동시에 잡혔어. 한쪽 신호의 강도는 5/8 이고, 다른 쪽 신호의 강도는 7/12 야. 더 강한 신호가 진짜 발신지일 가능성이 크기 때문에, 어느 쪽이 더 큰 값인지 정확히 비교해야 해. 두 분수를 통분해서 크기를 비교해줘.',
    prompt: '더 큰 쪽 (= 이면 등호) 선택',
    hint: '공통분모 24. 15/24 vs 14/24.',
    difficulty: 2,
    left: { numerator: 5, denominator: 8 },
    right: { numerator: 7, denominator: 12 },
    correctOp: '>',
  },
  {
    id: 'c3-7', // 소수+분수 자연수 카운트 (이분모 응용)
    kind: 'numeric',
    scenario:
      '정찰병의 정확한 위치를 좁히기 위해서 0.4 광년보다 멀고 7/10 광년보다 가까운 거리만 후보로 남기려고 해. 우리 좌표 시스템은 분모가 20 인 진분수 형태로만 거리를 표시할 수 있는데, 이 범위 안에 들어가는 자연수 분자 □ 가 모두 몇 개인지 세어줘.',
    prompt: '식: 0.4 < □/20 < 7/10 — 자연수 □ 의 개수',
    hint: '0.4 = 8/20, 7/10 = 14/20.',
    difficulty: 3,
    answer: 5,
    unit: '개',
  },
  {
    id: 'c3-8', // 소수 + 분수 혼합 합 (이분모 응용)
    kind: 'fraction',
    scenario:
      '귀환 좌표를 계산하려면 두 개의 신호 값을 합쳐야 해. 첫 번째 신호는 0.25 라는 소수, 두 번째 신호는 5/12 라는 분수로 도착했어. 메인 컴퓨터에는 분수 형태로만 입력할 수 있기 때문에 0.25 를 분수로 바꾼 다음 두 값을 더해서 기약분수로 적어야 해.',
    prompt: '기약분수로 답해',
    hint: '0.25 = 1/4 = 3/12. 3/12 + 5/12.',
    difficulty: 3,
    answer: { numerator: 2, denominator: 3 },
    requireSimplified: true,
  },
]

// 보스 설정
export const CHAPTER3_BOSS = {
  name: '아스트로파지 정찰병',
  maxHp: chapter3Problems.length * 20, // 정답 1개당 평균 데미지 20 = 정확히 모든 정답으로 처치
}
