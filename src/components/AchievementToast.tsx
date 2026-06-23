import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ACHIEVEMENTS, onUnlock } from '@/lib/achievements'

interface ToastEvent {
  id: string
  key: number
}

export function AchievementToast() {
  const [queue, setQueue] = useState<ToastEvent[]>([])

  useEffect(() => {
    const off = onUnlock((id) => {
      setQueue((q) => [...q, { id, key: Date.now() + Math.random() }])
      setTimeout(() => {
        setQueue((q) => q.slice(1))
      }, 3800)
    })
    return () => {
      off()
    }
  }, [])

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {queue.map((evt) => {
          const def = ACHIEVEMENTS.find((a) => a.id === evt.id)
          if (!def) return null
          return (
            <motion.div
              key={evt.key}
              initial={{ y: -40, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500/90 to-orange-500/90 border-2 border-yellow-200 shadow-2xl text-white max-w-sm"
            >
              <div className="text-[10px] uppercase tracking-widest font-bold text-yellow-100">
                ✨ 업적 달성!
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-3xl">{def.icon}</span>
                <div>
                  <div className="font-bold text-base">{def.name}</div>
                  <div className="text-xs opacity-90">{def.description}</div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
