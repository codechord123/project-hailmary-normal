import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { chapter2Waves, chapter2Expected } from '@/data/chapter2'
import { FractionInput } from '@/components/FractionInput'
import { ResourceBar } from '@/components/ResourceBar'
import { LevelBadge } from '@/components/LevelBadge'
import { StageHeader } from '@/components/arcade/StageHeader'
import { ScreenShake } from '@/components/arcade/ScreenShake'
import { useChapterRun } from '@/hooks/useChapterRun'
import { valueEquals, isSimplified } from '@/lib/fractionMath'
import { sfx } from '@/lib/sfx'
import { NotebookOverlay } from '@/components/NotebookOverlay'
import { StoryOverlay } from '@/components/StoryOverlay'
import { STORY } from '@/data/story'
import { playBgm, stop as stopBgm } from '@/lib/bgm'
import { CharacterAvatar } from '@/components/CharacterAvatar'
import { InventoryQuickSlot } from '@/components/InventoryQuickSlot'
import { GradeFlash, gradeFor, type Grade } from '@/components/arcade/GradeFlash'
import { RoundIntro } from '@/components/arcade/RoundIntro'
import { BonusProblemOverlay } from '@/components/BonusProblemOverlay'
import { pickBonusProblem } from '@/data/bonusProblems'
import type { Fraction } from '@/types/fraction'

