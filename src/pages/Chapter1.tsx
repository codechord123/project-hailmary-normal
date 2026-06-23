import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { chapter1Problems, pickApplicationProblems } from '@/data/chapter1'
import { addFractions, valueEquals, isSimplified } from '@/lib/fractionMath'
import { FractionInput } from '@/components/FractionInput'
import { FractionExpression } from '@/components/FractionDisplay'
import { FractionVisual } from '@/components/FractionVisual'
import { ManipulationScene } from '@/components/manipulation/ManipulationScene'
import { ResourceBar } from '@/components/ResourceBar'
import { DialogueBox } from '@/components/DialogueBox'
import { RockyAvatar } from '@/components/RockyAvatar'
import { CharacterAvatar } from '@/components/CharacterAvatar'
import { ShipDiagram } from '@/components/ShipDiagram'
import { NotebookOverlay } from '@/components/NotebookOverlay'
import { InventoryQuickSlot } from '@/components/InventoryQuickSlot'
import { StoryOverlay } from '@/components/StoryOverlay'
import { STORY } from '@/data/story'
import { LevelBadge } from '@/components/LevelBadge'
import { CountdownTimer } from '@/components/CountdownTimer'
import { CrisisOverlay } from '@/components/CrisisOverlay'
import { ConfettiBurst } from '@/components/ConfettiBurst'
import { EventCard } from '@/components/EventCard'
import { useGameStore } from '@/store/gameStore'
import { sfx } from '@/lib/sfx'
import { playBgm, stop as stopBgm } from '@/lib/bgm'
import { comboBonusXp, computeStars } from '@/lib/scoring'
import { rollEvent, type ThreatEvent } from '@/data/events'
import { CHAPTER_REWARD_POOL, ITEMS } from '@/data/items'
import { computeLevelInfo } from '@/lib/leveling'
import type { Fraction } from '@/types/fraction'
import { ProblemPanel } from '@/components/problem/ProblemPanel'
import { judge } from '@/lib/judge'
import type { StudentAnswer } from '@/types/problem'

type Feedback =
  | { kind: 'idle' }
  | { kind: 'correct' }
  | { kind: 'wrong'; message: string }
  | { kind: 'need-simplify' }
  | { kind: 'timeout' }

