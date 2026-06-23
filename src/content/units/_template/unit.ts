import type { UnitDef } from '@/content/types'

/**
 * ✂️ 새 단원 템플릿 — 복사해서 새 폴더(예: units/koreanGrammar/)를 만들고 채우세요.
 *
 * 미니게임(mechanic) 종류:
 *   'defense'  디펜스   — 객관식·OX (밀려오는 것 막기)
 *   'sorting'  분류     — matching (범주 바구니에 분류)
 *   'matching' 매칭     — matching (1:1 짝짓기)
 *   'oxrush'   OX 번개  — OX (빠른 판단)
 *   'boss'     보스전   — 객관식·OX
 *   'finalboss'최종보스 — 단원 전체(matching 제외) 종합
 *
 * 문제(problem) 종류:
 *   { kind:'mcq', prompt, choices:[...], correctIndexes:[0], multiple:false }  // 객관식(단일)
 *   { kind:'mcq', ..., correctIndexes:[0,2], multiple:true }                   // 객관식(복수)
 *   { kind:'ox', statement:'...', answer:true }                               // OX
 *   { kind:'matching', prompt, pairs:[{left,right}, ...] }                    // 짝짓기/분류
 *
 * 다 채운 뒤 src/content/registry.ts 의 SUBJECTS 에 한 줄 추가하면 끝!
 */
export const templateUnit: UnitDef = {
  id: 'subject-grade-unit', // 고유 id (예: 'korean-5-1-grammar')
  subject: '과목명', // 예: '국어'
  grade: '5-1',
  title: '단원 제목', // 예: '문장의 짜임'
  theme: '컨셉 키워드', // 예: '단어 탐정'
  narrative: {
    hero: '주인공 호칭', // 예: '단어 탐정'
    tagline: '한 줄 소개',
    startLabel: '🔍 모험 시작',
    ranks: [
      { level: 1, title: '견습' },
      { level: 3, title: '정식' },
      { level: 5, title: '베테랑' },
    ],
  },
  chapters: [
    {
      id: 'unit-1',
      title: '챕터 1 제목',
      mechanic: 'defense',
      intro: '챕터 한 줄 안내.',
      story: ['시작 대사 1', '시작 대사 2'],
      problems: [
        {
          id: 'u1-1', kind: 'mcq', difficulty: 1,
          prompt: '질문을 적어요.',
          choices: ['보기1', '보기2', '보기3', '보기4'],
          correctIndexes: [0], multiple: false,
          hint: '힌트(선택).',
        },
        {
          id: 'u1-2', kind: 'ox', difficulty: 1,
          statement: '맞으면 O, 틀리면 X인 진술.',
          answer: true,
        },
      ],
    },
    {
      id: 'unit-2',
      title: '챕터 2 제목',
      mechanic: 'matching',
      problems: [
        {
          id: 'u2-1', kind: 'matching', difficulty: 2,
          prompt: '알맞게 짝지어요.',
          pairs: [
            { left: '왼쪽1', right: '오른쪽1' },
            { left: '왼쪽2', right: '오른쪽2' },
          ],
        },
      ],
    },
  ],
}
