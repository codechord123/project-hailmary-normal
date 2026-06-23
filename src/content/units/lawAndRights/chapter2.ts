import type { ChapterDef } from '@/content/types'

/**
 * 챕터 2 — 「법은 무슨 일을 할까」 (매칭)
 * 학습: 법의 역할(질서·권리·분쟁·환경), 여러 법의 사례.
 * 서사: 흩어진 법 카드와 그 역할 카드를 짝지어 도시의 질서를 복구한다.
 */
export const chapter2: ChapterDef = {
  id: 'law-rights-2',
  title: '법은 무슨 일을 할까',
  mechanic: 'matching',
  intro:
    '도시의 법전이 뒤섞여버렸어요! 각 법과 그 법이 하는 일을 알맞게 이어 붙여 법전을 되살려요.',
  problems: [
    // ── 짝짓기 세트 ──
    {
      id: 'c2-match', kind: 'matching', difficulty: 2, source: '1회 6·7·8·10번 종합',
      prompt: '법과 그 법이 하는 일을 알맞게 짝지어요.',
      pairs: [
        { left: '학교 급식법', right: '학교에서 건강하고 안전하게 생활' },
        { left: '저작권법', right: '창작물 이용 시 정당한 비용을 냄' },
        { left: '소방 기본법', right: '화재를 예방하고 생명·재산을 보호' },
        { left: '경찰관 직무 집행법', right: '사회 질서를 유지하고 국민 안전을 지킴' },
        { left: '자연환경 보전법', right: '생태계와 자연환경을 보호' },
        { left: '초·중등 교육법', right: '학교에서 공부할 권리를 보장' },
      ],
    },
    {
      id: 'c2-match2', kind: 'matching', difficulty: 2, source: '교육과정',
      prompt: '법과 그 법이 보호하는 것을 알맞게 짝지어요.',
      pairs: [
        { left: '도로 교통법', right: '교통질서를 지켜 안전을 보호' },
        { left: '식품 안전 기본법', right: '안전한 먹거리를 보장' },
        { left: '장애인 차별 금지법', right: '장애인이 차별받지 않도록 보호' },
        { left: '소비자 기본법', right: '소비자의 권리를 보호' },
        { left: '어린이 놀이 시설 안전 관리법', right: '놀이 시설을 안전하게 관리' },
      ],
    },
    {
      id: 'c2-match3', kind: 'matching', difficulty: 3, source: '교육과정',
      prompt: '법의 역할과 그 예를 알맞게 짝지어요.',
      pairs: [
        { left: '개인의 권리 보호', right: '저작권법으로 창작물을 보호' },
        { left: '사회 질서 유지', right: '도로 교통법으로 교통질서를 지킴' },
        { left: '분쟁(갈등) 해결', right: '재판으로 다툼을 공정하게 해결' },
        { left: '안전·환경 보호', right: '자연환경 보전법으로 생태계를 보호' },
      ],
    },

    // ── 원본 샘플 (객관식·OX) ──
    {
      id: 'c2-7', kind: 'mcq', difficulty: 2, source: '1회 7번',
      figure: '한 사람이 컴퓨터로 창작물을 이용하며 "다른 사람의 창작물을 이용할 때는 정당한 비용을 내야 해." 라고 말하는 그림',
      prompt: '이 그림과 관련 있는 법으로 알맞은 것은?',
      choices: ['건축법', '의료법', '저작권법', '도로 교통법', '식품 안전 기본법'],
      correctIndexes: [2], multiple: false,
    },
    {
      id: 'c2-8', kind: 'mcq', difficulty: 2, source: '1회 8번(서술→보기)',
      scenario: '경찰관이 「경찰관 직무 집행법」에 따라 순찰을 나갑니다.',
      prompt: '이 법이 우리 생활에 주는 영향으로 알맞은 것은?',
      choices: [
        '사회 질서를 유지하고 국민의 안전을 지켜 준다',
        '개인의 재산을 마음대로 빼앗는다',
        '교통사고가 자주 일어나게 한다',
        '창작물을 공짜로 쓰게 해 준다',
      ],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c2-9', kind: 'mcq', difficulty: 2, source: '1회 9번',
      prompt: '생태계와 자연환경을 보호하고 국민이 건강한 생활을 하도록 정한 법은?',
      choices: ['소비자 기본법', '자연환경 보전법'],
      correctIndexes: [1], multiple: false,
    },
    {
      id: 'c2-10', kind: 'mcq', difficulty: 2, source: '1회 10번',
      prompt: '「소방 기본법」을 정해 놓은 까닭으로 알맞은 것은?',
      choices: [
        '안전한 식생활을 보장하기 위해서',
        '도로에서 일어나는 위험과 장애를 막기 위해서',
        '화재를 예방하고 위급한 상황에서 국민의 생명과 재산을 보호하기 위해서',
      ],
      correctIndexes: [2], multiple: false,
    },
    {
      id: 'c2-6a', kind: 'ox', difficulty: 2, source: '1회 6-(1)번',
      statement: '「학교 급식법」과 「어린이 놀이 시설 안전 관리법」은 튼튼하고 안전한 "건물"에서 생활하기 위해 만들었다.',
      answer: false,
    },
    {
      id: 'c2-6b', kind: 'ox', difficulty: 1, source: '1회 6-(2)번',
      statement: '「학교 급식법」은 학교에서 건강하고 안전하게 생활할 수 있도록 만들었다.',
      answer: true,
    },
    {
      id: 'c2-13a', kind: 'ox', difficulty: 3, source: '1회 13-(1)번',
      statement: '"범죄나 사고를 예방한다"는 것은 개인의 권리 보호와 직접 관련된 법의 역할이다.',
      answer: false,
      hint: '예방은 사회 질서 유지에 가까워요.',
    },
    {
      id: 'c2-13b', kind: 'ox', difficulty: 2, source: '1회 13-(2)번',
      statement: '"사고로부터 개인의 생명을 보호한다"는 것은 개인의 권리 보호와 관련된 법의 역할이다.',
      answer: true,
    },
    {
      id: 'c2-14', kind: 'mcq', difficulty: 2, source: '1회 14번',
      prompt: '법의 역할로 알맞은 것을 모두 고르세요.',
      choices: ['개인의 재산을 보호한다', '공정한 경제 질서를 유지한다', '교통사고가 자주 발생하게 한다'],
      correctIndexes: [0, 1], multiple: true,
    },
    {
      id: 'c2-15', kind: 'mcq', difficulty: 2, source: '1회 15번',
      scenario: '법은 깨끗하고 쾌적한 환경에서 생활할 수 있도록 환경을 보호하는 것과 같이 무언가를 유지하는 역할을 해요.',
      prompt: '빈칸에 들어갈 알맞은 말은?',
      choices: ['사회 질서', '사회 혼란'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c2-5', kind: 'mcq', difficulty: 2, source: '1회 5번',
      prompt: '「초·중등 교육법」이 우리 생활에 주는 영향을 바르게 말한 친구는?',
      choices: ['아름: 학교에서 공부할 수 있어.', '수민: 안전하게 등교할 수 있어.'],
      correctIndexes: [0], multiple: false,
      hint: '교육법은 "교육(공부)"과 관련 있어요.',
    },
    {
      id: 'c2-20', kind: 'mcq', difficulty: 2, source: '1회 20번(서술→보기)',
      figure: '한 사람이 컴퓨터로 다른 사람의 글을 베끼며 "내가 작성했는지 모를 거야." 라고 말하는 그림',
      prompt: '이 상황에서 법(저작권)을 지키려면 어떻게 행동해야 할까요?',
      choices: [
        '다른 사람의 글을 내 것처럼 베껴 쓴다',
        '출처를 밝히고 정당하게 이용한다',
        '몰래 사용하고 들키지 않게 숨긴다',
        '비용을 내지 않고 가져온다',
      ],
      correctIndexes: [1], multiple: false,
    },

    // ── 교육과정 반영 확장 ──
    {
      id: 'c2-21', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '법의 역할로 알맞지 "않은" 것은?',
      choices: ['개인의 권리 보호', '사회 질서 유지', '사람들 사이 갈등 해결', '힘센 사람에게 특혜 주기'],
      correctIndexes: [3], multiple: false,
    },
    {
      id: 'c2-22', kind: 'mcq', difficulty: 2, source: '교육과정',
      scenario: '교통사고를 막기 위해 신호등과 횡단보도를 두고 도로 교통법을 지키게 합니다.',
      prompt: '이는 법의 어떤 역할일까요?',
      choices: ['사회 질서 유지와 안전 보호', '창작물 보호', '선거 참여', '교육 제공'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c2-23', kind: 'mcq', difficulty: 1, source: '교육과정',
      prompt: '「저작권법」은 무엇을 보호하나요?',
      choices: ['사람이 만든 창작물(글·음악·그림 등)', '도로의 신호', '음식의 안전', '자연환경'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c2-24', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '「도로 교통법」을 만든 까닭으로 알맞은 것은?',
      choices: [
        '교통질서를 지켜 사고를 막고 안전을 보호하려고',
        '창작물을 보호하려고',
        '학교 급식을 관리하려고',
        '선거를 하려고',
      ],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c2-25', kind: 'mcq', difficulty: 1, source: '교육과정',
      figure: '학교 앞 도로에 "어린이 보호 구역, 속도를 줄이세요" 표지판이 있는 그림',
      prompt: '이와 관련 있는 것으로 알맞은 것은?',
      choices: ['어린이 교통안전을 위한 보호 구역(스쿨존)', '어른 전용 도로', '자전거 경주장', '주차장'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c2-26', kind: 'mcq', difficulty: 1, source: '교육과정',
      prompt: '「식품 안전 기본법」이 우리에게 주는 도움은?',
      choices: ['안전한 먹거리를 먹을 수 있다', '자유롭게 이동할 수 있다', '선거에 참여할 수 있다', '창작물을 만들 수 있다'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c2-27', kind: 'ox', difficulty: 1, source: '교육과정',
      statement: '법은 개인의 권리를 보호하는 역할도 한다.',
      answer: true,
    },
    {
      id: 'c2-28', kind: 'ox', difficulty: 1, source: '교육과정',
      statement: '법은 사람들 사이의 다툼을 해결하는 기준이 되기도 한다.',
      answer: true,
    },
    {
      id: 'c2-29', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '이웃과 다툼이 생겨 해결되지 않을 때, 공정하게 해결하는 방법으로 알맞은 것은?',
      choices: ['법에 따라 재판을 받는다', '힘으로 해결한다', '목소리 큰 사람이 이긴다', '그냥 참고 넘어간다'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c2-30', kind: 'mcq', difficulty: 1, source: '교육과정',
      prompt: '깨끗한 환경에서 살 수 있도록 자연을 보호하는 법은?',
      choices: ['자연환경 보전법', '저작권법', '도로 교통법', '학교 급식법'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c2-31', kind: 'mcq', difficulty: 1, source: '교육과정',
      prompt: '물건을 산 소비자의 권리를 보호하는 법은?',
      choices: ['소비자 기본법', '소방 기본법', '저작권법', '초·중등 교육법'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c2-32', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '법이 사회 질서를 지키는 예로 알맞은 것을 모두 고르세요.',
      choices: ['교통 신호를 지키게 한다', '쓰레기를 함부로 버리지 못하게 한다', '힘센 사람만 보호한다'],
      correctIndexes: [0, 1], multiple: true,
    },
    {
      id: 'c2-33', kind: 'mcq', difficulty: 1, source: '교육과정',
      prompt: '장애가 있는 사람도 차별받지 않도록 보호하는 법은?',
      choices: ['장애인 차별 금지법', '도로 교통법', '저작권법', '소방 기본법'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c2-34', kind: 'ox', difficulty: 1, source: '교육과정',
      statement: '「소방 기본법」은 화재를 예방하고 국민의 생명과 재산을 보호하기 위한 법이다.',
      answer: true,
    },
  ],
}
