import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  hero: string
  title: string
  lines: string[]
  startLabel: string
  onStart: () => void
}

/** 챕터 시작 스토리 오버레이 — 권리 수호자 서사를 한 줄씩 보여 준다. */
export function ContentStoryOverlay({ hero, title, lines, startLabel, onStart }: Props) {
  const [i, setI] = useState(0)
  const last = i >= lines.length - 1

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-6">
      <p className="text-xs text-indigo-300/80">⭐ {hero}</p>
      <h1 className="text-2xl font-black text-white">{title}</h1>

      <AnimatePresence mode="wait">
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-lg text-white/85 leading-relaxed max-w-md min-h-[3.5rem]"
        >
          {lines[i]}
        </motion.p>
      </AnimatePresence>

      <div className="flex items-center gap-1">
        {lines.map((_, idx) => (
          <span key={idx} className={`w-2 h-2 rounded-full ${idx === i ? 'bg-space-accent' : 'bg-white/20'}`} />
        ))}
      </div>

      {last ? (
        <button
          onClick={onStart}
          className="px-8 py-3 rounded-xl font-bold bg-space-accent text-space-900 hover:brightness-110 active:scale-95 transition"
        >
          {startLabel}
        </button>
      ) : (
        <div className="flex gap-2">
          <button onClick={onStart} className="px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white">건너뛰기</button>
          <button
            onClick={() => setI((x) => x + 1)}
            className="px-6 py-2 rounded-lg font-bold bg-white/10 hover:bg-white/20 transition"
          >
            다음 ▶
          </button>
        </div>
      )}
    </div>
  )
}
