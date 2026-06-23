import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { ContentProblem } from '@/content/types'
import { sfx } from '@/lib/sfx'
import { ConfettiBurst } from '@/components/ConfettiBurst'

interface Props {
  problems: ContentProblem[]
  title: string
  intro?: string
  onClear: (result: { mistakes: number; score: number }) => void
  onExit: () => void
}

interface Card {
  /** 짝 인덱스 (왼쪽 i ↔ 오른쪽 i 가 정답) */
  pairId: number
  text: string
}
type Selection = { side: 'L' | 'R'; pairId: number } | null

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * 매칭 미니게임 (챕터 2 — 「법은 무슨 일을 할까」).
 * 법 카드(왼쪽)와 역할 카드(오른쪽)를 짝지어 법전을 복구한다.
 */
export function MatchingGame({ problems, title, intro, onClear, onExit }: Props) {
  const { lefts, rights, prompt } = useMemo(() => {
    const matchings = problems.filter((p) => p.kind === 'matching')
    const pairs = matchings.flatMap((p) => (p.kind === 'matching' ? p.pairs : []))
    const lefts: Card[] = pairs.map((p, i) => ({ pairId: i, text: p.left }))
    const rights: Card[] = shuffle(pairs.map((p, i) => ({ pairId: i, text: p.right })))
    const prompt = matchings[0]?.kind === 'matching' ? matchings[0].prompt : '알맞게 짝지어요.'
    return { lefts, rights, prompt }
  }, [problems])

  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [selected, setSelected] = useState<Selection>(null)
  const [wrong, setWrong] = useState<number | null>(null) // 방금 틀린 pairId(흔들기)
  const [mistakes, setMistakes] = useState(0)

  const total = lefts.length
  const done = matched.size >= total && total > 0

  if (total === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-white/70">
        <p>이 챕터에는 아직 짝짓기 문제가 없어요.</p>
        <button onClick={onExit} className="underline">← 나가기</button>
      </div>
    )
  }

  const score = Math.max(100, total * 100 - mistakes * 30)

  const tap = (side: 'L' | 'R', pairId: number) => {
    if (matched.has(pairId)) return
    if (!selected) {
      setSelected({ side, pairId })
      return
    }
    if (selected.side === side) {
      // 같은 쪽 재선택 → 선택 이동
      setSelected({ side, pairId })
      return
    }
    // 양쪽 하나씩 선택됨 → 판정
    if (selected.pairId === pairId) {
      const nextMatched = new Set(matched).add(pairId)
      setMatched(nextMatched)
      setSelected(null)
      sfx[nextMatched.size >= total ? 'clear' : 'correct']()
    } else {
      sfx.wrong()
      setMistakes((m) => m + 1)
      setWrong(pairId)
      setTimeout(() => setWrong(null), 350)
      setSelected(null)
    }
  }

  const restart = () => {
    setMatched(new Set())
    setSelected(null)
    setWrong(null)
    setMistakes(0)
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center">
        <ConfettiBurst show />
        <div className="text-6xl">📜</div>
        <h1 className="text-2xl font-black text-white">법전을 복구했어요!</h1>
        <div className="text-white/70 flex flex-col gap-1">
          <span>짝 {total}개 완성</span>
          <span>실수 {mistakes}번</span>
          <span>점수 {score}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => onClear({ mistakes, score })} className="px-6 py-3 rounded-xl font-bold bg-indigo-500 hover:bg-indigo-400 transition">완료</button>
          <button onClick={restart} className="px-6 py-3 rounded-xl font-bold bg-white/10 hover:bg-white/20 transition">다시 하기</button>
        </div>
      </div>
    )
  }

  const cardCls = (side: 'L' | 'R', c: Card) => {
    if (matched.has(c.pairId)) return 'border-green-400/60 bg-green-400/10 text-green-200/70 cursor-default'
    if (selected && selected.side === side && selected.pairId === c.pairId)
      return 'border-yellow-300 bg-yellow-300/15 text-white'
    return 'border-white/15 bg-white/5 text-white/90 hover:bg-white/10'
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-4 max-w-2xl mx-auto flex flex-col">
      <header className="flex items-center justify-between">
        <button onClick={onExit} className="text-white/60 hover:text-white text-sm">← 나가기</button>
        <div className="text-xs text-white/60 flex gap-3">
          <span>완성 {matched.size}/{total}</span>
          <span>실수 {mistakes}</span>
        </div>
      </header>

      <div className="mt-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2">
        <div className="text-sm font-bold text-indigo-200">🃏 {title}</div>
        <div className="text-xs text-white/60 mt-0.5">{prompt}</div>
      </div>

      {intro && matched.size === 0 && (
        <p className="mt-2 text-xs text-white/55 text-center leading-relaxed">{intro}</p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        {/* 왼쪽: 법 */}
        <div className="flex flex-col gap-2">
          <div className="text-[11px] text-white/40 font-bold text-center">법</div>
          {lefts.map((c) => (
            <motion.button
              key={`L-${c.pairId}`}
              onClick={() => tap('L', c.pairId)}
              animate={wrong === c.pairId && selected === null ? { x: [0, -6, 6, 0] } : {}}
              transition={{ duration: 0.3 }}
              className={`px-3 py-3 rounded-xl border text-sm text-left transition ${cardCls('L', c)}`}
            >
              {matched.has(c.pairId) && '✓ '}{c.text}
            </motion.button>
          ))}
        </div>
        {/* 오른쪽: 하는 일 */}
        <div className="flex flex-col gap-2">
          <div className="text-[11px] text-white/40 font-bold text-center">하는 일</div>
          {rights.map((c) => (
            <motion.button
              key={`R-${c.pairId}`}
              onClick={() => tap('R', c.pairId)}
              animate={wrong === c.pairId && selected === null ? { x: [0, -6, 6, 0] } : {}}
              transition={{ duration: 0.3 }}
              className={`px-3 py-3 rounded-xl border text-sm text-left transition ${cardCls('R', c)}`}
            >
              {matched.has(c.pairId) && '✓ '}{c.text}
            </motion.button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-white/45">
        한쪽 카드를 고른 뒤, 짝이 되는 반대쪽 카드를 누르세요.
      </p>
    </div>
  )
}
