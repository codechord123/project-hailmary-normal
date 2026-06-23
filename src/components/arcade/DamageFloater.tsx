import { motion, AnimatePresence } from 'framer-motion'

export interface DamageNumber {
  id: number
  amount: number
  type: 'normal' | 'crit' | 'miss' | 'heal'
  x: number // 0~1 (보스 컨테이너 비율)
}

interface Props {
  numbers: DamageNumber[]
}

const STYLE: Record<DamageNumber['type'], { color: string; size: string; label?: string }> = {
  normal: { color: 'text-yellow-200', size: 'text-3xl font-black' },
  crit: { color: 'text-red-400', size: 'text-5xl font-black', label: 'CRITICAL!' },
  miss: { color: 'text-white/40', size: 'text-2xl font-bold', label: 'MISS' },
  heal: { color: 'text-emerald-300', size: 'text-3xl font-black' },
}

export function DamageFloater({ numbers }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence>
        {numbers.map((n) => {
          const s = STYLE[n.type]
          return (
            <motion.div
              key={n.id}
              initial={{ y: 20, opacity: 0, scale: 0.4, rotate: -8 }}
              animate={{ y: -90, opacity: 1, scale: 1.1, rotate: 4 }}
              exit={{ opacity: 0, y: -120 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className={`absolute ${s.color} ${s.size} drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)] font-mono`}
              style={{ left: `${n.x * 100}%`, top: '50%', transform: 'translateX(-50%)' }}
            >
              {s.label ? (
                <div className="leading-none text-center">
                  <div className="text-xs tracking-widest opacity-80">{s.label}</div>
                  <div>{n.amount}</div>
                </div>
              ) : (
                <div>
                  {n.type === 'heal' ? '+' : '-'}
                  {n.amount}
                </div>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
