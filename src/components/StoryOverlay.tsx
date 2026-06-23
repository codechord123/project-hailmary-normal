import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type StoryLine, SPEAKER_COLOR } from '@/data/story'

interface Props {
  lines: StoryLine[]
  onClose: () => void
}

export function StoryOverlay({ lines, onClose }: Props) {
  const [idx, setIdx] = useState(0)

  if (idx >= lines.length) return null
  const line = lines[idx]
  const color = SPEAKER_COLOR[line.speaker]

  const advance = () => {
    if (idx < lines.length - 1) setIdx(idx + 1)
    else onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-gradient-to-b from-black/60 via-black/80 to-black p-6"
      onClick={advance}
    >
      {/* 별 배경 */}
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
          style={{
            top: `${(i * 37) % 100}%`,
            left: `${(i * 61) % 100}%`,
            animationDelay: `${(i % 5) * 0.3}s`,
          }}
        />
      ))}

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          className="w-full max-w-2xl mb-12 p-5 rounded-2xl bg-black/80 border-2 border-white/20 backdrop-blur"
        >
          <div className={`text-xs font-bold tracking-widest mb-1 ${color}`}>
            {line.speaker.toUpperCase()}
          </div>
          <div className="text-lg sm:text-xl text-white leading-relaxed">{line.text}</div>
          <div className="flex justify-between items-center mt-3 text-xs text-white/40">
            <span>탭 / 클릭으로 진행 ({idx + 1}/{lines.length})</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="px-3 py-1 rounded bg-white/10 text-white/70 hover:bg-white/20"
            >
              ⏩ 스킵
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
