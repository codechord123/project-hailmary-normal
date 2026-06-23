import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ProblemPanel } from '@/components/problem/ProblemPanel'
import { DialogueBox } from '@/components/DialogueBox'
import { judge, answerToText, problemAnswerText } from '@/lib/judge'
import { sfx } from '@/lib/sfx'
import { addWrongNote } from '@/lib/wrongNotes'
import { trackCorrectDiffDen } from '@/lib/achievements'
import type { Problem, StudentAnswer } from '@/types/problem'

interface Props {
  problem: Problem
  /** 정답 처리 후 호출 (clear 전환 트리거) */
  onPass: () => void
  /** 오답 시 외부 페널티 (산소 감소 등) */
  onFail?: (reason: string) => void
  /** 오답 노트에 챕터 표기 */
  chapterId?: number | 'daily' | 'endless'
}

export function BonusProblemOverlay({ problem, onPass, onFail, chapterId }: Props) {
  const [answer, setAnswer] = useState<StudentAnswer>({ kind: 'fraction', value: null })
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'simplify' | 'correct'>('idle')
  const [reason, setReason] = useState('')

  const submit = useCallback(() => {
    const r = judge(problem, answer)
    if (r.kind === 'wrong') {
      setFeedback('wrong')
      setReason(r.reason)
      onFail?.(r.reason)
      sfx.wrong()
      if (chapterId != null) {
        addWrongNote({
          chapterId,
          problemId: problem.id,
          problemKind: problem.kind,
          scenario: problem.scenario,
          prompt: problem.prompt,
          studentAnswerText: answerToText(answer),
          correctAnswerText: problemAnswerText(problem),
          hint: problem.hint,
        })
      }
      return
    }
    if (r.kind === 'need-simplify') {
      setFeedback('simplify')
      onFail?.('기약분수로!')
      sfx.wrong()
      return
    }
    sfx.crit()
    setFeedback('correct')
    trackCorrectDiffDen()
    setTimeout(() => onPass(), 900)
  }, [problem, answer, onPass, onFail, chapterId])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-lg rounded-2xl bg-space-800 border-2 border-yellow-300/60 p-5 shadow-2xl"
      >
        <div className="text-center text-yellow-300 font-mono font-bold tracking-widest text-sm">
          ★ BONUS STAGE · 응용 문제 ★
        </div>
        <div className="mt-3 space-y-2">
          <DialogueBox speaker="시스템" tone="system" text={problem.scenario} />
          <DialogueBox speaker={`난이도 ★${problem.difficulty}`} tone="narrator" text={problem.prompt} />
        </div>

        <div className="mt-4 p-4 rounded-xl bg-black/30 border border-white/10">
          <ProblemPanel
            problem={problem}
            onAnswerChange={setAnswer}
            disabled={feedback === 'correct'}
          />
        </div>

        {feedback === 'wrong' && (
          <div className="mt-2 p-2 rounded bg-red-500/20 text-red-200 text-xs text-center">❌ {reason} · 다시</div>
        )}
        {feedback === 'simplify' && (
          <div className="mt-2 p-3 rounded bg-yellow-500/20 text-yellow-200 text-xs text-center leading-relaxed">
            🤏 <b>값은 맞지만 더 줄일 수 있어!</b><br />
            분자와 분모를 같은 수로 나눠서 더 작은 분수로 만든 다음 다시 입력해.
          </div>
        )}
        {feedback === 'correct' && (
          <div className="mt-2 p-2 rounded bg-emerald-500/20 text-emerald-200 text-xs text-center">✨ 보너스 클리어!</div>
        )}

        {feedback !== 'correct' && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={submit}
              className="flex-1 px-4 py-3 rounded-xl bg-yellow-400 text-space-900 font-bold"
            >
              제출
            </button>
            {feedback !== 'idle' && (
              <button
                onClick={() => setFeedback('idle')}
                className="px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20"
              >
                재시도
              </button>
            )}
          </div>
        )}
        <div className="mt-2 text-center text-xs text-white/40">힌트: {problem.hint}</div>
      </motion.div>
    </motion.div>
  )
}
