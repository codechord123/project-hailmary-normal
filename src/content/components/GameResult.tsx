import { motion, useReducedMotion } from 'framer-motion'
import { ConfettiBurst } from '@/components/ConfettiBurst'

interface Action {
  label: string
  onClick: () => void
}

const RANK: Record<number, { tag: string; from: string; to: string; ring: string; label: string }> = {
  3: { tag: 'S', from: 'from-yellow-300', to: 'to-orange-500', ring: 'shadow-[0_0_30px_rgba(251,191,36,0.7)]', label: '완벽해요!' },
  2: { tag: 'A', from: 'from-cyan-300', to: 'to-blue-500', ring: 'shadow-[0_0_24px_rgba(56,189,248,0.6)]', label: '훌륭해요!' },
  1: { tag: 'B', from: 'from-emerald-300', to: 'to-green-600', ring: 'shadow-[0_0_20px_rgba(52,211,153,0.5)]', label: '좋아요!' },
}

/**
 * 공용 결과 화면 — 콘텐츠 미니게임의 클리어/실패 화면을 통일.
 * stars 가 있으면 별점 + 랭크 도장(S/A/B), confetti 면 축하 컨페티.
 */
export function GameResult({
  emoji, title, stars, lines, confetti, primary, secondary,
}: {
  emoji: string
  title: string
  stars?: number
  lines: string[]
  confetti?: boolean
  primary: Action
  secondary: Action
}) {
  const reduce = useReducedMotion()
  const rank = stars != null && stars >= 1 ? RANK[stars] : null
  const dur = reduce ? 0 : undefined

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center overflow-hidden">
      {confetti && <ConfettiBurst show />}

      <motion.div
        initial={{ scale: 0.3, rotate: reduce ? 0 : -20, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16, duration: dur }}
        className="text-6xl"
      >
        {emoji}
      </motion.div>

      <motion.h1
        initial={{ y: reduce ? 0 : 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: reduce ? 0 : 0.1, duration: dur }}
        className="text-2xl font-black text-white"
      >
        {title}
      </motion.h1>

      {rank && (
        <motion.div
          initial={{ scale: reduce ? 1 : 2.2, opacity: 0, rotate: reduce ? 0 : -12 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ delay: reduce ? 0 : 0.25, type: 'spring', stiffness: 300, damping: 14, duration: dur }}
          className="flex flex-col items-center gap-1"
        >
          <div className={`w-20 h-20 rounded-full grid place-items-center bg-gradient-to-br ${rank.from} ${rank.to} ${rank.ring}`}>
            <span className="text-4xl font-black text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.4)]" style={{ WebkitTextStroke: '1.5px rgba(0,0,0,0.35)' } as React.CSSProperties}>
              {rank.tag}
            </span>
          </div>
          <span className="text-sm font-bold text-white/80">{rank.label}</span>
        </motion.div>
      )}

      {stars != null && (
        <div className="flex gap-1.5 text-3xl" aria-label={`별 ${stars}개`}>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, rotate: reduce ? 0 : -40 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: reduce ? 0 : 0.35 + i * 0.12, type: 'spring', stiffness: 320, damping: 12, duration: dur }}
              className={i < stars ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'text-white/20'}
            >
              ★
            </motion.span>
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduce ? 0 : 0.7, duration: dur }}
        className="text-white/70 flex flex-col gap-1"
      >
        {lines.map((l, i) => <span key={i}>{l}</span>)}
      </motion.div>

      <motion.div
        initial={{ y: reduce ? 0 : 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: reduce ? 0 : 0.8, duration: dur }}
        className="flex gap-3"
      >
        <button onClick={primary.onClick} className="px-6 py-3 rounded-xl font-bold bg-indigo-500 hover:bg-indigo-400 transition active:scale-95">{primary.label}</button>
        <button onClick={secondary.onClick} className="px-6 py-3 rounded-xl font-bold bg-white/10 hover:bg-white/20 transition active:scale-95">{secondary.label}</button>
      </motion.div>
    </div>
  )
}
