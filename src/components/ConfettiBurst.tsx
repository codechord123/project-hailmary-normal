import { motion } from 'framer-motion'

interface Props {
  show: boolean
}

const COLORS = ['#5eead4', '#fbbf24', '#f472b6', '#a78bfa', '#34d399']

export function ConfettiBurst({ show }: Props) {
  if (!show) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * Math.PI * 2
        const dist = 120 + Math.random() * 60
        return (
          <motion.div
            key={i}
            initial={{ x: '50vw', y: '40vh', scale: 0 }}
            animate={{
              x: `calc(50vw + ${Math.cos(angle) * dist}px)`,
              y: `calc(40vh + ${Math.sin(angle) * dist}px)`,
              scale: [0, 1, 0],
              rotate: 360,
            }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="absolute w-3 h-3 rounded-sm"
            style={{ backgroundColor: COLORS[i % COLORS.length] }}
          />
        )
      })}
    </div>
  )
}
