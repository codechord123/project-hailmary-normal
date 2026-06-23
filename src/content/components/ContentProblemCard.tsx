import { useMemo, useState } from 'react'
import type { ContentProblem } from '@/content/types'
import { judgeContent, isAnswered, type ContentAnswer } from '@/content/judge'

interface Props {
  problem: ContentProblem
  /** 정답 확인 후 결과 콜백 (점수 집계 등) */
  onResult?: (correct: boolean) => void
}

/** 인덱스를 안정적으로 섞기 (problem.id 기준으로 한 번만) */
function useShuffledRights(problem: ContentProblem): number[] {
  return useMemo(() => {
    if (problem.kind !== 'matching') return []
    const order = problem.pairs.map((_, i) => i)
    // problem.id 해시로 시드 → 렌더마다 안 바뀜
    let seed = 0
    for (const ch of problem.id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0
    for (let i = order.length - 1; i > 0; i--) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      const j = seed % (i + 1)
      ;[order[i], order[j]] = [order[j], order[i]]
    }
    return order
  }, [problem])
}

export function ContentProblemCard({ problem, onResult }: Props) {
  const initial: ContentAnswer = useMemo(() => {
    if (problem.kind === 'mcq') return { kind: 'mcq', values: [] }
    if (problem.kind === 'ox') return { kind: 'ox', value: null }
    return { kind: 'matching', map: {} }
  }, [problem])

  const [answer, setAnswer] = useState<ContentAnswer>(initial)
  const [submitted, setSubmitted] = useState(false)
  const rightOrder = useShuffledRights(problem)

  // problem이 바뀌면 상태 초기화
  const [lastId, setLastId] = useState(problem.id)
  if (lastId !== problem.id) {
    setLastId(problem.id)
    setAnswer(initial)
    setSubmitted(false)
  }

  const correct = submitted ? judgeContent(problem, answer) : null

  const submit = () => {
    if (!isAnswered(problem, answer) || submitted) return
    setSubmitted(true)
    onResult?.(judgeContent(problem, answer))
  }

  const kindLabel =
    problem.kind === 'ox' ? 'OX' : problem.kind === 'matching' ? '짝짓기'
    : problem.multiple ? '객관식 · 여러 개' : '객관식'

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-6 flex flex-col gap-4">
      <span className="self-start text-xs font-bold px-2 py-1 rounded-full bg-indigo-500/30 text-indigo-100">
        {kindLabel}
      </span>

      {problem.scenario && (
        <p className="text-sm sm:text-base text-white/80 leading-relaxed">
          {problem.scenario}
        </p>
      )}

      {problem.figure && (
        <div className="rounded-xl border border-dashed border-amber-300/40 bg-amber-300/5 p-3 text-sm text-amber-100/90">
          🖼️ <span className="font-semibold">자료</span> — {problem.figure}
        </div>
      )}

      <p className="text-lg sm:text-xl font-bold text-white">
        {problem.kind === 'ox' ? problem.statement : problem.prompt}
      </p>

      {/* ── 객관식 ── */}
      {problem.kind === 'mcq' && (
        <div className="flex flex-col gap-2">
          {problem.choices.map((choice, i) => {
            const picked = answer.kind === 'mcq' && answer.values.includes(i)
            const isCorrectChoice = problem.correctIndexes.includes(i)
            return (
              <button
                key={i}
                disabled={submitted}
                onClick={() => {
                  if (answer.kind !== 'mcq') return
                  if (problem.multiple) {
                    const has = answer.values.includes(i)
                    setAnswer({
                      kind: 'mcq',
                      values: has
                        ? answer.values.filter((v) => v !== i)
                        : [...answer.values, i],
                    })
                  } else {
                    setAnswer({ kind: 'mcq', values: [i] })
                  }
                }}
                className={[
                  'text-left px-4 py-3 rounded-xl border transition',
                  submitted && isCorrectChoice
                    ? 'border-green-400 bg-green-400/15 text-white'
                    : submitted && picked && !isCorrectChoice
                      ? 'border-red-400 bg-red-400/15 text-white'
                      : picked
                        ? 'border-indigo-400 bg-indigo-400/20 text-white'
                        : 'border-white/15 bg-white/5 text-white/85 hover:bg-white/10',
                ].join(' ')}
              >
                <span className="font-bold mr-2">{['①','②','③','④','⑤'][i] ?? i + 1}</span>
                {choice}
              </button>
            )
          })}
        </div>
      )}

      {/* ── OX ── */}
      {problem.kind === 'ox' && (
        <div className="flex gap-3 justify-center">
          {([true, false] as const).map((v) => {
            const picked = answer.kind === 'ox' && answer.value === v
            const isCorrectChoice = problem.answer === v
            return (
              <button
                key={String(v)}
                disabled={submitted}
                onClick={() => setAnswer({ kind: 'ox', value: v })}
                className={[
                  'w-24 h-24 rounded-2xl text-4xl font-black border-2 transition',
                  submitted && isCorrectChoice
                    ? 'border-green-400 bg-green-400/15'
                    : submitted && picked && !isCorrectChoice
                      ? 'border-red-400 bg-red-400/15'
                      : picked
                        ? 'border-indigo-400 bg-indigo-400/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10',
                ].join(' ')}
              >
                {v ? '⭕' : '❌'}
              </button>
            )
          })}
        </div>
      )}

      {/* ── 짝짓기 ── */}
      {problem.kind === 'matching' && (
        <div className="flex flex-col gap-3">
          {problem.pairs.map((pair, leftIdx) => {
            const chosen = answer.kind === 'matching' ? answer.map[leftIdx] : undefined
            const isRowCorrect = chosen === leftIdx
            return (
              <div key={leftIdx} className="flex flex-col gap-1.5">
                <div className="font-semibold text-white">
                  {pair.left}
                  {submitted && (
                    <span className={isRowCorrect ? 'text-green-300' : 'text-red-300'}>
                      {isRowCorrect ? '  ✓' : `  ✗ (정답: ${pair.right})`}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {rightOrder.map((rightIdx) => {
                    const picked = chosen === rightIdx
                    return (
                      <button
                        key={rightIdx}
                        disabled={submitted}
                        onClick={() => {
                          if (answer.kind !== 'matching') return
                          setAnswer({
                            kind: 'matching',
                            map: { ...answer.map, [leftIdx]: rightIdx },
                          })
                        }}
                        className={[
                          'px-3 py-1.5 rounded-lg text-sm border transition',
                          picked
                            ? 'border-indigo-400 bg-indigo-400/20 text-white'
                            : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10',
                        ].join(' ')}
                      >
                        {problem.pairs[rightIdx].right}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── 확인 버튼 / 결과 ── */}
      {!submitted ? (
        <button
          onClick={submit}
          disabled={!isAnswered(problem, answer)}
          className="mt-2 px-5 py-3 rounded-xl font-bold bg-indigo-500 enabled:hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          확인
        </button>
      ) : (
        <div
          className={[
            'mt-2 rounded-xl p-4 text-center font-bold',
            correct ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200',
          ].join(' ')}
        >
          {correct ? '정답이에요! 🎉' : '아쉬워요, 정답을 확인해 보세요.'}
          {problem.hint && (
            <p className="mt-1 text-sm font-normal text-white/70">💡 {problem.hint}</p>
          )}
        </div>
      )}
    </div>
  )
}