export function Chapter2() {
  const [waveIdx, setWaveIdx] = useState(0)
  const [enemyY, setEnemyY] = useState(0) // 0~1 (0=top, 1=bottom)
  const [answer, setAnswer] = useState<Fraction | null>(null)
  const [missile, setMissile] = useState<{ id: number; y: number } | null>(null)
  const [exploded, setExploded] = useState(false)
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'simplify' | 'crash'>('idle')
  const [shake, setShake] = useState(0)
  const run = useChapterRun({ chapterId: 2, maxScore: chapter2Waves.length * 500 })
  const startRef = useRef(Date.now())
  const missileIdRef = useRef(0)

  const wave = chapter2Waves[waveIdx]
  const isLast = waveIdx === chapter2Waves.length - 1
  const expectedAns = chapter2Expected(wave.a, wave.b)
  const bonus = useMemo(() => pickBonusProblem(2), [])

  useEffect(() => {
    playBgm('chapter2')
    return () => stopBgm()
  }, [])

  // 적기 강하 루프
  useEffect(() => {
    startRef.current = Date.now()
    setEnemyY(0)
    setExploded(false)
    setMissile(null)
    setFeedback('idle')
    const id = setInterval(() => {
      if (Date.now() < freezeUntilRef.current) return // 시간 정지 중
      const elapsed = (Date.now() - startRef.current) / 1000
      const t = Math.min(1, elapsed / wave.speedSec)
      setEnemyY(t)
      if (t >= 1) {
        clearInterval(id)
      }
    }, 80)
    return () => clearInterval(id)
  }, [waveIdx, wave.speedSec])

  // 바닥 도달 = 충돌
  useEffect(() => {
    if (enemyY >= 1 && !exploded && feedback !== 'crash') {
      setFeedback('crash')
      run.onTimeout(20)
      setShake((s) => s + 1)
      setTimeout(() => nextOrFinish(), 1200)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemyY, exploded])

  // 산소 0 → 첫 웨이브로
  useEffect(() => {
    if (run.isDead) {
      run.store.resetForChapter()
      setWaveIdx(0)
      setFeedback('idle')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.isDead])

  const fire = useCallback(() => {
    if (!answer || exploded) return
    if (!valueEquals(answer, expectedAns)) {
      if (shieldActive) {
        setShieldActive(false)
        setFeedback('wrong')
        return
      }
      run.onWrong(8)
      setFeedback('wrong')
      setShake((s) => s + 1)
      return
    }
    if (wave.requireSimplified && !isSimplified(answer)) {
      run.onWrong(4)
      setFeedback('simplify')
      return
    }
    // 발사 시퀀스
    missileIdRef.current += 1
    setMissile({ id: missileIdRef.current, y: 1 })
    setTimeout(() => {
      setExploded(true)
      setMissile(null)
      sfx.crit()
      setShake((s) => s + 1)
      const crit = run.combo >= 2
      run.onCorrect({ xpBase: 30, scoreGain: 400, crit, difficulty: 1 })
      const g = gradeFor(run.combo + 1, crit)
      setGrade(g)
      setTimeout(() => setGrade(null), 700)
      setTimeout(() => nextOrFinish(), 900)
    }, 350)
  }, [answer, expectedAns, exploded, wave, run])

  const [showBonus, setShowBonus] = useState(false)
  const [showNotebook, setShowNotebook] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const [shieldActive, setShieldActive] = useState(false)
  const [hintFormulaShown, setHintFormulaShown] = useState(false)
  const [grade, setGrade] = useState<Grade>(null)
  const [showRoundIntro, setShowRoundIntro] = useState(true)
  const freezeUntilRef = useRef(0)
  const nextOrFinish = useCallback(() => {
    if (isLast) {
      setShowBonus(true)
      return
    }
    setWaveIdx((i) => i + 1)
    setAnswer(null)
    setHintFormulaShown(false)
  }, [isLast])

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
          stage={`STAGE 2-${waveIdx + 1}`}
          subtitle="식량 점검 — 통분 뺄셈 슈터"
          combo={run.combo}
          score={run.score}
        />
        <div className="mt-2">
          <InventoryQuickSlot
            onUseOxygen={() => {}}
            onUseShield={() => setShieldActive(true)}
            onUseMagnet={() => setAnswer(expectedAns)}
            onUseTimeFreeze={() => { freezeUntilRef.current = Date.now() + 10000 }}
            onUseBomb={() => {
              // 즉시 격추
              setExploded(true)
              sfx.crit()
              setShake((s) => s + 1)
              run.onCorrect({ xpBase: 15, scoreGain: 200, difficulty: 1 })
              setTimeout(() => nextOrFinish(), 800)
            }}
            onUseHintFormula={() => setHintFormulaShown(true)}
            shieldActive={shieldActive}
          />
        </div>
        <ResourceBar />

        {wave.story && (
          <div className="mt-2 p-3 rounded-lg bg-amber-400/10 border border-amber-300/30 text-sm text-amber-50 leading-relaxed">
            📖 {wave.story}
          </div>
        )}
        {hintFormulaShown && (
          <div className="mt-1 p-2 rounded bg-yellow-400/15 border border-yellow-300/40 text-yellow-100 font-mono text-sm text-center">
            💡 식: {wave.a.numerator}/{wave.a.denominator} − {wave.b.numerator}/{wave.b.denominator}
          </div>
        )}

        {/* 슈팅 필드 */}
        <div className="relative mt-3 h-[360px] rounded-xl bg-gradient-to-b from-indigo-950 to-black border-2 border-cyan-400/30 overflow-hidden">
          {/* 별 배경 */}
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
              style={{
                top: `${(i * 37) % 100}%`,
                left: `${(i * 61) % 100}%`,
                animationDelay: `${(i % 4) * 0.4}s`,
              }}
            />
          ))}

          {/* 적기 */}
          <AnimatePresence>
            {!exploded && (
              <motion.div
                key={wave.id}
                animate={{ top: `${enemyY * 80}%` }}
                transition={{ duration: 0.08, ease: 'linear' }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
              >
                <div className="text-5xl">{wave.enemy}</div>
                <div className="mt-1 px-2 py-0.5 rounded bg-red-500/80 text-white text-xs font-mono">
                  ? = ?
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 미사일 */}
          <AnimatePresence>
            {missile && (
              <motion.div
                key={missile.id}
                initial={{ bottom: '8%', opacity: 1 }}
                animate={{ bottom: `${100 - enemyY * 80 - 5}%` }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute left-1/2 -translate-x-1/2 text-3xl"
              >
                🚀
              </motion.div>
            )}
          </AnimatePresence>

          {/* 폭발 — 중앙 + 방사형 파편 8발 */}
          {exploded && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 2.4, 0] }}
                transition={{ duration: 0.7 }}
                className="absolute left-1/2 text-6xl z-10"
                style={{ top: `${enemyY * 80}%`, transform: 'translateX(-50%)' }}
              >
                💥
              </motion.div>
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2
                return (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{
                      x: Math.cos(angle) * 80,
                      y: Math.sin(angle) * 80,
                      opacity: 0,
                      scale: 0.3,
                    }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="absolute left-1/2 w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_8px_#fbbf24]"
                    style={{ top: `${enemyY * 80}%` }}
                  />
                )
              })}
            </>
          )}

          {/* 플레이어 우주선 */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <CharacterAvatar size={56} pose="focus" />
          </div>
        </div>

        {/* 피드백 */}
        {feedback === 'wrong' && (
          <div className="mt-2 p-2 rounded bg-red-500/20 text-red-200 text-sm text-center">
            ❌ 빗나감! 다시 조준 (산소 -8)
          </div>
        )}
        {feedback === 'simplify' && (
          <div className="mt-2 p-2 rounded bg-yellow-500/20 text-yellow-200 text-sm text-center">
            🤏 기약분수로! (산소 -4)
          </div>
        )}
        {feedback === 'crash' && (
          <div className="mt-2 p-2 rounded bg-red-700/40 text-red-100 text-sm text-center font-bold">
            💢 적기 충돌! (산소 -20)
          </div>
        )}

        {/* 컨트롤 */}
        <div className="mt-3 flex flex-col items-center gap-2">
          <div className="text-xs text-white/60">정답을 입력하고 🚀 발사</div>
          <FractionInput key={wave.id} onChange={setAnswer} disabled={exploded || feedback === 'crash'} />
          <button
            onClick={fire}
            disabled={!answer || exploded || feedback === 'crash'}
            className="px-6 py-3 rounded-xl bg-red-500 text-white font-bold disabled:opacity-30 hover:brightness-110 active:scale-95"
          >
            🚀 발사
          </button>
        </div>
      </ScreenShake>

      <AnimatePresence>
        {run.levelUpBanner !== null && (
          <motion.div
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            exit={{ y: -60 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-bold"
          >
            🎉 LEVEL UP! Lv.{run.levelUpBanner}
          </motion.div>
        )}
      </AnimatePresence>

      {showBonus && (
        <BonusProblemOverlay chapterId={2}
          problem={bonus}
          onPass={() => run.finish()}
          onFail={() => run.store.addOxygen(-5)}
        />
      )}
      <NotebookOverlay open={showNotebook} onClose={() => setShowNotebook(false)} />
      {showIntro && <StoryOverlay lines={STORY[2].intro} onClose={() => setShowIntro(false)} />}
      <GradeFlash grade={grade} combo={run.combo} />
      <RoundIntro show={showRoundIntro} title="STAGE 2 — 식량 점검" subtitle="식량 도둑 출현" onFinished={() => setShowRoundIntro(false)} />
    </div>
  )
}
