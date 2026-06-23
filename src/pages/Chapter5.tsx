import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { chapter5Breaches, solveBreach } from '@/data/chapter5'
import { FractionInput } from '@/components/FractionInput'
import { NumericAnswer } from '@/components/problem/NumericAnswer'
import { ResourceBar } from '@/components/ResourceBar'
import { LevelBadge } from '@/components/LevelBadge'
import { StageHeader } from '@/components/arcade/StageHeader'
import { ScreenShake } from '@/components/arcade/ScreenShake'
import { CrisisOverlay } from '@/components/CrisisOverlay'
import { CountdownTimer } from '@/components/CountdownTimer'
import { useChapterRun } from '@/hooks/useChapterRun'
import { valueEquals, isSimplified } from '@/lib/fractionMath'
import { sfx } from '@/lib/sfx'
import { InventoryQuickSlot } from '@/components/InventoryQuickSlot'
import { NotebookOverlay } from '@/components/NotebookOverlay'
import { StoryOverlay } from '@/components/StoryOverlay'
import { STORY } from '@/data/story'
import { playBgm, stop as stopBgm } from '@/lib/bgm'
import { BonusProblemOverlay } from '@/components/BonusProblemOverlay'
import { pickBonusProblem } from '@/data/bonusProblems'
import type { Fraction } from '@/types/fraction'

type Step = 'commonDenom' | 'calc' | 'simplify'

const STEP_TIME = 30 // 발문 독해 시간 확보 — 단계당 제한시간

