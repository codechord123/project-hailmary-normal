import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sfx } from '@/lib/sfx'

interface Props {
  show: boolean
  title?: string
  subtitle?: string
  onFinished?: () => void
}

/** 캡콤식 라운드 인트로: READY → FIGHT! */
export function RoundIntro({ show, title = 'STAGE START', subtitle = '준비!', onFinished }: Props) {
  const [phase, setPhase] = useState<'ready' | 'fight' | 'done'>('ready')
  // onFinished 가 매 렌더 새 ref 라서 effect 가 재발화 되는 것을 막는다.
  const onFinishedRef = useRef(onFinished)
  onFinishedRef.current = onFinished

  useEffect(() => {
    if (!show) {
      setPhase('ready')
      return
    }
    setPhase('ready')
    sfx.bossLaugh()
    const t1 = setTimeout(() => {
      setPhase('fight')
      sfx.crit()
    }, 900)
    const t2 = setTimeout(() => {
      setPhase('done')
      onFinishedRef.current?.()
    }, 1700)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [show])

  if (!show || phase === 'done') return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[55] flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-none"
    >
      <AnimatePresence mode="wait">
        {phase === 'ready' && (
          <motion.div
            key="ready"
            initial={{ scale: 0.3, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280 }}
            className="text-center"
          >
            <div className="text-xs sm:text-sm font-mono text-cyan-300 tracking-widest">{title}</div>
            <div
              className="mt-2 text-6xl sm:text-7xl font-black font-mono text-yellow-300 drop-shadow-[4px_4px_0_rgba(0,0,0,0.7)]"
              style={{ WebkitTextStroke: '2px black' } as any}
            >
              READY...
            </div>
            <div className="mt-2 text-sm text-white/80">{subtitle}</div>
          </motion.div>
        )}
        {phase === 'fight' && (
          <motion.div
            key="fight"
            initial={{ scale: 0.1, opacity: 0, rotate: -30 }}
            animate={{ scale: [0.1, 1.8, 1.2], opacity: 1, rotate: 0 }}
            exit={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center"
          >
            <div
              className="text-7xl sm:text-9xl font-black font-mono bg-gradient-to-br from-red-500 via-yellow-400 to-red-600 bg-clip-text text-transparent drop-shadow-[6px_6px_0_rgba(0,0,0,0.7)]"
              style={{ WebkitTextStroke: '3px black' } as any}
            >
              FIGHT!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
