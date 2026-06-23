import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { ContentProblem } from '@/content/types'

interface Props {
  problems: ContentProblem[]
  title: string
  intro?: string
  onClear: (result: { mistakes: number }) => void
  onExit: () => void
  /** 올바른 분류마다 공유 보상 */
  onAward?: (correct: boolean) => void
}

interface Item {
  idx: number
  text: string
  category: string
}

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * 분류 미니게임 (챕터 2 — 「법은 무슨 일을 할까」).
 * matching 문제의 오른쪽 값을 "분류 바구니(범주)"로 사용해,
 * 각 사례(왼쪽)를 알맞은 바구니에 분류한다.
 */
export function SortingGame({ problems, title, intro, onClear, onExit, onAward }: Props) {
  const rounds = useMemo(
    () => problems.filter((p): p is Extract<ContentProblem, { kind: 'matching' }> => p.kind === 'matching'),
    [problems],
  )
  const [roundIdx, setRoundIdx] = useState(0)
  const round = rounds[roundIdx]

  const items: Item[] = useMemo(() => {
    if (!round) return []
    return shuffle(round.pairs.map((p, i) => ({ idx: i, text: p.left, category: p.right })))
  }, [round])
  const categories = useMemo(() => {
    if (!round) return []
    return Array.from(new Set(round.pairs.map((p) => p.right)))
  }, [round])

  const [assigned, setAssigned] = useState<Record<number, string>>({})
  const [selected, setSelected] = useState<number | null>(null)
  const [wrong, setWrong] = useState<number | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [status, setStatus] = useState<'play' | 'clear'>('play')

  if (rounds.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-white/70">
        <p>이 챕터에는 아직 분류할 문제가 없어요.</p>
        <button onClick={onExit} className="underline">← 나가기</button>
      </div>
    )
  }

  if (status === 'clear') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="text-6xl">🗂️</div>
        <h1 className="text-2xl font-black text-white">분류 완료!</h1>
        <div className="text-white/70">실수 {mistakes}번</div>
        <div className="flex gap-3">
          <button onClick={() => onClear({ mistakes })} className="px-6 py-3 rounded-xl font-bold bg-indigo-500 hover:bg-indigo-400 transition">완료</button>
          <button onClick={onExit} className="px-6 py-3 rounded-xl font-bold bg-white/10 hover:bg-white/20 transition">나가기</button>
        </div>
      </div>
    )
  }

  const place = (category: string) => {
    if (selected === null) return
    const item = items.find((it) => it.idx === selected)
    if (!item) return
    if (item.category === category) {
      const next = { ...assigned, [selected]: category }
      setAssigned(next)
      setSelected(null)
      onAward?.(true)
      if (Object.keys(next).length >= items.length) {
        // 라운드 완료 → 다음 라운드 또는 클리어
        if (roundIdx + 1 >= rounds.length) setStatus('clear')
        else {
          setRoundIdx((r) => r + 1)
          setAssigned({})
        }
      }
    } else {
      setMistakes((m) => m + 1)
      setWrong(selected)
      onAward?.(false)
      setTimeout(() => setWrong(null), 350)
      setSelected(null)
    }
  }

  const pool = items.filter((it) => assigned[it.idx] === undefined)
  const placedTotal = Object.keys(assigned).length

  return (
    <div className="min-h-screen px-4 sm:px-6 py-4 max-w-2xl mx-auto flex flex-col">
      <header className="flex items-center justify-between">
        <button onClick={onExit} className="text-white/60 hover:text-white text-sm">← 나가기</button>
        <div className="text-xs text-white/60 flex gap-3">
          <span>라운드 {roundIdx + 1}/{rounds.length}</span>
          <span>분류 {placedTotal}/{items.length}</span>
          <span>실수 {mistakes}</span>
        </div>
      </header>

      <div className="mt-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2">
        <div className="text-sm font-bold text-indigo-200">🗂️ {title}</div>
        <div className="text-xs text-white/60 mt-0.5">{round.prompt}</div>
      </div>

      {intro && roundIdx === 0 && placedTotal === 0 && (
        <p className="mt-2 text-xs text-white/55 text-center leading-relaxed">{intro}</p>
      )}

      {/* 분류할 사례들 */}
      <div className="mt-4">
        <div className="text-[11px] text-white/40 font-bold mb-1">분류할 사례 (눌러서 선택)</div>
        <div className="flex flex-wrap gap-2 min-h-[3rem]">
          {pool.length === 0 ? (
            <span className="text-white/40 text-sm">모두 분류했어요!</span>
          ) : pool.map((it) => (
            <motion.button
              key={it.idx}
              onClick={() => setSelected(it.idx)}
              animate={wrong === it.idx ? { x: [0, -6, 6, 0] } : {}}
              transition={{ duration: 0.3 }}
              className={`px-3 py-2 rounded-lg text-sm border transition ${
                selected === it.idx ? 'border-yellow-300 bg-yellow-300/15 text-white' : 'border-white/15 bg-white/5 text-white/90 hover:bg-white/10'
              }`}
            >
              {it.text}
            </motion.button>
          ))}
        </div>
      </div>

      {/* 바구니 */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {categories.map((cat) => {
          const inside = items.filter((it) => assigned[it.idx] === cat)
          return (
            <button
              key={cat}
              onClick={() => place(cat)}
              disabled={selected === null}
              className={`text-left rounded-xl border p-3 transition min-h-[5rem] ${
                selected !== null ? 'border-indigo-400/60 bg-indigo-400/10 hover:bg-indigo-400/20' : 'border-white/15 bg-white/5'
              }`}
            >
              <div className="text-sm font-bold text-white mb-1">📦 {cat}</div>
              <div className="flex flex-wrap gap-1">
                {inside.map((it) => (
                  <span key={it.idx} className="px-2 py-0.5 rounded bg-green-400/20 text-green-100 text-[11px]">
                    ✓ {it.text}
                  </span>
                ))}
              </div>
            </button>
          )
        })}
      </div>

      <p className="mt-4 text-center text-xs text-white/45">
        사례를 누른 뒤, 알맞은 역할 바구니를 누르세요.
      </p>
    </div>
  )
}
