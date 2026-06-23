import type { ChapterDef } from '@/content/types'

/**
 * 챕터 5 — 「인권을 지킨 사람들」 (보스전)
 * 학습: 인권 신장에 힘쓴 인물, 옛날 인권 제도, 인권 존중·침해.
 * 서사: 인권을 무시하는 "편견 빌런"을 올바른 지식으로 무찌른다.
 */
export const chapter5: ChapterDef = {
  id: 'law-rights-5',
  title: '인권을 지킨 사람들',
  mechanic: 'boss',
  intro: '"권리는 내가 정하는 거야!" 편견 빌런이 나타났어요. 인권을 지킨 사람들의 이야기로 빌런을 무찔러요!',
  problems: [
    {
      id: 'c3-6', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: "어린이를 존중하자며 '어린이날'을 만들고 어린이 인권을 위해 힘쓴 인물은?",
      choices: ['방정환', '이태영', '허균', '세종대왕'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c3-7', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '우리나라 최초의 여성 변호사로, 여성의 인권을 위해 노력한 인물은?',
      choices: ['이태영', '신사임당', '유관순', '허난설헌'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c3-8', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '신분 차별이 없는 세상을 꿈꾸며 「홍길동전」을 지은 인물은?',
      choices: ['허균', '정약용', '김홍도', '이순신'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c3-9', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: "미국에서 흑인과 백인의 차별에 맞서 '나에게는 꿈이 있습니다' 연설을 한 인물은?",
      choices: ['마틴 루서 킹', '전태일', '방정환', '이태영'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c3-24', kind: 'mcq', difficulty: 3, source: '교육과정',
      prompt: '남아프리카 공화국에서 흑인 차별(아파르트헤이트)에 맞서 싸운 인물은?',
      choices: ['넬슨 만델라', '마틴 루서 킹', '간디', '링컨'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c3-18', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '가난하고 병든 사람들을 위해 평생을 바친 인물은?',
      choices: ['테레사 수녀', '마리 퀴리', '에디슨', '뉴턴'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c3-19', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '노동자의 권리를 위해 노력한 우리나라 인물은?',
      choices: ['전태일', '방정환', '허균', '이태영'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c3-10', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '옛날에 억울한 일을 당한 백성이 임금에게 알리려고 치던 북은?',
      choices: ['신문고', '꽹과리', '종', '장구'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c3-11', kind: 'mcq', difficulty: 3, source: '교육과정',
      prompt: '옛날에 백성의 억울함을 풀어 주기 위한 제도가 "아닌" 것은?',
      choices: ['신문고', '상소', '격쟁', '선거'],
      correctIndexes: [3], multiple: false,
    },
    {
      id: 'c3-12', kind: 'ox', difficulty: 1, source: '교육과정',
      statement: '옛날에도 백성의 억울함을 풀어 주려는 제도(신문고 등)가 있었다.',
      answer: true,
    },
    {
      id: 'c3-25', kind: 'mcq', difficulty: 3, source: '교육과정',
      prompt: '모든 사람이 존중받아야 한다고 세계가 함께 약속한 것은?',
      choices: ['세계 인권 선언', '학급 규칙', '교통 법규', '급식 메뉴'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c3-13', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '다음 중 인권이 침해된 경우는?',
      choices: ['친구를 외모로 놀리며 차별한다', '친구와 사이좋게 논다', '서로 존중하며 대화한다', '규칙을 함께 지킨다'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c3-14', kind: 'mcq', difficulty: 1, source: '교육과정',
      prompt: '인권을 존중하는 태도로 알맞은 것은?',
      choices: ['나와 다른 사람도 존중한다', '약한 사람을 무시한다', '내 권리만 주장한다', '함부로 차별한다'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c3-22', kind: 'mcq', difficulty: 1, source: '교육과정',
      prompt: '인권을 존중하는 사회의 모습으로 알맞은 것은?',
      choices: ['장애가 있어도 차별하지 않는다', '남자만 우대한다', '부자만 존중한다', '어른만 대우한다'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c3-23', kind: 'ox', difficulty: 1, source: '교육과정',
      statement: '외모나 성별이 다르다고 놀리거나 차별하는 것은 인권 침해이다.',
      answer: true,
    },
  ],
}
