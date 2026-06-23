import { motion } from 'framer-motion'

interface Props {
  name: string
  hp: number
  maxHp: number
  isHit?: boolean
  isDead?: boolean
}

export function Boss({ name, hp, maxHp, isHit, isDead }: Props) {
  const pct = Math.max(0, (hp / maxHp) * 100)
  return (
    <div className="w-full flex flex-col items-center">
      {/* HP 바 */}
      <div className="w-full max-w-sm">
        <div className="flex justify-between text-[10px] font-mono">
          <span className="text-red-300 font-bold tracking-widest">BOSS · {name}</span>
          <span className="text-white/60">{Math.ceil(hp)} / {maxHp}</span>
        </div>
        <div className="h-3 mt-1 bg-black/50 border-2 border-red-500/50 rounded-sm overflow-hidden">
          <motion.div
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4 }}
            className="h-full bg-gradient-to-r from-red-600 via-red-500 to-yellow-400"
          />
        </div>
      </div>

      {/* 보스 (꿈틀거리는 미생물) */}
      <motion.div
        animate={
          isDead
            ? { scale: [1, 1.4, 0], opacity: [1, 1, 0], rotate: [0, 30, 60] }
            : isHit
              ? { x: [-6, 6, -4, 4, 0], filter: ['brightness(2)', 'brightness(1)'] }
              : { y: [0, -4, 0], scaleX: [1, 1.05, 1] }
        }
        transition={
          isDead
            ? { duration: 1 }
            : isHit
              ? { duration: 0.3 }
              : { duration: 2.4, repeat: Infinity }
        }
        className="mt-3"
      >
        <svg viewBox="-60 -50 120 100" width="180" height="150">
          {/* 본체 */}
          <ellipse cx="0" cy="0" rx="48" ry="34" fill="#7c2d12" stroke="#fbbf24" strokeWidth="2" />
          <ellipse cx="0" cy="-4" rx="40" ry="26" fill="#a16207" opacity="0.7" />
          {/* 가시 / 촉수 */}
          {[-50, -30, 0, 30, 50].map((x, i) => (
            <line key={i} x1={x * 0.9} y1="32" x2={x} y2="46" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
          ))}
          {/* 눈 */}
          <circle cx="-14" cy="-8" r="6" fill="#fef3c7" />
          <circle cx="14" cy="-8" r="6" fill="#fef3c7" />
          <circle cx="-14" cy="-8" r="3" fill="#7f1d1d" />
          <circle cx="14" cy="-8" r="3" fill="#7f1d1d" />
          {/* 입 */}
          <path d="M-14 10 Q0 22 14 10" fill="#7f1d1d" stroke="#fbbf24" strokeWidth="1.5" />
          {/* 이빨 */}
          <path d="M-10 12 L-7 18 L-4 12 M4 12 L7 18 L10 12" stroke="#fef3c7" strokeWidth="1.5" fill="none" />
        </svg>
      </motion.div>
    </div>
  )
}
