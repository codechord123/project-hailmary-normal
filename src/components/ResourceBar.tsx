import { useGameStore } from '@/store/gameStore'

export function ResourceBar() {
  const { oxygen, energy, bond } = useGameStore()
  const max = useGameStore((s) => s.maxOxygen())
  const oxygenPct = (oxygen / max) * 100
  const danger = oxygenPct < 30

  return (
    <div className="mt-3 space-y-1">
      <div className="flex justify-between text-xs text-white/70">
        <span>🫁 산소 {oxygen}/{max}</span>
        <span>⚡ 에너지 {energy} · 🤝 신뢰도 {bond}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full transition-all ${danger ? 'bg-red-500 animate-pulse' : 'bg-cyan-400'}`}
          style={{ width: `${Math.max(0, Math.min(100, oxygenPct))}%` }}
        />
      </div>
    </div>
  )
}
