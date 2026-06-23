import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  shake: number // 0이면 정지, 양수면 흔들기 횟수 (key용)
  children: ReactNode
  intensity?: number
}

export function ScreenShake({ shake, children, intensity = 8 }: Props) {
  return (
    <motion.div
      key={shake}
      animate={
        shake > 0
          ? { x: [0, -intensity, intensity, -intensity * 0.6, intensity * 0.6, 0] }
          : {}
      }
      transition={{ duration: 0.35 }}
    >
      {children}
    </motion.div>
  )
}