export function Chapter5() {
  const [idx, setIdx] = useState(0)
  const [step, setStep] = useState<Step>('commonDenom')
  const [shake, setShake] = useState(0)
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'simplify-fail'>('idle')
  const [commonDenomAns, setCommonDenomAns] = useState<number | null>(null)
  const [calcAns, setCalcAns] = useState<Fraction | null>(null)
  const [simplifyAns, setSimplifyAns] = useState<Fraction | null>(null)
  const [showBonus, setShowBonus] = useState(false)
  const [showNotebook, setShowNotebook] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const [shieldActive, setShieldActive] = useState(false)
  const [timerPaused, setTimerPaused] = useState(false)
  const [hintFormulaShown, setHintFormulaShown] = useState(false)
  const run = useChapterRun({ chapterId: 5, maxScore: chapter5Breaches.length * 900 })
  const bonus = useMemo(() => pickBonusProblem(5), [])

  const breach = chapter5Breaches[idx]
  const sol = solveBreach(breach)
  const isLast = idx === chapter5Breaches.length - 1
  const crisis = step === 'simplify' // 마지막 단계가 가장 긴장

  const handleStepTimeout = useCallback(() => {
    run.onTimeout(12)
    setShake((s) => s + 1)
    setFeedback('wrong')
    setTimeout(() => setFeedback('idle'), 1000)
  }, [run])

  useEffect(() => {
    playBgm('chapter5')
    return () => stopBgm()
  }, [])

  useEffect(() => {
    if (run.isDead) {
      run.store.resetForChapter()
      setIdx(0)
      setStep('commonDenom')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.isDead])

  const submitStep = useCallback(() => {
    if (step === 'commonDenom') {
      if (commonDenomAns !== sol.commonDenom) {
        if (shieldActive) { setShieldActive(false); setFeedback('wrong'); return }
        run.onWrong(8)
        setFeedback('wrong')
        setShake((s) => s + 1)
        return
      }
      sfx.hit()
      run.onCorrect({ xpBase: 15, scoreGain: 200, difficulty: 1 })
      setStep('calc')
      setFeedback('idle')
      return
    }
    if (step === 'calc') {
      if (!calcAns || !valueEquals(calcAns, sol.result)) {
        run.onWrong(8)
        setFeedback('wrong')
        setShake((s) => s + 1)
        return
      }
      sfx.hit()
      run.onCorrect({ xpBase: 20, scoreGain: 300, difficulty: 2 })
      setStep('simplify')
      setFeedback('idle')
      return
    }
    // simplify 단계
    if (!simplifyAns || !valueEquals(simplifyAns, sol.simplified)) {
      run.onWrong(8)
      setFeedback('wrong')
      setShake((s) => s + 1)
      return
    }
    if (!isSimplified(simplifyAns)) {
      run.onWrong(4)
      setFeedback('simplify-fail')
      return
    }
    sfx.crit()
    setShake((s) => s + 1)
    run.onCorrect({ xpBase: 30, scoreGain: 400, crit: run.combo >= 2, difficulty: 3 })
    if (isLast) {
      setShowBonus(true)
      return
    }
    setTimeout(() => {
      setIdx((i) => i + 1)
      setStep('commonDenom')
      setCommonDenomAns(null)
      setCalcAns(null)
      setSimplifyAns(null)
      setFeedback('idle')
      setHintFormulaShown(false)
    }, 600)
  }, [step, commonDenomAns, calcAns, simplifyAns, sol, isLast, run])

  const stepLabel: Record<Step, string> = {
    commonDenom: '1단계 · 공통분모(LCM)',
    calc: '2단계 · 통분 후 빼기',
    simplify: '3단계 · 기약분수로',
  }

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
          stage={`STAGE 5 · REACTOR`}
          subtitle={`위기의 동력실 — 다른 분모 뺄셈 (${idx + 1}/${chapter5Breaches.length})`}
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
              if (step === 'commonDenom') setCommonDenomAns(sol.commonDenom)
              else if (step === 'calc') setCalcAns(sol.result)
              else setSimplifyAns(sol.simplified)
            }}
            onUseBomb={() => {
              // 즉시 전체 누출 차단
              run.onCorrect({ xpBase: 20, scoreGain: 300, difficulty: 2 })
              if (isLast) { setShowBonus(true); return }
              setIdx((i) => i + 1)
              setStep('commonDenom')
              setCommonDenomAns(null); setCalcAns(null); setSimplifyAns(null)
            }}
            onUseHintFormula={() => setHintFormulaShown(true)}
            shieldActive={shieldActive}
          />
        </div>
        <ResourceBar />

        {/* 누출 위치 + 응용 시나리오 + 파이프 다이어그램 */}
        <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-400/40">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-xs text-red-300 font-mono">⚠ {breach.location} 누출</div>
              <div className="text-white mt-1 text-sm leading-relaxed">
                {breach.story}
              </div>
              {hintFormulaShown && (
                <div className="mt-2 p-2 rounded bg-yellow-400/15 border border-yellow-300/40 text-yellow-100 font-mono text-sm">
                  💡 식: {breach.a.numerator}/{breach.a.denominator} − {breach.b.numerator}/{breach.b.denominator}
                </div>
              )}
            </div>
            <div className="text-4xl ml-2">⚡</div>
          </div>
          {/* 식 자체는 노출하지 않아 학생이 시나리오를 읽고 식을 세우도록 유도 */}
        </div>

        {/* 단계 진행 */}
        <div className="mt-3 flex gap-1">
          {(['commonDenom', 'calc', 'simplify'] as Step[]).map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded ${
                step === s ? 'bg-yellow-300' : i < (['commonDenom', 'calc', 'simplify'] as Step[]).indexOf(step) ? 'bg-emerald-400' : 'bg-white/15'
              }`}
            />
          ))}
        </div>

        <div className="mt-2">
          <CountdownTimer
            durationSec={STEP_TIME}
            paused={feedback !== 'idle' || timerPaused}
            onTimeout={handleStepTimeout}
            resetKey={`${idx}-${step}`}
            crisis={crisis}
          />
        </div>

        {/* 단계별 입력 */}
        <div className="mt-3 p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-3">
          <div className="text-yellow-200 font-bold">{stepLabel[step]}</div>

          {step === 'commonDenom' && (
            <>
              <div className="text-sm text-white/70 text-center">
                두 분모 {breach.a.denominator}와 {breach.b.denominator}의 최소공배수를 입력해.
              </div>
              <NumericAnswer
                onChange={setCommonDenomAns}
                resetKey={`${idx}-cd`}
                unit=""
              />
            </>
          )}
          {step === 'calc' && (
            <>
              <div className="text-sm text-white/70 text-center">
                공통분모 {sol.commonDenom}으로 통분해서 빼봐. (약분 전)
              </div>
              <FractionInput key={`${idx}-calc`} onChange={setCalcAns} />
            </>
          )}
          {step === 'simplify' && (
            <>
              <div className="text-sm text-white/70 text-center">
                {isSimplified(sol.result) ? (
                  <>
                    <b>{sol.result.numerator}/{sol.result.denominator}</b>은 <span className="text-emerald-300">이미 기약분수</span>!
                    <br />
                    그대로 다시 입력해서 확인해줘.
                  </>
                ) : (
                  <>{sol.result.numerator}/{sol.result.denominator}을 기약분수로 줄여!</>
                )}
              </div>
              <FractionInput key={`${idx}-simp`} onChange={setSimplifyAns} />
            </>
          )}

          <button
            onClick={submitStep}
            className="px-6 py-3 rounded-xl bg-yellow-400 text-space-900 font-bold"
          >
            {step === 'simplify' ? '🔧 누출 차단!' : '다음 단계 →'}
          </button>
        </div>

        <AnimatePresence>
          {feedback === 'wrong' && (
            <motion.div
              key="w"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 p-2 rounded bg-red-500/20 text-red-200 text-xs text-center"
            >
              ❌ 다시 시도! 누출이 심해지고 있어 (산소 -8)
            </motion.div>
          )}
          {feedback === 'simplify-fail' && (
            <motion.div
              key="s"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 p-2 rounded bg-yellow-500/20 text-yellow-200 text-xs text-center"
            >
              🤏 기약분수로 더 줄여! (산소 -4)
            </motion.div>
          )}
        </AnimatePresence>
      </ScreenShake>

      {showBonus && (
        <BonusProblemOverlay chapterId={5}
          problem={bonus}
          onPass={() => run.finish()}
          onFail={() => run.store.addOxygen(-5)}
        />
      )}
      <NotebookOverlay open={showNotebook} onClose={() => setShowNotebook(false)} />
      {showIntro && <StoryOverlay lines={STORY[5].intro} onClose={() => setShowIntro(false)} />}
    </div>
  )
}
