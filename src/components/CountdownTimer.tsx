import { useEffect, useRef, useState } from 'react'
import { sfx } from '@/lib/sfx'

interface Props {
  durationSec: number
  paused?: boolean
  onTimeout: () => void
  resetKey: string | number // 변경 시 타이머 재시작
  crisis?: boolean
}

export function CountdownTimer({ durationSec, paused, onTimeout, resetKey, crisis }: Props) {
  const [remaining, setRemaining] = useState(durationSec)
  const firedRef = useRef(false)

  useEffect(() => {
    setRemaining(durationSec)
    firedRef.current = false
  }, [resetKey, durationSec])

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      setRemaining((r) => {
        const next = Math.max(0, r - 0.1)
        if (next <= 5 && Math.abs(next - Math.round(next)) < 0.05 && next > 0) {
          sfx.tick()
        }
        if (next === 0 && !firedRef.current) {
          firedRef.current = true
          onTimeout()
        }
        return next
      })
    }, 100)
    return () => clearInterval(id)
  }, [paused, onTimeout])

  const pct = (remaining / durationSec) * 100
  const danger = remaining <= 5
  const color = crisis
    ? 'bg-red-500'
    : danger
      ? 'bg-orange-400'
      : 'bg-cyan-400'

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className={crisis ? 'text-red-300 animate-pulse font-bold' : 'text-white/60'}>
          {crisis ? '⚠ 위기 모드' : '제한 시간'}
        </span>
        <span className={danger ? 'text-orange-300 font-bold' : 'text-white/60'}>
          {remaining.toFixed(1)}s
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
