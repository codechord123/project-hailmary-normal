import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { comboBonusXp, computeStars } from '@/lib/scoring'
import { computeRank } from '@/lib/judge'
import { CHAPTER_REWARD_POOL, type ItemId } from '@/data/items'
import { sfx } from '@/lib/sfx'
import { unlock, trackCorrectSimplified } from '@/lib/achievements'

interface Options {
  chapterId: number
  maxScore: number
}

export function useChapterRun({ chapterId, maxScore }: Options) {
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [timeoutCount, setTimeoutCount] = useState(0)
  const [levelUpBanner, setLevelUpBanner] = useState<number | null>(null)
  const store = useGameStore()
  const navigate = useNavigate()
  const startedAt = useRef(Date.now())

  useEffect(() => {
    store.resetForChapter()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onCorrect = useCallback(
    (opts: { xpBase?: number; scoreGain?: number; crit?: boolean; difficulty?: number } = {}) => {
      const xpBase = opts.xpBase ?? 25
      const scoreGain = opts.scoreGain ?? 200
      const newCombo = combo + 1
      setCombo(newCombo)
      setMaxCombo((m) => Math.max(m, newCombo))
      setCorrectCount((c) => c + 1)
      setScore((s) => s + scoreGain * (opts.crit ? 2 : 1) + comboBonusXp(newCombo) * 10)
      const luckBonus = Math.random() * 100 < store.stats.luck * 5 ? 15 : 0
      const result = store.addXp(xpBase + comboBonusXp(newCombo) + luckBonus + (opts.difficulty ?? 0) * 5)
      store.addEnergy(2)
      store.addBond(1)
      if (newCombo === 3) unlock('first-combo')
      if (newCombo === 10) unlock('combo-10')
      // 정답 1회 당 기약/통분 카운터는 약식: 챕터1~7 본 게임은 기약 + 다른 분모 위주이므로 합산
      trackCorrectSimplified()
      if (result.leveledUp) {
        setLevelUpBanner(result.newLevel)
        sfx.levelUp()
        setTimeout(() => setLevelUpBanner(null), 2200)
      }
      return { combo: newCombo, leveledUp: result.leveledUp }
    },
    [combo, store],
  )

  const onWrong = useCallback(
    (oxygenLoss = 10) => {
      store.addOxygen(-oxygenLoss)
      setCombo(0)
      setWrongCount((c) => c + 1)
      sfx.wrong()
    },
    [store],
  )

  const onTimeout = useCallback(
    (oxygenLoss = 15) => {
      store.addOxygen(-oxygenLoss)
      setCombo(0)
      setTimeoutCount((c) => c + 1)
      sfx.wrong()
    },
    [store],
  )

  const finish = useCallback(
    (extra?: { bossDefeated?: boolean }) => {
      const rank = computeRank(score, maxScore)
      const stars: 1 | 2 | 3 = (() => {
        if (rank === 'S' || rank === 'A') return 3
        if (rank === 'B') return 2
        return 1
      })()
      // 별 기록은 정답률도 반영
      const accStars = computeStars({
        correctCount,
        wrongCount,
        totalProblems: correctCount + wrongCount + timeoutCount || 1,
        maxCombo,
        timeoutCount,
      })
      const finalStars: 1 | 2 | 3 = Math.max(stars, accStars) as 1 | 2 | 3
      const elapsedMs = Date.now() - startedAt.current
      const totalAttempts = correctCount + wrongCount + timeoutCount
      const accuracy = totalAttempts > 0 ? correctCount / totalAttempts : 1
      store.recordChapter(chapterId, finalStars, maxCombo, { elapsedMs, accuracy })
      store.clearChapter(chapterId)
      const reward: ItemId = CHAPTER_REWARD_POOL[Math.floor(Math.random() * CHAPTER_REWARD_POOL.length)]
      store.giveItem(reward)
      unlock('first-item')
      if (wrongCount === 0 && timeoutCount === 0) unlock('no-wrong-clear')
      sfx.clear()
      navigate(`/chapter/${chapterId}/clear`, {
        state: {
          stars: finalStars,
          rank,
          maxCombo,
          score,
          rewardItemId: reward,
          elapsedMs: Date.now() - startedAt.current,
          ...extra,
        },
      })
    },
    [score, maxScore, chapterId, correctCount, wrongCount, timeoutCount, maxCombo, store, navigate],
  )

  // 산소 0 = 챕터 처음부터 (state는 외부에서 리셋해야 함)
  const isDead = store.oxygen <= 0

  return {
    combo,
    maxCombo,
    score,
    correctCount,
    wrongCount,
    timeoutCount,
    levelUpBanner,
    setCombo,
    setScore,
    onCorrect,
    onWrong,
    onTimeout,
    finish,
    isDead,
    store,
    navigate,
  }
}
