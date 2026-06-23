import type { ChapterDef } from '@/content/types'

/**
 * 챕터 4 — 「인권을 지키는 방법」 (최종보스)
 * 학습: 인권 보장의 모습, 권리의 종류(참정권·사회권·평등권 등).
 * 서사: 단원 마무리! "권리침해 대마왕"을 종합 문제로 쓰러뜨리는 클라이맥스.
 */
export const chapter4: ChapterDef = {
  id: 'law-rights-4',
  title: '인권을 지키는 방법',
  mechanic: 'finalboss',
  intro:
    '마지막 관문! 사람들의 권리를 빼앗으려는 "권리침해 대마왕"과의 결전이에요. 그동안 배운 모든 것을 쏟아부어요!',
  problems: [
    {
      id: 'c4-17', kind: 'mcq', difficulty: 2, source: '1회 17번',
      scenario: '"국가의 정치 의사 형성 과정에 참여할 수 있습니다."',
      prompt: '이와 관련된 인권 보장 모습으로 알맞은 것은?',
      choices: [
        '선거권을 가지고 투표한다.',
        '자신이 원하는 직업을 선택한다.',
        '법관으로부터 법에 따른 재판을 받는다.',
        '자신이 원하는 곳으로 자유롭게 이동한다.',
        '직원 채용에서 성별, 나이 등으로 차별받지 않는다.',
      ],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c4-18', kind: 'mcq', difficulty: 3, source: '1회 18번',
      scenario: '"건강하고 쾌적한 환경에서 생활합니다."',
      prompt: '이 설명에서 알 수 있는 인권 보장의 모습으로 옳은 것은?',
      choices: [
        '선거에 후보로 출마한다.',
        '모든 국민이 차별받지 않고 동등하게 대우받는다.',
        '더 나은 삶을 살 수 있도록 국가에 요구할 수 있다.',
        '권리가 침해되었을 때 국가에 일정한 행위를 요구할 수 있다.',
        '국가의 간섭을 받지 않고 자유롭게 생각하고 행동할 수 있다.',
      ],
      correctIndexes: [2], multiple: false,
    },
    {
      id: 'c4-19a', kind: 'mcq', difficulty: 2, source: '1회 19번 ㉠',
      scenario: '"국민은 ㉠에 따라 ㉡하게 교육을 받을 수 있습니다."',
      prompt: '㉠에 들어갈 알맞은 말은?',
      choices: ['능력', '재산'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c4-19b', kind: 'mcq', difficulty: 2, source: '1회 19번 ㉡',
      scenario: '"국민은 능력에 따라 ㉡하게 교육을 받을 수 있습니다."',
      prompt: '㉡에 들어갈 알맞은 말은?',
      choices: ['균등', '차등'],
      correctIndexes: [0], multiple: false,
    },
  ],
}