export function Chapter1() {
  const [showIntro, setShowIntro] = useState(true)
  const [showOutro, setShowOutro] = useState(false)
  const [showNotebook, setShowNotebook] = useState(false)
  const [shieldActive, setShieldActive] = useState(false)
  const [idx, setIdx] = useState(0)
  const [answer, setAnswer] = useState<Fraction | null>(null)
  const [seedAnswer, setSeedAnswer] = useState<Fraction | null>(null)
  const [feedback, setFeedback] = useState<Feedback>({ kind: 'idle' })
  const [showHint, setShowHint] = useState(false)
  const [showVisual, setShowVisual] = useState(false)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [timeoutCount, setTimeoutCount] = useState(0)
  const [event, setEvent] = useState<ThreatEvent | null>(null)
  const [timeBonus, setTimeBonus] = useState(0) // 이벤트로 누적되는 시간 보정
  const [xpBonus, setXpBonus] = useState(0)
  const [simplifyAidActive, setSimplifyAidActive] = useState(false)
  const [confetti, setConfetti] = useState(false)
  const [levelUpBanner, setLevelUpBanner] = useState<number | null>(null)
  const [appAnswer, setAppAnswer] = useState<StudentAnswer>({ kind: 'fraction', value: null })
  const store = useGameStore()
  const navigate = useNavigate()
  const startedAt = useRef(Date.now())

  // mount 시 manipulation 5 + 응용 2 (풀에서 랜덤)으로 시퀀스 구성
  const sequence = useMemo(() => {
    const manips = chapter1Problems.filter((p) => p.kind === 'manipulation')
    const apps = pickApplicationProblems(2)
    return [...manips, ...apps]
  }, [])
  const problem = sequence[idx]
  const manipProblem = problem.kind === 'manipulation' ? problem : null
  const appProblem = problem.kind === 'application' ? problem : null
  const expected = useMemo(
    () => (manipProblem ? addFractions(manipProblem.a, manipProblem.b) : { numerator: 0, denominator: 1 }),
    [manipProblem],
  )
  const isLast = idx === sequence.length - 1
  const crisis = isLast

  const baseTime = store.baseTimePerProblem()
  const timerSeconds = Math.max(
    8,
    (crisis ? baseTime - 10 : baseTime) + timeBonus,
  )

  // 산소 0 이면 챕터 처음으로 (XP는 유지)
  useEffect(() => {
    if (store.oxygen <= 0) {
      sfx.crisis()
      store.resetForChapter()
      setIdx(0)
      setCombo(0)
      setFeedback({ kind: 'idle' })
      setShowHint(false)
      setTimeBonus(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.oxygen])

  // 챕터 시작 시 산소 풀 + BGM
  useEffect(() => {
    store.resetForChapter()
    playBgm('chapter1')
    return () => stopBgm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTimeout = useCallback(() => {
    if (feedback.kind !== 'idle') return
    store.addOxygen(-15)
    setCombo(0)
    setTimeoutCount((c) => c + 1)
    setFeedback({ kind: 'timeout' })
    sfx.wrong()
  }, [feedback.kind, store])

  const submit = useCallback(() => {
    // 응용 문제 모드
    if (appProblem) {
      const r = judge(appProblem.problem, appAnswer)
      if (r.kind === 'wrong') {
        if (shieldActive) {
          setShieldActive(false)
          setFeedback({ kind: 'wrong', message: '🛡 보호막이 오답을 막았어!' })
          return
        }
        store.addOxygen(-10)
        setCombo(0)
        setWrongCount((c) => c + 1)
        setFeedback({ kind: 'wrong', message: r.reason })
        sfx.wrong()
        return
      }
      if (r.kind === 'need-simplify') {
        store.addOxygen(-5)
        setFeedback({ kind: 'need-simplify' })
        sfx.wrong()
        return
      }
      // 응용 정답 분기는 아래 공통 처리로 (combo, xp 등)
    } else {
      if (!answer) return
      if (!valueEquals(answer, expected)) {
        if (shieldActive) {
          setShieldActive(false)
          setFeedback({ kind: 'wrong', message: '🛡 보호막이 오답을 막았어!' })
          return
        }
        store.addOxygen(-10)
        setCombo(0)
        setWrongCount((c) => c + 1)
        setFeedback({ kind: 'wrong', message: '값이 달라. 분모는 그대로, 분자끼리 더해봐.' })
        sfx.wrong()
        return
      }
      if (manipProblem && manipProblem.requireSimplified && !simplifyAidActive && !isSimplified(answer)) {
        store.addOxygen(-5)
        setFeedback({ kind: 'need-simplify' })
        sfx.wrong()
        return
      }
    }
    // 정답
    const newCombo = combo + 1
    setCombo(newCombo)
    setMaxCombo((m) => Math.max(m, newCombo))
    setCorrectCount((c) => c + 1)

    const baseXp = 20
    const bonus = comboBonusXp(newCombo)
    const crisisMult = crisis ? 2 : 1
    const luckBonus = Math.random() * 100 < store.stats.luck * 5 ? 10 : 0
    const totalXp = (baseXp + bonus + xpBonus + luckBonus) * crisisMult

    const result = store.addXp(totalXp)
    store.addEnergy(2)
    store.addBond(1)
    setFeedback({ kind: 'correct' })
    setConfetti(true)
    setTimeout(() => setConfetti(false), 900)
    sfx.correct()
    if (result.leveledUp) {
      setLevelUpBanner(result.newLevel)
      sfx.levelUp()
      setTimeout(() => setLevelUpBanner(null), 2400)
    }
  }, [answer, expected, manipProblem, appProblem, appAnswer, combo, simplifyAidActive, crisis, xpBonus, store])

  const next = useCallback(() => {
    if (isLast) {
      // 챕터 클리어 처리
      const stars = computeStars({
        correctCount,
        wrongCount,
        totalProblems: sequence.length,
        maxCombo,
        timeoutCount,
      })
      store.recordChapter(1, stars, maxCombo)
      store.clearChapter(1)
      // 보상 아이템
      const reward = CHAPTER_REWARD_POOL[Math.floor(Math.random() * CHAPTER_REWARD_POOL.length)]
      store.giveItem(reward)
      sfx.clear()
      navigate('/chapter/1/clear', {
        state: {
          stars,
          maxCombo,
          rewardItemId: reward,
          elapsedMs: Date.now() - startedAt.current,
        },
      })
      return
    }
    setIdx((i) => i + 1)
    setAnswer(null)
    setSeedAnswer(null)
    setAppAnswer({ kind: 'fraction', value: null })
    setFeedback({ kind: 'idle' })
    setShowHint(false)
    setShowVisual(false)
    setXpBonus(0)
    setTimeBonus(0)
    // 이벤트 굴림
    const ev = rollEvent(0.35)
    if (ev) setEvent(ev)
  }, [isLast, correctCount, wrongCount, maxCombo, timeoutCount, store, navigate])

  const useHint = () => {
    const cost = Math.max(1, 1 - Math.floor(store.stats.intuition / 2))
    if (store.energy < cost) return
    store.addEnergy(-cost)
    setShowHint(true)
  }

  const useOxygenPack = () => {
    if (store.useItem('oxygen-pack')) {
      store.addOxygen(25)
    }
  }

  const useSimplifyAid = () => {
    if (store.useItem('simplify-aid')) {
      setSimplifyAidActive(true)
    }
  }

  const handleEventChoice = (i: number) => {
    if (!event) return
    const c = event.choices[i]
    if (c.oxygenDelta) store.addOxygen(c.oxygenDelta)
    if (c.timeBonus) setTimeBonus(c.timeBonus)
    if (c.xpBonus) setXpBonus(c.xpBonus)
    setEvent(null)
  }

  const rockyMood = feedback.kind === 'correct'
    ? 'happy'
    : feedback.kind === 'wrong' || feedback.kind === 'timeout'
      ? 'sad'
      : showHint
        ? 'thinking'
        : 'neutral'

  return (
    <div className="min-h-screen px-4 sm:px-6 py-4 max-w-2xl mx-auto flex flex-col relative">
      <CrisisOverlay active={crisis} />
      <ConfettiBurst show={confetti} />

      <AnimatePresence>
        {event && <EventCard event={event} onChoose={handleEventChoice} />}
      </AnimatePresence>

      <AnimatePresence>
        {levelUpBanner !== null && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-bold shadow-xl"
          >
            🎉 LEVEL UP! Lv.{levelUpBanner} · 스탯 포인트 +1
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex items-center justify-between gap-2">
        <Link to="/chapters" className="text-white/60 hover:text-white text-sm">
          ← 챕터 선택
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotebook(true)}
            className="px-2 py-1 rounded bg-amber-400/20 text-amber-200 border border-amber-300/40 text-xs"
          >
            📝 노트
          </button>
          <LevelBadge compact />
        </div>
      </header>

      <div className="mt-2">
        <InventoryQuickSlot
          onUseOxygen={() => {}}
          onUseShield={() => setShieldActive(true)}
          onUseMagnet={() => {
            if (manipProblem) setSeedAnswer(expected)
          }}
          shieldActive={shieldActive}
          simplifyAidActive={simplifyAidActive}
          onUseSimplifyAid={() => setSimplifyAidActive(true)}
        />
      </div>

      <ResourceBar />

      <h2 className="mt-4 text-xl font-bold text-white flex items-center gap-2">
        Chapter 1. 깨어남
        <span className="text-white/40 text-sm">({idx + 1}/{sequence.length})</span>
        {combo >= 2 && (
          <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 text-xs">
            🔥 {combo} 콤보!
          </span>
        )}
      </h2>

      <div className="mt-3">
        <ShipDiagram modules={sequence.length} repaired={correctCount} />
      </div>

      <div className="mt-3">
        <CountdownTimer
          durationSec={timerSeconds}
          paused={feedback.kind !== 'idle' || !!event || showHint}
          onTimeout={handleTimeout}
          resetKey={`${idx}-${timerSeconds}`}
          crisis={crisis}
        />
      </div>

      <div className="mt-4 flex items-start gap-3">
        <div className="flex-shrink-0">
          <RockyAvatar mood={rockyMood} size={64} />
        </div>
        <div className="flex-1 space-y-2">
          <DialogueBox speaker="시스템" tone="system" text={problem.story} />
          {showHint && manipProblem && <DialogueBox speaker="로키" tone="rocky" text={manipProblem.hint} />}
          {showHint && appProblem && <DialogueBox speaker="로키" tone="rocky" text={appProblem.problem.hint} />}
          {appProblem && (
            <DialogueBox
              speaker={`응용 · ★${appProblem.problem.difficulty}`}
              tone="narrator"
              text={appProblem.problem.scenario + ' ' + appProblem.problem.prompt}
            />
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10">
        {manipProblem && (
          <>
            <FractionExpression a={manipProblem.a} b={manipProblem.b} operation="add" />
            <ManipulationScene
              a={manipProblem.a}
              b={manipProblem.b}
              themeId={manipProblem.scene}
              resetKey={manipProblem.id}
              onComplete={(combined) => setSeedAnswer(combined)}
              onTransfer={() => sfx.tick()}
            />
            {showVisual && <FractionVisual a={manipProblem.a} b={manipProblem.b} operation="add" />}
            <FractionInput
              onChange={setAnswer}
              disabled={feedback.kind === 'correct'}
              seed={seedAnswer}
            />
            {manipProblem.requireSimplified && !simplifyAidActive && (
              <div className="text-xs text-yellow-300/90">⚠ 기약분수로 답해야 정답이야.</div>
            )}
            {manipProblem.requireSimplified && !simplifyAidActive && seedAnswer && !isSimplified(seedAnswer) && (
              <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-400/40 rounded-md p-2 max-w-sm text-center">
                💡 셀을 다 옮기면 <b>{seedAnswer.numerator}/{seedAnswer.denominator}</b>야.
                분자와 분모를 같은 수로 나눠 <b>약분</b>해서 입력해봐!
              </div>
            )}
          </>
        )}
        {appProblem && (
          <ProblemPanel
            problem={appProblem.problem}
            onAnswerChange={setAppAnswer}
            disabled={feedback.kind === 'correct'}
          />
        )}
        {simplifyAidActive && (
          <div className="text-xs text-emerald-300">🧪 약분 도우미 활성 — 기약분수 요구 해제됨</div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {feedback.kind === 'correct' && (
          <motion.div
            key="ok"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 p-3 rounded-xl bg-green-500/15 border border-green-400/40 text-green-200 text-sm"
          >
            ✅ 정답! +XP · ⚡+2 · 🤝+1 {crisis && ' (위기 보너스 ×2)'}
          </motion.div>
        )}
        {feedback.kind === 'wrong' && (
          <motion.div
            key="ng"
            initial={{ x: -8 }}
            animate={{ x: [0, -6, 6, -4, 4, 0] }}
            className="mt-3 p-3 rounded-xl bg-red-500/15 border border-red-400/40 text-red-200 text-sm"
          >
            ❌ {feedback.message} (산소 -10🫁 · 콤보 리셋)
          </motion.div>
        )}
        {feedback.kind === 'need-simplify' && (
          <motion.div
            key="simp"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 p-3 rounded-xl bg-yellow-500/15 border border-yellow-400/40 text-yellow-200 text-sm"
          >
            🤏 값은 맞지만 기약분수가 아니야! 다시 (-5🫁)
          </motion.div>
        )}
        {feedback.kind === 'timeout' && (
          <motion.div
            key="to"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 p-3 rounded-xl bg-orange-500/15 border border-orange-400/40 text-orange-200 text-sm"
          >
            ⏱ 시간 초과! (산소 -15🫁 · 콤보 리셋)
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex flex-wrap gap-2">
        {feedback.kind === 'correct' ? (
          <button
            onClick={next}
            className="flex-1 px-4 py-3 rounded-xl bg-space-accent text-space-900 font-bold hover:brightness-110 active:scale-95"
          >
            {isLast ? '챕터 완료 →' : '다음 문제 →'}
          </button>
        ) : feedback.kind === 'idle' ? (
          <>
            <button
              onClick={submit}
              disabled={manipProblem ? !answer : false}
              className="flex-1 px-4 py-3 rounded-xl bg-space-accent text-space-900 font-bold disabled:opacity-40"
            >
              제출
            </button>
            <button
              onClick={useHint}
              disabled={showHint || store.energy < 1}
              className="px-3 py-3 rounded-xl bg-rocky/20 text-rocky border border-rocky/40 disabled:opacity-30"
            >
              💡 힌트
            </button>
            {manipProblem && manipProblem.a.denominator === manipProblem.b.denominator && (
              <button
                onClick={() => setShowVisual((v) => !v)}
                className="px-3 py-3 rounded-xl bg-cyan-400/15 text-cyan-200 border border-cyan-400/30"
              >
                📊 시각화
              </button>
            )}
          </>
        ) : (
          <button
            onClick={() => setFeedback({ kind: 'idle' })}
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20"
          >
            다시 시도
          </button>
        )}
      </div>

      {/* 인벤토리 빠른 사용 */}
      <div className="mt-3 flex gap-2 text-xs">
        <button
          onClick={useOxygenPack}
          disabled={(store.items['oxygen-pack'] ?? 0) < 1}
          className="px-2 py-1 rounded bg-white/10 text-white/80 disabled:opacity-30"
        >
          {ITEMS['oxygen-pack'].icon} 산소팩 ×{store.items['oxygen-pack'] ?? 0}
        </button>
        <button
          onClick={useSimplifyAid}
          disabled={simplifyAidActive || (store.items['simplify-aid'] ?? 0) < 1}
          className="px-2 py-1 rounded bg-white/10 text-white/80 disabled:opacity-30"
        >
          {ITEMS['simplify-aid'].icon} 약분 도우미 ×{store.items['simplify-aid'] ?? 0}
        </button>
      </div>

      <div className="mt-2">
        <CharacterAvatar size={56} pose="idle" />
      </div>

      <NotebookOverlay open={showNotebook} onClose={() => setShowNotebook(false)} />
      {showIntro && (
        <StoryOverlay lines={STORY[1].intro} onClose={() => setShowIntro(false)} />
      )}
      {showOutro && (
        <StoryOverlay lines={STORY[1].outro} onClose={() => setShowOutro(false)} />
      )}
    </div>
  )
}

export function Chapter1Clear() {
  const totalXp = useGameStore((s) => s.totalXp)
  const info = computeLevelInfo(totalXp)

  // navigate state로 받은 결과 — 단순화: window.history.state 활용
  const state = (window.history.state?.usr ?? {}) as {
    stars?: number
    maxCombo?: number
    rewardItemId?: keyof typeof ITEMS
    elapsedMs?: number
  }
  const stars = state.stars ?? 1
  const reward = state.rewardItemId ? ITEMS[state.rewardItemId] : null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <motion.div initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="text-6xl">
        🛰️
      </motion.div>
      <h2 className="mt-4 text-3xl font-bold text-white">챕터 1 클리어!</h2>

      <div className="mt-4 text-4xl">
        {'★'.repeat(stars)}
        <span className="text-white/15">{'★'.repeat(3 - stars)}</span>
      </div>

      <div className="mt-4 text-white/70">
        <div>최고 콤보: 🔥 {state.maxCombo ?? 0}</div>
        <div className="mt-1">
          현재 레벨: <span className={info.titleColor}>Lv.{info.level} {info.title}</span>
        </div>
      </div>

      {reward && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="mt-5 p-4 rounded-xl bg-yellow-400/15 border border-yellow-300/40"
        >
          <div className="text-xs text-yellow-200">획득 보상</div>
          <div className="text-2xl mt-1">{reward.icon} {reward.name}</div>
        </motion.div>
      )}

      <p className="mt-6 text-white/60 max-w-md">
        산소 탱크와 비상 전원이 복구되었다. 깊은 정적 너머에서 무언가 신호가 들린다…
      </p>

      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Link
          to="/chapter/1"
          className="px-6 py-3 rounded-xl bg-space-accent text-space-900 font-bold"
        >
          ↺ 재도전
        </Link>
        <Link
          to="/cabinet"
          className="px-6 py-3 rounded-xl bg-pink-400/20 text-pink-200 border border-pink-300/40"
        >
          🧳 캐비닛
        </Link>
        <Link
          to="/chapters"
          className="px-6 py-3 rounded-xl bg-white/10 text-white border border-white/20"
        >
          챕터 선택
        </Link>
      </div>
    </div>
  )
}
