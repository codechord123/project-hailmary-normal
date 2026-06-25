import { motion } from 'framer-motion'

interface Props {
  hero: string
  title: string
  concept: { title: string; points: string[] }
  startLabel: string
  onStart: () => void
}

/** 게임 전 핵심 개념 카드 — 짧게 가르치고 시작(가르치기 → 풀기). */
export function ConceptCard({ hero, title, concept, startLabel, onStart }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-5">
      <p className="text-xs text-indigo-300/80">⭐ {hero}</p>
      <h1 className="text-xl font-black text-white/90">{title}</h1>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 20 }}
        className="w-full max-w-md rounded-2xl border border-amber-300/30 bg-gradient-to-br from-amber-400/10 to-indigo-500/10 p-5 shadow-[0_0_30px_rgba(251,191,36,0.15)]"
      >
        <div className="text-base font-black text-amber-200 mb-3">💡 오늘 배울 핵심 — {concept.title}</div>
        <ul className="flex flex-col gap-2 text-left">
          {concept.points.map((p, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.12 }}
              className="flex gap-2 text-sm text-white/85 leading-relaxed"
            >
              <span className="text-amber-300 font-bold">{i + 1}.</span>
              <span>{p}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <p className="text-[11px] text-white/40">이 내용을 게임 속 미션에서 확인해 봐요!</p>
      <button
        onClick={onStart}
        className="px-8 py-3 rounded-xl font-bold bg-space-accent text-space-900 hover:brightness-110 active:scale-95 transition"
      >
        {startLabel}
      </button>
    </div>
  )
}
