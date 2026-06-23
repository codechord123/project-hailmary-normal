import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { getHelmet, getSuit } from '@/data/cosmetics'

interface Props {
  size?: number
  pose?: 'idle' | 'wave' | 'focus'
}

export function CharacterAvatar({ size = 100, pose = 'idle' }: Props) {
  const cosmetics = useGameStore((s) => s.cosmetics)
  const suit = getSuit(cosmetics.suit)
  const helmet = getHelmet(cosmetics.helmet)

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="-50 -60 100 120"
      animate={pose === 'wave' ? { rotate: [-3, 3, -3] } : { y: [0, -2, 0] }}
      transition={{ repeat: Infinity, duration: pose === 'wave' ? 0.8 : 2.2 }}
    >
      {/* 몸통 (우주복) */}
      <rect x="-20" y="-5" width="40" height="50" rx="10" fill={suit.primary} />
      <rect x="-20" y="-5" width="40" height="10" fill={suit.accent} opacity="0.7" />
      {/* 팔 */}
      <rect x="-30" y="0" width="10" height="32" rx="5" fill={suit.primary} />
      <rect x="20" y="0" width="10" height="32" rx="5" fill={suit.primary} />
      {/* 다리 */}
      <rect x="-15" y="40" width="12" height="20" rx="3" fill={suit.primary} />
      <rect x="3" y="40" width="12" height="20" rx="3" fill={suit.primary} />
      {/* 머리 / 헬멧 */}
      <g transform="translate(0, -22)">
        {helmet.shape === 'round' && (
          <>
            <circle r="20" fill="#fef3c7" />
            <circle r="20" fill="none" stroke={suit.accent} strokeWidth="3" />
          </>
        )}
        {helmet.shape === 'visor' && (
          <>
            <rect x="-22" y="-20" width="44" height="36" rx="10" fill="#0f172a" />
            <rect x="-18" y="-12" width="36" height="14" rx="3" fill="#7dd3fc" opacity="0.8" />
          </>
        )}
        {helmet.shape === 'astro' && (
          <>
            <circle r="22" fill="#1e293b" />
            <circle r="22" fill="none" stroke={suit.accent} strokeWidth="3" />
            <ellipse cx="0" cy="-2" rx="14" ry="10" fill="#7dd3fc" opacity="0.85" />
            <rect x="-3" y="-22" width="6" height="6" fill={suit.accent} />
          </>
        )}
        {/* 눈 */}
        {helmet.shape !== 'visor' && (
          <>
            <circle cx="-6" cy="-2" r="2" fill="#1e293b" />
            <circle cx="6" cy="-2" r="2" fill="#1e293b" />
            <path d="M-4 6 Q0 9 4 6" stroke="#1e293b" strokeWidth="1.5" fill="none" />
          </>
        )}
      </g>
    </motion.svg>
  )
}
