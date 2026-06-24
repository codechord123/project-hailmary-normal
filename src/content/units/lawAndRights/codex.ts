/**
 * 권리 도감 — 단원의 핵심 개념을 "수집 카드"로 모으는 재미.
 * 챕터를 클리어하면 그 챕터의 카드가 도감에 해금된다(별도 저장 없이 진행도에서 파생).
 */
export interface CodexCard {
  term: string
  emoji: string
  desc: string
}

export interface CodexGroup {
  chapterId: string
  title: string
  cards: CodexCard[]
}

export const CODEX: CodexGroup[] = [
  {
    chapterId: 'law-rights-1',
    title: '법이 뭐길래?',
    cards: [
      { term: '법', emoji: '⚖️', desc: '사회 구성원이 함께 지키기로 한, 강제성이 있는 약속이에요.' },
      { term: '규칙', emoji: '📏', desc: '여러 사람이 함께 잘 지내려고 정한 약속이에요.' },
      { term: '강제성', emoji: '🔒', desc: '누구나 반드시 지켜야 하고, 어기면 제재를 받는 법의 특징이에요.' },
      { term: '제재', emoji: '🚫', desc: '법을 어겼을 때 받는 벌이나 불이익이에요.' },
    ],
  },
  {
    chapterId: 'law-rights-2',
    title: '법은 무슨 일을 할까',
    cards: [
      { term: '질서 유지', emoji: '🚦', desc: '사회가 어지럽지 않고 안정되게 지켜 주는 법의 역할이에요.' },
      { term: '권리 보호', emoji: '🛡️', desc: '사람들의 재산과 권리를 함부로 침해받지 않게 지켜 줘요.' },
      { term: '분쟁 해결', emoji: '🤝', desc: '다툼이 생겼을 때 공정한 기준으로 해결해 줘요.' },
      { term: '안전·환경 보호', emoji: '🚒', desc: '생명과 깨끗한 환경을 지켜 주는 법의 역할이에요.' },
    ],
  },
  {
    chapterId: 'law-rights-3',
    title: '여러 가지 법',
    cards: [
      { term: '저작권법', emoji: '🎨', desc: '글·음악·그림 같은 창작물을 함부로 못 쓰게 보호해요.' },
      { term: '도로 교통법', emoji: '🚗', desc: '차와 사람이 질서를 지켜 사고를 막도록 정한 법이에요.' },
      { term: '소방 기본법', emoji: '🔥', desc: '화재를 막고 위급할 때 생명과 재산을 지켜요.' },
      { term: '학교 급식법', emoji: '🍱', desc: '학생들이 건강하고 안전하게 밥을 먹도록 만든 법이에요.' },
    ],
  },
  {
    chapterId: 'law-rights-4',
    title: '인권이란 무엇일까',
    cards: [
      { term: '인권', emoji: '🌟', desc: '사람이면 누구나 태어날 때부터 가지는, 빼앗을 수 없는 권리예요.' },
      { term: '헌법', emoji: '📜', desc: '나라의 가장 기본이 되는 법으로, 국민의 기본권을 정해요.' },
      { term: '평등권', emoji: '⚖️', desc: '차별 없이 똑같이 대우받을 권리예요.' },
      { term: '자유권', emoji: '🕊️', desc: '국가의 간섭 없이 마음껏 생각하고 행동할 권리예요.' },
      { term: '참정권', emoji: '🗳️', desc: '선거 등 나라의 정치에 참여하는 권리예요.' },
      { term: '사회권', emoji: '🏠', desc: '인간답게 살도록 국가에 도움을 요구하는 권리예요.' },
      { term: '청구권', emoji: '📨', desc: '권리를 침해당했을 때 국가에 도움을 요구하는 권리예요.' },
    ],
  },
  {
    chapterId: 'law-rights-5',
    title: '인권을 지킨 사람들',
    cards: [
      { term: '방정환', emoji: '🧒', desc: '어린이도 존중받아야 한다며 \'어린이날\'을 만든 분이에요.' },
      { term: '마틴 루서 킹', emoji: '✊', desc: '피부색 차별에 맞서 평등을 외친 미국의 인물이에요.' },
      { term: '넬슨 만델라', emoji: '🕊️', desc: '남아프리카 공화국에서 흑인 차별에 맞서 싸웠어요.' },
      { term: '세계 인권 선언', emoji: '🌍', desc: '모든 사람이 존중받아야 한다고 전 세계가 함께 한 약속이에요.' },
    ],
  },
  {
    chapterId: 'law-rights-6',
    title: '인권을 지키는 방법',
    cards: [
      { term: '국가인권위원회', emoji: '🏛️', desc: '인권 침해를 조사하고 사람들의 인권을 지키는 국가 기관이에요.' },
      { term: '점자블록', emoji: '🟡', desc: '시각 장애인이 길을 안전하게 찾도록 돕는 편의 시설이에요.' },
      { term: '저상버스', emoji: '🚌', desc: '바닥을 낮춰 휠체어도 쉽게 타고 내리는 버스예요.' },
      { term: '어린이 보호 구역', emoji: '🚸', desc: '어린이가 안전하게 다니도록 지켜 주는 구역이에요.' },
    ],
  },
  {
    chapterId: 'law-rights-7',
    title: '절차의 달인',
    cards: [
      { term: '재판', emoji: '👨‍⚖️', desc: '다툼을 법에 따라 공정하게 가려 해결하는 과정이에요.' },
      { term: '입법(법 제정)', emoji: '🏢', desc: '국회에서 제안·토론·표결을 거쳐 새 법을 만드는 과정이에요.' },
      { term: '선거', emoji: '🗳️', desc: '후보 등록·공약·투표·개표를 거쳐 대표를 뽑는 과정이에요.' },
    ],
  },
]

/** 단원 전체 카드 수 */
export const codexTotal = (): number => CODEX.reduce((n, g) => n + g.cards.length, 0)

/** 클리어한 챕터 기준으로 모은 카드 수 */
export const codexCollected = (clearedChapterIds: string[]): number =>
  CODEX.filter((g) => clearedChapterIds.includes(g.chapterId)).reduce((n, g) => n + g.cards.length, 0)
