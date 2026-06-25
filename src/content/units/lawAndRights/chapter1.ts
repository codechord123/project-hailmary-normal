import type { ChapterDef } from '@/content/types'

/**
 * 챕터 1 — 「법이 뭐길래?」 (디펜스)
 * 학습: 규칙과 법, 법의 의미, 법이 필요한 까닭, 법의 특징.
 * 서사: 규칙 없는 혼란이 밀려올 때, 알맞은 법 보기로 막아 도시를 지킨다.
 */
export const chapter1: ChapterDef = {
  id: 'law-rights-1',
  title: '법이 뭐길래?',
  mechanic: 'runner',
  concept: {
    title: '법과 규칙의 차이',
    points: [
      '규칙은 우리 반·도서관처럼 특정 곳에서만 지키는 약속이에요.',
      '법은 나라 모든 사람이 지켜야 하고, 어기면 국가가 강제로 처벌할 수 있어요.',
    ],
  },
  intro:
    '도시에 "혼란"이 밀려오고 있어요. 규칙과 법을 제대로 아는 수호자만이 이 물결을 막아낼 수 있어요. 준비됐나요?',
  story: [
    '평화롭던 도시에 "혼란"의 물결이 몰려오기 시작했어요.',
    '규칙도 법도 없으면 모두가 위험해져요.',
    '권리 수호자여, 알맞은 법으로 혼란을 막아 도시를 지켜요!',
  ],
  problems: [
    // ── 원본 샘플 ──
    {
      id: 'c1-1', kind: 'mcq', difficulty: 1, source: '1회 1번',
      scenario: '"관람 중에 휴대 전화를 사용하지 않습니다." 라는 규칙이 적힌 표지판이 떠올랐어요.',
      prompt: '이 규칙을 지켜야 할 장소는 어디일까요?',
      choices: ['시장', '공원', '식당', '영화관', '피시방'],
      correctIndexes: [3], multiple: false,
      hint: '어두운 곳에서 조용히 무언가를 "관람"하는 장소!',
    },
    {
      id: 'c1-2', kind: 'mcq', difficulty: 2, source: '1회 2번(서술→보기)',
      scenario: '법은 강제성이 있어서 사회 구성원은 반드시 법을 지켜야 해요.',
      prompt: '법을 지키지 않으면 국가로부터 무엇을 받을까요?',
      choices: ['칭찬', '제재', '선물', '휴식'],
      correctIndexes: [1], multiple: false,
      hint: '벌이나 불이익 같은 것을 뜻하는 말이에요.',
    },
    {
      id: 'c1-3a', kind: 'ox', difficulty: 1, source: '1회 3-(1)번',
      statement: '사회의 혼란을 막고 질서를 유지하기 위해 법이 생겨났다.',
      answer: true,
    },
    {
      id: 'c1-3b', kind: 'ox', difficulty: 2, source: '1회 3-(2)번',
      statement: '상점에서 물건값을 내지 않고 가져가는 상황은 법이 필요하지 않은 상황이다.',
      answer: false,
      hint: '남의 물건을 그냥 가져가면 어떻게 될까요?',
    },
    {
      id: 'c1-4', kind: 'mcq', difficulty: 2, source: '1회 4번',
      prompt: '다음 중 법이 필요한 상황으로 볼 수 있는 것은?',
      choices: [
        '형제끼리 말다툼하는 상황',
        '이웃 어른께 인사하지 않는 상황',
        '차에서 안전벨트를 하지 않는 상황',
        '길에 떨어진 쓰레기를 줍지 않는 상황',
        '지하철에서 노약자에게 자리를 양보하지 않는 상황',
      ],
      correctIndexes: [2], multiple: false,
      hint: '안전·생명과 직접 관련되어, 어기면 처벌받는 상황을 찾아요.',
    },
    {
      id: 'c1-5', kind: 'mcq', difficulty: 2, source: '1회 11번',
      scenario: '많은 사람이 함께 사는 사회에서는 갈등이나 다툼이 생길 수 있어요.',
      prompt: '이런 문제가 생겼을 때, 법은 사람들 사이의 갈등을 해결하는 무엇이 될까요?',
      choices: ['기준', '권리'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c1-6', kind: 'mcq', difficulty: 1, source: '1회 12번',
      prompt: '개인 사이에 다툼이 생겼을 때 무엇에 따라 재판하여 해결할까요?',
      choices: ['힘', '법', '양심', '생명', '합의'],
      correctIndexes: [1], multiple: false,
    },

    // ── 교육과정 반영 확장 ──
    {
      id: 'c1-7', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '사회 구성원이 함께 지키기로 약속하여 만든, 강제성이 있는 규칙을 무엇이라고 할까요?',
      choices: ['도덕', '법', '예절', '약속'],
      correctIndexes: [1], multiple: false,
    },
    {
      id: 'c1-8', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '법이 도덕이나 양심과 다른 가장 큰 특징은 무엇일까요?',
      choices: [
        '지키지 않아도 아무 일이 없다',
        '어기면 제재(처벌)를 받는다',
        '어른만 지키면 된다',
        '학교에서만 적용된다',
      ],
      correctIndexes: [1], multiple: false,
      hint: '법에는 "강제성"이 있어요.',
    },
    {
      id: 'c1-9', kind: 'ox', difficulty: 2, source: '교육과정',
      statement: '법은 사회가 변하면 새로 만들어지거나 고쳐지기도 한다.',
      answer: true,
    },
    {
      id: 'c1-10', kind: 'ox', difficulty: 1, source: '교육과정',
      statement: '법은 한 번 정해지면 절대 바뀌지 않는다.',
      answer: false,
    },
    {
      id: 'c1-11', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '법이 필요한 까닭으로 알맞은 것을 모두 고르세요.',
      choices: [
        '사회 질서를 유지하기 위해',
        '사람들 사이의 갈등을 해결하기 위해',
        '개인의 권리를 보호하기 위해',
        '힘센 사람이 마음대로 하기 위해',
      ],
      correctIndexes: [0, 1, 2], multiple: true,
    },
    {
      id: 'c1-12', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '법이 없다면 우리 사회에 일어날 수 있는 일은?',
      choices: [
        '다툼이 생겨도 공정하게 해결하기 어렵다',
        '모두가 늘 안전하게 생활한다',
        '질서가 저절로 잘 지켜진다',
        '권리가 알아서 잘 보호된다',
      ],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c1-13', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '다음 중 법으로 정해 강제하지 "않는" 것은?',
      choices: [
        '빨간불에 길을 건너지 않기',
        '웃어른께 인사하기',
        '남의 물건을 훔치지 않기',
        '교통 신호 지키기',
      ],
      correctIndexes: [1], multiple: false,
      hint: '인사는 법이 아니라 "도덕·예절"이에요.',
    },
    {
      id: 'c1-14', kind: 'mcq', difficulty: 1, source: '교육과정',
      prompt: '법을 어겼을 때 받게 되는 것은?',
      choices: ['상', '제재(처벌)', '칭찬', '무시'],
      correctIndexes: [1], multiple: false,
    },
    {
      id: 'c1-15', kind: 'mcq', difficulty: 1, source: '교육과정',
      prompt: '법은 누가 지켜야 할까요?',
      choices: ['어른만', '학생만', '사회 구성원 모두', '공무원만'],
      correctIndexes: [2], multiple: false,
    },
    {
      id: 'c1-16', kind: 'mcq', difficulty: 1, source: '교육과정',
      scenario: '"큰 소리로 떠들지 않습니다." 라는 규칙이 있어요.',
      prompt: '이 규칙이 꼭 필요한 장소는?',
      choices: ['도서관', '놀이터', '운동장', '시장'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c1-17', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '다음 중 법이 필요한 상황은?',
      choices: [
        '친구와 사이좋게 지내지 않는 것',
        '신호를 무시하고 길을 건너는 것',
        '방 청소를 하지 않는 것',
        '지각을 자주 하는 것',
      ],
      correctIndexes: [1], multiple: false,
    },
    {
      id: 'c1-18', kind: 'ox', difficulty: 1, source: '교육과정',
      statement: '교통 신호를 지키는 것은 법을 지키는 행동이다.',
      answer: true,
    },
    {
      id: 'c1-19', kind: 'ox', difficulty: 1, source: '교육과정',
      statement: '법을 잘 지키면 사회가 더 안전하고 질서 있게 유지된다.',
      answer: true,
    },
    {
      id: 'c1-20', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '사람들 사이에 다툼이 생겼을 때, 공정하게 해결하는 기준이 되어 주는 것은?',
      choices: ['힘', '법', '나이', '돈'],
      correctIndexes: [1], multiple: false,
    },
    {
      id: 'c1-21', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: "법의 '강제성'이란 무슨 뜻일까요?",
      choices: [
        '지키든 안 지키든 자유다',
        '반드시 지켜야 하고 어기면 제재를 받는다',
        '어른만 지킨다',
        '상황에 따라 마음대로 한다',
      ],
      correctIndexes: [1], multiple: false,
    },
    {
      id: 'c1-22', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '다음 중 법이 있어서 보호받는 경우는?',
      choices: [
        '내가 산 물건의 값을 정당하게 치를 때',
        '남의 창작물을 함부로 베껴 쓸 때',
        '신호를 무시하고 운전할 때',
        '쓰레기를 아무 데나 버릴 때',
      ],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c1-23', kind: 'ox', difficulty: 1, source: '교육과정',
      statement: '남의 물건을 허락 없이 가져가는 것은 법을 어기는 행동이다.',
      answer: true,
    },
    {
      id: 'c1-24', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '규칙과 법의 공통점으로 알맞은 것은?',
      choices: [
        '여러 사람이 함께 잘 지내기 위해 지키는 약속이다',
        '혼자만 지키면 되는 것이다',
        '지키지 않아도 괜찮은 것이다',
        '놀이를 위한 것일 뿐이다',
      ],
      correctIndexes: [0], multiple: false,
    },
  ],
}
