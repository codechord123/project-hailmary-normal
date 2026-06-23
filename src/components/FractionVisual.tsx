import type { Fraction } from '@/types/fraction'

interface Props {
  a: Fraction
  b: Fraction
  operation: 'add' | 'subtract'
}

/** 같은 분모일 때 정확한 막대 모델 */
export function FractionVisual({ a, b, operation }: Props) {
  // 분모가 다를 때는 표시 안 함 (다음 챕터에서 통분 시각화 별도)
  if (a.denominator !== b.denominator) return null
  const total = a.denominator
  const fillA = a.numerator
  const fillB = operation === 'add' ? b.numerator : -b.numerator
  const result = Math.max(0, Math.min(total, fillA + fillB))

  return (
    <div className="w-full max-w-md space-y-2 text-xs text-white/70">
      <BarRow label="A" total={total} filled={fillA} color="bg-cyan-400" />
      <BarRow
        label={operation === 'add' ? '+ B' : '− B'}
        total={total}
        filled={Math.abs(fillB)}
        color={operation === 'add' ? 'bg-emerald-400' : 'bg-rose-400'}
      />
      <div className="h-px bg-white/20 my-2" />
      <BarRow label="=" total={total} filled={result} color="bg-yellow-300" />
    </div>
  )
}

function BarRow({
  label,
  total,
  filled,
  color,
}: {
  label: string
  total: number
  filled: number
  color: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 text-right">{label}</span>
      <div className="flex-1 flex gap-0.5 rounded overflow-hidden">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-5 ${i < filled ? color : 'bg-white/10'} transition-colors`}
          />
        ))}
      </div>
      <span className="w-12 text-left">{filled}/{total}</span>
    </div>
  )
}
