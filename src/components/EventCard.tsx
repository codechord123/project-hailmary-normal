import { motion } from 'framer-motion'
import type { ThreatEvent } from '@/data/events'

interface Props {
  event: ThreatEvent
  onChoose: (choiceIdx: number) => void
}

export function EventCard({ event, onChoose }: Props) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed inset-0 z-30 flex items-center justify-center px-6 bg-black/70 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl bg-space-700 border border-red-400/40 p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-red-300">{event.title}</h3>
        <p className="mt-2 text-white/80 text-sm">{event.description}</p>
        <div className="mt-5 space-y-2">
          {event.choices.map((c, i) => (
            <button
              key={i}
              onClick={() => onChoose(i)}
              className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              <div className="font-semibold text-white">{c.label}</div>
              <div className="text-xs text-white/60 mt-0.5">{c.hint}</div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
