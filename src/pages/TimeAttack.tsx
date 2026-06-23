import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ProblemPanel } from '@/components/problem/ProblemPanel'
import { StageHeader } from '@/components/arcade/StageHeader'
import { ScreenShake } from '@/components/arcade/ScreenShake'
import { DialogueBox } from '@/components/DialogueBox'
import { LevelBadge } from '@/components/LevelBadge'
import { GradeFlash, gradeFor, type Grade } from '@/components/arcade/GradeFlash'
import { RoundIntro } from '@/components/arcade/RoundIntro'
import { useGameStore } from '@/store/gameStore'
import { useShortcuts } from '@/hooks/useShortcuts'
import { genRandom } from '@/lib/problemGen'
import { judge, answerToText, problemAnswerText } from '@/lib/judge'
import { sfx } from '@/lib/sfx'
import { comboBonusXp } from '@/lib/scoring'
import { addWrongNote } from '@/lib/wrongNotes'
import { unlock as unlockAch } from '@/lib/achievements'
import type { Problem, StudentAnswer } from '@/types/problem'

const TIME_LIMIT = 100 // 초 — 응용 독해 시간 확보
const TIME_BONUS = 6 // 정답 시 시간 보너스
const TIME_PENALTY = 2 // 오답 시 시간 감소
const FEVER_COMBO = 10 // 피버 진입 콤보
const FEVER_DURATION_MS = 5000 // 피버 지속 시간

const HI_KEY = 'hailmary-timeattack-hi'
const readHi = (): number => {
  try { return parseInt(localStorage.getItem(HI_KEY) || '0', 10) || 0 } catch { return 0 }
}
const writeHi = (v: number) => { try { localStorage.setItem(HI_KEY, String(v)) } catch { /* ignore */ } }

