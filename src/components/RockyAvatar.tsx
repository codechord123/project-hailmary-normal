import { motion } from 'framer-motion'

type Mood = 'neutral' | 'happy' | 'sad' | 'excited' | 'thinking'

interface Props {
  mood?: Mood
  size?: number
}

export function RockyAvatar({ mood = 'neutral', size = 80 }: Props) {
  const eye = mood === 'sad' ? 'M-4 0 L4 0' : mood === 'excited' ? 'M-4 -2 Q0 2 4 -2' : 'M-4 0 L4 0'
  const eyeOpen = mood === 'sad' ? 1.5 : mood === 'thinking' ? 1 : 3
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="-50 -50 100 100"
      animate={{ y: mood === 'excited' ? [-2, 2, -2] : 0 }}
      transition={{ repeat: mood === 'excited' ? Infinity : 0, duration: 0.6 }}
    >
      {/* 외골격 몸체 */}
      <ellipse cx="0" cy="10" rx="38" ry="32" fill="#f59e0b" />
      <ellipse cx="0" cy="0" rx="36" ry="30" fill="#fbbf24" />
      {/* 다리 5개 (펜타팟) */}
      {[-30, -15, 0, 15, 30].map((x) => (
        <line key={x} x1={x} y1="35" x2={x * 1.3} y2="48" stroke="#92400e" strokeWidth="3" strokeLinecap="round" />
      ))}
      {/* 눈 (위 두 개) */}
      <g>
        <circle cx="-12" cy="-10" r={eyeOpen} fill="#1e293b" />
        <circle cx="12" cy="-10" r={eyeOpen} fill="#1e293b" />
      </g>
      {mood === 'sad' && (
        <>
          <path d="M-16 -5 L-8 -2" stroke="#1e293b" strokeWidth="2" />
          <path d="M16 -5 L8 -2" stroke="#1e293b" strokeWidth="2" />
        </>
      )}
      {/* 입 */}
      <g transform="translate(0, 14)">
        {mood === 'happy' || mood === 'excited' ? (
          <path d="M-10 0 Q0 8 10 0" stroke="#1e293b" strokeWidth="2.5" fill="none" />
        ) : mood === 'sad' ? (
          <path d="M-10 4 Q0 -4 10 4" stroke="#1e293b" strokeWidth="2.5" fill="none" />
        ) : (
          <path d={eye} stroke="#1e293b" strokeWidth="2.5" fill="none" />
        )}
      </g>
      {/* 생각 중이면 ? */}
      {mood === 'thinking' && (
        <text x="30" y="-25" fontSize="20" fill="#f59e0b">?</text>
      )}
    </motion.svg>
  )
}
