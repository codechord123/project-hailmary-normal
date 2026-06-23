import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { chapter3Problems, CHAPTER3_BOSS } from '@/data/chapter3'
import { ProblemPanel } from '@/components/problem/ProblemPanel'
import { Boss } from '@/components/arcade/Boss'
import { DamageFloater, type DamageNumber } from '@/components/arcade/DamageFloater'
import { StageHeader } from '@/components/arcade/StageHeader'
import { ScreenShake } from '@/components/arcade/ScreenShake'
import { CountdownTimer } from '@/components/CountdownTimer'
import { ResourceBar } from '@/components/ResourceBar'
import { LevelBadge } from '@/components/LevelBadge'
import { DialogueBox } from '@/components/DialogueBox'
import { RockyAvatar } from '@/components/RockyAvatar'
import { CrisisOverlay } from '@/components/CrisisOverlay'
import { ConfettiBurst } from '@/components/ConfettiBurst'
import { useGameStore } from '@/store/gameStore'
import { useShortcuts } from '@/hooks/useShortcuts'
import { GradeFlash, gradeFor, type Grade } from '@/components/arcade/GradeFlash'
import { RoundIntro } from '@/components/arcade/RoundIntro'
import { SuperGauge } from '@/components/arcade/SuperGauge'
import { sfx } from '@/lib/sfx'
import { InventoryQuickSlot } from '@/components/InventoryQuickSlot'
import { NotebookOverlay } from '@/components/NotebookOverlay'
import { StoryOverlay } from '@/components/StoryOverlay'
import { STORY } from '@/data/story'
import { playBgm, stop as stopBgm } from '@/lib/bgm'
import { judge, correctAnswerFor } from '@/lib/judge'
import { computeRank } from '@/lib/judge'
import { BonusProblemOverlay } from '@/components/BonusProblemOverlay'
import { pickBonusProblem } from '@/data/bonusProblems'
import { comboBonusXp } from '@/lib/scoring'
import { CHAPTER_REWARD_POOL } from '@/data/items'
import type { StudentAnswer } from '@/types/problem'

type Feedback =
  | { kind: 'idle' }
  | { kind: 'correct'; damage: number; crit: boolean }
  | { kind: 'wrong'; reason: string }
  | { kind: 'need-simplify' }
  | { kind: 'timeout' }

