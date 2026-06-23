import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BlockMath } from 'react-katex'
import { buildChapter6Deck, type MatchCardDef } from '@/data/chapter6'
import { ResourceBar } from '@/components/ResourceBar'
import { LevelBadge } from '@/components/LevelBadge'
import { StageHeader } from '@/components/arcade/StageHeader'
import { ScreenShake } from '@/components/arcade/ScreenShake'
import { CountdownTimer } from '@/components/CountdownTimer'
import { useChapterRun } from '@/hooks/useChapterRun'
import { sfx } from '@/lib/sfx'
import { InventoryQuickSlot } from '@/components/InventoryQuickSlot'
import { NotebookOverlay } from '@/components/NotebookOverlay'
import { StoryOverlay } from '@/components/StoryOverlay'
import { STORY } from '@/data/story'
import { BonusProblemOverlay } from '@/components/BonusProblemOverlay'
import { pickBonusProblem } from '@/data/bonusProblems'
import { playBgm, stop as stopBgm } from '@/lib/bgm'

export function Chapter6() {
  const initialDeck = useMemo(() => buildChapter6Deck(), [])
  const [deck, setDeck] = useState<MatchCardDef[]>(initialDeck)
  const [flipped, setFlipped] = useState<string[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'match'>('idle')
  const [shake, setShake] = useState(0)
  const [resetFlag, setResetFlag] = useState(0)
  const run = useChapterRun({ chapterId: 6, maxScore: deck.length * 250 })
  const bonus = useMemo(() => pickBonusProblem(6), [])
  const [showNotebook, setShowNotebook] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const [shieldActive, setShieldActive] = useState(false)
  const [timerPaused, setTimerPaused] = useState(false)

  const allMatched = matched.length === deck.length

  useEffect(() => {
    playBgm('chapter6')
    return () => stopBgm()
  }, [])

  useEffect(() => {
    if (run.isDead) {
      run.store.resetForChapter()
      setMatched([])
      setFlipped([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.isDead])

  const [showBonus, setShowBonus] = useState(false)
  useEffect(() => {
    if (allMatched && deck.length > 0) {
      setTimeout(() => setShowBonus(true), 800)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMatched])

  const handleFlip = useCallback(
    (id: string) => {
      if (flipped.includes(id) || matched.includes(id)) return
      if (flipped.length >= 2) return
      const next = [...flipped, id]
      setFlipped(next)
      if (next.length === 2) {
        const [a, b] = next.map((fid) => deck.find((c) => c.id === fid)!)
        if (a.improperKey === b.improperKey) {
          // 매치
          setTimeout(() => {
            setMatched((m) => [...m, a.id, b.id])
            setFlipped([])
            sfx.crit()
            run.onCorrect({ xpBase: 18, scoreGain: 250, crit: run.combo >= 3, difficulty: 2 })
            setFeedback('match')
            setTimeout(() => setFeedback('idle'), 700)
          }, 400)
        } else {
          // 미스
          setTimeout(() => {
            setFlipped([])
            if (shieldActive) {
              setShieldActive(false)
              setFeedback('idle')
              return
            }
            run.onWrong(6)
            setShake((s) => s + 1)
            setFeedback('wrong')
            setTimeout(() => setFeedback('idle'), 700)
          }, 900)
        }
      }
    },
    [flipped, matched, deck, run, shieldActive],
  )

  const handleTimeout = () => {
    run.onTimeout(20)
    setShake((s) => s + 1)
  }

  const reshuffle = () => {
    setDeck(buildChapter6Deck())
    setFlipped([])
    setMatched([])
    setResetFlag((r) => r + 1)
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-4 max-w-2xl mx-auto flex flex-col">
      <ScreenShake shake={shake}>
        <header className="flex items-center justify-between">
          <Link to="/chapters" className="text-white/60 hover:text-white text-sm">
            ← 챕터 선택
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowNotebook(true)} className="px-2 py-1 rounded bg-amber-400/20 text-amber-200 border border-amber-300/40 text-xs">📝 노트</button>
            <LevelBadge compact />
          </div>
        </header>

        <StageHeader
          stage={`STAGE 6 · PUZZLE`}
          subtitle={`아스트로파지 배양 — 대분수 ↔ 가분수 매칭 (${matched.length / 2}/${deck.length / 2})`}
          combo={run.combo}
          score={run.score}
        />
        <div className="mt-2">
          <InventoryQuickSlot
            onUseOxygen={() => {}}
            onUseShield={() => setShieldActive(true)}
            onUseTimeFreeze={() => {
              setTimerPaused(true)
              setTimeout(() => setTimerPaused(false), 10000)
            }}
            onUseMagnet={() => {
              // 매치 안된 첫 쌍을 자동 매치
              const remaining = deck.filter((c) => !matched.includes(c.id))
              if (remaining.length < 2) return
              const first = remaining[0]
              const partner = remaining.find((c) => c.id !== first.id && c.improperKey === first.improperKey)
              if (partner) {
                setMatched((m) => [...m, first.id, partner.id])
                sfx.crit()
              }
            }}
            onUseBomb={() => {
              // 매치되지 않은 쌍 하나 강제 매치 (자석과 동일하지만 즉발)
              const remaining = deck.filter((c) => !matched.includes(c.id))
              if (remaining.length < 2) return
              const first = remaining[0]
              const partner = remaining.find((c) => c.id !== first.id && c.improperKey === first.improperKey)
              if (partner) {
                setMatched((m) => [...m, first.id, partner.id])
                sfx.crit()
              }
            }}
            shieldActive={shieldActive}
          />
        </div>
        <ResourceBar />

        <div className="mt-2 text-xs text-white/60 text-center">
          짝이 되는 두 카드를 찾아. 대분수와 같은 값의 가분수를 매칭하면 배양액이 안정돼.
        </div>

        <div className="mt-3">
          <CountdownTimer
            durationSec={180}
            paused={allMatched || timerPaused}
            onTimeout={handleTimeout}
            resetKey={resetFlag}
          />
        </div>

        {/* 카드 그리드 4×4 (총 16장) */}
        <div className="mt-3 grid grid-cols-4 gap-1.5 sm:gap-2">
          {deck.map((card) => {
            const isOpen = flipped.includes(card.id) || matched.includes(card.id)
            const isMatched = matched.includes(card.id)
            return (
              <motion.button
                key={card.id}
                onClick={() => handleFlip(card.id)}
                disabled={isMatched}
                whileTap={{ scale: 0.9 }}
                animate={
                  feedback === 'match' && flipped.length === 0 && isMatched
                    ? { scale: [1, 1.1, 1] }
                    : {}
                }
                className={`aspect-square rounded-lg border-2 flex items-center justify-center text-sm transition ${
                  isMatched
                    ? 'border-emerald-400 bg-emerald-500/20 text-white'
                    : isOpen
                      ? 'border-yellow-300 bg-slate-800 text-white shadow-[0_0_16px_rgba(253,224,71,0.35)]'
                      : 'border-purple-500/40 bg-gradient-to-br from-purple-700 to-purple-900 text-purple-200 hover:from-purple-600'
                }`}
              >
                {isOpen ? (
                  <div className="px-1">
                    <BlockMath math={card.display} />
                  </div>
                ) : (
                  <div className="text-2xl opacity-80">
                    {['🧬', '🦠', '🧫', '🔬'][parseInt(card.id.slice(-1)) % 4]}
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>

        {feedback === 'wrong' && (
          <div className="mt-2 p-2 rounded bg-red-500/20 text-red-200 text-xs text-center">
            ❌ 짝이 아니야 (산소 -6)
          </div>
        )}
        {feedback === 'match' && (
          <div className="mt-2 p-2 rounded bg-emerald-500/20 text-emerald-200 text-xs text-center">
            ✨ 매치! 배양액 안정
          </div>
        )}

        <div className="mt-3 flex justify-center">
          <button onClick={reshuffle} className="text-xs px-3 py-1 rounded bg-white/10 text-white/70">
            🔀 다시 섞기
          </button>
        </div>
      </ScreenShake>

      {showBonus && (
        <BonusProblemOverlay chapterId={6}
          problem={bonus}
          onPass={() => run.finish()}
          onFail={() => run.store.addOxygen(-5)}
        />
      )}
      <NotebookOverlay open={showNotebook} onClose={() => setShowNotebook(false)} />
      {showIntro && <StoryOverlay lines={STORY[6].intro} onClose={() => setShowIntro(false)} />}
    </div>
  )
}
