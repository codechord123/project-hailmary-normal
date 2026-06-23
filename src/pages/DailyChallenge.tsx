import { useState, useMemo, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ProblemPanel } from '@/components/problem/ProblemPanel'
import { StageHeader } from '@/components/arcade/StageHeader'
import { ScreenShake } from '@/components/arcade/ScreenShake'
import { CountdownTimer } from '@/components/CountdownTimer'
import { DialogueBox } from '@/components/DialogueBox'
import { LevelBadge } from '@/components/LevelBadge'
import { useGameStore } from '@/store/gameStore'
import { useShortcuts } from '@/hooks/useShortcuts'
import {
  getDailyChallenge, getDailyBest, recordDailyBest, dailyDateLabel, todayDateKey,
} from '@/lib/dailyChallenge'
import { judge, answerToText, problemAnswerText } from '@/lib/judge'
import { addWrongNote } from '@/lib/wrongNotes'
import { unlock } from '@/lib/achievements'
import { sfx } from '@/lib/sfx'
import { comboBonusXp } from '@/lib/scoring'
import type { StudentAnswer } from '@/types/problem'

export function DailyChallenge() {
  const store = useGameStore()
  const today = todayDateKey()
  const challenge = useMemo(() => getDailyChallenge(today), [today])
  const [idx, setIdx] = useState(0)
  const [studentAnswer, setStudentAnswer] = useState<StudentAnswer>({ kind: 'fraction', value: null })
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'simplify' | 'correct' | 'timeout'>('idle')
  const [shake, setShake] = useState(0)
  const [finished, setFinished] = useState(false)
  const previousBest = useMemo(() => getDailyBest(today), [today])

  const problem = challenge.problems[idx]
  const isLast = idx === challenge.problems.length - 1
  const timer = 60 // 발문 독해 시간 확보

  useEffect(() => {
    if (finished) {
      recordDailyBest(score, correctCount, today)
      unlock('daily-done')
      sfx.clear()
    }
  }, [finished, score, correctCount, today])

  const nextProblem = useCallback(() => {
    if (isLast) {
      setFinished(true)
      return
    }
    setIdx((i) => i + 1)
    setStudentAnswer({ kind: 'fraction', value: null })
    setFeedback('idle')
  }, [isLast])

  const submit = useCallback(() => {
    const r = judge(problem, studentAnswer)
    if (r.kind === 'wrong') {
      setCombo(0)
      setFeedback('wrong')
      setShake((s) => s + 1)
      sfx.wrong()
      addWrongNote({
        chapterId: 'daily',
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
    if (r.kind === 'need-simplify') {
      setFeedback('simplify')
      sfx.wrong()
      return
    }
    const newCombo = combo + 1
    setCombo(newCombo)
    setCorrectCount((c) => c + 1)
    const crit = newCombo >= 5
    const gain = (100 + problem.difficulty * 40 + comboBonusXp(newCombo) * 12) * (crit ? 2 : 1)
    setScore((s) => s + gain)
    store.addXp(20 + problem.difficulty * 5)
    store.addEnergy(1)
    setFeedback('correct')
    if (crit) sfx.crit()
    else sfx.hit()
    setTimeout(() => nextProblem(), 700)
  }, [problem, studentAnswer, combo, store, nextProblem])

  const handleTimeout = useCallback(() => {
    if (feedback !== 'idle') return
    setCombo(0)
    setFeedback('timeout')
    setShake((s) => s + 1)
    sfx.wrong()
    setTimeout(() => nextProblem(), 900)
  }, [feedback, nextProblem])

  useShortcuts({
    onSubmit: feedback === 'idle' && !finished ? submit : undefined,
  })

  if (finished) {
    const newRecord = !previousBest || score > previousBest.score
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl">
          🌟
        </motion.div>
        <h2 className="mt-4 text-3xl font-bold text-yellow-300">오늘의 챌린지 완료!</h2>
        <div className="mt-2 text-white/60 text-sm font-mono">{dailyDateLabel(today)}</div>
        <div className="mt-6 font-mono text-white/80 space-y-2">
          <div>SCORE: <span className="text-yellow-300 text-2xl">{score.toLocaleString()}</span></div>
          <div>정답: <span className="text-emerald-300">{correctCount}/{challenge.problems.length}</span></div>
          {previousBest && !newRecord && (
            <div className="text-white/40 text-xs">오늘 최고기록: {previousBest.score.toLocaleString()}</div>
          )}
          {newRecord && (
            <div className="text-yellow-400 mt-3 animate-pulse font-bold">🏆 오늘의 신기록!</div>
          )}
        </div>
        <div className="mt-8 flex gap-3">
          <Link to="/" className="px-6 py-3 rounded-xl bg-space-accent text-space-900 font-bold">메인으로</Link>
          <Link to="/leaderboard" className="px-6 py-3 rounded-xl bg-yellow-400/20 text-yellow-200 border border-yellow-300/40">🏆 리더보드</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-4 max-w-2xl mx-auto flex flex-col">
      <ScreenShake shake={shake}>
        <header className="flex items-center justify-between">
          <Link to="/" className="text-white/60 hover:text-white text-sm">← 메인</Link>
          <LevelBadge compact />
        </header>

        <StageHeader
          stage={`DAILY · ${dailyDateLabel(today)}`}
          subtitle={`오늘의 챌린지 (${idx + 1}/${challenge.problems.length})`}
          combo={combo}
          score={score}
        />

        {previousBest && (
          <div className="mt-1 text-xs text-yellow-200/70 text-center">
            오늘 최고기록: <span className="font-mono">{previousBest.score.toLocaleString()}</span>
          </div>
        )}

        <div className="mt-3">
          <CountdownTimer
            durationSec={timer}
            paused={feedback !== 'idle'}
            onTimeout={handleTimeout}
            resetKey={problem.id}
          />
        </div>

        <div className="mt-3">
          <DialogueBox speaker="오늘의 챌린지" tone="system" text={problem.scenario} />
          <div className="mt-1">
            <DialogueBox speaker={`★${problem.difficulty}`} tone="narrator" text={problem.prompt} />
          </div>
        </div>

        <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <ProblemPanel problem={problem} onAnswerChange={setStudentAnswer} disabled={feedback === 'correct'} />
        </div>

        <AnimatePresence>
          {feedback === 'wrong' && <Box key="w" text="❌ 오답" color="bg-red-500/20 text-red-200" />}
          {feedback === 'simplify' && <Box key="s" text="🤏 기약분수로!" color="bg-yellow-500/20 text-yellow-200" />}
          {feedback === 'timeout' && <Box key="t" text="⏱ 시간 초과! 다음 문제" color="bg-orange-500/20 text-orange-200" />}
          {feedback === 'correct' && <Box key="c" text="✅ 정답!" color="bg-emerald-500/20 text-emerald-200" />}
        </AnimatePresence>

        <div className="mt-3 flex gap-2">
          {feedback === 'idle' && (
            <button onClick={submit} className="flex-1 px-4 py-3 rounded-xl bg-space-accent text-space-900 font-bold">제출</button>
          )}
          {(feedback === 'wrong' || feedback === 'simplify') && (
            <button onClick={() => setFeedback('idle')} className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20">다시 시도</button>
          )}
        </div>
      </ScreenShake>
    </div>
  )
}

function Box({ text, color }: { text: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`mt-2 p-2 rounded text-xs text-center ${color}`}
    >
      {text}
    </motion.div>
  )
}
