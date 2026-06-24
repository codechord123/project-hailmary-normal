import type { ChapterDef } from '@/content/types'

/**
 * 챕터 4 — 「인권이란 무엇일까」 (OX 번개)
 * 학습: 인권의 의미와 특징(천부성·보편성·불가침성).
 * 서사: 빠르게 다가오는 진술을 OX로 판단해 인권 지식을 증명한다.
 */
export const chapter4: ChapterDef = {
  id: 'law-rights-4',
  title: '인권이란 무엇일까',
  mechanic: 'oxrush',
  intro: '인권에 대한 진술이 번개처럼 지나가요! 맞으면 ⭕, 틀리면 ❌ — 빠르게 판단해요.',
  story: [
    '편견의 안개가 번개처럼 몰려와요!',
    '인권에 대한 진실과 거짓을 빠르게 가려내야 해요.',
    '⭕와 ❌로 번개처럼 판단해, 안개를 걷어내자!',
  ],
  problems: [
    // OX (번개에서 사용)
    { id: 'ir-1', kind: 'ox', difficulty: 1, source: '교육과정', statement: '인권은 사람이라면 누구나 가진다.', answer: true },
    { id: 'ir-2', kind: 'ox', difficulty: 1, source: '교육과정', statement: '인권은 어른이 되어야만 생긴다.', answer: false },
    { id: 'ir-3', kind: 'ox', difficulty: 1, source: '교육과정', statement: '인권은 돈으로 사고팔 수 있다.', answer: false },
    { id: 'ir-4', kind: 'ox', difficulty: 1, source: '교육과정', statement: '인권은 다른 사람이 함부로 빼앗을 수 없다.', answer: true },
    { id: 'ir-5', kind: 'ox', difficulty: 1, source: '교육과정', statement: '남자와 여자의 인권은 서로 다르다.', answer: false },
    { id: 'ir-6', kind: 'ox', difficulty: 1, source: '교육과정', statement: '어린이도 어른과 똑같이 인권을 가진다.', answer: true },
    { id: 'ir-7', kind: 'ox', difficulty: 1, source: '교육과정', statement: '장애가 있는 사람은 인권이 없다.', answer: false },
    { id: 'ir-8', kind: 'ox', difficulty: 1, source: '교육과정', statement: '모든 사람은 태어날 때부터 똑같이 존엄하다.', answer: true },
    { id: 'c3-2', kind: 'ox', difficulty: 1, source: '교육과정', statement: '인권은 사람이라면 누구나 태어날 때부터 가진다.', answer: true },
    { id: 'c3-3', kind: 'ox', difficulty: 2, source: '교육과정', statement: '인권은 다른 사람이 힘으로 함부로 빼앗을 수 있다.', answer: false },
    { id: 'c3-20', kind: 'ox', difficulty: 1, source: '교육과정', statement: '인권은 어른이 되어야만 생기는 권리이다.', answer: false },
    { id: 'c3-15', kind: 'ox', difficulty: 1, source: '교육과정', statement: '남자와 여자, 어린이와 어른 모두 똑같이 존중받아야 한다.', answer: true },
    // ── 심화(헷갈리기 쉬운) OX ──
    { id: 'ir-9', kind: 'ox', difficulty: 3, source: '교육과정', statement: '인권은 법으로 정해야만 비로소 생기는 권리이다.', answer: false },
    { id: 'ir-10', kind: 'ox', difficulty: 3, source: '교육과정', statement: '다수가 동의하면 한 사람의 인권을 빼앗아도 된다.', answer: false },
    { id: 'ir-11', kind: 'ox', difficulty: 3, source: '교육과정', statement: '의무를 다한 사람에게만 인권이 주어진다.', answer: false },
    { id: 'ir-12', kind: 'ox', difficulty: 2, source: '교육과정', statement: '다른 나라에서 온 사람도 인권을 존중받아야 한다.', answer: true },
    { id: 'ir-13', kind: 'ox', difficulty: 3, source: '교육과정', statement: '인권은 한 번 보장되면 다시는 침해되지 않는다.', answer: false },
    { id: 'ir-14', kind: 'ox', difficulty: 2, source: '교육과정', statement: '내가 남의 인권을 존중하면 나의 권리도 함께 보호된다.', answer: true },

    // 객관식 (카드 풀이/복습용)
    {
      id: 'c3-1', kind: 'mcq', difficulty: 1, source: '교육과정',
      prompt: '인권이란 무엇일까요?',
      choices: [
        '사람이라면 누구나 태어나면서부터 가지는 기본적인 권리',
        '어른이 되어야 생기는 권리',
        '돈을 주고 사는 권리',
        '나라가 골라 준 사람만 갖는 권리',
      ],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c3-16', kind: 'mcq', difficulty: 2, source: '1회 16번',
      prompt: '인권의 특징으로 알맞은 것을 두 가지 고르세요.',
      choices: [
        '나라에서 허락한 권리이다.',
        '어른에게만 주어지는 권리이다.',
        '재산이 많은 사람이 누리는 권리이다.',
        '사람이라면 누구나 태어날 때부터 가지는 권리이다.',
        '다른 사람이 힘이나 권력으로 함부로 빼앗을 수 없는 권리이다.',
      ],
      correctIndexes: [3, 4], multiple: true,
    },
    {
      id: 'c3-4', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '인권에 대한 설명으로 알맞은 것은?',
      choices: ['남자만 가진다', '어린이도 똑같이 가진다', '부자만 가진다', '어른만 가진다'],
      correctIndexes: [1], multiple: false,
    },
    {
      id: 'c3-5', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '인권의 특징으로 알맞은 것을 모두 고르세요.',
      choices: ['태어날 때부터 가진다', '모든 사람이 똑같이 가진다', '함부로 빼앗을 수 없다', '힘센 사람만 가진다'],
      correctIndexes: [0, 1, 2], multiple: true,
    },
    {
      id: 'c3-21', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: "'인권은 태어날 때부터 가진다'는 말의 뜻으로 알맞은 것은?",
      choices: ['누가 주지 않아도 사람이면 당연히 가진다', '나라가 허락해야 가진다', '시험을 봐야 가진다', '돈을 내야 가진다'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c3-17', kind: 'mcq', difficulty: 1, source: '교육과정',
      prompt: '어린이의 인권에 대한 설명으로 알맞은 것은?',
      choices: ['어린이도 존중받아야 할 인권을 가진다', '어린이는 인권이 없다', '어른이 되면 생긴다', '어린이는 보호만 받으면 된다'],
      correctIndexes: [0], multiple: false,
    },
  ],
}
