import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ACHIEVEMENTS, getUnlockedMap, getCounters } from '@/lib/achievements'

const CATEGORY_LABEL: Record<string, string> = {
  progress: '🚀 진행',
  mastery: '🎯 숙달',
  collection: '📦 수집',
  challenge: '⚔ 도전',
}

const CATEGORY_ORDER = ['progress', 'mastery', 'collection', 'challenge'] as const

export function Achievements() {
  const unlocked = getUnlockedMap()
  const counters = getCounters()
  const total = ACHIEVEMENTS.length
  const got = Object.keys(unlocked).length

  return (
    <div className="min-h-screen px-6 py-8 max-w-3xl mx-auto">
      <Link to="/" className="text-white/60 hover:text-white text-sm">← 메인으로</Link>
      <h2 className="mt-3 text-3xl font-bold text-white">🏅 업적</h2>
      <p className="text-white/60 text-sm mt-1">
        해금: <span className="text-yellow-300 font-bold">{got}</span> / {total}
      </p>

      <section className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-sm font-bold text-white mb-2">진행 카운터</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Counter label="기약분수 정답" value={counters.simplified} target={50} />
          <Counter label="통분 정답" value={counters.diffDen} target={30} />
        </div>
      </section>

      {CATEGORY_ORDER.map((cat) => {
        const items = ACHIEVEMENTS.filter((a) => a.category === cat)
        return (
          <section key={cat} className="mt-4">
            <h3 className="text-sm font-bold text-white/80 mb-2">{CATEGORY_LABEL[cat]}</h3>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {items.map((a) => {
                const isGot = Boolean(unlocked[a.id])
                const showHidden = a.hidden && !isGot
                return (
                  <motion.li
                    key={a.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`p-3 rounded-xl border ${
                      isGot
                        ? 'bg-yellow-500/15 border-yellow-300/40'
                        : 'bg-white/5 border-white/10 opacity-60'
                    }`}
                  >
                    <div className="text-3xl text-center">{showHidden ? '❓' : a.icon}</div>
                    <div className={`mt-1 text-xs text-center font-bold ${isGot ? 'text-yellow-200' : 'text-white/60'}`}>
                      {showHidden ? '???' : a.name}
                    </div>
                    <div className="mt-0.5 text-[10px] text-center text-white/50">
                      {showHidden ? '조건을 충족하면 공개됩니다' : a.description}
                    </div>
                  </motion.li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

function Counter({ label, value, target }: { label: string; value: number; target: number }) {
  const pct = Math.min(100, (value / target) * 100)
  return (
    <div className="p-2 rounded bg-black/30">
      <div className="flex justify-between">
        <span className="text-white/60">{label}</span>
        <span className="text-white/80 font-mono">{value}/{target}</span>
      </div>
      <div className="mt-1 h-1.5 rounded bg-white/10 overflow-hidden">
        <div className="h-full bg-yellow-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
