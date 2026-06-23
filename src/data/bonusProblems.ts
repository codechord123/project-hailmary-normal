import type { Problem } from '@/types/problem'

/**
 * 챕터 메인 메커니즘 종료 후 등장하는 보너스 응용 문제 풀.
 * 모든 문제: 단순 계산식이 아닌 우주 서사 독해 응용.
 * 범위 문제는 모두 이분모 (양 끝 분모 다름).
 */
const POOLS: Record<number, Problem[]> = {
  2: [
    {
      // 3/4 - 1/8 = 5/8 (B 배수, 약분 X — 식량 잔량 응용)
      id: 'c2-bonus-a', kind: 'fraction', difficulty: 2,
      scenario: '식량 점검 마무리! 비축 식량이 3/4 박스였는데 점검 중 1/8 박스를 시식용으로 썼어. 박스에 남은 양을 기약분수로!',
      prompt: '남은 양을 기약분수로', hint: '공통분모 8.',
      answer: { numerator: 5, denominator: 8 }, requireSimplified: true,
    },
    {
      // 7/9 - 1/3 = 4/9 — 항해 자원 응용
      id: 'c2-bonus-b', kind: 'fraction', difficulty: 3,
      scenario: '비상 산소 라인이 7/9 까지 채워져 있었는데, 야간 순찰 동안 1/3 만큼 사용했어. 라인 잔량을 기약으로!',
      prompt: '남은 양을 기약분수로', hint: '공통분모 9.',
      answer: { numerator: 4, denominator: 9 }, requireSimplified: true,
    },
    {
      // 11/14 - 3/7 = 11/14 - 6/14 = 5/14 — 새로운 분모 14 도입
      id: 'c2-bonus-c', kind: 'fraction', difficulty: 3,
      scenario: '비상 식수 11/14 통 중에 우주복 정화 시스템이 3/7 통을 끌어 썼어. 식수 잔량을 기약분수로!',
      prompt: '남은 양을 기약분수로', hint: '공통분모 14.',
      answer: { numerator: 5, denominator: 14 }, requireSimplified: true,
    },
    {
      // 0.7 - 3/8 = 7/10 - 3/8 = 28/40 - 15/40 = 13/40 — 소수 응용
      id: 'c2-bonus-d', kind: 'fraction', difficulty: 3,
      scenario: '약품 0.7 L 가 비축돼 있었는데 실험에 3/8 L 를 사용. 남은 약품을 기약분수로!',
      prompt: '남은 양을 기약분수로', hint: '0.7 = 7/10. 공통분모 40.',
      answer: { numerator: 13, denominator: 40 }, requireSimplified: true,
    },
    {
      // 분수 vs 소수 비교 — 보급 비교
      id: 'c2-bonus-e', kind: 'compare', difficulty: 2,
      scenario: '두 보급선의 식량 적재량 비교. A선은 5/8 박스, B선은 0.65 박스를 운반 중이야. 누가 더 많이 갖고 와?',
      prompt: '더 큰 쪽 (= 이면 등호) 선택', hint: '5/8 = 0.625.',
      left: { numerator: 5, denominator: 8 }, right: { decimal: 0.65 },
      correctOp: '<',
    },
    {
      // 11/12 - 5/8 = 22/24 - 15/24 = 7/24 — 큰 분모 응용
      id: 'c2-bonus-f', kind: 'fraction', difficulty: 3,
      scenario: '산소통 11/12 까지 채워져 있었는데 유출 점검 중 5/8 만큼이 새어 나갔어. 통에 남은 산소를 기약분수로!',
      prompt: '남은 양을 기약분수로', hint: '공통분모 24.',
      answer: { numerator: 7, denominator: 24 }, requireSimplified: true,
    },
    {
      // 0.45 → 9/20 — 소수 변환 응용
      id: 'c2-bonus-g', kind: 'fraction', difficulty: 3,
      scenario: '구조선 화물칸 적재율이 0.45 야. 같은 양을 분모 20 형태의 기약분수로 적어 인계 서류에 기록해야 해.',
      prompt: '같은 값을 기약분수로', hint: '45/100 → ÷5.',
      answer: { numerator: 9, denominator: 20 }, requireSimplified: true,
    },
    {
      // 이분모 범위 — 4/15 < □/30 < 7/10 (분모 30, 양 끝 분모 15·10)
      id: 'c2-bonus-h', kind: 'numeric', difficulty: 3,
      scenario: '비상 전력선 출력은 4/15 단계 이상 7/10 단계 미만에 머물러야 안전해. 우리 계측기 분모 30 의 자연수 출력값 □ 는 몇 가지 가능?',
      prompt: '식: 4/15 < □/30 < 7/10 — 자연수 □ 의 개수',
      hint: '4/15 = 8/30, 7/10 = 21/30.',
      answer: 12, unit: '개',
    },
  ],
  3: [
    {
      // 분수 비교 응용 (이분모) — 임무 진행률 비교
      id: 'c3-bonus-a', kind: 'compare', difficulty: 3,
      scenario: '아스트로파지 정찰병의 환영이 두 번 등장. 첫 번째는 거리 7/8 광년, 두 번째는 11/12 광년이야. 더 가까운 환영이 진짜! 어느 쪽이 더 가까운가?',
      prompt: '더 큰 쪽 (= 이면 등호) 선택', hint: '공통분모 24.',
      left: { numerator: 7, denominator: 8 }, right: { numerator: 11, denominator: 12 },
      correctOp: '<',
    },
    {
      // 이분모 범위 — 2/9 < □/18 < 5/6 (분모 18, bounds 분모 9, 6)
      id: 'c3-bonus-b', kind: 'numeric', difficulty: 3,
      scenario: '아스트로파지 둥지의 안전 진입 범위는 2/9 광년 ~ 5/6 광년이야. 분모 18 의 정수 분자 □ 가 진입 가능한 경우의 수는?',
      prompt: '식: 2/9 < □/18 < 5/6 — 자연수 □ 의 개수',
      hint: '2/9 = 4/18, 5/6 = 15/18.',
      answer: 10, unit: '개',
    },
    {
      // 분수 vs 소수 — 신호 강도
      id: 'c3-bonus-c', kind: 'compare', difficulty: 3,
      scenario: '두 정찰병의 신호 강도 비교 — 한 쪽은 9/16, 다른 쪽은 0.6. 더 강한 쪽을 추적해야 해.',
      prompt: '더 큰 쪽 (= 이면 등호) 선택', hint: '9/16 = 0.5625.',
      left: { numerator: 9, denominator: 16 }, right: { decimal: 0.6 },
      correctOp: '<',
    },
    {
      // 0.16 = 4/25 — 소수→분수 응용
      id: 'c3-bonus-d', kind: 'fraction', difficulty: 3,
      scenario: '정찰병이 내뿜는 가스 농도 0.16 을 같은 값의 기약분수 (분모 25 형태) 로 기록해 분석실로 전송해.',
      prompt: '같은 값을 기약분수로', hint: '16/100 → ÷4.',
      answer: { numerator: 4, denominator: 25 }, requireSimplified: true,
    },
    {
      // 분수 + 분수 응용 (이분모) — 자원 합산
      id: 'c3-bonus-e', kind: 'fraction', difficulty: 3,
      scenario: '정찰병의 분비물 분석 — 시료 1번이 3/10 g, 시료 2번이 5/8 g 일 때 총 시료의 합을 기약분수로!',
      prompt: '기약분수로 답해', hint: '공통분모 40.',
      answer: { numerator: 37, denominator: 40 }, requireSimplified: true,
    },
    {
      // 분수 vs 소수 — 항법 비교
      id: 'c3-bonus-f', kind: 'compare', difficulty: 3,
      scenario: '두 신호 위치 — 좌표 A 는 11/20 광년, 좌표 B 는 0.55 광년. 두 좌표는 같을까 다를까?',
      prompt: '더 큰 쪽 (= 이면 등호) 선택', hint: '11/20 = 55/100 = 0.55.',
      left: { numerator: 11, denominator: 20 }, right: { decimal: 0.55 },
      correctOp: '=',
    },
    {
      // 비례 동치 응용
      id: 'c3-bonus-g', kind: 'numeric', difficulty: 3,
      scenario: '정찰병이 보낸 분수 2/5 의 분자에 4 를 더했더니 분수의 크기가 변하지 않았어. 분모에는 얼마를 더해야 했을까?',
      prompt: '분모에 더한 수',
      hint: '2+4=6. 분자가 ×3 됐으니 분모도 ×3 → 15. 15-5.',
      answer: 10, unit: '',
    },
    {
      // 다단계 역산
      id: 'c3-bonus-h', kind: 'multi', difficulty: 3,
      scenario: '정찰병이 마지막 코드를 흘렸어 — 어떤 분수의 분모에 4 를 더하고 5 로 약분하니 2/3 이 됐어. 원래 분수를 기약으로 입력해 코드 해제!',
      prompt: '원래 분수 (기약)',
      hint: '5로 약분 후 2/3 → 약분 전 10/15. 분모에 4 더해 15였으니 원래 분모 11',
      workspacePlaceholder: '여기에 풀이 과정을 적어 보세요 (선택)',
      finalAnswer: { numerator: 10, denominator: 11 }, requireSimplified: true,
    },
  ],
  4: [
    {
      // 5/12 + 3/8 = 10/24 + 9/24 = 19/24 — 디펜스 응용
      id: 'c4-bonus-a', kind: 'fraction', difficulty: 3,
      scenario: '디펜스 후 합류 자원 — 우리 5/12 통, 동맹 3/8 통. 합치면 베이스 총 자원량은 기약분수로?',
      prompt: '기약분수로 답해', hint: '공통분모 24.',
      answer: { numerator: 19, denominator: 24 }, requireSimplified: true,
    },
    {
      // 0.25 + 5/12 = 1/4 + 5/12 = 3/12 + 5/12 = 8/12 = 2/3
      id: 'c4-bonus-b', kind: 'fraction', difficulty: 3,
      scenario: '회수된 자원: 우주잔해에서 0.25 통, 노출된 운석에서 5/12 통. 두 자원을 합한 양을 기약분수로!',
      prompt: '기약분수로 답해', hint: '0.25 = 1/4 = 3/12. 3/12 + 5/12.',
      answer: { numerator: 2, denominator: 3 }, requireSimplified: true,
    },
    {
      // 분수 비교 — 부대 진행률
      id: 'c4-bonus-c', kind: 'compare', difficulty: 3,
      scenario: '두 부대가 동시에 디펜스 임무 수행 중. A 부대는 5/9 완료, B 부대는 7/12 완료. 누가 더 진행됐을까?',
      prompt: '더 큰 쪽 (= 이면 등호) 선택', hint: '공통분모 36.',
      left: { numerator: 5, denominator: 9 }, right: { numerator: 7, denominator: 12 },
      correctOp: '<',
    },
    {
      // 7/15 + 1/6 = 14/30 + 5/30 = 19/30 — 큰 분모 응용
      id: 'c4-bonus-d', kind: 'fraction', difficulty: 3,
      scenario: '응원 함대 — 본진 7/15 + 지원군 1/6 의 화력을 합치면 총 화력이 얼마? (기약)',
      prompt: '기약분수로 답해', hint: '공통분모 30.',
      answer: { numerator: 19, denominator: 30 }, requireSimplified: true,
    },
    {
      // 11/16 + 1/4 = 11/16 + 4/16 = 15/16 — 새 분모 16 도입
      id: 'c4-bonus-e', kind: 'fraction', difficulty: 3,
      scenario: '두 베이스 합산 — 알파 베이스 방어막 11/16, 베타 베이스 1/4. 합쳐서 총 방어막의 비율은? (기약)',
      prompt: '기약분수로 답해', hint: '공통분모 16.',
      answer: { numerator: 15, denominator: 16 }, requireSimplified: true,
    },
    {
      // 분수 + 소수 비교 응용
      id: 'c4-bonus-f', kind: 'compare', difficulty: 3,
      scenario: '아군 부대 5/8 + 1/4 의 화력 vs 적군 0.95 의 화력. 누가 우세할까?',
      prompt: '더 큰 쪽 (= 이면 등호) 선택', hint: '5/8 + 1/4 = 7/8 = 0.875.',
      left: { numerator: 7, denominator: 8 }, right: { decimal: 0.95 },
      correctOp: '<',
    },
    {
      // 이분모 범위 — 1/4 < □/20 < 3/5
      id: 'c4-bonus-g', kind: 'numeric', difficulty: 3,
      scenario: '디펜스 라인 안전 범위는 1/4 ~ 3/5. 분모 20 의 자연수 출력 □ 는 몇 개?',
      prompt: '식: 1/4 < □/20 < 3/5 — 자연수 □ 의 개수',
      hint: '1/4 = 5/20, 3/5 = 12/20.',
      answer: 6, unit: '개',
    },
    {
      // 세 자원 합 응용
      id: 'c4-bonus-h', kind: 'fraction', difficulty: 3,
      scenario: '세 보급선의 비상 자원: 1번 3/10, 2번 1/4, 3번 1/5. 셋 다 합치면 베이스 잔량은 기약분수로?',
      prompt: '기약분수로 답해',
      hint: '공통분모 20.',
      answer: { numerator: 3, denominator: 4 }, requireSimplified: true,
    },
  ],
  5: [
    {
      // 분수 vs 소수 — 잔량 비교
      id: 'c5-bonus-a', kind: 'compare', difficulty: 3,
      scenario: '리액터 라인 잔량 비교 — 라인 A 11/16 단계, 라인 B 0.65 단계. 어느 쪽이 더 위험 (적은) 가?',
      prompt: '더 큰 쪽 (= 이면 등호) 선택', hint: '11/16 = 0.6875.',
      left: { numerator: 11, denominator: 16 }, right: { decimal: 0.65 }, correctOp: '>',
    },
    {
      // 7/10 - 3/8 = 28/40 - 15/40 = 13/40 — 응용
      id: 'c5-bonus-b', kind: 'fraction', difficulty: 3,
      scenario: '연료 잔량 7/10 통에서 비상 점화로 3/8 통을 추가 소비했어. 라인 잔량을 기약으로!',
      prompt: '기약분수로 답해', hint: '공통분모 40.',
      answer: { numerator: 13, denominator: 40 }, requireSimplified: true,
    },
    {
      // LCM 응용
      id: 'c5-bonus-c', kind: 'numeric', difficulty: 3,
      scenario: '리액터 두 코어 주기를 맞추려면 LCM(9, 12) 분 마다 동기화해야 해. 그 주기는?',
      prompt: '두 분모의 최소공배수 (LCM)', hint: '36.',
      answer: 36, unit: '',
    },
    {
      // 0.6 - 1/3 = 3/5 - 1/3 = 9/15 - 5/15 = 4/15
      id: 'c5-bonus-d', kind: 'fraction', difficulty: 3,
      scenario: '냉각수 0.6 통이 있고, 비상 분사로 1/3 통이 소모됐어. 잔량을 기약으로!',
      prompt: '기약분수로 답해', hint: '0.6 = 3/5. 9/15 - 5/15.',
      answer: { numerator: 4, denominator: 15 }, requireSimplified: true,
    },
    {
      // 이분모 범위 — 3/10 < □/30 < 7/15
      id: 'c5-bonus-e', kind: 'numeric', difficulty: 3,
      scenario: '리액터 출력 안정 범위는 3/10 ~ 7/15 단계. 분모 30 의 자연수 출력 □ 는 몇 개?',
      prompt: '식: 3/10 < □/30 < 7/15 — 자연수 □ 의 개수',
      hint: '3/10 = 9/30, 7/15 = 14/30.',
      answer: 4, unit: '개',
    },
    {
      // 0.84 - 5/8 = 21/25 - 5/8 = 168/200 - 125/200 = 43/200
      id: 'c5-bonus-f', kind: 'fraction', difficulty: 3,
      scenario: '비상 전력 0.84 단위 중 5/8 단위가 메인 컴퓨터로 흘러갔어. 라인에 남은 전력을 기약분수로!',
      prompt: '기약분수로 답해', hint: '0.84 = 21/25. 21/25 - 5/8 → 공통분모 200.',
      answer: { numerator: 43, denominator: 200 }, requireSimplified: true,
    },
  ],
  6: [
    {
      id: 'c6-bonus-a', kind: 'fraction', difficulty: 3,
      scenario: '배양조 1번에 우주 미생물이 2¾ 통 들어 있어. 같은 양을 가분수로 적어 분석기에 입력해.',
      prompt: '기약 가분수로 답해', hint: '2×4+3=11, 분모 4.',
      answer: { numerator: 11, denominator: 4 }, requireSimplified: true,
    },
    {
      id: 'c6-bonus-b', kind: 'fraction', difficulty: 3,
      scenario: '아스트로파지 표본 1⅗ 박스를 정밀 분석기에 넣으려면 가분수 표기가 필요해.',
      prompt: '기약 가분수로 답해', hint: '1×5+3=8, 분모 5.',
      answer: { numerator: 8, denominator: 5 }, requireSimplified: true,
    },
    {
      id: 'c6-bonus-c', kind: 'mcq', difficulty: 2,
      scenario: '연구원이 가분수 11/3 박스의 표본을 가져왔어. 같은 양을 대분수로 적으면?',
      prompt: '대분수 표기를 골라',
      hint: '11 ÷ 3 = 3 나머지 2.',
      choices: ['3⅓', '3⅔', '2⅔', '4⅓', '⅓'],
      correctIndexes: [1], multiple: false,
    },
    {
      id: 'c6-bonus-d', kind: 'fraction', difficulty: 3,
      scenario: '냉동 보관 박스에 2⅖ 박스가 보관 중이야. 컴퓨터 시스템은 가분수만 인식해. 변환해줘.',
      prompt: '기약 가분수로 답해', hint: '2×5+2=12, 분모 5. 약분 X.',
      answer: { numerator: 12, denominator: 5 }, requireSimplified: true,
    },
    {
      id: 'c6-bonus-e', kind: 'fraction', difficulty: 3,
      scenario: '아스트로파지 3⅔ 박스를 분석실로 인계하려면 가분수 표기로 인계서에 적어야 해.',
      prompt: '기약 가분수로 답해', hint: '3×3+2=11, 분모 3.',
      answer: { numerator: 11, denominator: 3 }, requireSimplified: true,
    },
    {
      id: 'c6-bonus-f', kind: 'mcq', difficulty: 2,
      scenario: '센서가 가분수 9/4 박스로 잡혔어. 분석실은 대분수로 받아. 변환은?',
      prompt: '대분수 표기를 골라', hint: '9 = 4×2 + 1.',
      choices: ['1¾', '2¼', '2¾', '3¼', '1¼'],
      correctIndexes: [1], multiple: false,
    },
  ],
  7: [
    {
      // 다단계 역산
      id: 'c7-bonus-a', kind: 'multi', difficulty: 3,
      scenario: '귀환 잠금 — 결계 코드는 분자에 7 더하고 5로 약분하면 3/5 이 되는 분수야. 원래 기약 분수는?',
      prompt: '풀이 + 기약 답', hint: '3/5 = 15/25, 15-7.',
      workspacePlaceholder: '여기에 풀이 과정을 적어 보세요 (선택)',
      finalAnswer: { numerator: 8, denominator: 25 }, requireSimplified: true,
    },
    {
      // 다단계 역산
      id: 'c7-bonus-b', kind: 'multi', difficulty: 3,
      scenario: '여왕의 봉인을 풀기 위해 — 분자에 3을 더하고 7로 약분하니 2/3 이 됐어. 원래 기약 분수는?',
      prompt: '풀이 + 기약 답', hint: '2/3 = 14/21, 14-3.',
      workspacePlaceholder: '여기에 풀이 과정을 적어 보세요 (선택)',
      finalAnswer: { numerator: 11, denominator: 21 }, requireSimplified: true,
    },
    {
      // 대분수 합 응용
      id: 'c7-bonus-c', kind: 'fraction', difficulty: 3,
      scenario: '연합 함대의 무기 마력을 합산. 항해사 2¼, 로키 1⅔. 합쳐 봉인 일격을 가분수 기약으로!',
      prompt: '기약 가분수로 답해', hint: '9/4 + 5/3 = 27/12 + 20/12.',
      answer: { numerator: 47, denominator: 12 }, requireSimplified: true,
    },
    {
      // 대분수 차 응용
      id: 'c7-bonus-d', kind: 'fraction', difficulty: 3,
      scenario: '여왕의 잔여 체력은 3⅓ 이었는데, 1½ 만큼 봉인 일격을 가했어. 남은 체력을 가분수 기약으로!',
      prompt: '기약 가분수로 답해', hint: '10/3 - 3/2 = 20/6 - 9/6.',
      answer: { numerator: 11, denominator: 6 }, requireSimplified: true,
    },
    {
      // 분수 vs 소수 비교
      id: 'c7-bonus-e', kind: 'compare', difficulty: 3,
      scenario: '여왕의 환영 — 환영 A 는 11/16 광년, 환영 B 는 0.7 광년 거리에 있어. 진짜 여왕은 더 가까운 쪽.',
      prompt: '더 큰 쪽 (= 이면 등호) 선택', hint: '11/16 = 0.6875.',
      left: { numerator: 11, denominator: 16 }, right: { decimal: 0.7 },
      correctOp: '<',
    },
    {
      // 이분모 범위 응용
      id: 'c7-bonus-f', kind: 'numeric', difficulty: 3,
      scenario: '여왕 봉인 결계의 안전 진입 범위는 1/6 광년 ~ 5/8 광년. 분모 24 의 자연수 좌표 □ 는 몇 개?',
      prompt: '식: 1/6 < □/24 < 5/8 — 자연수 □ 의 개수',
      hint: '1/6 = 4/24, 5/8 = 15/24.',
      answer: 10, unit: '개',
    },
    {
      // 다단계 역산
      id: 'c7-bonus-g', kind: 'multi', difficulty: 3,
      scenario: '여왕의 마지막 함정 — 분자에 6을 더하고 5로 약분하니 4/5 가 됐어. 원래 기약 분수는?',
      prompt: '원래 분수 (기약)',
      hint: '5로 약분 후 4/5 → 약분 전 20/25. 분자 -6.',
      workspacePlaceholder: '여기에 풀이 과정을 적어 보세요 (선택)',
      finalAnswer: { numerator: 14, denominator: 25 }, requireSimplified: true,
    },
    {
      // 이분모 범위 응용
      id: 'c7-bonus-h', kind: 'numeric', difficulty: 3,
      scenario: '귀환 항로 — 1/3 광년 ~ 3/4 광년 사이의 분모 36 자연수 좌표 □ 는 몇 개?',
      prompt: '식: 1/3 < □/36 < 3/4 — 자연수 □ 의 개수',
      hint: '1/3 = 12/36, 3/4 = 27/36.',
      answer: 14, unit: '개',
    },
  ],
}

/** 챕터 진입 시 랜덤 1문항 선택 */
export const pickBonusProblem = (chapter: number): Problem => {
  const pool = POOLS[chapter]
  if (!pool || pool.length === 0) throw new Error(`No bonus pool for chapter ${chapter}`)
  return pool[Math.floor(Math.random() * pool.length)]
}

/** 하위 호환 — 첫 번째 문항 */
export const BONUS_PROBLEMS: Record<number, Problem> = Object.fromEntries(
  Object.entries(POOLS).map(([k, v]) => [k, v[0]]),
)
