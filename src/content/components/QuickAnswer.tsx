import { useState } from 'react'
import type { ContentProblem } from '@/content/types'
import { judgeContent } from '@/content/judge'
import { figureIcon } from '@/content/figureIcon'

interface Props {
  problem: ContentProblem
  onResult: (correct: boolean) => void
}

/**
 * 빠른 답안 카드 — 타임어택·끝없는 도전용.
 * 객관식(단일)·OX는 누르면 즉시 채점, 복수정답만 '확인' 버튼.
 * 문제가 바뀌면 호출부에서 key 로 리마운트해 상태를 초기화한다.
 */
export function QuickAnswer({ problem, onResult }: Props) {
  const [pick, setPick] = useState<number[]>([])

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
          {problem.choices.map((c, i) => (
            <button
              key={i}
              onClick={() => onResult(judgeContent(problem, { kind: 'mcq', values: [i] }))}
              className="text-left px-4 py-2.5 rounded-lg bg-gradient-to-br from-indigo-500/25 to-violet-700/25 border border-indigo-400/40 hover:border-yellow-300 hover:scale-[1.02] transition active:scale-95 text-white/90"
            >
              <span className="font-bold mr-2">{['①','②','③','④','⑤'][i] ?? i + 1}</span>{c}
            </button>
          ))}
        </div>
      )}

      {problem.kind === 'mcq' && problem.multiple && (
        <div className="flex flex-col gap-2">
          {problem.choices.map((c, i) => {
            const on = pick.includes(i)
            return (
              <button
                key={i}
                onClick={() => setPick((p) => (on ? p.filter((x) => x !== i) : [...p, i]))}
                className={`text-left px-4 py-2.5 rounded-lg border transition ${
                  on ? 'border-indigo-400 bg-indigo-400/20 text-white' : 'border-white/15 bg-white/5 text-white/85 hover:bg-white/10'
                }`}
              >
                <span className="font-bold mr-2">{['①','②','③','④','⑤'][i] ?? i + 1}</span>{c}
              </button>
            )
          })}
          <button
            onClick={() => onResult(judgeContent(problem, { kind: 'mcq', values: pick }))}
            disabled={pick.length === 0}
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
              onClick={() => onResult(judgeContent(problem, { kind: 'ox', value: v }))}
              className="w-20 h-20 rounded-2xl text-3xl font-black border-2 border-white/20 bg-white/5 hover:bg-white/10 hover:border-yellow-300 transition active:scale-95"
            >
              {v ? '⭕' : '❌'}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
