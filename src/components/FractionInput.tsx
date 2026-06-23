import { useState, useEffect, useRef } from 'react'
import type { Fraction } from '@/types/fraction'

interface Props {
  onChange: (f: Fraction | null) => void
  disabled?: boolean
  /** 외부에서 답을 제안 (조작 씬 완료 시 자동 채움). 객체 참조 변경 시 1회 반영 */
  seed?: Fraction | null
  /** 마운트 시 초기 값 (자석 효과 등 강제 시드용) */
  initialValue?: Fraction | null
}

export function FractionInput({ onChange, disabled, seed, initialValue }: Props) {
  const [num, setNum] = useState(initialValue ? String(initialValue.numerator) : '')
  const [den, setDen] = useState(initialValue ? String(initialValue.denominator) : '')
  const lastSeedRef = useRef<Fraction | null>(null)

  useEffect(() => {
    if (!seed) return
    const last = lastSeedRef.current
    if (last && last.numerator === seed.numerator && last.denominator === seed.denominator) {
      return
    }
    lastSeedRef.current = seed
    setNum(String(seed.numerator))
    setDen(String(seed.denominator))
  }, [seed])

  useEffect(() => {
    const n = parseInt(num, 10)
    const d = parseInt(den, 10)
    if (Number.isFinite(n) && Number.isFinite(d) && d >= 1) {
      onChange({ numerator: n, denominator: d })
    } else {
      onChange(null)
    }
  }, [num, den, onChange])

  const clean = (s: string) => s.replace(/[^0-9]/g, '').slice(0, 3)

  return (
    <div className="inline-flex flex-col items-center text-space-900">
      <input
        aria-label="분자"
        inputMode="numeric"
        value={num}
        disabled={disabled}
        onChange={(e) => setNum(clean(e.target.value))}
        className="w-20 h-14 text-3xl text-center rounded-lg border-2 border-space-700 focus:outline-none focus:border-space-accent bg-white"
        placeholder="?"
      />
      <div className="w-24 h-1 bg-space-900 my-1 rounded" />
      <input
        aria-label="분모"
        inputMode="numeric"
        value={den}
        disabled={disabled}
        onChange={(e) => setDen(clean(e.target.value))}
        className="w-20 h-14 text-3xl text-center rounded-lg border-2 border-space-700 focus:outline-none focus:border-space-accent bg-white"
        placeholder="?"
      />
    </div>
  )
}
