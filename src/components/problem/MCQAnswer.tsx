import { useState, useEffect } from 'react'

interface Props {
  choices: string[]
  multiple: boolean
  onChange: (values: number[]) => void
  resetKey: string
  disabled?: boolean
  initialValue?: number[]
}

export function MCQAnswer({ choices, multiple, onChange, resetKey, disabled, initialValue }: Props) {
  const [picked, setPicked] = useState<number[]>(initialValue ?? [])
  useEffect(() => {
    setPicked(initialValue ?? [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])
  useEffect(() => {
    onChange(picked)
  }, [picked, onChange])

  const toggle = (i: number) => {
    if (disabled) return
    if (multiple) {
      setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]))
    } else {
      setPicked([i])
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
      {choices.map((c, i) => {
        const on = picked.includes(i)
        return (
          <button
            key={i}
            onClick={() => toggle(i)}
            disabled={disabled}
            className={`text-left px-3 py-2 rounded-lg border-2 transition ${
              on
                ? 'border-space-accent bg-space-accent/20 text-white'
                : 'border-white/20 bg-white/5 text-white/80 hover:bg-white/10'
            }`}
          >
            <span className="font-bold mr-2">{['①', '②', '③', '④', '⑤'][i] ?? `${i + 1}`}</span>
            {c}
          </button>
        )
      })}
      {multiple && (
        <div className="col-span-full text-xs text-yellow-200/80">
          ⓘ 정답이 여러 개일 수 있어. 모두 골라.
        </div>
      )}
    </div>
  )
}
