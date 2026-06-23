import type { ChapterDef } from '@/content/types'

/**
 * 챕터 3 — 「인권이란 무엇일까」 (보스전)
 * 학습: 인권의 의미와 특징.
 * 서사: 인권을 무시하는 "편견 빌런"을 올바른 인권 지식으로 무찌른다.
 *
 * ※ 샘플에는 인권의 "의미·특징" 문항이 16번 하나뿐이라 통이 비어 보임.
 *   다음 회차 문제를 같은 통(problems)에 계속 추가하면 됨.
 */
export const chapter3: ChapterDef = {
  id: 'law-rights-3',
  title: '인권이란 무엇일까',
  mechanic: 'boss',
  intro:
    '"권리는 내가 정하는 거야!" 편견 빌런이 나타났어요. 인권이 무엇인지 똑똑히 알려 줘서 빌런을 무찔러요!',
  problems: [
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
  ],
}
