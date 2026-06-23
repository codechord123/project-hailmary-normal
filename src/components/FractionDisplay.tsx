import { BlockMath } from 'react-katex'
import type { Fraction } from '@/types/fraction'
import { formatFraction } from '@/lib/fractionMath'

interface Props {
  a: Fraction
  b: Fraction
  operation: 'add' | 'subtract'
}

export function FractionExpression({ a, b, operation }: Props) {
  const op = operation === 'add' ? '+' : '-'
  return (
    <div className="text-white text-2xl">
      <BlockMath math={`${formatFraction(a)} \\;${op}\\; ${formatFraction(b)} \\;=\\; ?`} />
    </div>
  )
}
