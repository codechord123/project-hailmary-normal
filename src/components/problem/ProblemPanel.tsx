import { useCallback } from 'react'
import type { Problem, StudentAnswer } from '@/types/problem'
import { FractionInput } from '@/components/FractionInput'
import { NumericAnswer } from './NumericAnswer'
import { MCQAnswer } from './MCQAnswer'
import { CompareAnswer } from './CompareAnswer'
import { MultiPartAnswer } from './MultiPartAnswer'

interface Props {
  problem: Problem
  onAnswerChange: (a: StudentAnswer) => void
  disabled?: boolean
  /** 자석 등 외부 시드: id가 바뀌면 child가 리마운트되며 정답이 초기값으로 채워짐 */
  externalSeed?: { id: number; answer: StudentAnswer } | null
}

export function ProblemPanel({ problem, onAnswerChange, disabled, externalSeed }: Props) {
  const resetKey = externalSeed ? `${problem.id}-seed-${externalSeed.id}` : problem.id
  const seedAns = externalSeed?.answer ?? null

  const handleFraction = useCallback(
    (v: any) => onAnswerChange({ kind: 'fraction', value: v }),
    [onAnswerChange],
  )
  const handleNumeric = useCallback(
    (v: any) => onAnswerChange({ kind: 'numeric', value: v }),
    [onAnswerChange],
  )
  const handleMcq = useCallback(
    (vs: number[]) => onAnswerChange({ kind: 'mcq', values: vs }),
    [onAnswerChange],
  )
  const handleCompare = useCallback(
    (op: any) => onAnswerChange({ kind: 'compare', op }),
    [onAnswerChange],
  )
  const handleMulti = useCallback(
    ({ workspace, value }: { workspace: string; value: any }) =>
      onAnswerChange({ kind: 'multi', workspace, value }),
    [onAnswerChange],
  )

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {problem.kind === 'fraction' && (
        <FractionInput
          key={resetKey}
          onChange={handleFraction}
          disabled={disabled}
          initialValue={seedAns?.kind === 'fraction' ? seedAns.value : null}
        />
      )}
      {problem.kind === 'numeric' && (
        <NumericAnswer
          unit={problem.unit}
          onChange={handleNumeric}
          resetKey={resetKey}
          disabled={disabled}
          initialValue={seedAns?.kind === 'numeric' ? seedAns.value : null}
        />
      )}
      {problem.kind === 'mcq' && (
        <MCQAnswer
          choices={problem.choices}
          multiple={problem.multiple}
          onChange={handleMcq}
          resetKey={resetKey}
          disabled={disabled}
          initialValue={seedAns?.kind === 'mcq' ? seedAns.values : undefined}
        />
      )}
      {problem.kind === 'compare' && (
        <CompareAnswer
          left={problem.left}
          right={problem.right}
          onChange={handleCompare}
          resetKey={resetKey}
          disabled={disabled}
          initialValue={seedAns?.kind === 'compare' ? seedAns.op : null}
        />
      )}
      {problem.kind === 'multi' && (
        <MultiPartAnswer
          placeholder={problem.workspacePlaceholder}
          onChange={handleMulti}
          resetKey={resetKey}
          disabled={disabled}
          initialValue={
            seedAns?.kind === 'multi'
              ? { workspace: seedAns.workspace, value: seedAns.value }
              : undefined
          }
        />
      )}
    </div>
  )
}
