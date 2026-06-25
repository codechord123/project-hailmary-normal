import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { ContentProblem } from '@/content/types'
import { sfx } from '@/lib/sfx'
import { useGameJuice, JuiceOverlay } from '@/content/components/GameJuice'
import { GameResult } from '@/content/components/GameResult'
import { useLives, GameItemBar, HeartBar } from '@/content/components/GameItems'
import { starsFromMistakes } from '@/content/score'
import { BALANCE } from '@/content/balance'

interface Props {
  problems: ContentProblem[]
  title: string
  intro?: string
  onClear: (result: { mistakes: number; stars: number }) => void
  onExit: () => void
  /** 올바른 분류마다 공유 보상 */
  onAward?: (correct: boolean) => void
}

interface Item {
  idx: number
  text: string
  category: string
}

const START_HEARTS = BALANCE.hearts

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * 분류 미니게임 (챕터 「법은 무슨 일을 할까」).
 * matching 문제의 오른쪽 값을 "분류 바구니(범주)"로 사용해,
 * 각 사례(왼쪽)를 제한 시간 안에 알맞은 바구니에 분류한다.
 */
export function SortingGame({ problems, title, intro, onClear, onExit, onAward }: Props) {
  const rounds = useMemo(
    () => problems.filter((p): p is Extract<ContentProblem, { kind: 'matching' }> => p.kind === 'matching'),
    [problems],
  )
  const budget = Math.max(
    BALANCE.timed.minBudgetSec,
    rounds.reduce((s, r) => s + r.pairs.length, 0) * BALANCE.timed.sortingSecPerItem,
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
  const bucketRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [wrong, setWrong] = useState<number | null>(null)
  // 드래그 대체 입력(키보드·스크린리더): 사례 선택 → 바구니 탭
  const [selected, setSelected] = useState<number | null>(null)
  const lives = useLives(START_HEARTS)
  const [mistakes, setMistakes] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(budget)
  const [status, setStatus] = useState<'play' | 'clear' | 'over'>('play')
  const [revealCat, setRevealCat] = useState<string | null>(null)
  const juice = useGameJuice()

  useEffect(() => {
    if (status !== 'play') return
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { setStatus('over'); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [status])

  if (rounds.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-white/70">
        <p>이 챕터에는 아직 분류할 문제가 없어요.</p>
        <button onClick={onExit} className="underline">← 나가기</button>
      </div>
    )
  }

  const stars = starsFromMistakes(mistakes)

  const restart = () => {
    setRoundIdx(0); setAssigned({}); setWrong(null); setSelected(null); lives.reset()
    setMistakes(0); setCombo(0); setTimeLeft(budget); setStatus('play')
  }

  if (status === 'clear') {
    return (
      <GameResult emoji="🗂️" title="분류 완료!" confetti stars={stars}
        lines={[`실수 ${mistakes}번 · 남은 시간 ${timeLeft}초`]}
        primary={{ label: '완료', onClick: () => onClear({ mistakes, stars }) }}
        secondary={{ label: '다시 하기', onClick: restart }} />
    )
  }

  if (status === 'over') {
    const ranOut = timeLeft <= 0
    return (
      <GameResult emoji={ranOut ? '⏰' : '🛑'} title={ranOut ? '시간이 다 됐어요!' : '하트를 다 썼어요…'}
        lines={[`실수 ${mistakes}번`, '다시 도전해 볼까요?']}
        primary={{ label: '다시 도전', onClick: restart }}
        secondary={{ label: '나가기', onClick: onExit }} />
    )
  }

  const placeItem = (itemIdx: number, category: string) => {
    if (status !== 'play' || assigned[itemIdx] !== undefined) return
    const item = items.find((it) => it.idx === itemIdx)
    if (!item) return
    setSelected(null)
    if (item.category === category) {
      const c = combo + 1
      setCombo(c)
      juice.correct(c, { x: 0.5 })
      sfx.correct(c)
      const next = { ...assigned, [itemIdx]: category }
      setAssigned(next)
      onAward?.(true)
      if (Object.keys(next).length >= items.length) {
        if (roundIdx + 1 >= rounds.length) { setStatus('clear'); sfx.clear() }
        else { setRoundIdx((r) => r + 1); setAssigned({}) }
      }
    } else {
      sfx.wrong()
      setCombo(0)
      setMistakes((m) => m + 1)
      setWrong(itemIdx)
      setRevealCat(`'${item.text}' → '${item.category}'`)
      onAward?.(false)
      if (lives.lose()) setStatus('over')
      setTimeout(() => setWrong(null), 350)
      setTimeout(() => setRevealCat(null), 1400)
    }
  }

  // 드롭 지점이 어느 바구니 위인지 판정
  const handleDrop = (itemIdx: number, point: { x: number; y: number }) => {
    for (const cat of categories) {
      const el = bucketRefs.current[cat]
      if (!el) continue
      const r = el.getBoundingClientRect()
      if (point.x >= r.left && point.x <= r.right && point.y >= r.top && point.y <= r.bottom) {
        placeItem(itemIdx, cat)
        return
      }
    }
  }

  const pool = items.filter((it) => assigned[it.idx] === undefined)
  const placedTotal = Object.keys(assigned).length
  const lowTime = timeLeft <= 10

  return (
    <div className="min-h-screen px-4 sm:px-6 py-4 max-w-2xl mx-auto flex flex-col relative">
      <JuiceOverlay floaters={juice.floaters} grade={juice.grade} combo={combo} confetti={juice.confetti} />
      <header className="flex items-center justify-between">
        <button onClick={onExit} className="text-white/60 hover:text-white text-sm">← 나가기</button>
        <div className="text-xs text-white/60 flex gap-3 items-center">
          <HeartBar hearts={lives.hearts} max={lives.MAX_HEARTS} shielded={lives.shielded} />
          <span>R{roundIdx + 1}/{rounds.length}</span>
          <span className={lowTime ? 'text-red-400 font-bold' : ''}>⏱ {timeLeft}s</span>
        </div>
      </header>

      <div className="h-1.5 mt-2 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full transition-all duration-1000 ease-linear ${lowTime ? 'bg-red-500' : 'bg-space-accent'}`}
          style={{ width: `${(timeLeft / budget) * 100}%` }} />
      </div>

      <div className="mt-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2">
        <div className="text-sm font-bold text-indigo-200">🗂️ {title}</div>
        <div className="text-xs text-white/60 mt-0.5">{round.prompt}</div>
      </div>

      <div className="mt-2">
        <GameItemBar items={[
          { id: 'shield', icon: '🛡️ 보호막', label: '실수 1회 무효', cost: 8, onBuy: lives.arm, disabled: lives.shielded },
          { id: 'life', icon: '❤️ 생명', label: '생명 +1', cost: 15, onBuy: lives.addLife },
        ]} />
      </div>

      {intro && roundIdx === 0 && placedTotal === 0 && (
        <p className="mt-2 text-xs text-white/55 text-center leading-relaxed">{intro}</p>
      )}

      <div className="mt-4">
        <div className="text-[11px] text-white/40 font-bold mb-1">분류할 사례 (끌어다 놓거나, 사례를 누른 뒤 바구니를 누르기)</div>
        <div className="flex flex-wrap gap-2 min-h-[3rem]">
          {pool.length === 0 ? (
            <span className="text-white/40 text-sm">모두 분류했어요!</span>
          ) : pool.map((it) => {
            const isSel = selected === it.idx
            return (
              <motion.button
                key={it.idx}
                drag
                dragSnapToOrigin
                whileDrag={{ scale: 1.12, zIndex: 50 }}
                onDragEnd={(_, info) => handleDrop(it.idx, info.point)}
                onClick={() => setSelected(isSel ? null : it.idx)}
                aria-pressed={isSel}
                aria-label={`사례: ${it.text}${isSel ? ' (선택됨 — 바구니를 누르세요)' : ''}`}
                className={`px-3 py-2 rounded-lg text-sm border cursor-grab active:cursor-grabbing touch-none select-none transition-colors ${
                  wrong === it.idx
                    ? 'border-red-400 bg-red-500/20 text-white ring-2 ring-red-400/60'
                    : isSel
                      ? 'border-yellow-300 bg-yellow-300/15 text-white ring-2 ring-yellow-300/50'
                      : 'border-white/15 bg-white/5 text-white/90'
                }`}
              >
                {it.text}
              </motion.button>
            )
          })}
        </div>
      </div>

      {revealCat && (
        <div className="mt-2 p-2 rounded-lg bg-amber-400/15 text-amber-100 border border-amber-300/40 text-xs text-center font-bold">
          ❌ 정답: {revealCat}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        {categories.map((cat) => {
          const inside = items.filter((it) => assigned[it.idx] === cat)
          const armed = selected !== null
          return (
            <button
              key={cat}
              type="button"
              ref={(el) => { bucketRefs.current[cat] = el }}
              onClick={() => { if (selected !== null) placeItem(selected, cat) }}
              disabled={!armed}
              aria-label={`${cat} 바구니, 현재 ${inside.length}개${armed ? ' — 눌러서 선택한 사례 넣기' : ''}`}
              className={`text-left rounded-xl border-2 border-dashed p-3 min-h-[5.5rem] transition ${
                armed
                  ? 'border-yellow-300/70 bg-yellow-300/10 cursor-pointer hover:bg-yellow-300/20'
                  : 'border-indigo-400/40 bg-indigo-400/5 cursor-default'
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
        끌어다 놓거나, 사례를 누른 뒤 알맞은 역할 바구니를 누르세요.
      </p>
    </div>
  )
}
