import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ProblemPanel } from '@/components/problem/ProblemPanel'
import { StageHeader } from '@/components/arcade/StageHeader'
import { DialogueBox } from '@/components/DialogueBox'
import { LevelBadge } from '@/components/LevelBadge'
import { GradeFlash, gradeFor, type Grade } from '@/components/arcade/GradeFlash'
import { useGameStore } from '@/store/gameStore'
import { useShortcuts } from '@/hooks/useShortcuts'
import { genBasicPractice } from '@/lib/problemGen'
import { judge, answerToText, problemAnswerText } from '@/lib/judge'
import { sfx } from '@/lib/sfx'
import { addWrongNote } from '@/lib/wrongNotes'
import type { Problem, StudentAnswer } from '@/types/problem'

const HI_KEY = 'hailmary-basic-hi'
const readHi = (): number => {
  try { return parseInt(localStorage.getItem(HI_KEY) || '0', 10) || 0 } catch { return 0 }
}
const writeHi = (v: number) => { try { localStorage.setItem(HI_KEY, String(v)) } catch { /* ignore */ } }

/**
 * 기초연습 모드 — 이분모 분수의 단순 계산만 훈련.
 * 통분 LCM < 99 인 모든 분모 쌍에서 매번 새로운 분수.
 * 시나리오 없이 식만 노출 — 응용 모드와 명확히 구분.
 */
export function BasicPractice() {
  const store = useGameStore()
  const [problem, setProblem] = useState<Problem>(() => genBasicPractice())
  const [studentAnswer, setStudentAnswer] = useState<StudentAnswer>({ kind: 'fraction', value: null })
  const [solved, setSolved] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(readHi())
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle')
  const [grade, setGrade] = useState<Grade>(null)
  const [showHint, setShowHint] = useState(false)

  const next = useCallback(() => {
    setProblem(genBasicPractice())
    setStudentAnswer({ kind: 'fraction', value: null })
    setFeedback('idle')
    setShowHint(false)
  }, [])

  const submit = useCallback(() => {
    const r = judge(problem, studentAnswer)
    if (r.kind === 'wrong' || r.kind === 'need-simplify') {
      setStreak(0)
      setFeedback('wrong')
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
    const newStreak = streak + 1
    setStreak(newStreak)
    setSolved((c) => c + 1)
    if (newStreak > bestStreak) {
      writeHi(newStreak)
      setBestStreak(newStreak)
    }
    store.addXp(10)
    setFeedback('correct')
    const g = gradeFor(newStreak, newStreak >= 5)
    setGrade(g)
    setTimeout(() => setGrade(null), 700)
    if (newStreak >= 5) sfx.crit()
    else sfx.hit()
    setTimeout(() => next(), 600)
  }, [problem, studentAnswer, streak, bestStreak, store, next])

  useShortcuts({ onSubmit: feedback === 'idle' ? submit : undefined })

  return (
    <div className="min-h-screen px-4 sm:px-6 py-4 max-w-2xl mx-auto flex flex-col">
      <header className="flex items-center justify-between">
        <Link to="/" className="text-white/60 hover:text-white text-sm">← 메인</Link>
        <LevelBadge compact />
      </header>

      <StageHeader
        stage="기초연습 · 통분 훈련"
        subtitle={`이분모 분수의 단순 합·차 · 연속 정답 BEST ${bestStreak}`}
        combo={streak}
        score={solved}
      />

      <div className="mt-3 p-3 rounded-xl bg-cyan-400/10 border border-cyan-300/30 text-cyan-100 text-sm leading-relaxed">
        🧮 기초연습 모드 — 응용 문제 대신 식이 직접 나와. 통분, 약분만 연습하자.
        <br />
        분모 쌍은 매번 무작위 (LCM이 99 미만인 모든 조합). 연속 정답을 쌓아 BEST 를 갱신해봐!
      </div>

      <div className="mt-3">
        <DialogueBox speaker="기초연습" tone="system" text={problem.scenario} />
      </div>

      <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10">
        <ProblemPanel problem={problem} onAnswerChange={setStudentAnswer} disabled={feedback === 'correct'} />
      </div>

      <AnimatePresence>
        {feedback === 'wrong' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 p-2 rounded bg-red-500/20 text-red-200 text-sm text-center">
            ❌ 다시 해보자! (연속 정답 0으로 리셋)
          </motion.div>
        )}
        {feedback === 'correct' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 p-2 rounded bg-emerald-500/20 text-emerald-200 text-sm text-center">
            ✅ 정답! (연속 {streak})
          </motion.div>
        )}
      </AnimatePresence>

      {showHint && (
        <div className="mt-2 p-2 rounded bg-yellow-400/15 border border-yellow-300/40 text-yellow-100 text-sm">
          💡 {problem.hint}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        {feedback === 'idle' && (
          <>
            <button onClick={submit} className="flex-1 px-4 py-3 rounded-xl bg-space-accent text-space-900 font-bold">
              제출 (Enter)
            </button>
            <button
              onClick={() => setShowHint((h) => !h)}
              className="px-4 py-3 rounded-xl bg-yellow-400/20 text-yellow-200 border border-yellow-300/40 text-sm"
            >
              {showHint ? '힌트 닫기' : '💡 힌트'}
            </button>
          </>
        )}
        {feedback === 'wrong' && (
          <button onClick={() => setFeedback('idle')} className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20">
            다시 시도
          </button>
        )}
      </div>

      <GradeFlash grade={grade} combo={streak} />
    </div>
  )
}
