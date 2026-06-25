import { useState } from 'react'
import type { ContentProblem } from '@/content/types'
import { judgeContent } from '@/content/judge'
import { figureIcon } from '@/content/figureIcon'
import { explainFor } from '@/content/units/lawAndRights/explanations'

interface Props {
  problem: ContentProblem
  onResult: (correct: boolean) => void
  /** 답한 뒤 정답/해설 피드백을 보여주고 '계속'을 눌러야 진행 (기본 true). 속도 모드는 false. */
  feedback?: boolean
}

const MARK = ['①', '②', '③', '④', '⑤']

/**
 * 빠른 답안 카드 — 게임/타임어택/끝없는 도전 공용.
 * 기본은 답한 뒤 정답·해설을 보여주고 '계속'으로 진행(학습 강화).
 * feedback=false면 즉시 채점·진행(속도 모드).
 */
export function QuickAnswer({ problem, onResult, feedback = true }: Props) {
  const [pick, setPick] = useState<number[]>([])
  const [result, setResult] = useState<boolean | null>(null)

  const correctText =
    problem.kind === 'ox'
      ? (problem.answer ? '⭕ 맞음' : '❌ 틀림')
      : problem.kind === 'mcq'
        ? problem.correctIndexes.map((i) => `${MARK[i] ?? i + 1} ${problem.choices[i]}`).join(', ')
        : ''
  const explanation = explainFor(problem)

  const commit = (correct: boolean) => {
    if (feedback) setResult(correct)
    else onResult(correct)
  }
  const answered = result !== null

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-3">
      {problem.scenario && (
        <p className="text-sm text-white/80 leading-relaxed">{problem.scenario}</p>
      )}
      {problem.figure && (
        <div className="rounded-lg border border-dashed border-amber-300/40 bg-amber-300/5 p-2 flex items-center gap-2 text-xs text-amber-100/90">
          <span className="text-2xl">{figureIcon(problem.figure)}</span>
          <span>{problem.figure}</span>
        </div>
      )}
      <p className="text-lg font-bold text-white">
        {problem.kind === 'ox' ? problem.statement : problem.prompt}
      </p>

      {problem.kind === 'mcq' && !problem.multiple && (
        <div className="grid grid-cols-1 gap-2">
          {problem.choices.map((c, i) => {
            const isCorrect = problem.correctIndexes.includes(i)
            return (
              <button
                key={i}
                disabled={answered}
                onClick={() => commit(judgeContent(problem, { kind: 'mcq', values: [i] }))}
                className={`text-left px-4 py-2.5 rounded-lg border transition active:scale-95 ${
                  answered && isCorrect
                    ? 'border-green-400 bg-green-400/20 text-white'
                    : 'bg-gradient-to-br from-indigo-500/25 to-violet-700/25 border-indigo-400/40 enabled:hover:border-yellow-300 enabled:hover:scale-[1.02] text-white/90'
                }`}
              >
                <span className="font-bold mr-2">{MARK[i] ?? i + 1}</span>{c}
              </button>
            )
          })}
        </div>
      )}

      {problem.kind === 'mcq' && problem.multiple && (
        <div className="flex flex-col gap-2">
          {problem.choices.map((c, i) => {
            const on = pick.includes(i)
            return (
              <button
                key={i}
                disabled={answered}
                onClick={() => setPick((p) => (on ? p.filter((x) => x !== i) : [...p, i]))}
                className={`text-left px-4 py-2.5 rounded-lg border transition ${
                  on ? 'border-indigo-400 bg-indigo-400/20 text-white' : 'border-white/15 bg-white/5 text-white/85 hover:bg-white/10'
                }`}
              >
                <span className="font-bold mr-2">{MARK[i] ?? i + 1}</span>{c}
              </button>
            )
          })}
          <button
            onClick={() => commit(judgeContent(problem, { kind: 'mcq', values: pick }))}
            disabled={pick.length === 0 || answered}
            className="px-4 py-2 rounded-lg bg-indigo-500 enabled:hover:bg-indigo-400 disabled:opacity-40 font-bold transition"
          >
            확인 (여러 개 선택)
          </button>
        </div>
      )}

      {problem.kind === 'ox' && (
        <div className="flex gap-3 justify-center">
          {([true, false] as const).map((v) => (
            <button
              key={String(v)}
              aria-label={v ? '맞음 (O)' : '틀림 (X)'}
              disabled={answered}
              onClick={() => commit(judgeContent(problem, { kind: 'ox', value: v }))}
              className="w-20 h-20 rounded-2xl text-3xl font-black border-2 border-white/20 bg-white/5 enabled:hover:bg-white/10 enabled:hover:border-yellow-300 disabled:opacity-60 transition active:scale-95"
            >
              {v ? '⭕' : '❌'}
            </button>
          ))}
        </div>
      )}

      {/* 정답·해설 피드백 — 누른 뒤 '계속'으로 진행 */}
      {answered && (
        <div className={`rounded-xl p-3 border ${result ? 'border-green-400/50 bg-green-400/10' : 'border-red-400/50 bg-red-400/10'}`}>
          <div className={`text-sm font-bold ${result ? 'text-green-200' : 'text-red-200'}`}>
            {result ? '✅ 정답이에요!' : '❌ 아쉬워요'}
          </div>
          {!result && <div className="text-xs text-white/80 mt-1">정답: {correctText}</div>}
          {explanation && <div className="text-xs text-white/75 mt-1.5 leading-relaxed">💡 {explanation}</div>}
          <button
            onClick={() => onResult(result)}
            className="mt-3 w-full py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 font-bold transition active:scale-95"
          >
            계속하기 →
          </button>
        </div>
      )}
    </div>
  )
}
