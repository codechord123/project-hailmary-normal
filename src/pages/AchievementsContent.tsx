import { Link, Navigate, useParams } from 'react-router-dom'
import { findUnit } from '@/content/registry'
import { useUnitProgress, ACHIEVEMENTS } from '@/content/progress'
import { useGameStore } from '@/store/gameStore'
import { computeLevelInfo } from '@/lib/leveling'

/** 단원 기록 — 단원별 별점·기록·업적 + 공유 레벨. */
export function AchievementsContent() {
  const { unitId = '' } = useParams()
  const unit = findUnit(unitId)
  const prog = useUnitProgress(unitId)
  const totalXp = useGameStore((s) => s.totalXp)

  if (!unit) return <Navigate to="/subjects" replace />

  const info = computeLevelInfo(totalXp)
  const level = info.level
  const totalStars = Object.values(prog.stars).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen px-4 py-6 flex flex-col items-center gap-5">
      <div className="w-full max-w-xl flex items-center justify-between">
        <Link to={`/unit/${unit.id}`} className="text-sm text-white/60 hover:text-white">← 허브</Link>
      </div>

      <h1 className="text-xl font-black text-white">🏅 업적 · 기록</h1>

      <div className="w-full max-w-xl grid grid-cols-3 gap-2 text-center">
        <Stat label="레벨(공유)" value={`Lv.${level}`} />
        <Stat label="XP(공유)" value={String(totalXp)} />
        <Stat label="별" value={`⭐${totalStars}`} />
        <Stat label="클리어" value={`${prog.cleared.length}/${unit.chapters.length}`} />
        <Stat label="타임어택" value={String(prog.bestTimeAttack)} />
        <Stat label="끝없는 연속" value={String(prog.bestEndless)} />
      </div>

      <div className="w-full max-w-xl flex flex-col gap-2">
        {ACHIEVEMENTS.map((a) => {
          const got = prog.achievements.includes(a.id)
          return (
            <div
              key={a.id}
              className={`rounded-xl border p-3 flex items-center gap-3 ${
                got ? 'border-amber-300/50 bg-amber-300/10' : 'border-white/10 bg-white/5 opacity-60'
              }`}
            >
              <span className="text-3xl">{got ? a.icon : '🔒'}</span>
              <span className="flex flex-col">
                <span className="font-bold text-white">{a.name}</span>
                <span className="text-xs text-white/55">{a.desc}</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-2">
      <div className="text-lg font-black text-white">{value}</div>
      <div className="text-[11px] text-white/50">{label}</div>
    </div>
  )
}
