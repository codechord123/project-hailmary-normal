/**
 * 이분모 능통 학생을 위한 응용 문제 풀.
 * 분모 조합 패턴별로 다양화:
 *   A. 서로소 (LCM = 두 분모 곱):  3·5, 4·5, 4·9, 5·7, 5·8, 7·12
 *   B. 배수 관계 (LCM = 큰 분모):  2·4, 3·9, 5·15
 *   C. 공통인수 (LCM < 두 분모 곱): 4·6, 6·9, 6·10, 8·12, 9·15
 * 응용 유형: 합/차/세 분수/분수↔소수/동치/자연수 카운트/다단계 역산/비율
 */

import type { Problem } from '@/types/problem'

export const ADVANCED_PROBLEMS: Problem[] = [
  // === 분수 ↔ 소수 변환 ===
  {
    id: 'adv-dec-1', kind: 'compare', difficulty: 2,
    scenario: '실험실에서 두 가지 농도 측정값이 도착했어. 하나는 분수 형태로 5/8 이라고 표시돼 있고, 다른 하나는 소수 형태로 0.6 이라고 표시돼 있어. 어느 쪽이 더 진한 농도인지 비교해서 알려줘.',
    prompt: '더 큰 쪽 (= 이면 등호) 선택',
    hint: '5/8 을 소수로 바꿔서 0.6 과 비교해봐.',
    left: { numerator: 5, denominator: 8 }, right: { decimal: 0.6 }, correctOp: '>',
  },
  {
    id: 'adv-dec-2', kind: 'fraction', difficulty: 2,
    scenario: '계측기에서 0.75 라는 소수 값이 도착했어. 분석실 컴퓨터는 분수 형태로만 데이터를 받기 때문에, 같은 값을 기약분수로 바꿔서 입력해야 해. 어떤 분수일까?',
    prompt: '같은 값을 기약분수로',
    hint: '0.75 = 75/100. 분자와 분모를 같은 수로 약분.',
    answer: { numerator: 3, denominator: 4 }, requireSimplified: true,
  },
  {
    id: 'adv-dec-3', kind: 'mcq', difficulty: 2,
    scenario: '데이터베이스에 0.4 라는 값이 등록돼 있는데, 그 값과 정확히 같은 값을 가지는 분수들을 모두 찾아 함께 분류해야 해. 아래 보기 중 0.4 와 같은 값을 가지는 분수를 모두 골라줘.',
    prompt: '같은 값을 가지는 분수를 모두 선택',
    hint: '0.4 = 4/10.',
    choices: ['2/5', '4/10', '6/15', '8/20', '3/8'],
    correctIndexes: [0, 1, 2, 3], multiple: true,
  },
  {
    id: 'adv-dec-4', kind: 'fraction', difficulty: 3,
    scenario: '함선의 가속도 측정기가 0.625 라는 값을 보내왔어. 항법 컴퓨터는 분수만 인식하기 때문에 이 값을 같은 크기의 기약분수로 변환해서 입력해야 해. 어떤 분수가 될까?',
    prompt: '같은 값을 기약분수로',
    hint: '0.625 = 625/1000. 분자와 분모를 같은 수로 나눠 약분.',
    answer: { numerator: 5, denominator: 8 }, requireSimplified: true,
  },
  {
    id: 'adv-dec-5', kind: 'compare', difficulty: 2,
    scenario: '실험실에서 두 가지 시료의 농도를 측정했어. A 시료는 한 통의 3/4 만큼, B 시료는 7/10 만큼의 밀도를 가져. 어느 시료가 더 진한지 알아야 어느 쪽을 먼저 분석해야 할지 정할 수 있어. 두 분수를 비교해줘.',
    prompt: '더 큰 쪽 (= 이면 등호) 선택',
    hint: '공통분모 20.',
    left: { numerator: 3, denominator: 4 }, right: { numerator: 7, denominator: 10 }, correctOp: '>',
  },
  {
    id: 'adv-dec-6', kind: 'compare', difficulty: 2,
    scenario: '엔진실 두 곳에서 동시에 압력값이 측정됐어. 1번 엔진은 4/9, 2번 엔진은 1/2 의 압력을 보이고 있어. 더 높은 압력의 엔진을 먼저 점검해야 안전하기 때문에, 어느 쪽이 더 큰지 비교해줘.',
    prompt: '더 큰 쪽 (= 이면 등호) 선택',
    hint: '공통분모 18.',
    left: { numerator: 4, denominator: 9 }, right: { numerator: 1, denominator: 2 }, correctOp: '<',
  },

  // === 실생활 비율 / 세 분수 ===
  {
    id: 'adv-life-1', kind: 'fraction', difficulty: 3,
    scenario: '냉장고에 1L 짜리 음료수 한 병이 가득 차 있었어. 내가 그 중 1/4 L 를 마셨고, 그 후에 친구가 와서 추가로 1/3 L 를 더 마셨대. 두 사람이 마신 양을 빼고 병에 남아 있는 음료수를 기약분수로 적어줘.',
    prompt: '남은 양을 기약분수로',
    hint: '1 - 1/4 - 1/3. 공통분모 12.',
    answer: { numerator: 5, denominator: 12 }, requireSimplified: true,
  },
  {
    id: 'adv-life-2', kind: 'fraction', difficulty: 3,
    scenario: '저녁 식사 시간에 피자 한 판을 통째로 시켰어. 형이 1/2 판을 먼저 가져갔고, 누나가 그 다음에 1/3 판을 가져갔어. 두 사람이 가져간 양을 빼고 나에게 남은 피자의 양을 기약분수로 계산해줘.',
    prompt: '내 몫 (기약 분수)',
    hint: '1 - 1/2 - 1/3 = 6/6 - 3/6 - 2/6.',
    answer: { numerator: 1, denominator: 6 }, requireSimplified: true,
  },
  {
    id: 'adv-life-3', kind: 'fraction', difficulty: 3,
    scenario: '비상 연료를 세 개의 통에 나누어 보관해 왔어. 1번 통에는 1/4 L, 2번 통에는 1/3 L, 3번 통에는 5/12 L 가 들어 있어. 세 통을 모두 합쳤을 때 총 연료가 몇 L 가 되는지 기약분수로 답해줘.',
    prompt: '합을 기약분수로',
    hint: '공통분모 12.',
    answer: { numerator: 1, denominator: 1 }, requireSimplified: true,
  },
  {
    id: 'adv-life-4', kind: 'fraction', difficulty: 3,
    scenario: '비축 창고를 점검해서 세 가지 자원을 모두 회수하기로 했어. 연료가 한 통의 1/2, 산소가 한 통의 2/5, 물이 한 통의 3/10 만큼 남아 있어. 세 자원을 한 통에 모았을 때 총량이 얼마인지 기약분수로 적어줘 (1통을 넘어도 괜찮아).',
    prompt: '합을 기약분수로',
    hint: '공통분모 10.',
    answer: { numerator: 6, denominator: 5 }, requireSimplified: true,
  },

  // === 서로소 분모 (LCM = 곱) ===
  {
    id: 'adv-cop-1', kind: 'fraction', difficulty: 2,
    scenario: '두 개의 화물칸에 각각 다른 양의 화물이 실려 있어. A 화물칸은 한 통의 3/5, B 화물칸은 1/3 만큼 가득 차 있지. 두 화물을 한곳에 모았을 때 총 화물량이 얼마인지 기약분수로 알려줘.',
    prompt: '합을 기약분수로',
    hint: '공통분모 15.',
    answer: { numerator: 14, denominator: 15 }, requireSimplified: true,
  },
  {
    id: 'adv-cop-2', kind: 'fraction', difficulty: 3,
    scenario: '실험실의 두 비커에 각각 다른 양의 시약이 들어 있어. 1번 비커는 한 통의 2/7, 2번 비커는 3/4 가 채워져 있지. 둘을 합치면 1통을 넘기는 양이 될 수 있어. 합친 시약의 총량을 기약 가분수로 적어줘.',
    prompt: '합을 기약분수로',
    hint: '공통분모 28.',
    answer: { numerator: 29, denominator: 28 }, requireSimplified: true,
  },
  {
    id: 'adv-cop-3', kind: 'fraction', difficulty: 3,
    scenario: '백신 제조용 농축액 통 두 개를 합치려고 해. 첫 번째 통은 한 통의 5/9, 두 번째 통은 1/4 만큼 들어 있어. 두 농축액을 합쳐 새 보관통에 옮길 때 총량이 얼마인지 기약분수로 계산해줘.',
    prompt: '합을 기약분수로',
    hint: '공통분모 36.',
    answer: { numerator: 29, denominator: 36 }, requireSimplified: true,
  },
  {
    id: 'adv-cop-4', kind: 'fraction', difficulty: 3,
    scenario: '연료 탱크가 한 통의 7/8 만큼 가득 차 있었어. 이번 항해에 2/5 통 분량을 사용했지. 남은 연료가 얼마인지 알아야 다음 점검 일정을 짤 수 있어. 통분해서 빼고 기약분수로 답해줘.',
    prompt: '차를 기약분수로',
    hint: '공통분모 40.',
    answer: { numerator: 19, denominator: 40 }, requireSimplified: true,
  },

  // === 배수 관계 분모 (LCM = 큰 분모) ===
  {
    id: 'adv-mult-1', kind: 'fraction', difficulty: 2,
    scenario: '식량 저장소 두 칸에 각각 한 통의 3/4 와 5/12 만큼의 곡물이 들어 있어. 두 칸의 곡물을 한 자루에 모두 옮겨 담을 때 총량이 한 통을 넘을 수도 있어. 합쳐진 양을 기약 가분수로 계산해줘.',
    prompt: '합을 기약 가분수로',
    hint: '공통분모 12.',
    answer: { numerator: 7, denominator: 6 }, requireSimplified: true,
  },
  {
    id: 'adv-mult-2', kind: 'fraction', difficulty: 2,
    scenario: '백신 농축액 한 통의 5/6 만큼이 비축돼 있었어. 그런데 첫 실험에 1/3 통 분량을 쓰고 났더니 일부가 줄어들었지. 비커에 남은 농축액의 비율을 기약분수로 알려줘.',
    prompt: '차를 기약분수로',
    hint: '공통분모 6.',
    answer: { numerator: 1, denominator: 2 }, requireSimplified: true,
  },
  {
    id: 'adv-mult-3', kind: 'fraction', difficulty: 3,
    scenario: '냉각수 탱크가 한 통의 11/15 까지 차 있었어. 점검 도중에 2/5 통 분량의 냉각수를 정화 라인으로 흘려보냈지. 탱크에 남아 있는 냉각수의 비율을 기약분수로 계산해줘.',
    prompt: '차를 기약분수로',
    hint: '공통분모 15.',
    answer: { numerator: 1, denominator: 3 }, requireSimplified: true,
  },

  // === 공통인수 분모 (LCM < 곱) ===
  {
    id: 'adv-gcd-1', kind: 'fraction', difficulty: 3,
    scenario: '두 개의 가스 통을 합치려고 해. A 통에는 한 통의 5/6 만큼, B 통에는 2/9 만큼의 산소 가스가 들어 있어. 두 통을 합쳤을 때 1통을 넘기는 양이 될 수도 있어. 합친 가스의 총량을 기약 가분수로 계산해줘.',
    prompt: '합을 기약분수로',
    hint: '공통분모 18.',
    answer: { numerator: 19, denominator: 18 }, requireSimplified: true,
  },
  {
    id: 'adv-gcd-2', kind: 'fraction', difficulty: 3,
    scenario: '두 개의 산소 펌프에서 동시에 산소를 끌어모으는 중이야. 1번 펌프는 한 통의 5/8 만큼, 2번 펌프는 1/6 만큼의 산소를 모았어. 두 펌프가 모은 총 산소량을 기약분수로 알려줘.',
    prompt: '합을 기약분수로',
    hint: '공통분모 24.',
    answer: { numerator: 19, denominator: 24 }, requireSimplified: true,
  },
  {
    id: 'adv-gcd-3', kind: 'fraction', difficulty: 3,
    scenario: '실험실의 약품통이 한 통의 7/12 만큼 차 있었어. 그런데 시험에 1/8 통 분량의 약품을 사용했지. 약품통에 남은 양을 기약분수로 정확히 계산해줘.',
    prompt: '차를 기약분수로',
    hint: '공통분모 24.',
    answer: { numerator: 11, denominator: 24 }, requireSimplified: true,
  },
  {
    id: 'adv-gcd-4', kind: 'fraction', difficulty: 3,
    scenario: '엔진 윤활유가 한 통의 11/15 까지 비축돼 있었어. 점검 도중에 1/6 통 분량의 윤활유가 빠져나갔지. 통에 남아 있는 윤활유의 비율을 기약분수로 알려줘.',
    prompt: '차를 기약분수로',
    hint: '공통분모 30.',
    answer: { numerator: 17, denominator: 30 }, requireSimplified: true,
  },

  // === 다단계 역산 ===
  {
    id: 'adv-multi-1', kind: 'multi', difficulty: 3,
    scenario: '어떤 분수의 분자에 3을 더하고 분모를 4 빼고 약분 6으로 했더니 1/2이 됐어. 원래 분수를 기약으로!',
    prompt: '원래 분수 (기약)',
    hint: '1/2 의 6배 약분 전을 떠올려봐. 분자에서 3을 뺀 게 원래 분자, 분모에 4를 더한 게 원래 분모야.',
    workspacePlaceholder: '여기에 풀이 과정을 적어 보세요 (선택)',
    finalAnswer: { numerator: 3, denominator: 16 }, requireSimplified: true,
  },
  {
    // 이분모 범위 (2/3, 5/6 분모 다름)
    id: 'adv-multi-2', kind: 'numeric', difficulty: 3,
    scenario: '아군 함대 위치는 2/3 광년 너머이고, 적군 함대는 5/6 광년 안쪽에 있어. 우리 좌표 분모 18 의 자연수 □ 가 두 함대 사이에 들어갈 수 있는 경우는 몇 가지?',
    prompt: '식: 2/3 < □/18 < 5/6 — 자연수 □ 의 개수',
    hint: '2/3 와 5/6 을 모두 분모 18 로 통분한 다음, 그 사이의 자연수 분자가 몇 개인지 세어봐.',
    answer: 2, unit: '개',
  },
  {
    // 이분모 범위 (0.3, 0.7 → 3/10, 7/10 — diversify with 분모 20)
    id: 'adv-multi-3', kind: 'numeric', difficulty: 3,
    scenario: '비상 출력은 0.3 단계보다 높고 0.7 단계보다 낮아야 안전해. 우리 계측기 분모 20 의 자연수 출력 □ 는 모두 몇 개?',
    prompt: '식: 0.3 < □/20 < 0.7 — 자연수 □ 의 개수',
    hint: '0.3 과 0.7 을 모두 분모 20 으로 통분한 다음, 그 사이의 자연수 분자가 몇 개인지 세어봐.',
    answer: 7, unit: '개',
  },
  {
    // 이분모 범위 (1/6, 1/3 분모 다름)
    id: 'adv-multi-4', kind: 'numeric', difficulty: 3,
    scenario: '항법 안전 범위는 1/6 광년 이상 1/3 광년 이하야. 분모 24 의 자연수 좌표 □ 가 가능한 경우는?',
    prompt: '식: 1/6 < □/24 < 1/3 — 자연수 □ 의 개수',
    hint: '1/6 과 1/3 을 모두 분모 24 로 통분한 다음, 그 사이의 자연수 분자가 몇 개인지 세어봐.',
    answer: 3, unit: '개',
  },
  {
    id: 'adv-multi-5', kind: 'multi', difficulty: 3,
    scenario: '어떤 분수에 1/8을 더하고 3으로 약분했더니 5/8이 됐어. 원래 분수를 기약으로!',
    prompt: '원래 분수 (기약)',
    hint: '5/8 을 3배 약분 전 형태(15/24)로 본 다음, 1/8 을 빼고 약분.',
    workspacePlaceholder: '여기에 풀이 과정을 적어 보세요 (선택)',
    finalAnswer: { numerator: 1, denominator: 2 }, requireSimplified: true,
  },

  // === 통분 활용 (LCM / 공통분모 후보) ===
  {
    id: 'adv-lcm-1', kind: 'numeric', difficulty: 2,
    scenario: '두 분모 6, 10의 최소공배수를 구해서 통분 준비.',
    prompt: '두 분모의 최소공배수 (LCM)',
    hint: '6 = 2·3, 10 = 2·5. LCM = 2·3·5.',
    answer: 30, unit: '',
  },
  {
    id: 'adv-lcm-2', kind: 'mcq', difficulty: 2,
    scenario: '3/4 와 5/6의 공통분모로 쓸 수 있는 수를 모두 고르세요.',
    prompt: '가능한 공통분모를 모두 선택',
    hint: 'LCM(4,6) = 12. 12의 배수들.',
    choices: ['12', '24', '30', '36', '48'],
    correctIndexes: [0, 1, 3, 4], multiple: true,
  },
  {
    id: 'adv-lcm-3', kind: 'numeric', difficulty: 3,
    scenario: '세 분모 4, 6, 9의 최소공배수는?',
    prompt: '두 분모의 최소공배수 (LCM)',
    hint: '4=2², 6=2·3, 9=3² → LCM = 2²·3².',
    answer: 36, unit: '',
  },
  {
    id: 'adv-lcm-4', kind: 'mcq', difficulty: 3,
    scenario: '7/8 과 5/12 의 공통분모로 쓸 수 있는 것을 모두 고르세요.',
    prompt: '가능한 공통분모를 모두 선택',
    hint: 'LCM(8,12) = 24. 24의 배수.',
    choices: ['24', '36', '48', '72', '96'],
    correctIndexes: [0, 2, 3, 4], multiple: true,
  },

  // === 동치 분수 함정 (분모 다양) ===
  {
    id: 'adv-eq-1', kind: 'mcq', difficulty: 2,
    scenario: '진짜 5/8과 같은 분수만 골라낼 수 있어?',
    prompt: '같은 값을 가지는 분수를 모두 선택',
    hint: '분자·분모를 같은 수로 곱했는지 검산.',
    choices: ['10/16', '15/24', '20/32', '10/18', '25/40'],
    correctIndexes: [0, 1, 2, 4], multiple: true,
  },
  {
    id: 'adv-eq-2', kind: 'mcq', difficulty: 3,
    scenario: '3/7과 같은 분수만 골라.',
    prompt: '같은 값을 가지는 분수를 모두 선택',
    hint: '×2, ×3, ×4 ... 모든 배수.',
    choices: ['6/14', '9/21', '12/28', '15/35', '18/49'],
    correctIndexes: [0, 1, 2, 3], multiple: true,
  },
  {
    id: 'adv-eq-3', kind: 'fraction', difficulty: 2,
    scenario: '5/12 와 같은 값을 가지면서 분모가 24인 분수의 분자는?',
    prompt: '같은 값의 분수 (분모는 시나리오에 명시) 를 적어',
    hint: '5/12 = X/24. ×2.',
    answer: { numerator: 10, denominator: 24 }, requireSimplified: false,
  },

  // === 비율 / 백분율 ↔ 분수 ===
  {
    id: 'adv-pct-1', kind: 'fraction', difficulty: 2,
    scenario: '학급 인원의 35% 가 안경을 써. 이를 기약분수로 표현하면?',
    prompt: '같은 값을 기약분수로',
    hint: '35/100 → 약분 (÷5).',
    answer: { numerator: 7, denominator: 20 }, requireSimplified: true,
  },
  {
    id: 'adv-pct-2', kind: 'fraction', difficulty: 3,
    scenario: '연료의 60% 를 사용. 사용한 양을 기약분수로 표현하면?',
    prompt: '같은 값을 기약분수로',
    hint: '60/100 → 약분.',
    answer: { numerator: 3, denominator: 5 }, requireSimplified: true,
  },

  // === 소수 둘째자리 → 분수 변환 (2 decimal place) ===
  {
    id: 'adv-dec2-1', kind: 'fraction', difficulty: 2,
    scenario: '0.25 를 기약분수로 바꿔.',
    prompt: '같은 값을 기약분수로',
    hint: '0.25 = 25/100 → 25와 100을 25로 약분',
    answer: { numerator: 1, denominator: 4 }, requireSimplified: true,
  },
  {
    id: 'adv-dec2-2', kind: 'fraction', difficulty: 2,
    scenario: '0.36 을 기약분수로.',
    prompt: '같은 값을 기약분수로',
    hint: '36/100 → ÷4.',
    answer: { numerator: 9, denominator: 25 }, requireSimplified: true,
  },
  {
    id: 'adv-dec2-3', kind: 'fraction', difficulty: 2,
    scenario: '0.45 를 기약분수로.',
    prompt: '같은 값을 기약분수로',
    hint: '45/100 → ÷5.',
    answer: { numerator: 9, denominator: 20 }, requireSimplified: true,
  },
  {
    id: 'adv-dec2-4', kind: 'fraction', difficulty: 3,
    scenario: '0.08 을 기약분수로.',
    prompt: '같은 값을 기약분수로',
    hint: '8/100 → ÷4.',
    answer: { numerator: 2, denominator: 25 }, requireSimplified: true,
  },
  {
    id: 'adv-dec2-5', kind: 'fraction', difficulty: 3,
    scenario: '0.84 를 기약분수로.',
    prompt: '같은 값을 기약분수로',
    hint: '84/100 → ÷4.',
    answer: { numerator: 21, denominator: 25 }, requireSimplified: true,
  },
  {
    id: 'adv-dec2-6', kind: 'fraction', difficulty: 2,
    scenario: '0.65 를 기약분수로.',
    prompt: '같은 값을 기약분수로',
    hint: '65/100 → ÷5.',
    answer: { numerator: 13, denominator: 20 }, requireSimplified: true,
  },
  {
    id: 'adv-dec2-7', kind: 'fraction', difficulty: 3,
    scenario: '0.16 을 기약분수로.',
    prompt: '같은 값을 기약분수로',
    hint: '16/100 → ÷4.',
    answer: { numerator: 4, denominator: 25 }, requireSimplified: true,
  },
  {
    id: 'adv-dec2-8', kind: 'mcq', difficulty: 2,
    scenario: '아래 중 0.75 와 같은 분수를 모두 골라.',
    prompt: '같은 값을 가지는 분수를 모두 선택',
    hint: '0.75 = 75/100.',
    choices: ['3/4', '6/8', '15/20', '9/12', '5/8'],
    correctIndexes: [0, 1, 2, 3], multiple: true,
  },
  {
    id: 'adv-dec2-9', kind: 'mcq', difficulty: 2,
    scenario: '아래 중 0.6 과 같은 분수만 골라.',
    prompt: '같은 값을 가지는 분수를 모두 선택',
    hint: '0.6 = 6/10.',
    choices: ['3/5', '6/10', '9/15', '12/20', '4/7'],
    correctIndexes: [0, 1, 2, 3], multiple: true,
  },

  // === 소수 + 분수 혼합 계산 (이분모 응용) ===
  {
    id: 'adv-mix-1', kind: 'fraction', difficulty: 3,
    scenario: '연료 0.25 L 와 1/3 L 를 합쳤어. 기약분수로 답해.',
    prompt: '기약분수로 답해',
    hint: '0.25 = 1/4. 1/4 + 1/3 = 3/12 + 4/12.',
    answer: { numerator: 7, denominator: 12 }, requireSimplified: true,
  },
  {
    id: 'adv-mix-2', kind: 'fraction', difficulty: 3,
    scenario: '물 0.4 L 에서 1/6 L 가 증발. 남은 양 (기약)?',
    prompt: '기약분수로 답해',
    hint: '0.4 = 2/5. 2/5 - 1/6 = 12/30 - 5/30.',
    answer: { numerator: 7, denominator: 30 }, requireSimplified: true,
  },
  {
    id: 'adv-mix-3', kind: 'fraction', difficulty: 3,
    scenario: '산소 0.75 L 에서 5/8 L 를 사용했어. 남은 양 (기약)?',
    prompt: '기약분수로 답해',
    hint: '0.75 = 3/4 = 6/8. 6/8 - 5/8.',
    answer: { numerator: 1, denominator: 8 }, requireSimplified: true,
  },
  {
    id: 'adv-mix-4', kind: 'compare', difficulty: 2,
    scenario: '두 시료의 무게 비교.',
    prompt: '더 큰 쪽 (= 이면 등호) 선택',
    hint: '7/20 = 0.35.',
    left: { numerator: 7, denominator: 20 }, right: { decimal: 0.4 }, correctOp: '<',
  },
  {
    id: 'adv-mix-5', kind: 'compare', difficulty: 2,
    scenario: '두 측정값.',
    prompt: '더 큰 쪽 (= 이면 등호) 선택',
    hint: '0.45 = 9/20. 9/20 = 45/100, 9/25.',
    left: { decimal: 0.45 }, right: { numerator: 9, denominator: 25 }, correctOp: '>',
  },
  {
    id: 'adv-mix-6', kind: 'compare', difficulty: 3,
    scenario: '비밀 좌표 비교.',
    prompt: '더 큰 쪽 (= 이면 등호) 선택',
    hint: '3/8 = 0.375.',
    left: { numerator: 3, denominator: 8 }, right: { decimal: 0.4 }, correctOp: '<',
  },
  {
    // 이분모 범위 (0.3 = 3/10, 1/2 → 분모 다름)
    id: 'adv-mix-7', kind: 'numeric', difficulty: 3,
    scenario: '연료 라인 압력이 0.3 단계 ~ 1/2 단계 사이에 있어야 안전 운행 가능. 분모 20 의 자연수 압력 □ 는 몇 가지?',
    prompt: '식: 0.3 < □/20 < 1/2 — 자연수 □ 의 개수',
    hint: '0.3 = 6/20, 1/2 = 10/20.',
    answer: 3, unit: '개',
  },
  {
    id: 'adv-mix-8', kind: 'fraction', difficulty: 3,
    scenario: '용액 A 0.6 L 와 용액 B 1/4 L 를 합쳤어. 기약분수로!',
    prompt: '기약분수로 답해',
    hint: '0.6 = 3/5. 3/5 + 1/4 = 12/20 + 5/20.',
    answer: { numerator: 17, denominator: 20 }, requireSimplified: true,
  },

  // === 타우 세티 항로 비교 응용 (route comparison) ===
  {
    id: 'adv-route-1', kind: 'compare', difficulty: 3,
    scenario: '타우 세티로 가는 두 항로. 항로 A는 5/6 광년, 항로 B는 7/8 광년. 어느 항로가 더 가까울까?',
    prompt: '더 큰 쪽 (= 이면 등호) 선택',
    hint: '공통분모 24.',
    left: { numerator: 5, denominator: 6 }, right: { numerator: 7, denominator: 8 }, correctOp: '<',
  },
  {
    id: 'adv-route-2', kind: 'compare', difficulty: 3,
    scenario: '소행성대 우회 항로 — 위쪽 경로 7/12 광년, 아래쪽 경로 0.6 광년. 어느 쪽이 더 짧은가?',
    prompt: '더 큰 쪽 (= 이면 등호) 선택',
    hint: '7/12 ≈ 0.583.',
    left: { numerator: 7, denominator: 12 }, right: { decimal: 0.6 }, correctOp: '<',
  },
  {
    id: 'adv-route-3', kind: 'compare', difficulty: 3,
    scenario: '두 화물선이 화성으로 출발했어. A선은 3/8 일 만에, B선은 0.4 일 만에 도착. 누가 더 빨라?',
    prompt: '더 큰 쪽 (= 이면 등호) 선택',
    hint: '3/8 = 0.375.',
    left: { numerator: 3, denominator: 8 }, right: { decimal: 0.4 }, correctOp: '<',
  },
  {
    id: 'adv-route-4', kind: 'fraction', difficulty: 3,
    scenario: '타우 세티 항로 — 첫 구간 3/8 광년 + 두 번째 구간 5/12 광년. 총 거리 (기약)?',
    prompt: '기약분수로 답해',
    hint: '공통분모 24.',
    answer: { numerator: 19, denominator: 24 }, requireSimplified: true,
  },
  {
    id: 'adv-route-5', kind: 'fraction', difficulty: 3,
    scenario: '항해 일지: 어제 7/10 광년, 오늘 3/4 광년 이동. 이틀 총합 (기약, 가분수 OK)?',
    prompt: '기약분수로 답해',
    hint: '공통분모 20.',
    answer: { numerator: 29, denominator: 20 }, requireSimplified: true,
  },
  {
    id: 'adv-route-6', kind: 'fraction', difficulty: 3,
    scenario: '여정 11/12 광년 중 5/8 광년을 지나왔어. 남은 거리 (기약)?',
    prompt: '기약분수로 답해',
    hint: '공통분모 24.',
    answer: { numerator: 7, denominator: 24 }, requireSimplified: true,
  },
  {
    id: 'adv-route-7', kind: 'fraction', difficulty: 3,
    scenario: '귀환 항로 — 0.75 광년 짜리 경로에서 3/8 광년을 이동. 남은 거리 (기약)?',
    prompt: '기약분수로 답해',
    hint: '0.75 = 3/4 = 6/8. 6/8 − 3/8.',
    answer: { numerator: 3, denominator: 8 }, requireSimplified: true,
  },
  {
    id: 'adv-route-8', kind: 'compare', difficulty: 3,
    scenario: '세 경로 중 가장 짧은 두 후보 — 경로 X: 5/8 광년, 경로 Y: 11/16 광년. 어느 쪽이 짧을까?',
    prompt: '더 큰 쪽 (= 이면 등호) 선택',
    hint: '5/8.',
    left: { numerator: 5, denominator: 8 }, right: { numerator: 11, denominator: 16 }, correctOp: '<',
  },
  {
    id: 'adv-route-9', kind: 'fraction', difficulty: 3,
    scenario: '타우 세티 도착까지 4/5 광년. 그 중 1/3 광년을 워프로 단축. 남은 비워프 거리 (기약)?',
    prompt: '기약분수로 답해',
    hint: '공통분모 15.',
    answer: { numerator: 7, denominator: 15 }, requireSimplified: true,
  },
  {
    id: 'adv-route-10', kind: 'fraction', difficulty: 3,
    scenario: '구조선은 3 갈래 경로를 동시에 분석 중. A: 1/4, B: 1/3, C: 5/12 광년. 셋의 합 (기약)?',
    prompt: '기약분수로 답해',
    hint: '공통분모 12.',
    answer: { numerator: 1, denominator: 1 }, requireSimplified: true,
  },

  // === 우주 응용 — 시간/자원/속도 ===
  {
    id: 'adv-app-1', kind: 'fraction', difficulty: 3,
    scenario: '연료 셀 1번 0.45 L, 2번 1/3 L 를 합쳤어. 합 (기약)?',
    prompt: '기약분수로 답해',
    hint: '0.45 = 9/20. 공통분모 60.',
    answer: { numerator: 47, denominator: 60 }, requireSimplified: true,
  },
  {
    id: 'adv-app-2', kind: 'compare', difficulty: 3,
    scenario: '두 명의 항해사가 같은 미션을 수행. 항해사 A는 미션의 5/8, 항해사 B는 0.65 를 완료. 누가 더 진행?',
    prompt: '더 큰 쪽 (= 이면 등호) 선택',
    hint: '5/8 = 0.625.',
    left: { numerator: 5, denominator: 8 }, right: { decimal: 0.65 }, correctOp: '<',
  },
  {
    id: 'adv-app-3', kind: 'fraction', difficulty: 3,
    scenario: '산소 탱크의 7/12 이 차 있고, 새로 1/8 통을 채웠어. 총 양 (기약)?',
    prompt: '기약분수로 답해',
    hint: '공통분모 24.',
    answer: { numerator: 17, denominator: 24 }, requireSimplified: true,
  },
  {
    id: 'adv-app-4', kind: 'multi', difficulty: 3,
    scenario: '암호 해독: 어떤 분수의 분자에서 5를 빼고 분모에 3을 더했더니 1/4 이 됐어. 원래 분수가 9/X 였다면 X 는?',
    prompt: '풀이 + 원래 분수의 기약',
    hint: '1/4 의 약분 전 형태에서 분자 (9-5)/분모 X 가 1/4 와 같다고 두고 X 를 구한 다음 3을 빼.',
    workspacePlaceholder: '여기에 풀이 과정을 적어 보세요 (선택)',
    finalAnswer: { numerator: 9, denominator: 13 }, requireSimplified: true,
  },
  {
    // 이분모 범위 (1/4, 2/3 → 분모 다름)
    id: 'adv-app-5', kind: 'numeric', difficulty: 3,
    scenario: '구조 신호의 발신 거리는 1/4 광년 ~ 2/3 광년 사이로 잡혀. 우리 좌표 분모 12 의 자연수 발신 거리 □ 의 후보는 몇 개?',
    prompt: '식: 1/4 < □/12 < 2/3 — 자연수 □ 의 개수',
    hint: '1/4 = 3/12, 2/3 = 8/12. 분자 4, 5, 6, 7',
    answer: 4, unit: '개',
  },
  {
    id: 'adv-app-6', kind: 'compare', difficulty: 3,
    scenario: '두 행성의 자전 주기 — 행성 X 는 0.36 일, 행성 Y 는 9/25 일. 같을까 다를까?',
    prompt: '더 큰 쪽 (= 이면 등호) 선택',
    hint: '9/25 = 36/100 = 0.36.',
    left: { decimal: 0.36 }, right: { numerator: 9, denominator: 25 }, correctOp: '=',
  },
  {
    id: 'adv-app-7', kind: 'fraction', difficulty: 3,
    scenario: '워프 1구간 5/8 광년, 2구간 7/12 광년 — 1구간이 더 짧다면 그 차이는? (기약)',
    prompt: '두 구간의 차를 기약분수로',
    hint: '5/8 = 15/24, 7/12 = 14/24. 차.',
    answer: { numerator: 1, denominator: 24 }, requireSimplified: true,
  },
  {
    id: 'adv-app-8', kind: 'numeric', difficulty: 3,
    scenario: '두 행성 사이 거리는 3/4 광년. 그 중 0.4 광년 지점에 정거장이 있어. 정거장에서 다음 행성까지 거리는 100분의 몇 광년? (정수 분자만 적어, 분모는 100)',
    prompt: '거리(분모 100)의 분자만 적어',
    hint: '3/4 = 0.75 = 75/100. 0.4 = 40/100. 차.',
    answer: 35, unit: '',
  },

  // === 최상급 난이도 — 3-step 응용 ===
  {
    id: 'adv-hard-1', kind: 'fraction', difficulty: 3,
    scenario: '연료 1통 중 어제 1/4, 오늘 5/12 를 사용했어. 남은 연료 (기약)?',
    prompt: '기약분수로 답해',
    hint: '공통분모 12.',
    answer: { numerator: 1, denominator: 3 }, requireSimplified: true,
  },
  {
    id: 'adv-hard-2', kind: 'fraction', difficulty: 3,
    scenario: '귀환선이 0.8 광년을 가야 해. 이미 3/8 광년을 갔고, 어제 1/6 광년을 더 갔어. 남은 거리 (기약)?',
    prompt: '기약분수로 답해',
    hint: '0.8 = 4/5. 공통분모 120.',
    answer: { numerator: 31, denominator: 120 }, requireSimplified: true,
  },
  {
    id: 'adv-hard-3', kind: 'compare', difficulty: 3,
    scenario: '두 항로 비교 — 항로 P: 3/8 + 1/4 광년, 항로 Q: 0.6 광년. 어느 쪽이 더 짧을까?',
    prompt: '두 항로 중 더 짧은 쪽 (= 이면 등호) 선택',
    hint: '3/8 + 1/4 = 3/8 + 2/8 = 5/8 = 0.625.',
    left: { numerator: 5, denominator: 8 }, right: { decimal: 0.6 }, correctOp: '>',
  },
  {
    id: 'adv-hard-4', kind: 'fraction', difficulty: 3,
    scenario: '식량 5/6 통 중 3/8 통은 우주식, 나머지는 비상식. 비상식의 양 (기약)?',
    prompt: '기약분수로 답해',
    hint: '공통분모 24.',
    answer: { numerator: 11, denominator: 24 }, requireSimplified: true,
  },
  {
    id: 'adv-hard-5', kind: 'multi', difficulty: 3,
    scenario: '항법 해제: 어떤 분수에 0.25 를 더했더니 3/4 이 됐어. 원래 분수를 기약으로!',
    prompt: '풀이 + 기약 답',
    hint: '0.25 = 1/4. 3/4 − 1/4 = 2/4.',
    workspacePlaceholder: '여기에 풀이 과정을 적어 보세요 (선택)',
    finalAnswer: { numerator: 1, denominator: 2 }, requireSimplified: true,
  },
  {
    id: 'adv-hard-6', kind: 'multi', difficulty: 3,
    scenario: '귀환 코드: 어떤 분수의 분자에 5 를 더하고 분모를 2 배 했더니 7/12 이 됐어. 원래 분수를 기약으로!',
    prompt: '풀이 + 기약 답',
    hint: '(X분자 + 5) / (X분모 × 2) = 7/12. 분모 쪽: ×2가 12가 되도록 X분모를 정하고, 분자 쪽: +5가 7이 되도록 X분자를 정해. 마지막에 약분.',
    workspacePlaceholder: '여기에 풀이 과정을 적어 보세요 (선택)',
    finalAnswer: { numerator: 1, denominator: 3 }, requireSimplified: true,
  },
  {
    // 이분모 범위 (3/8, 7/12 → 분모 다름)
    id: 'adv-hard-7', kind: 'numeric', difficulty: 3,
    scenario: '항해사가 잠입할 행성의 안전 구역은 3/8 광년 ~ 7/12 광년 사이. 우리 좌표 분모 24 의 자연수 잠입 좌표 □ 의 가능한 수는?',
    prompt: '식: 3/8 < □/24 < 7/12 — 자연수 □ 의 개수',
    hint: '3/8 = 9/24, 7/12 = 14/24.',
    answer: 4, unit: '개',
  },
  {
    id: 'adv-hard-8', kind: 'fraction', difficulty: 3,
    scenario: '항해 일지 — 3일간 5/12, 1/3, 7/24 광년씩 이동. 총 이동 거리를 기약 가분수로!',
    prompt: '기약분수로 답해',
    hint: '공통분모 24.',
    answer: { numerator: 25, denominator: 24 }, requireSimplified: true,
  },

  // === 소수 둘째자리 ↔ 분수 응용 (분수 다양화 — 새 분모 도입) ===
  {
    // 0.55 = 11/20 — 분수 다양화 (분모 20)
    id: 'adv-dec3-1', kind: 'fraction', difficulty: 3,
    scenario: '함선 외부 압력이 0.55 단위로 측정됐어. 같은 값을 분모 20 의 기약분수로 적어 인계 서류에 기록해.',
    prompt: '같은 값을 기약분수로',
    hint: '55/100 → ÷5.',
    answer: { numerator: 11, denominator: 20 }, requireSimplified: true,
  },
  {
    // 0.12 = 3/25 — 새 분모 25
    id: 'adv-dec3-2', kind: 'fraction', difficulty: 3,
    scenario: '실험실 농도 미터가 0.12 를 가리켜. 분모 25 의 기약분수로 보고서에 적어줘.',
    prompt: '같은 값을 기약분수로',
    hint: '12/100 → ÷4.',
    answer: { numerator: 3, denominator: 25 }, requireSimplified: true,
  },
  {
    // 0.95 = 19/20
    id: 'adv-dec3-3', kind: 'fraction', difficulty: 3,
    scenario: '비상 전력 충전률이 0.95 까지 도달했어. 분모 20 의 기약분수로 메인 컴퓨터에 등록!',
    prompt: '같은 값을 기약분수로',
    hint: '95/100 → ÷5.',
    answer: { numerator: 19, denominator: 20 }, requireSimplified: true,
  },
  {
    // 분수+소수 차 응용 (새 분수 11/16)
    id: 'adv-dec3-4', kind: 'fraction', difficulty: 3,
    scenario: '메인 산소통이 11/16 채워져 있었는데, 응급 보충 0.25 통을 추가했어. 산소통의 현재 양을 기약분수로!',
    prompt: '기약분수로 답해',
    hint: '0.25 = 1/4 = 4/16. 11/16 + 4/16.',
    answer: { numerator: 15, denominator: 16 }, requireSimplified: true,
  },
  {
    // 분수 차 — 새 분수 13/18
    id: 'adv-dec3-5', kind: 'fraction', difficulty: 3,
    scenario: '냉각수가 13/18 만큼 있었어. 그 중 0.4 만큼이 증발. 남은 냉각수를 기약분수로!',
    prompt: '기약분수로 답해',
    hint: '0.4 = 2/5. 공통분모 90.',
    answer: { numerator: 29, denominator: 90 }, requireSimplified: true,
  },
  {
    // 분수 vs 소수 비교 — 새 분수 7/16
    id: 'adv-dec3-6', kind: 'compare', difficulty: 3,
    scenario: '두 우주선 속도 비교 — 우리 선박은 7/16 광속, 적 선박은 0.5 광속이야. 누가 더 빠른가?',
    prompt: '더 큰 쪽 (= 이면 등호) 선택',
    hint: '7/16 = 0.4375.',
    left: { numerator: 7, denominator: 16 }, right: { decimal: 0.5 }, correctOp: '<',
  },
  {
    // 분수 vs 소수 비교 — 새 분수 13/25
    id: 'adv-dec3-7', kind: 'compare', difficulty: 3,
    scenario: '두 행성의 자전 속도 — 행성 X 는 13/25, 행성 Y 는 0.52. 두 행성의 속도는 같을까?',
    prompt: '더 큰 쪽 (= 이면 등호) 선택',
    hint: '13/25 = 52/100 = 0.52.',
    left: { numerator: 13, denominator: 25 }, right: { decimal: 0.52 }, correctOp: '=',
  },
  {
    // 이분모 범위 — 새 분모 36 / 분수 다양화
    id: 'adv-dec3-8', kind: 'numeric', difficulty: 3,
    scenario: '워프 안전 범위는 1/4 광년 ~ 5/9 광년. 분모 36 자연수 워프 좌표 □ 의 가능한 수는?',
    prompt: '식: 1/4 < □/36 < 5/9 — 자연수 □ 의 개수',
    hint: '1/4 = 9/36, 5/9 = 20/36.',
    answer: 10, unit: '개',
  },
  {
    // 이분모 범위 — 새 분모 40 / 소수 + 분수 bounds
    id: 'adv-dec3-9', kind: 'numeric', difficulty: 3,
    scenario: '비상 출력 안전 범위는 0.2 단계 ~ 7/10 단계. 분모 40 의 자연수 출력 □ 가 안전 구간에 들어가는 경우는?',
    prompt: '식: 0.2 < □/40 < 7/10 — 자연수 □ 의 개수',
    hint: '0.2 = 8/40, 7/10 = 28/40.',
    answer: 19, unit: '개',
  },

  // === 신규 분수 다양화 — 분모 11/13/14/16/21/22/27/30/33/35/45 도입 ===
  {
    // 4/11 + 1/3 = 12/33 + 11/33 = 23/33 (A 서로소)
    id: 'adv-div-1', kind: 'fraction', difficulty: 3,
    scenario: '실험실 1번 배양조에 한 통의 4/11 만큼 시료가 있어. 거기에 2번 배양조의 시료 1/3 통을 옮겨 담아야 해. 합친 후 시료의 총량을 기약분수로 적어 분석실에 보고해줘.',
    prompt: '합을 기약분수로',
    hint: '공통분모 33.',
    answer: { numerator: 23, denominator: 33 }, requireSimplified: true,
  },
  {
    // 5/13 + 2/3 = 15/39 + 26/39 = 41/39 (A, 가분수)
    id: 'adv-div-2', kind: 'fraction', difficulty: 3,
    scenario: '우주선 비상 배터리 A 는 한 통의 5/13 만큼 충전돼 있고, 배터리 B 는 2/3 만큼 충전돼 있어. 두 배터리를 하나로 합쳤을 때의 총 충전량을 기약 가분수로 알려줘. (1통을 넘을 수 있어.)',
    prompt: '합을 기약 가분수로',
    hint: '공통분모 39.',
    answer: { numerator: 41, denominator: 39 }, requireSimplified: true,
  },
  {
    // 9/14 - 3/7 = 9/14 - 6/14 = 3/14 (B 배수)
    id: 'adv-div-3', kind: 'fraction', difficulty: 3,
    scenario: '항해 일지에 따르면 어제까지 임무의 9/14 가 완료된 상태였어. 그런데 시스템 오류로 3/7 만큼의 진행 기록이 손실됐대. 손실 후 실제 인정되는 완료 비율을 기약분수로 정확히 다시 적어줘.',
    prompt: '차를 기약분수로',
    hint: '공통분모 14.',
    answer: { numerator: 3, denominator: 14 }, requireSimplified: true,
  },
  {
    // 5/16 + 3/8 = 5/16 + 6/16 = 11/16 (B 배수)
    id: 'adv-div-4', kind: 'fraction', difficulty: 3,
    scenario: '백신 실험에서 약품 A 5/16 통과 약품 B 3/8 통을 같은 비커에 부어 섞으려고 해. 섞은 후 비커에 담긴 총 부피를 정확히 알아야 다음 가열 단계를 진행할 수 있어. 통분해서 더한 뒤 기약분수로!',
    prompt: '합을 기약분수로',
    hint: '공통분모 16.',
    answer: { numerator: 11, denominator: 16 }, requireSimplified: true,
  },
  {
    // 11/21 - 2/7 = 11/21 - 6/21 = 5/21 (B 배수)
    id: 'adv-div-5', kind: 'fraction', difficulty: 3,
    scenario: '함선 통신 안테나 출력이 한 통의 11/21 까지 도달했었어. 그런데 노이즈 간섭으로 2/7 만큼의 출력이 손실됐다고 해. 현재 안테나에 남아 있는 실제 출력을 통분해서 빼고 기약분수로 알려줘.',
    prompt: '차를 기약분수로',
    hint: '공통분모 21.',
    answer: { numerator: 5, denominator: 21 }, requireSimplified: true,
  },
  {
    // 7/22 + 1/11 = 7/22 + 2/22 = 9/22 (B 배수)
    id: 'adv-div-6', kind: 'fraction', difficulty: 3,
    scenario: '의무실 약품 캐비닛에는 두 가지 진통제가 들어 있어. 1번 진통제는 한 통의 7/22, 2번 진통제는 1/11 만큼 남아 있어. 두 진통제를 합치면 총 얼마인지 알아야 다음 처방을 정할 수 있어. 통분해서 더한 뒤 기약분수로!',
    prompt: '합을 기약분수로',
    hint: '공통분모 22.',
    answer: { numerator: 9, denominator: 22 }, requireSimplified: true,
  },
  {
    // 7/27 + 1/9 = 7/27 + 3/27 = 10/27 (B 배수)
    id: 'adv-div-7', kind: 'fraction', difficulty: 3,
    scenario: '외계 행성 표본을 두 개의 시험관에 나누어 담아 가져왔어. 시험관 1에는 한 통의 7/27, 시험관 2에는 1/9 만큼 표본이 들어 있어. 두 표본을 합쳤을 때의 총량을 기약분수로 정확히 기록해줘.',
    prompt: '합을 기약분수로',
    hint: '공통분모 27.',
    answer: { numerator: 10, denominator: 27 }, requireSimplified: true,
  },
  {
    // 17/30 - 1/5 = 17/30 - 6/30 = 11/30 (B 배수)
    id: 'adv-div-8', kind: 'fraction', difficulty: 3,
    scenario: '항해 자료에 따르면 산소 잔량이 한 통의 17/30 까지 차 있었어. 비행 중 추가 호흡 작업으로 1/5 만큼이 소모됐대. 현재 남아 있는 산소 비율을 기약분수로 정확히 알려줘.',
    prompt: '차를 기약분수로',
    hint: '공통분모 30.',
    answer: { numerator: 11, denominator: 30 }, requireSimplified: true,
  },
  {
    // 13/33 + 2/11 = 13/33 + 6/33 = 19/33 (B 배수)
    id: 'adv-div-9', kind: 'fraction', difficulty: 3,
    scenario: '냉동실에 보관된 두 종류의 보존제 — 첫 번째 보존제는 한 통의 13/33, 두 번째 보존제는 2/11 만큼 남았어. 둘을 합치면 다음 보존 작업에 충분한지 결정할 수 있어. 통분해서 더하고 기약분수로!',
    prompt: '합을 기약분수로',
    hint: '공통분모 33.',
    answer: { numerator: 19, denominator: 33 }, requireSimplified: true,
  },
  {
    // 13/35 + 2/7 = 13/35 + 10/35 = 23/35 (B 배수)
    id: 'adv-div-10', kind: 'fraction', difficulty: 3,
    scenario: '실험실 비커에 한 통의 13/35 만큼 시약이 들어 있었어. 거기에 보충 시약 2/7 통을 부어 농도를 조절하려 해. 부은 뒤 비커에 담긴 시약 총량을 기약분수로 적어 보고서에 기록!',
    prompt: '합을 기약분수로',
    hint: '공통분모 35.',
    answer: { numerator: 23, denominator: 35 }, requireSimplified: true,
  },
  {
    // 19/45 + 1/9 = 19/45 + 5/45 = 24/45 = 8/15 (B 배수, 약분)
    id: 'adv-div-11', kind: 'fraction', difficulty: 3,
    scenario: '대형 화물선 적재 칸이 두 구역으로 나뉘어 있어. 1구역에는 한 통의 19/45, 2구역에는 1/9 만큼의 자원이 들어 있어. 두 구역의 자원을 모두 합쳤을 때의 총 적재량을 기약분수로 줄여 알려줘.',
    prompt: '합을 기약분수로',
    hint: '공통분모 45.',
    answer: { numerator: 8, denominator: 15 }, requireSimplified: true,
  },
  {
    // 3/11 + 5/8 = 24/88 + 55/88 = 79/88 (A 서로소, LCM=88)
    id: 'adv-div-12', kind: 'fraction', difficulty: 3,
    scenario: '두 명의 항해사가 별도 시뮬레이터에서 임무를 풀고 있어. 한 명은 자기 시뮬레이터의 3/11 를, 다른 한 명은 5/8 를 끝냈어. 두 사람이 합쳐서 끝낸 비율을 알아야 다음 작전 계획을 세울 수 있어. 통분해서 더하고 기약분수로!',
    prompt: '합을 기약분수로',
    hint: '공통분모 88.',
    answer: { numerator: 79, denominator: 88 }, requireSimplified: true,
  },
  {
    // 7/12 + 5/9 = 21/36 + 20/36 = 41/36 (C 공통인수, 가분수)
    id: 'adv-div-13', kind: 'fraction', difficulty: 3,
    scenario: '의무실 산소통 A 는 한 통의 7/12, 산소통 B 는 5/9 만큼 충전된 상태야. 비상시 두 산소통을 합쳐 한 사람에게 공급하려면 총량이 얼마인지 알아야 안전한 공급 시간을 정할 수 있어. 통분해서 더하고 기약 가분수로!',
    prompt: '합을 기약 가분수로',
    hint: '공통분모 36.',
    answer: { numerator: 41, denominator: 36 }, requireSimplified: true,
  },
  {
    // 11/18 - 1/4 = 22/36 - 9/36 = 13/36 (C 공통인수)
    id: 'adv-div-14', kind: 'fraction', difficulty: 3,
    scenario: '엔진 점검 일지에 따르면 윤활유가 한 통의 11/18 까지 들어 있었어. 점검 도중 1/4 통 분량의 윤활유가 외부로 흘러나갔지. 엔진을 다시 가동하기 전에 통 안에 남은 윤활유의 비율을 기약분수로 정확히 알려줘.',
    prompt: '차를 기약분수로',
    hint: '공통분모 36.',
    answer: { numerator: 13, denominator: 36 }, requireSimplified: true,
  },
  {
    // 0.48 = 12/25 — 소수 변환 응용 (새로운 소수)
    id: 'adv-div-15', kind: 'fraction', difficulty: 3,
    scenario: '함선 외부 압력 센서가 0.48 단위라는 값을 계속 보내오고 있어. 메인 컴퓨터는 분수 단위로만 데이터를 저장할 수 있어서, 이 값을 분모 25 형태의 기약분수로 변환해 입력해야 해. 어떤 분수가 될까?',
    prompt: '같은 값을 기약분수로',
    hint: '48/100 → ÷4.',
    answer: { numerator: 12, denominator: 25 }, requireSimplified: true,
  },
  {
    // 0.72 = 18/25 — 새 소수
    id: 'adv-div-16', kind: 'fraction', difficulty: 3,
    scenario: '구조선 도착 거리 표시판이 0.72 광년이라고 가리켜. 우리의 항법 모듈은 분수만 받아들이기 때문에 같은 거리를 분모 25 의 기약분수로 변환해 입력해야 해. 변환 결과를 적어줘.',
    prompt: '같은 값을 기약분수로',
    hint: '72/100 → ÷4.',
    answer: { numerator: 18, denominator: 25 }, requireSimplified: true,
  },
  {
    // 0.28 = 7/25
    id: 'adv-div-17', kind: 'fraction', difficulty: 3,
    scenario: '실험실 가스 농도 측정기가 0.28 을 가리키고 있어. 환기 시스템은 분수 입력만 받기 때문에 같은 농도를 분모 25 의 기약분수로 변환해 입력해야 해. 어떤 분수일까?',
    prompt: '같은 값을 기약분수로',
    hint: '28/100 → ÷4.',
    answer: { numerator: 7, denominator: 25 }, requireSimplified: true,
  },
  {
    // 분수 vs 소수 — 새 분수 9/22
    id: 'adv-div-18', kind: 'compare', difficulty: 3,
    scenario: '두 우주선이 같은 화물칸 적재량을 보고하고 있어. 우리 우주선의 적재율은 9/22 라고 표시되고, 동맹 우주선의 적재율은 0.4 라고 표시돼. 어느 쪽이 더 많이 적재했는지 알아야 보급 분배를 결정할 수 있어. 둘을 비교해줘.',
    prompt: '더 큰 쪽 (= 이면 등호) 선택',
    hint: '9/22 ≈ 0.409.',
    left: { numerator: 9, denominator: 22 }, right: { decimal: 0.4 }, correctOp: '>',
  },
  {
    // 분수 vs 분수 — 새 조합 11/27 vs 5/12
    id: 'adv-div-19', kind: 'compare', difficulty: 3,
    scenario: '두 행성 사이의 신호 강도를 비교하는 중이야. 행성 A 의 신호는 11/27, 행성 B 의 신호는 5/12 로 측정됐어. 더 강한 신호를 보내고 있는 쪽이 진짜 발신지일 가능성이 커. 어느 쪽이 더 큰가?',
    prompt: '더 큰 쪽 (= 이면 등호) 선택',
    hint: '공통분모 108.',
    left: { numerator: 11, denominator: 27 }, right: { numerator: 5, denominator: 12 }, correctOp: '<',
  },
  {
    // 이분모 범위 — 새 분모 60
    id: 'adv-div-20', kind: 'numeric', difficulty: 3,
    scenario: '비상 출력 안전 범위는 한 통의 3/20 단계보다 높고 7/12 단계보다 낮아야 안전해. 우리 계측기는 분모 60 의 자연수 출력만 표시할 수 있는데, 이 범위 안에 들어가는 자연수 출력값은 모두 몇 개일까?',
    prompt: '식: 3/20 < □/60 < 7/12 — 자연수 □ 의 개수',
    hint: '3/20 = 9/60, 7/12 = 35/60.',
    answer: 25, unit: '개',
  },
]

/** 풀에서 N개 랜덤 픽 */
export const pickAdvancedProblems = (n: number): Problem[] => {
  const pool = [...ADVANCED_PROBLEMS]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, Math.min(n, pool.length))
}
