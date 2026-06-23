import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ProblemPanel } from '@/components/problem/ProblemPanel'
import { StageHeader } from '@/components/arcade/StageHeader'
import { ScreenShake } from '@/components/arcade/ScreenShake'
import { CountdownTimer } from '@/components/CountdownTimer'
import { ResourceBar } from '@/components/ResourceBar'
import { LevelBadge } from '@/components/LevelBadge'
import { DialogueBox } from '@/components/DialogueBox'
import { useGameStore } from '@/store/gameStore'
import { useShortcuts } from '@/hooks/useShortcuts'
import { genRandom } from '@/lib/problemGen'
import { judge, answerToText, problemAnswerText } from '@/lib/judge'
import { addWrongNote } from '@/lib/wrongNotes'
import { unlock } from '@/lib/achievements'
import { sfx } from '@/lib/sfx'
import { playBgm, stop as stopBgm } from '@/lib/bgm'
import { recordEndlessDailyBest, getDailyCombinedScore } from '@/lib/dailyChallenge'
import { comboBonusXp } from '@/lib/scoring'
import type { Problem, StudentAnswer } from '@/types/problem'

const ENDLESS_HI_KEY = 'hailmary-endless-hi'

const getHi = (): number => {
  try {
    return parseInt(localStorage.getItem(ENDLESS_HI_KEY) || '0', 10) || 0
  } catch {
    return 0
  }
}
const setHi = (v: number) => {
  try {
    localStorage.setItem(ENDLESS_HI_KEY, String(v))
  } catch {
    /* ignore */
  }
}

