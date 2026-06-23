export interface MatchCardDef {
  id: string
  /** KaTeX 표시 문자열 */
  display: string
  /** 정수+분수 표기인지 (대분수) */
  isMixed: boolean
  /** 가분수 형태 키 (등가 매칭용) */
  improperKey: string // "7/4"
}

interface Pair {
  improper: { whole: number; num: number; denom: number } // 시각화용
  improperFrac: { num: number; denom: number }
}

const PAIRS: Pair[] = [
  { improper: { whole: 1, num: 3, denom: 4 }, improperFrac: { num: 7, denom: 4 } },
  { improper: { whole: 2, num: 1, denom: 3 }, improperFrac: { num: 7, denom: 3 } },
  { improper: { whole: 1, num: 2, denom: 5 }, improperFrac: { num: 7, denom: 5 } },
  { improper: { whole: 3, num: 1, denom: 2 }, improperFrac: { num: 7, denom: 2 } },
  { improper: { whole: 2, num: 3, denom: 5 }, improperFrac: { num: 13, denom: 5 } },
  { improper: { whole: 1, num: 5, denom: 6 }, improperFrac: { num: 11, denom: 6 } },
  { improper: { whole: 2, num: 3, denom: 4 }, improperFrac: { num: 11, denom: 4 } },
  { improper: { whole: 3, num: 1, denom: 3 }, improperFrac: { num: 10, denom: 3 } },
]

export const buildChapter6Deck = (): MatchCardDef[] => {
  const cards: MatchCardDef[] = []
  PAIRS.forEach((p, i) => {
    const key = `${p.improperFrac.num}/${p.improperFrac.denom}`
    cards.push({
      id: `mix-${i}`,
      display: `${p.improper.whole}\\dfrac{${p.improper.num}}{${p.improper.denom}}`,
      isMixed: true,
      improperKey: key,
    })
    cards.push({
      id: `imp-${i}`,
      display: `\\dfrac{${p.improperFrac.num}}{${p.improperFrac.denom}}`,
      isMixed: false,
      improperKey: key,
    })
  })
  // 셔플
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }
  return cards
}
