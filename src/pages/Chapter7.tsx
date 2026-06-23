import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { chapter7Phases, QUEEN } from '@/data/chapter7'
import { ProblemPanel } from '@/components/problem/ProblemPanel'
import { Boss } from '@/components/arcade/Boss'
import { DamageFloater, type DamageNumber } from '@/components/arcade/DamageFloater'
import { StageHeader } from '@/components/arcade/StageHeader'
import { ScreenShake } from '@/components/arcade/ScreenShake'
import { CrisisOverlay } from '@/components/CrisisOverlay'
import { CountdownTimer } from '@/components/CountdownTimer'
import { ResourceBar } from '@/components/ResourceBar'
import { LevelBadge } from '@/components/LevelBadge'
import { DialogueBox } from '@/components/DialogueBox'
import { RockyAvatar } from '@/components/RockyAvatar'
import { useChapterRun } from '@/hooks/useChapterRun'
import { judge, correctAnswerFor } from '@/lib/judge'
import { InventoryQuickSlot } from '@/components/InventoryQuickSlot'
import { GradeFlash, gradeFor, type Grade } from '@/components/arcade/GradeFlash'
import { RoundIntro } from '@/components/arcade/RoundIntro'
import { SuperGauge } from '@/components/arcade/SuperGauge'
import { BonusProblemOverlay } from '@/components/BonusProblemOverlay'
import { pickBonusProblem } from '@/data/bonusProblems'
import { sfx } from '@/lib/sfx'
import { NotebookOverlay } from '@/components/NotebookOverlay'
import { StoryOverlay } from '@/components/StoryOverlay'
import { STORY } from '@/data/story'
import { playBgm, stop as stopBgm } from '@/lib/bgm'
import type { StudentAnswer } from '@/types/problem'

const TOTAL_PROBLEMS = chapter7Phases.reduce((s, p) => s + p.problems.length, 0)

