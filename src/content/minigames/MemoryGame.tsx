import { useMemo, useState } from 'react'
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
  onAward?: (correct: boolean) => void
}

interface Card {
  cardId: number
  pairId: number
  side: 'L' | 'R'
  text: string
}

const PAIRS_PER_ROUND = 8 // 한 라운드 8쌍(4×4, 16장)
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
 * 메모리 카드 미니게임 (챕터 「여러 가지 법」).
 * 카드를 뒤집어 법↔역할 짝을 기억해 맞춘다. (조작: 뒤집기·기억 — 다른 게임과 차별)
 */
export function MemoryGame({ problems, title, intro, onClear, onExit, onAward }: Props) {
  // 모든 matching 짝을 모아 4쌍씩 라운드로 분할
  const rounds = useMemo(() => {
    const pairs = problems
      .filter((p): p is Extract<ContentProblem, { kind: 'matching' }> => p.kind === 'matching')
      .flatMap((p) => p.pairs)
    const chunks: { left: string; right: string }[][] = []
    for (let i = 0; i < pairs.length; i += PAIRS_PER_ROUND) {
      chunks.push(pairs.slice(i, i + PAIRS_PER_ROUND))
    }
    return chunks
  }, [problems])

  const [roundIdx, setRoundIdx] = useState(0)
  const round = rounds[roundIdx]

  const cards: Card[] = useMemo(() => {
    if (!round) return []
    const list: Card[] = []
    round.forEach((p, i) => {
      list.push({ cardId: i * 2, pairId: i, side: 'L', text: p.left })
      list.push({ cardId: i * 2 + 1, pairId: i, side: 'R', text: p.right })
    })
    return shuffle(list)
  }, [round])

  const [flipped, setFlipped] = useState<number[]>([]) // 현재 뒤집힌(미매칭) cardId
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const lives = useLives(START_HEARTS)
  const [mistakes, setMistakes] = useState(0)
  const [combo, setCombo] = useState(0)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<'play' | 'clear' | 'over'>('play')
  const juice = useGameJuice()

  if (rounds.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-white/70">
        <p>이 챕터에는 아직 카드로 만들 짝이 없어요.</p>
        <button onClick={onExit} className="underline">← 나가기</button>
      </div>
    )
  }

  const stars = starsFromMistakes(mistakes)

  const restart = () => {
    setRoundIdx(0); setFlipped([]); setMatched(new Set()); lives.reset()
    setMistakes(0); setCombo(0); setBusy(false); setStatus('play')
  }

  if (status === 'clear') {
    return (
      <GameResult emoji="🃏" title="모두 기억해냈어요!" confetti stars={stars}
        lines={[`실수 ${mistakes}번`]}
        primary={{ label: '완료', onClick: () => onClear({ mistakes, stars }) }}
        secondary={{ label: '다시 하기', onClick: restart }} />
    )
  }
  if (status === 'over') {
    return (
      <GameResult emoji="🛑" title="하트를 다 썼어요…"
        lines={[`실수 ${mistakes}번`, '다시 도전해 볼까요?']}
        primary={{ label: '다시 도전', onClick: restart }}
        secondary={{ label: '나가기', onClick: onExit }} />
    )
  }

  const flip = (card: Card) => {
    if (busy || status !== 'play') return
    if (matched.has(card.cardId) || flipped.includes(card.cardId)) return
    const next = [...flipped, card.cardId]
    setFlipped(next)
    if (next.length < 2) return

    // 두 장 비교
    const [a, b] = next.map((id) => cards.find((c) => c.cardId === id)!)
    if (a.pairId === b.pairId && a.side !== b.side) {
      // 매칭 성공
      const nextMatched = new Set(matched).add(a.cardId).add(b.cardId)
      setMatched(nextMatched)
      setFlipped([])
      const c = combo + 1
      setCombo(c)
      juice.correct(c, { x: 0.5 })
      onAward?.(true)
      if (nextMatched.size >= cards.length) {
        if (roundIdx + 1 >= rounds.length) { setStatus('clear'); sfx.clear() }
        else { setTimeout(() => { setRoundIdx((r) => r + 1); setMatched(new Set()); setFlipped([]) }, 500) }
      } else sfx.correct()
    } else {
      // 실패 — 잠시 보여주고 닫기 (그동안 입력 잠금)
      sfx.wrong()
      setCombo(0)
      setMistakes((m) => m + 1)
      onAward?.(false)
      const dead = lives.lose()
      setBusy(true)
      setTimeout(() => { setFlipped([]); setBusy(false); if (dead) setStatus('over') }, 800)
    }
  }

  const isUp = (c: Card) => matched.has(c.cardId) || flipped.includes(c.cardId)

  return (
    <div className="min-h-screen px-4 sm:px-6 py-4 max-w-2xl mx-auto flex flex-col relative">
      <JuiceOverlay floaters={juice.floaters} grade={juice.grade} combo={combo} />
      <header className="flex items-center justify-between">
        <button onClick={onExit} className="text-white/60 hover:text-white text-sm">← 나가기</button>
        <div className="text-xs text-white/60 flex gap-3 items-center">
          <HeartBar hearts={lives.hearts} max={lives.MAX_HEARTS} shielded={lives.shielded} />
          <span>R{roundIdx + 1}/{rounds.length}</span>
          <span>실수 {mistakes}</span>
        </div>
      </header>

      <div className="mt-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2">
        <div className="text-sm font-bold text-indigo-200">🃏 {title}</div>
        <div className="text-xs text-white/60 mt-0.5">카드를 뒤집어 법과 하는 일의 짝을 맞춰요.</div>
      </div>

      <div className="mt-2">
        <GameItemBar items={[
          { id: 'shield', icon: '🛡️ 보호막', label: '실수 1회 무효', cost: 8, onBuy: lives.arm, disabled: lives.shielded },
          { id: 'life', icon: '❤️ 생명', label: '생명 +1', cost: 15, onBuy: lives.addLife },
        ]} />
      </div>

      {intro && roundIdx === 0 && matched.size === 0 && flipped.length === 0 && (
        <p className="mt-2 text-xs text-white/55 text-center leading-relaxed">{intro}</p>
      )}

      <div className="mt-4 grid grid-cols-4 gap-1.5 sm:gap-2">
        {cards.map((c) => {
          const up = isUp(c)
          const done = matched.has(c.cardId)
          return (
            <button
              key={c.cardId}
              onClick={() => flip(c)}
              disabled={up || busy}
              aria-label={up ? c.text : '뒤집힌 카드'}
              className={`relative h-20 sm:h-24 rounded-lg border-2 p-1 text-[10px] sm:text-xs font-bold flex items-center justify-center text-center leading-tight transition ${
                done
                  ? 'border-green-400/60 bg-green-400/10 text-green-100'
                  : up
                    ? 'border-yellow-300 bg-yellow-300/10 text-white'
                    : 'border-white/15 bg-gradient-to-br from-indigo-600/40 to-violet-800/40 text-transparent hover:from-indigo-500/50'
              }`}
            >
              <motion.span
                initial={false}
                animate={{ scale: up ? 1 : 0.9 }}
                className={up ? '' : 'opacity-0'}
              >
                {up ? c.text : '?'}
              </motion.span>
              {!up && <span className="absolute text-2xl text-white/70">❓</span>}
            </button>
          )
        })}
      </div>

      <p className="mt-4 text-center text-xs text-white/45">
        카드 두 장을 뒤집어 짝이 맞으면 카드가 열린 채로 남아요.
      </p>
    </div>
  )
}
