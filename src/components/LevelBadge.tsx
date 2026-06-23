import { useGameStore } from '@/store/gameStore'
import { computeLevelInfo } from '@/lib/leveling'

interface Props {
  compact?: boolean
}

export function LevelBadge({ compact }: Props) {
  const totalXp = useGameStore((s) => s.totalXp)
  const statPoints = useGameStore((s) => s.statPoints)
  const info = computeLevelInfo(totalXp)
  const pct = Math.min(100, (info.xpInLevel / info.xpToNext) * 100)

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className={`font-bold ${info.titleColor}`}>Lv.{info.level}</span>
        <span className="text-white/60">{info.title}</span>
        {statPoints > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-pink-500/30 text-pink-200 text-[10px]">
            SP {statPoints}
          </span>
        )}
      </div>
    )
  }
  return (
    <div className="w-full max-w-xs">
      <div className="flex items-center justify-between text-sm">
        <span className={`font-bold ${info.titleColor}`}>Lv.{info.level} {info.title}</span>
        <span className="text-white/60 text-xs">
          {info.xpInLevel} / {info.xpToNext} XP
        </span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-pink-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      {statPoints > 0 && (
        <div className="mt-1 text-xs text-pink-300">
          ✨ 분배 가능한 스탯 포인트 {statPoints}개 — 캐비닛에서 사용
        </div>
      )}
    </div>
  )
}
