import type { ChapterDef } from '@/content/types'

/**
 * 챕터 1 — 「법이 뭐길래?」 (디펜스)
 * 학습: 규칙과 법, 법이 필요한 까닭.
 * 서사: 규칙 없는 혼란이 밀려올 때, 알맞은 법 보기로 막아 도시를 지킨다.
 */
export const chapter1: ChapterDef = {
  id: 'law-rights-1',
  title: '법이 뭐길래?',
  mechanic: 'defense',
  intro:
    '도시에 "혼란"이 밀려오고 있어요. 규칙과 법을 제대로 아는 수호자만이 이 물결을 막아낼 수 있어요. 준비됐나요?',
  problems: [
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
  ],
}
