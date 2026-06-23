import type { ChapterDef } from '@/content/types'

/**
 * 챕터 6 — 「인권을 지키는 방법」 (최종보스)
 * 학습: 인권 보장의 모습, 기본권(평등·자유·참정·사회·청구권), 생활 속 인권 보장.
 * 서사: 단원 마무리! "권리침해 대마왕"을 종합 문제로 쓰러뜨리는 클라이맥스.
 */
export const chapter6: ChapterDef = {
  id: 'law-rights-6',
  title: '인권을 지키는 방법',
  mechanic: 'finalboss',
  intro: '마지막 관문! 사람들의 권리를 빼앗으려는 "권리침해 대마왕"과의 결전이에요. 배운 모든 것을 쏟아부어요!',
  story: [
    '마지막 결전! "권리침해 대마왕"이 모두의 권리를 빼앗으려 해요.',
    '평등권·자유권·참정권·사회권·청구권… 우리가 지켜야 할 권리들.',
    '그동안 배운 모든 힘을 모아, 권리 수호자의 이름으로 막아내자!',
  ],
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
      choices: ['능력', '재산'], correctIndexes: [0], multiple: false,
    },
    {
      id: 'c4-19b', kind: 'mcq', difficulty: 2, source: '1회 19번 ㉡',
      scenario: '"국민은 능력에 따라 ㉡하게 교육을 받을 수 있습니다."',
      prompt: '㉡에 들어갈 알맞은 말은?',
      choices: ['균등', '차등'], correctIndexes: [0], multiple: false,
    },
    {
      id: 'c4-1', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '선거에 참여해 투표할 수 있는 권리를 무엇이라 하나요?',
      choices: ['참정권', '자유권', '평등권', '청구권'], correctIndexes: [0], multiple: false,
    },
    {
      id: 'c4-2', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '모든 국민이 차별받지 않고 동등하게 대우받을 권리는?',
      choices: ['평등권', '자유권', '참정권', '사회권'], correctIndexes: [0], multiple: false,
    },
    {
      id: 'c4-3', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '국가의 간섭 없이 자유롭게 생각하고 행동할 권리는?',
      choices: ['자유권', '평등권', '청구권', '사회권'], correctIndexes: [0], multiple: false,
    },
    {
      id: 'c4-4', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '인간다운 생활을 할 수 있도록 국가에 요구할 수 있는 권리는?',
      choices: ['사회권', '자유권', '참정권', '평등권'], correctIndexes: [0], multiple: false,
    },
    {
      id: 'c4-5', kind: 'mcq', difficulty: 3, source: '교육과정',
      prompt: '권리가 침해되었을 때 국가에 도움(재판 등)을 요구할 수 있는 권리는?',
      choices: ['청구권', '참정권', '자유권', '평등권'], correctIndexes: [0], multiple: false,
    },
    {
      id: 'c4-10', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '국민의 기본권을 보장한다고 정해 놓은, 나라의 가장 기본이 되는 법은?',
      choices: ['헌법', '학칙', '교통법', '급식법'], correctIndexes: [0], multiple: false,
    },
    {
      id: 'c4-11', kind: 'ox', difficulty: 1, source: '교육과정',
      statement: '헌법에는 국민의 기본적인 권리(기본권)가 정해져 있다.', answer: true,
    },
    {
      id: 'c4-25', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '다음 중 헌법이 보장하는 기본권이 "아닌" 것은?',
      choices: ['평등권', '자유권', '참정권', '차별권'], correctIndexes: [3], multiple: false,
    },
    {
      id: 'c4-12', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '참정권을 행사하는 모습으로 알맞은 것은?',
      choices: ['선거에서 투표한다', '자유롭게 여행한다', '차별받지 않는다', '재판을 청구한다'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c4-13', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '사회권과 관련 있는 모습으로 알맞은 것은?',
      choices: ['건강하고 쾌적한 환경에서 산다', '선거에 출마한다', '자유롭게 종교를 믿는다', '차별받지 않는다'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c4-14', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '평등권이 보장되는 모습으로 알맞은 것은?',
      choices: ['남녀 차별 없이 똑같이 기회를 준다', '마음대로 이동한다', '투표를 한다', '재판을 받는다'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c4-15', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '자유권이 보장되는 모습으로 알맞은 것은?',
      choices: ['원하는 직업을 자유롭게 선택한다', '국가에 생활을 요구한다', '투표한다', '차별받지 않는다'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c4-16', kind: 'ox', difficulty: 1, source: '교육과정',
      statement: '교육을 받을 권리는 인권 보장의 한 모습이다.', answer: true,
    },
    {
      id: 'c4-6', kind: 'mcq', difficulty: 1, source: '교육과정',
      figure: '바닥에 노란색 점자블록이 깔린 길의 그림',
      prompt: '시각 장애인이 안전하게 다니도록 바닥에 설치한 것은?',
      choices: ['점자블록', '과속 방지턱', '신호등', '계단'], correctIndexes: [0], multiple: false,
    },
    {
      id: 'c4-7', kind: 'mcq', difficulty: 1, source: '교육과정',
      prompt: '휠체어를 탄 사람도 쉽게 타고 내리도록 바닥을 낮춘 버스는?',
      choices: ['저상버스', '관광버스', '스쿨버스', '2층버스'], correctIndexes: [0], multiple: false,
    },
    {
      id: 'c4-8', kind: 'mcq', difficulty: 1, source: '교육과정',
      prompt: '장애가 있는 사람을 위해 마련한 주차 공간은?',
      choices: ['장애인 전용 주차 구역', '일반 주차장', '자전거 보관소', '버스 정류장'], correctIndexes: [0], multiple: false,
    },
    {
      id: 'c4-20', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '학교 앞 어린이 보호 구역은 무엇을 지키기 위한 것일까요?',
      choices: ['어린이의 안전(인권)', '어른의 편의', '상점의 이익', '자동차의 빠른 속도'], correctIndexes: [0], multiple: false,
    },
    {
      id: 'c4-22', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '생활 속에서 인권을 보장하는 시설을 모두 고르세요.',
      choices: ['점자블록', '저상버스', '장애인 전용 주차 구역', '담배 자판기'],
      correctIndexes: [0, 1, 2], multiple: true,
    },
    {
      id: 'c4-23', kind: 'ox', difficulty: 1, source: '교육과정',
      statement: '공공장소에 점자블록이나 경사로(휠체어 길)를 두는 것은 인권을 보장하기 위한 노력이다.', answer: true,
    },
    {
      id: 'c4-9', kind: 'mcq', difficulty: 3, source: '교육과정',
      prompt: '인권 침해를 조사하고 인권을 보호하기 위해 만든 국가 기관은?',
      choices: ['국가인권위원회', '기상청', '우체국', '소방서'], correctIndexes: [0], multiple: false,
    },
    {
      id: 'c4-21', kind: 'mcq', difficulty: 1, source: '교육과정',
      prompt: '인권을 지키기 위한 노력으로 알맞은 것은?',
      choices: ['인권 존중 캠페인·공익광고를 한다', '약한 사람을 무시한다', '차별을 모른 척한다', '규칙을 어긴다'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c4-24', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '인권을 침해당했을 때 할 수 있는 행동으로 알맞은 것은?',
      choices: ['국가인권위원회 등에 도움을 요청한다', '그냥 참는다', '똑같이 갚아 준다', '숨긴다'],
      correctIndexes: [0], multiple: false,
    },
  ],
}
