import { motion } from 'framer-motion'

interface Props {
  /** 현재 SP (0-100) */
  value: number
  /** SP 100 시 발동 가능 알림 */
  onTrigger?: () => void
}

/** 캡콤식 SP 게이지 — 콤보 누적으로 차오름, MAX 시 슈퍼 발동 가능 */
export function SuperGauge({ value, onTrigger }: Props) {
  const pct = Math.max(0, Math.min(100, value))
  const max = pct >= 100

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className={max ? 'text-yellow-300 font-bold animate-pulse' : 'text-white/60'}>
          {max ? '⚡ SUPER READY!' : 'SP GAUGE'}
        </span>
        <span className="text-white/50">{pct.toFixed(0)} / 100</span>
      </div>
      <div className="relative h-2.5 mt-0.5 rounded-full bg-black/50 overflow-hidden border border-white/15">
        <motion.div
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3 }}
          className={`h-full ${
            max
              ? 'bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 animate-pulse'
              : 'bg-gradient-to-r from-cyan-400 to-purple-500'
          }`}
        />
        {max && (
          <button
            onClick={onTrigger}
            className="absolute inset-0 cursor-pointer"
            aria-label="슈퍼 발동"
            title="SP 풀충전! 클릭해서 발동"
          />
        )}
      </div>
    </div>
  )
}