export function TimeAttack() {
  const store = useGameStore()
  const [problem, setProblem] = useState<Problem>(() => genRandom(1))
  const [studentAnswer, setStudentAnswer] = useState<StudentAnswer>({ kind: 'fraction', value: null })
  const [solved, setSolved] = useState(0)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [timeMs, setTimeMs] = useState(TIME_LIMIT * 1000)
  const [over, setOver] = useState(false)
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle')
  const [shake, setShake] = useState(0)
  const [grade, setGrade] = useState<Grade>(null)
  const [showIntro, setShowIntro] = useState(true)
  const [hi, setHiState] = useState(readHi())
  const [feverUntil, setFeverUntil] = useState(0)
  const [floaters, setFloaters] = useState<{ id: number; text: string; tone: 'plus' | 'minus' }[]>([])
  const fever = Date.now() < feverUntil

  // 타이머
  useEffect(() => {
    if (over || showIntro) return
    const id = setInterval(() => {
      setTimeMs((t) => Math.max(0, t - 100))
    }, 100)
    return () => clearInterval(id)
  }, [over, showIntro])

  useEffect(() => {
    if (timeMs <= 0 && !over) {
      setOver(true)
      if (score > hi) {
        writeHi(score)
        setHiState(score)
      }
      if (score >= 1000) unlockAch('time-attack-1k')
      sfx.bossDie()
    }
  }, [timeMs, over, score, hi])

  const next = useCallback(() => {
    const diff = Math.floor(solved / 5) + 1
    setProblem(genRandom(diff))
    setStudentAnswer({ kind: 'fraction', value: null })
    setFeedback('idle')
  }, [solved])

  const pushFloater = useCallback((text: string, tone: 'plus' | 'minus') => {
    const id = Date.now() + Math.random()
    setFloaters((arr) => [...arr, { id, text, tone }])
    setTimeout(() => setFloaters((arr) => arr.filter((f) => f.id !== id)), 900)
  }, [])

  const submit = useCallback(() => {
    if (over) return
    const r = judge(problem, studentAnswer)
    if (r.kind === 'wrong' || r.kind === 'need-simplify') {
      setCombo(0)
      setFeedback('wrong')
      setShake((s) => s + 1)
      setTimeMs((t) => Math.max(0, t - TIME_PENALTY * 1000))
      pushFloater(`-${TIME_PENALTY}s`, 'minus')
      sfx.wrong()
      addWrongNote({
        chapterId: 'endless' as any,
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
    const newCombo = combo + 1
    setCombo(newCombo)
    setMaxCombo((m) => Math.max(m, newCombo))
    setSolved((c) => c + 1)
    const crit = newCombo >= 5
    const inFever = Date.now() < feverUntil
    const feverMul = inFever ? 2 : 1
    const gain = (100 + (problem.difficulty ?? 1) * 30 + comboBonusXp(newCombo) * 12) * (crit ? 2 : 1) * feverMul
    setScore((s) => s + gain)
    setTimeMs((t) => Math.min(TIME_LIMIT * 1000, t + TIME_BONUS * 1000))
    pushFloater(`+${TIME_BONUS}s`, 'plus')
    store.addXp(15 + (problem.difficulty ?? 1) * 5)
    setFeedback('correct')
    const g = gradeFor(newCombo, crit)
    setGrade(g)
    setTimeout(() => setGrade(null), 700)
    if (crit) sfx.crit()
    else sfx.hit()
    // 피버 진입 — 10콤보 정확히 도달 시
    if (newCombo === FEVER_COMBO) {
      setFeverUntil(Date.now() + FEVER_DURATION_MS)
      sfx.crit()
      unlockAch('fever-time')
    }
    setTimeout(() => next(), 500)
  }, [over, problem, studentAnswer, combo, store, next, feverUntil, pushFloater])

  useShortcuts({ onSubmit: feedback === 'idle' && !over ? submit : undefined })

  const restart = () => {
    setProblem(genRandom(1))
    setStudentAnswer({ kind: 'fraction', value: null })
    setSolved(0)
    setScore(0)
    setCombo(0)
    setMaxCombo(0)
    setTimeMs(TIME_LIMIT * 1000)
    setOver(false)
    setFeedback('idle')
    setFeverUntil(0)
    setFloaters([])
  }

  if (over) {
    const newRec = score === hi && score > 0
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-7xl">⏱</motion.div>
        <h2 className="mt-4 text-3xl font-bold text-yellow-300 font-mono tracking-widest">TIME UP!</h2>
        <div className="mt-6 font-mono text-white/90 space-y-2">
          <div>SCORE: <span className="text-yellow-200 text-3xl font-bold">{score.toLocaleString()}</span></div>
          <div>풀이: <span className="text-cyan-300">{solved}</span> · MAX COMBO: <span className="text-pink-300">×{maxCombo}</span></div>
          <div>BEST: <span className="text-purple-300">{hi.toLocaleString()}</span></div>
          {newRec && <div className="text-yellow-400 mt-3 animate-pulse font-bold">🏆 NEW RECORD!</div>}
        </div>
        <div className="mt-8 flex gap-3">
          <button onClick={restart} className="px-6 py-3 rounded-xl bg-space-accent text-space-900 font-bold">↺ 다시</button>
          <Link to="/" className="px-6 py-3 rounded-xl bg-white/10 text-white border border-white/20">메인으로</Link>
        </div>
      </div>
    )
  }

  const timePct = (timeMs / (TIME_LIMIT * 1000)) * 100
  const danger = timeMs < 10000

  return (
    <div className="min-h-screen px-4 sm:px-6 py-4 max-w-2xl mx-auto flex flex-col">
      <ScreenShake shake={shake}>
        <header className="flex items-center justify-between">
          <Link to="/" className="text-white/60 hover:text-white text-sm">← 메인</Link>
          <LevelBadge compact />
        </header>

        <StageHeader
          stage={`TIME ATTACK · ${solved} solved`}
          subtitle={`BEST ${hi.toLocaleString()} · ${TIME_LIMIT}초 안에 최대 점수!`}
          combo={combo}
          score={score}
        />

        {/* 거대 타이머 */}
        <div className="mt-3 relative">
          <div className="flex justify-between text-xs font-mono">
            <span className={danger ? 'text-red-300 font-bold animate-pulse' : 'text-white/70'}>
              {danger ? '⚠ 시간 위급!' : '⏱ 남은 시간'}
            </span>
            <span className={`font-bold ${danger ? 'text-red-300' : 'text-white/90'}`}>
              {(timeMs / 1000).toFixed(1)}s
            </span>
          </div>
          <div className="mt-1 h-3 rounded-full bg-black/60 overflow-hidden border border-white/15">
            <motion.div
              animate={{ width: `${timePct}%` }}
              transition={{ duration: 0.1 }}
              className={`h-full ${danger ? 'bg-red-500 animate-pulse' : fever ? 'bg-gradient-to-r from-pink-400 via-yellow-300 to-pink-400 animate-pulse' : 'bg-gradient-to-r from-cyan-400 to-yellow-300'}`}
            />
          </div>
          {/* 시간 변동 플로터 */}
          <div className="pointer-events-none absolute right-0 -top-1 h-8">
            <AnimatePresence>
              {floaters.map((f) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 0, scale: 0.7 }}
                  animate={{ opacity: 1, y: -28, scale: 1.1 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.9 }}
                  className={`absolute right-0 font-mono font-bold text-lg ${f.tone === 'plus' ? 'text-emerald-300' : 'text-red-300'}`}
                  style={{ textShadow: '0 0 8px rgba(0,0,0,0.8)' }}
                >
                  {f.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* 피버 배너 */}
        <AnimatePresence>
          {fever && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 via-yellow-400 to-pink-500 text-space-900 font-extrabold text-center text-sm tracking-widest animate-pulse"
            >
              🔥 FEVER TIME! 점수 ×2 🔥
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3">
          <DialogueBox speaker="TIME ATTACK" tone="system" text={problem.scenario} />
          <div className="mt-1">
            <DialogueBox speaker={`★${problem.difficulty}`} tone="narrator" text={problem.prompt} />
          </div>
        </div>

        <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <ProblemPanel problem={problem} onAnswerChange={setStudentAnswer} disabled={feedback === 'correct'} />
        </div>

        <AnimatePresence>
          {feedback === 'wrong' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 p-2 rounded bg-red-500/20 text-red-200 text-xs text-center">
              ❌ 오답 (시간 -{TIME_PENALTY}초)
            </motion.div>
          )}
          {feedback === 'correct' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 p-2 rounded bg-emerald-500/20 text-emerald-200 text-xs text-center">
              ✅ 정답 (시간 +{TIME_BONUS}초)
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3 flex gap-2">
          {feedback === 'idle' && (
            <button onClick={submit} className="flex-1 px-4 py-3 rounded-xl bg-space-accent text-space-900 font-bold">
              제출 (Enter)
            </button>
          )}
          {feedback === 'wrong' && (
            <button onClick={() => setFeedback('idle')} className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20">
              다시 시도
            </button>
          )}
        </div>
      </ScreenShake>

      <GradeFlash grade={grade} combo={combo} />
      <RoundIntro show={showIntro} title={`TIME ATTACK ${TIME_LIMIT}s`} subtitle="시간이 갈수록 어려워진다!" onFinished={() => setShowIntro(false)} />
    </div>
  )
}