export function Endless() {
  const store = useGameStore()
  const [problem, setProblem] = useState<Problem>(() => genRandom(0))
  const [studentAnswer, setStudentAnswer] = useState<StudentAnswer>({ kind: 'fraction', value: null })
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [solved, setSolved] = useState(0)
  const [oxygen, setOxygen] = useState(100)
  const [gameOver, setGameOver] = useState(false)
  const [hi, setHiState] = useState(getHi())
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'simplify' | 'timeout' | 'correct'>('idle')
  const [shake, setShake] = useState(0)

  const difficulty = useMemo(() => Math.floor(solved / 5), [solved])
  const timer = Math.max(20, 50 - Math.floor(solved / 4)) // 발문 독해 시간 확보

  const startEndless = useCallback(() => {
    setProblem(genRandom(0))
    setStudentAnswer({ kind: 'fraction', value: null })
    setScore(0)
    setCombo(0)
    setSolved(0)
    setOxygen(100)
    setGameOver(false)
    setFeedback('idle')
  }, [])

  useEffect(() => {
    playBgm('endless')
    return () => stopBgm()
  }, [])

  useEffect(() => {
    if (oxygen <= 0 && !gameOver) {
      sfx.crisis()
      setGameOver(true)
      if (score > hi) {
        setHi(score)
        setHiState(score)
      }
      recordEndlessDailyBest(score)
    }
  }, [oxygen, gameOver, score, hi])

  const nextProblem = useCallback(() => {
    setProblem(genRandom(difficulty + 1))
    setStudentAnswer({ kind: 'fraction', value: null })
    setFeedback('idle')
  }, [difficulty])

  const submit = useCallback(() => {
    const j = judge(problem, studentAnswer)
    if (j.kind === 'wrong') {
      setOxygen((o) => Math.max(0, o - 12))
      setCombo(0)
      setFeedback('wrong')
      setShake((s) => s + 1)
      sfx.wrong()
      addWrongNote({
        chapterId: 'endless',
        problemId: problem.id,
        problemKind: problem.kind,
        scenario: problem.scenario,
        prompt: problem.prompt,
        studentAnswerText: answerToText(studentAnswer),
        correctAnswerText: problemAnswerText(problem),
        hint: problem.hint,
      })
      return
    }
    if (j.kind === 'need-simplify') {
      setOxygen((o) => Math.max(0, o - 5))
      setFeedback('simplify')
      sfx.wrong()
      return
    }
    const newCombo = combo + 1
    setCombo(newCombo)
    const crit = newCombo >= 5
    const gain = (100 + difficulty * 30 + comboBonusXp(newCombo) * 10) * (crit ? 2 : 1)
    setScore((s) => s + gain)
    setSolved((c) => {
      const next = c + 1
      if (next >= 50) unlock('endless-50')
      return next
    })
    setOxygen((o) => Math.min(100, o + 3)) // 정답 시 산소 약간 회복
    store.addXp(15 + difficulty * 5 + comboBonusXp(newCombo))
    store.addEnergy(1)
    if (crit) sfx.crit()
    else sfx.hit()
    setFeedback('correct')
    setTimeout(() => nextProblem(), 700)
  }, [problem, studentAnswer, combo, difficulty, store, nextProblem])

  const handleTimeout = useCallback(() => {
    if (feedback !== 'idle') return
    setOxygen((o) => Math.max(0, o - 18))
    setCombo(0)
    setFeedback('timeout')
    setShake((s) => s + 1)
    sfx.wrong()
    setTimeout(() => nextProblem(), 900)
  }, [feedback, nextProblem])

  useShortcuts({
    onSubmit: feedback === 'idle' && !gameOver ? submit : undefined,
  })

  if (gameOver) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-6xl"
        >
          ⚰️
        </motion.div>
        <h2 className="mt-4 text-3xl font-bold text-red-300">GAME OVER</h2>
        <div className="mt-6 font-mono text-white/80 space-y-2">
          <div>SCORE: <span className="text-yellow-300 text-2xl">{score.toLocaleString()}</span></div>
          <div>SOLVED: <span className="text-cyan-300">{solved}</span></div>
          <div>BEST: <span className="text-pink-300">{hi.toLocaleString()}</span></div>
          <div className="mt-3 pt-2 border-t border-white/10">
            <div className="text-[10px] text-white/40">오늘의 종합 점수</div>
            <div className="text-amber-300 text-xl font-bold">{getDailyCombinedScore().toLocaleString()}</div>
            <div className="text-[10px] text-white/40">챌린지 + 엔들리스 일일 최고</div>
          </div>
          {score === hi && score > 0 && (
            <div className="text-yellow-400 mt-3 animate-pulse font-bold">🏆 NEW RECORD!</div>
          )}
        </div>
        <div className="mt-8 flex gap-3">
          <button onClick={startEndless} className="px-6 py-3 rounded-xl bg-space-accent text-space-900 font-bold">
            ↺ 다시
          </button>
          <Link to="/" className="px-6 py-3 rounded-xl bg-white/10 text-white border border-white/20">
            메인으로
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-4 max-w-2xl mx-auto flex flex-col">
      <ScreenShake shake={shake}>
        <header className="flex items-center justify-between">
          <Link to="/" className="text-white/60 hover:text-white text-sm">
            ← 메인
          </Link>
          <LevelBadge compact />
        </header>

        <StageHeader
          stage={`ENDLESS · ${solved} solved`}
          subtitle={`난이도 +${difficulty} · BEST ${hi.toLocaleString()}`}
          combo={combo}
          score={score}
        />

        {/* 산소 직접 표시 (게임모드 자체 산소) */}
        <div className="mt-2 space-y-1">
          <div className="text-xs text-white/70">🫁 산소 {oxygen}/100</div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full transition-all ${oxygen < 30 ? 'bg-red-500 animate-pulse' : 'bg-cyan-400'}`}
              style={{ width: `${oxygen}%` }}
            />
          </div>
        </div>

        <ResourceBar />

        <div className="mt-3">
          <CountdownTimer
            durationSec={timer}
            paused={feedback !== 'idle'}
            onTimeout={handleTimeout}
            resetKey={problem.id}
            crisis={oxygen < 30}
          />
        </div>

        <div className="mt-3">
          <DialogueBox speaker="끝없는 항해" tone="system" text={problem.scenario} />
          <div className="mt-1">
            <DialogueBox speaker={`★${problem.difficulty}`} tone="narrator" text={problem.prompt} />
          </div>
        </div>

        <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <ProblemPanel problem={problem} onAnswerChange={setStudentAnswer} disabled={feedback === 'correct'} />
        </div>

        <AnimatePresence>
          {feedback === 'wrong' && <FeedbackBox key="w" text="❌ 빗나감 (-12🫁)" color="red" />}
          {feedback === 'simplify' && <FeedbackBox key="s" text="🤏 기약분수로 (-5🫁)" color="yellow" />}
          {feedback === 'timeout' && <FeedbackBox key="t" text="⏱ MISS (-18🫁)" color="orange" />}
          {feedback === 'correct' && <FeedbackBox key="c" text="✅ 명중! +SCORE" color="emerald" />}
        </AnimatePresence>

        <div className="mt-3">
          {feedback === 'idle' ? (
            <button onClick={submit} className="w-full px-4 py-3 rounded-xl bg-space-accent text-space-900 font-bold">
              ⚔ 제출
            </button>
          ) : feedback === 'wrong' || feedback === 'simplify' ? (
            <button onClick={() => setFeedback('idle')} className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20">
              다시 시도
            </button>
          ) : null}
        </div>
      </ScreenShake>
    </div>
  )
}

function FeedbackBox({ text, color }: { text: string; color: string }) {
  const cls: Record<string, string> = {
    red: 'bg-red-500/20 text-red-200',
    yellow: 'bg-yellow-500/20 text-yellow-200',
    orange: 'bg-orange-500/20 text-orange-200',
    emerald: 'bg-emerald-500/20 text-emerald-200',
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`mt-2 p-2 rounded text-xs text-center ${cls[color]}`}
    >
      {text}
    </motion.div>
  )
}