export function Chapter3() {
  const [idx, setIdx] = useState(0)
  const [bossHp, setBossHp] = useState(CHAPTER3_BOSS.maxHp)
  const [studentAnswer, setStudentAnswer] = useState<StudentAnswer>({
    kind: 'fraction',
    value: null,
  })
  const [feedback, setFeedback] = useState<Feedback>({ kind: 'idle' })
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [score, setScore] = useState(0)
  const [shakeKey, setShakeKey] = useState(0)
  const [bossHit, setBossHit] = useState(false)
  const [confetti, setConfetti] = useState(false)
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([])
  const [showBonus, setShowBonus] = useState(false)
  const [pendingClear, setPendingClear] = useState<null | (() => void)>(null)
  const [showNotebook, setShowNotebook] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const [shieldActive, setShieldActive] = useState(false)
  const [timerPaused, setTimerPaused] = useState(false)
  const [magnetSeed, setMagnetSeed] = useState<{ id: number; answer: StudentAnswer } | null>(null)
  const [grade, setGrade] = useState<Grade>(null)
  const [showRoundIntro, setShowRoundIntro] = useState(true)
  const [sp, setSp] = useState(0)
  const bonus = useMemo(() => pickBonusProblem(3), [])
  const damageIdRef = useRef(0)
  const store = useGameStore()
  const navigate = useNavigate()
  const startedAt = useRef(Date.now())

  const problem = chapter3Problems[idx]
  const isLast = idx === chapter3Problems.length - 1
  const bossDead = bossHp <= 0
  const crisis = bossHp < CHAPTER3_BOSS.maxHp * 0.3 && !bossDead

  const baseTime = store.baseTimePerProblem()
  const timerSeconds = problem.difficulty === 3 ? baseTime + 15 : baseTime + 5

  useEffect(() => {
    store.resetForChapter()
    playBgm('chapter3')
    return () => stopBgm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (store.oxygen <= 0) {
      sfx.crisis()
      store.resetForChapter()
      setIdx(0)
      setBossHp(CHAPTER3_BOSS.maxHp)
      setCombo(0)
      setScore(0)
      setFeedback({ kind: 'idle' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.oxygen])

  const pushDamage = (amount: number, type: DamageNumber['type']) => {
    damageIdRef.current += 1
    const id = damageIdRef.current
    const x = 0.35 + Math.random() * 0.3
    setDamageNumbers((ns) => [...ns, { id, amount, type, x }])
    setTimeout(() => {
      setDamageNumbers((ns) => ns.filter((n) => n.id !== id))
    }, 1100)
  }

  const handleAnswerChange = useCallback((a: StudentAnswer) => {
    setStudentAnswer(a)
  }, [])

  const handleTimeout = useCallback(() => {
    if (feedback.kind !== 'idle') return
    store.addOxygen(-15)
    setCombo(0)
    setFeedback({ kind: 'timeout' })
    pushDamage(0, 'miss')
    sfx.wrong()
    setShakeKey((k) => k + 1)
  }, [feedback.kind, store])

  const submit = useCallback(() => {
    const result = judge(problem, studentAnswer)
    if (result.kind === 'wrong') {
      if (shieldActive) {
        setShieldActive(false)
        setFeedback({ kind: 'wrong', reason: '🛡 보호막 발동' })
        return
      }
      store.addOxygen(-10)
      setCombo(0)
      setFeedback({ kind: 'wrong', reason: result.reason })
      pushDamage(0, 'miss')
      sfx.wrong()
      setShakeKey((k) => k + 1)
      return
    }
    if (result.kind === 'need-simplify') {
      store.addOxygen(-5)
      setFeedback({ kind: 'need-simplify' })
      sfx.wrong()
      return
    }
    // 정답
    const newCombo = combo + 1
    setCombo(newCombo)
    setMaxCombo((m) => Math.max(m, newCombo))

    // 데미지 계산
    const baseDmg = 15 + problem.difficulty * 3
    const isCrit = newCombo >= 5 || (newCombo >= 3 && Math.random() < 0.5)
    const dmg = Math.round((baseDmg + comboBonusXp(newCombo) * 0.4) * (isCrit ? 2 : 1))

    setBossHp((hp) => Math.max(0, hp - dmg))
    setBossHit(true)
    setTimeout(() => setBossHit(false), 350)
    pushDamage(dmg, isCrit ? 'crit' : 'normal')

    // 스코어
    const gained = dmg * 10 + (isCrit ? 200 : 0)
    setScore((s) => s + gained)

    // XP
    const xpBase = 25 + problem.difficulty * 10
    const xpBonus = comboBonusXp(newCombo)
    const luckBonus = Math.random() * 100 < store.stats.luck * 5 ? 15 : 0
    store.addXp(xpBase + xpBonus + luckBonus)
    store.addEnergy(2)
    store.addBond(1)

    setFeedback({ kind: 'correct', damage: dmg, crit: isCrit })
    if (isCrit) sfx.crit()
    else sfx.hit()
    setConfetti(true)
    setTimeout(() => setConfetti(false), 700)
    if (isCrit) setShakeKey((k) => k + 1)
    // 캡콤식 등급 표시
    const g = gradeFor(newCombo, isCrit)
    setGrade(g)
    setTimeout(() => setGrade(null), 800)
    // SP 게이지 충전 (콤보·크리티컬에 비례)
    setSp((s) => Math.min(100, s + (isCrit ? 25 : 12 + newCombo * 2)))
  }, [problem, studentAnswer, combo, store, shieldActive])

  const next = useCallback(() => {
    const newBossHp = bossHp
    if (newBossHp <= 0 || isLast) {
      // 클리어 — 보너스 게이트
      const maxScorePossible = chapter3Problems.length * 600
      const rank = computeRank(score, maxScorePossible)
      const stars = rank === 'S' ? 3 : rank === 'A' ? 3 : rank === 'B' ? 2 : 1
      const reward = CHAPTER_REWARD_POOL[Math.floor(Math.random() * CHAPTER_REWARD_POOL.length)]
      const doClear = () => {
        const elapsedMs = Date.now() - startedAt.current
        store.recordChapter(3, stars, maxCombo, { elapsedMs })
        store.clearChapter(3)
        store.giveItem(reward)
        sfx.bossDie()
        navigate(`/chapter/3/clear`, {
          state: {
            stars,
            rank,
            maxCombo,
            score,
            rewardItemId: reward,
            elapsedMs: Date.now() - startedAt.current,
            bossDefeated: newBossHp <= 0,
          },
        })
      }
      setPendingClear(() => doClear)
      setShowBonus(true)
      return
    }
    setIdx((i) => i + 1)
    setFeedback({ kind: 'idle' })
    setMagnetSeed(null)
    setStudentAnswer({ kind: 'fraction', value: null })
  }, [bossHp, isLast, score, maxCombo, store, navigate])

  useShortcuts({
    onSubmit: feedback.kind === 'idle' ? submit : undefined,
    onNotebook: () => setShowNotebook(true),
  })

  const rockyMood = feedback.kind === 'correct'
    ? feedback.crit ? 'excited' : 'happy'
    : feedback.kind === 'wrong' || feedback.kind === 'timeout'
      ? 'sad'
      : 'neutral'

  return (
    <div className="min-h-screen px-4 sm:px-6 py-4 max-w-2xl mx-auto flex flex-col">
      <CrisisOverlay active={crisis} />
      <ConfettiBurst show={confetti} />

      <ScreenShake shake={shakeKey}>
        <header className="flex items-center justify-between gap-2">
          <Link to="/chapters" className="text-white/60 hover:text-white text-sm">
            ← 챕터 선택
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowNotebook(true)} className="px-2 py-1 rounded bg-amber-400/20 text-amber-200 border border-amber-300/40 text-xs">📝 노트</button>
            <LevelBadge compact />
          </div>
        </header>

        <StageHeader
          stage={`STAGE 3-${idx + 1}`}
          subtitle="미지의 신호 — 약분과 통분 심화"
          combo={combo}
          score={score}
        />

        <div className="mt-2">
          <SuperGauge
            value={sp}
            onTrigger={() => {
              // SP 풀충전 발동: 거대한 데미지 + 화면 흔들림 + 보스 비명
              const dmg = 80
              setBossHp((hp) => Math.max(0, hp - dmg))
              pushDamage(dmg, 'crit')
              setBossHit(true)
              setShakeKey((k) => k + 1)
              setGrade('PERFECT')
              setTimeout(() => setBossHit(false), 350)
              setTimeout(() => setGrade(null), 900)
              sfx.bossLaugh()
              setSp(0)
            }}
          />
        </div>
        <div className="mt-2">
          <InventoryQuickSlot
            onUseOxygen={() => {}}
            onUseShield={() => setShieldActive(true)}
            onUseBomb={() => {
              const dmg = 50
              setBossHp((hp) => Math.max(0, hp - dmg))
              pushDamage(dmg, 'crit')
              setBossHit(true)
              setTimeout(() => setBossHit(false), 350)
              sfx.crit()
            }}
            onUseTimeFreeze={() => {
              setTimerPaused(true)
              setTimeout(() => setTimerPaused(false), 10000)
            }}
            onUseMagnet={() => {
              // 자석: 정답을 input에 자동 채움 + 보스 데미지 + XP 절반
              setMagnetSeed({ id: Date.now(), answer: correctAnswerFor(problem) })
              const dmg = 20
              setBossHp((hp) => Math.max(0, hp - dmg))
              pushDamage(dmg, 'normal')
              sfx.hit()
              store.addXp(10)
            }}
            shieldActive={shieldActive}
          />
        </div>

        <ResourceBar />

        {/* 보스 + 데미지 플로터 */}
        <div className="relative mt-4">
          <Boss
            name={CHAPTER3_BOSS.name}
            hp={bossHp}
            maxHp={CHAPTER3_BOSS.maxHp}
            isHit={bossHit}
            isDead={bossDead}
          />
          <DamageFloater numbers={damageNumbers} />
        </div>

        <div className="mt-4">
          <CountdownTimer
            durationSec={timerSeconds}
            paused={feedback.kind !== 'idle' || bossDead || timerPaused}
            onTimeout={handleTimeout}
            resetKey={`${idx}-${timerSeconds}`}
            crisis={crisis}
          />
        </div>

        <div className="mt-4 flex items-start gap-3">
          <RockyAvatar mood={rockyMood} size={64} />
          <div className="flex-1 space-y-2">
            <DialogueBox speaker="시스템" tone="system" text={problem.scenario} />
            {/* 챕터 3 — 힌트 제거 (학생이 시나리오만 보고 직접 풀도록) */}
            <DialogueBox
              speaker={`문제 · 난이도 ${'★'.repeat(problem.difficulty)}`}
              tone="narrator"
              text={problem.prompt}
            />
          </div>
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10">
          {magnetSeed && (
            <div className="mb-3 p-2 rounded-lg bg-pink-500/20 border border-pink-400/40 text-pink-200 text-center text-xs">
              🧲 자석이 입력칸에 정답을 채웠어! 제출하면 정답 처리.
            </div>
          )}
          <ProblemPanel
            problem={problem}
            onAnswerChange={handleAnswerChange}
            disabled={feedback.kind === 'correct' || bossDead}
            externalSeed={magnetSeed}
          />
        </div>

        <AnimatePresence mode="wait">
          {feedback.kind === 'correct' && (
            <motion.div
              key="ok"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-3 p-3 rounded-xl border text-sm ${
                feedback.crit
                  ? 'bg-red-500/20 border-red-300/60 text-red-100 font-bold'
                  : 'bg-green-500/15 border-green-400/40 text-green-200'
              }`}
            >
              {feedback.crit ? '💥 CRITICAL HIT!' : '✅ 명중!'} 데미지 {feedback.damage}
            </motion.div>
          )}
          {feedback.kind === 'wrong' && (
            <motion.div
              key="ng"
              initial={{ x: -8 }}
              animate={{ x: [0, -6, 6, -4, 4, 0] }}
              className="mt-3 p-3 rounded-xl bg-red-500/15 border border-red-400/40 text-red-200 text-sm"
            >
              ❌ {feedback.reason} (산소 -10🫁 · 콤보 리셋)
            </motion.div>
          )}
          {feedback.kind === 'need-simplify' && (
            <motion.div
              key="simp"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 p-3 rounded-xl bg-yellow-500/15 border border-yellow-400/40 text-yellow-200 text-sm"
            >
              🤏 기약분수로 다시! (-5🫁)
            </motion.div>
          )}
          {feedback.kind === 'timeout' && (
            <motion.div
              key="to"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 p-3 rounded-xl bg-orange-500/15 border border-orange-400/40 text-orange-200 text-sm"
            >
              ⏱ MISS! 보스가 회피했어. (-15🫁)
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 flex flex-wrap gap-2">
          {feedback.kind === 'correct' || bossDead ? (
            <button
              onClick={next}
              className="flex-1 px-4 py-3 rounded-xl bg-space-accent text-space-900 font-bold"
            >
              {bossDead ? '🏆 보스 처치 →' : isLast ? '챕터 완료 →' : '다음 공격 →'}
            </button>
          ) : feedback.kind === 'idle' ? (
            <>
              <button
                onClick={submit}
                className="flex-1 px-4 py-3 rounded-xl bg-space-accent text-space-900 font-bold"
              >
                ⚔ 공격
              </button>
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
      </ScreenShake>

      {showBonus && (
        <BonusProblemOverlay chapterId={3}
          problem={bonus}
          onPass={() => pendingClear?.()}
          onFail={() => store.addOxygen(-5)}
        />
      )}
      <NotebookOverlay open={showNotebook} onClose={() => setShowNotebook(false)} />
      <GradeFlash grade={grade} combo={combo} />
      <RoundIntro show={showRoundIntro} title="STAGE 3 — 미지의 신호" subtitle="아스트로파지 정찰병 등장" onFinished={() => setShowRoundIntro(false)} />
      {showIntro && <StoryOverlay lines={STORY[3].intro} onClose={() => setShowIntro(false)} />}
    </div>
  )
}

export function Chapter3Clear() {
  const state = (window.history.state?.usr ?? {}) as {
    stars?: number
    rank?: string
    maxCombo?: number
    score?: number
    rewardItemId?: string
    bossDefeated?: boolean
  }
  const rank = state.rank ?? 'C'
  const rankColors: Record<string, string> = {
    S: 'text-yellow-300',
    A: 'text-pink-300',
    B: 'text-cyan-300',
    C: 'text-white/70',
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className={`text-9xl font-black ${rankColors[rank]} font-mono drop-shadow-[4px_4px_0_rgba(0,0,0,0.6)]`}
      >
        {rank}
      </motion.div>
      <h2 className="mt-2 text-2xl font-bold text-white">
        {state.bossDefeated ? '🏆 보스 처치!' : '챕터 종료'}
      </h2>
      <div className="mt-4 text-white/70 space-y-1 font-mono">
        <div>SCORE: <span className="text-yellow-200">{state.score?.toLocaleString() ?? 0}</span></div>
        <div>MAX COMBO: <span className="text-pink-200">×{state.maxCombo ?? 0}</span></div>
      </div>
      <div className="mt-8 flex gap-3">
        <Link to="/chapter/3" className="px-6 py-3 rounded-xl bg-space-accent text-space-900 font-bold">
          ↺ 재도전
        </Link>
        <Link to="/chapters" className="px-6 py-3 rounded-xl bg-white/10 text-white border border-white/20">
          챕터 선택
        </Link>
      </div>
    </div>
  )
}
