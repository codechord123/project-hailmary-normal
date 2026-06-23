import { useState, useEffect } from 'react'

interface Props {
  unit?: string
  onChange: (n: number | null) => void
  resetKey: string
  disabled?: boolean
  initialValue?: number | null
}

export function NumericAnswer({ unit, onChange, resetKey, disabled, initialValue }: Props) {
  const [val, setVal] = useState(initialValue != null ? String(initialValue) : '')
  useEffect(() => {
    setVal(initialValue != null ? String(initialValue) : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])
  useEffect(() => {
    const n = parseInt(val, 10)
    onChange(Number.isFinite(n) ? n : null)
  }, [val, onChange])
  return (
    <div className="inline-flex items-center gap-2">
      <input
        inputMode="numeric"
        value={val}
        disabled={disabled}
        onChange={(e) => setVal(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
        className="w-24 h-12 text-2xl text-center rounded-lg border-2 border-space-700 bg-white text-space-900 focus:outline-none focus:border-space-accent"
        placeholder="?"
      />
      {unit && <span className="text-white text-lg">{unit}</span>}
    </div>
  )
}