export function Chapter7() {
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [problemIdx, setProblemIdx] = useState(0)
  const [hp, setHp] = useState(QUEEN.maxHp)
  const [studentAnswer, setStudentAnswer] = useState<StudentAnswer>({ kind: 'fraction', value: null })
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'simplify' | 'timeout' | 'correct'>('idle')
  const [bossHit, setBossHit] = useState(false)
  const [bossDead, setBossDead] = useState(false)
  const [showBonus, setShowBonus] = useState(false)
  const [showNotebook, setShowNotebook] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const [shieldActive, setShieldActive] = useState(false)
  const [timerPaused, setTimerPaused] = useState(false)
  const [hintFormulaShown, setHintFormulaShown] = useState(false)
  const [magnetSeed, setMagnetSeed] = useState<{ id: number; answer: StudentAnswer } | null>(null)
  const [grade, setGrade] = useState<Grade>(null)
  const [showRoundIntro, setShowRoundIntro] = useState(true)
  const [sp, setSp] = useState(0)
  const [shake, setShake] = useState(0)
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([])
  const [phaseBanner, setPhaseBanner] = useState<string | null>(null)
  const damageIdRef = useRef(0)
  const run = useChapterRun({ chapterId: 7, maxScore: TOTAL_PROBLEMS * 700 })
  const bonus = useMemo(() => pickBonusProblem(7), [])

  const phase = chapter7Phases[phaseIdx]
  const problem = phase.problems[problemIdx]
  const crisis = phaseIdx >= 2
  const baseTime = run.store.baseTimePerProblem()
  const timer = crisis ? baseTime - 5 : baseTime + 5

  useEffect(() => {
    playBgm('chapter7')
    return () => stopBgm()
  }, [])

  useEffect(() => {
    if (run.isDead) {
      run.store.resetForChapter()
      setHp(QUEEN.maxHp)
      setPhaseIdx(0)
      setProblemIdx(0)
      setBossDead(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.isDead])

  const pushDamage = (amount: number, type: DamageNumber['type']) => {
    damageIdRef.current += 1
    const id = damageIdRef.current
    setDamageNumbers((ns) => [...ns, { id, amount, type, x: 0.3 + Math.random() * 0.4 }])
    setTimeout(() => setDamageNumbers((ns) => ns.filter((n) => n.id !== id)), 1100)
  }

  const showPhaseBanner = (text: string) => {
    setPhaseBanner(text)
    sfx.bossLaugh()
    setShake((s) => s + 1)
    setTimeout(() => setPhaseBanner(null), 1800)
  }

  const handleTimeout = useCallback(() => {
    if (feedback !== 'idle') return
    run.onTimeout(18)
    setShake((s) => s + 1)
    pushDamage(0, 'miss')
    setFeedback('timeout')
  }, [feedback, run])

  const submit = useCallback(() => {
    const j = judge(problem, studentAnswer)
    if (j.kind === 'wrong') {
      if (shieldActive) { setShieldActive(false); setFeedback('wrong'); return }
      run.onWrong(crisis ? 14 : 10)
      pushDamage(0, 'miss')
      setShake((s) => s + 1)
      setFeedback('wrong')
      return
    }
    if (j.kind === 'need-simplify') {
      run.onWrong(5)
      setFeedback('simplify')
      return
    }
    // 정답
    const isCrit = run.combo >= 4 || (run.combo >= 2 && Math.random() < 0.4)
    const baseDmg = 25 + problem.difficulty * 5 + phaseIdx * 5
    const dmg = Math.round((baseDmg + run.combo * 3) * (isCrit ? 2 : 1))
    const newHp = Math.max(0, hp - dmg)
    setHp(newHp)
    setBossHit(true)
    setTimeout(() => setBossHit(false), 300)
    pushDamage(dmg, isCrit ? 'crit' : 'normal')
    run.onCorrect({ xpBase: 35 + problem.difficulty * 8, scoreGain: 500 + problem.difficulty * 100, crit: isCrit, difficulty: problem.difficulty })
    if (isCrit) sfx.crit()
    else sfx.hit()
    if (isCrit) setShake((s) => s + 1)
    setFeedback('correct')
    // 캡콤 등급 표시
    const g = gradeFor(run.combo + 1, isCrit)
    setGrade(g)
    setTimeout(() => setGrade(null), 800)
    setSp((s) => Math.min(100, s + (isCrit ? 30 : 15 + (run.combo + 1) * 2)))

    if (newHp <= 0) {
      setBossDead(true)
      sfx.bossDie()
      setTimeout(() => setShowBonus(true), 1800)
      return
    }
    // 다음 페이즈/문제
    setTimeout(() => {
      let nextPhase = phaseIdx
      let nextProblem = problemIdx + 1
      if (nextProblem >= phase.problems.length) {
        nextPhase = phaseIdx + 1
        nextProblem = 0
        if (nextPhase >= chapter7Phases.length) {
          run.finish({ bossDefeated: newHp <= 0 })
          return
        }
        showPhaseBanner(chapter7Phases[nextPhase].name)
      }
      setPhaseIdx(nextPhase)
      setProblemIdx(nextProblem)
      setFeedback('idle')
      setMagnetSeed(null)
      setHintFormulaShown(false)
      setStudentAnswer({ kind: 'fraction', value: null })
    }, 1000)
  }, [problem, studentAnswer, hp, phaseIdx, problemIdx, phase.problems.length, crisis, run])

  const rockyMood = feedback === 'correct' ? 'excited' : feedback === 'wrong' || feedback === 'timeout' ? 'sad' : 'neutral'

  return (
    <div className="min-h-screen px-4 sm:px-6 py-4 max-w-2xl mx-auto flex flex-col">
      <CrisisOverlay active={crisis} />
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
          stage={`STAGE 7 · FINAL`}
          subtitle={`${phase.name} — ${phase.subtitle}`}
          combo={run.combo}
          score={run.score}
        />
        <div className="mt-2">
          <SuperGauge
            value={sp}
            onTrigger={() => {
              // 메가 SP: 여왕 HP 120 깎기
              const dmg = 120
              setHp((h) => Math.max(0, h - dmg))
              pushDamage(dmg, 'crit')
              setBossHit(true)
              setShake((s) => s + 1)
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
              const dmg = 75
              setHp((h) => Math.max(0, h - dmg))
              pushDamage(dmg, 'crit')
              setBossHit(true)
              setTimeout(() => setBossHit(false), 350)
              sfx.crit()
              setShake((s) => s + 1)
            }}
            onUseTimeFreeze={() => {
              setTimerPaused(true)
              setTimeout(() => setTimerPaused(false), 10000)
            }}
            onUseMagnet={() => {
              setMagnetSeed({ id: Date.now(), answer: correctAnswerFor(problem) })
              const dmg = 30
              setHp((h) => Math.max(0, h - dmg))
              pushDamage(dmg, 'normal')
              sfx.hit()
              run.store.addXp(15)
            }}
            onUseHintFormula={() => setHintFormulaShown(true)}
            shieldActive={shieldActive}
          />
        </div>
        <ResourceBar />

        <div className="relative mt-3">
          <Boss name={QUEEN.name} hp={hp} maxHp={QUEEN.maxHp} isHit={bossHit} isDead={bossDead} />
          <DamageFloater numbers={damageNumbers} />
        </div>

        <div className="mt-3">
          <CountdownTimer
            durationSec={timer}
            paused={feedback !== 'idle' || bossDead || !!phaseBanner || timerPaused}
            onTimeout={handleTimeout}
            resetKey={`${phaseIdx}-${problemIdx}`}
            crisis={crisis}
          />
        </div>

        <div className="mt-3 flex items-start gap-3">
          <RockyAvatar mood={rockyMood} size={56} />
          <div className="flex-1 space-y-2">
            <DialogueBox speaker={`PHASE ${phaseIdx + 1}`} tone="system" text={problem.scenario} />
            <DialogueBox speaker={`★ 난이도 ${problem.difficulty}`} tone="narrator" text={problem.prompt} />
            {hintFormulaShown && (
              <div className="p-2 rounded bg-yellow-400/15 border border-yellow-300/40 text-yellow-100 font-mono text-sm">
                💡 식 힌트: {problem.hint}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10">
          {magnetSeed && (
            <div className="mb-3 p-2 rounded-lg bg-pink-500/20 border border-pink-400/40 text-pink-200 text-center text-xs">
              🧲 자석이 입력칸을 채웠어! 그대로 일격!
            </div>
          )}
          <ProblemPanel
            problem={problem}
            onAnswerChange={setStudentAnswer}
            disabled={feedback === 'correct' || bossDead}
            externalSeed={magnetSeed}
          />
        </div>

        <AnimatePresence>
          {feedback === 'wrong' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 p-2 rounded bg-red-500/20 text-red-200 text-xs text-center">
              ❌ 빗나감 (산소 -{crisis ? 14 : 10})
            </motion.div>
          )}
          {feedback === 'timeout' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 p-2 rounded bg-orange-500/20 text-orange-200 text-xs text-center">
              ⏱ MISS — 여왕의 반격 (산소 -18)
            </motion.div>
          )}
          {feedback === 'simplify' && (
            <div className="mt-2 p-2 rounded bg-yellow-500/20 text-yellow-200 text-xs text-center">
              🤏 기약분수로! (-5)
            </div>
          )}
        </AnimatePresence>

        <div className="mt-3 flex gap-2">
          {feedback === 'correct' || bossDead ? (
            <div className="flex-1 px-4 py-3 rounded-xl bg-emerald-500/20 text-emerald-200 text-center font-bold">
              {bossDead ? '👑 봉인 완료!' : '명중! 다음...'}
            </div>
          ) : feedback === 'idle' ? (
            <button onClick={submit} className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-bold">
              ⚔ 일격
            </button>
          ) : (
            <button onClick={() => setFeedback('idle')} className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20">
              다시 시도
            </button>
          )}
        </div>
      </ScreenShake>

      <AnimatePresence>
        {phaseBanner && (
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="px-8 py-4 rounded-xl bg-gradient-to-r from-red-700 to-purple-900 text-white font-black text-2xl font-mono drop-shadow-[4px_4px_0_rgba(0,0,0,0.6)] border-2 border-yellow-300">
              ⚠ {phaseBanner} ⚠
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showBonus && (
        <BonusProblemOverlay chapterId={7}
          problem={bonus}
          onPass={() => run.finish({ bossDefeated: true })}
          onFail={() => run.store.addOxygen(-5)}
        />
      )}
      <NotebookOverlay open={showNotebook} onClose={() => setShowNotebook(false)} />
      <GradeFlash grade={grade} combo={run.combo} />
      <RoundIntro show={showRoundIntro} title="FINAL STAGE 7 — 귀환 미션" subtitle="아스트로파지 여왕 등장" onFinished={() => setShowRoundIntro(false)} />
      {showIntro && <StoryOverlay lines={STORY[7].intro} onClose={() => setShowIntro(false)} />}
    </div>
  )
}
