import { useState, useEffect } from 'react'
import { BlockMath } from 'react-katex'
import type { Fraction } from '@/types/fraction'

type Side = Fraction | { decimal: number }

interface Props {
  left: Side
  right: Side
  onChange: (op: '>' | '<' | '=' | null) => void
  resetKey: string
  disabled?: boolean
  initialValue?: '>' | '<' | '=' | null
}

const sideTex = (s: Side): string =>
  'decimal' in s ? `${s.decimal}` : `\\dfrac{${s.numerator}}{${s.denominator}}`

export function CompareAnswer({ left, right, onChange, resetKey, disabled, initialValue }: Props) {
  const [op, setOp] = useState<'>' | '<' | '=' | null>(initialValue ?? null)
  useEffect(() => {
    setOp(initialValue ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])
  useEffect(() => {
    onChange(op)
  }, [op, onChange])

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="flex items-center gap-3 text-white text-2xl">
        <BlockMath math={sideTex(left)} />
        <span className="text-3xl font-bold text-yellow-300">
          {op ?? '?'}
        </span>
        <BlockMath math={sideTex(right)} />
      </div>
      <div className="flex gap-2">
        {(['>', '=', '<'] as const).map((o) => (
          <button
            key={o}
            disabled={disabled}
            onClick={() => setOp(o)}
            className={`w-14 h-14 text-2xl rounded-lg border-2 ${
              op === o
                ? 'border-space-accent bg-space-accent/30 text-white'
                : 'border-white/20 bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}
