import type { ChapterDef } from '@/content/types'

/**
 * 챕터 2 — 「법은 무슨 일을 할까」 (분류)
 * 학습: 법의 역할(권리 보호·질서 유지·분쟁 해결·안전/환경 보호).
 * 서사: 흩어진 사례를 알맞은 "역할 바구니"에 분류해 법전을 정리한다.
 * 분류 게임은 matching 문제의 오른쪽 값을 "분류 바구니(범주)"로 사용한다.
 */
export const chapter2: ChapterDef = {
  id: 'law-rights-2',
  title: '법은 무슨 일을 할까',
  mechanic: 'sorting',
  intro: '여러 사례가 뒤섞였어요. 각 사례가 법의 어떤 "역할"인지 알맞은 바구니에 분류해요!',
  story: [
    '도시의 법전이 뒤죽박죽 흩어져버렸어요.',
    '각 법이 무슨 "역할"을 하는지 기억하나요?',
    '사례를 알맞은 역할 바구니에 담아 법전을 정리하자!',
  ],
  problems: [
    {
      id: 'c2-sort1', kind: 'matching', difficulty: 2, source: '교육과정',
      prompt: '각 사례를 법의 알맞은 역할로 분류해요.',
      pairs: [
        { left: '저작권법으로 창작물을 보호', right: '개인의 권리 보호' },
        { left: '소비자 기본법으로 소비자를 보호', right: '개인의 권리 보호' },
        { left: '교통 신호를 지키게 함', right: '사회 질서 유지' },
        { left: '범죄를 예방함', right: '사회 질서 유지' },
        { left: '재판으로 다툼을 해결', right: '분쟁 해결' },
        { left: '이웃 간 갈등을 법으로 조정', right: '분쟁 해결' },
        { left: '소방 기본법으로 화재를 예방', right: '안전·환경 보호' },
        { left: '자연환경 보전법으로 생태계 보호', right: '안전·환경 보호' },
      ],
    },
    {
      id: 'c2-sort2', kind: 'matching', difficulty: 2, source: '교육과정',
      prompt: '각 사례를 법의 알맞은 역할로 분류해요.',
      pairs: [
        { left: '학교 급식법으로 건강한 급식', right: '안전·환경 보호' },
        { left: '도로 교통법으로 교통질서 유지', right: '사회 질서 유지' },
        { left: '개인의 재산을 보호', right: '개인의 권리 보호' },
        { left: '다툼을 공정하게 해결', right: '분쟁 해결' },
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
      id: 'c2-29', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '이웃과 다툼이 생겨 해결되지 않을 때, 공정하게 해결하는 방법으로 알맞은 것은?',
      choices: ['법에 따라 재판을 받는다', '힘으로 해결한다', '목소리 큰 사람이 이긴다', '그냥 참고 넘어간다'],
      correctIndexes: [0], multiple: false,
    },
    {
      id: 'c2-13a', kind: 'ox', difficulty: 3, source: '1회 13-(1)번',
      statement: '"범죄나 사고를 예방한다"는 것은 개인의 권리 보호와 직접 관련된 법의 역할이다.',
      answer: false, hint: '예방은 사회 질서 유지에 가까워요.',
    },
    {
      id: 'c2-13b', kind: 'ox', difficulty: 2, source: '1회 13-(2)번',
      statement: '"사고로부터 개인의 생명을 보호한다"는 것은 개인의 권리 보호와 관련된 법의 역할이다.',
      answer: true,
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
      id: 'c2-32', kind: 'mcq', difficulty: 2, source: '교육과정',
      prompt: '법이 사회 질서를 지키는 예로 알맞은 것을 모두 고르세요.',
      choices: ['교통 신호를 지키게 한다', '쓰레기를 함부로 버리지 못하게 한다', '힘센 사람만 보호한다'],
      correctIndexes: [0, 1], multiple: true,
    },
  ],
}
