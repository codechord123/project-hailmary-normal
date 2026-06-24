import { Link, Navigate, useParams } from 'react-router-dom'
import { findUnit } from '@/content/registry'
import { useUnitProgress } from '@/content/progress'
import { CODEX, codexTotal } from '@/content/units/lawAndRights/codex'

/**
 * 권리 도감 — 챕터를 클리어하면 그 챕터의 개념 카드가 해금된다.
 * "수집하는 재미"로 진행 동기를 더하고, 핵심 용어를 복습하게 한다.
 */
export function CodexContent() {
  const { unitId = '' } = useParams()
  const unit = findUnit(unitId)
  const prog = useUnitProgress(unitId)

  if (!unit) return <Navigate to="/subjects" replace />

  const total = codexTotal()
  const collected = CODEX
    .filter((g) => prog.cleared.includes(g.chapterId))
    .reduce((n, g) => n + g.cards.length, 0)

  return (
    <div className="min-h-screen px-4 py-6 max-w-2xl mx-auto flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Link to={`/unit/${unit.id}`} className="text-sm text-white/60 hover:text-white">← 허브</Link>
        <span className="text-sm font-bold text-amber-200">📖 {collected} / {total} 수집</span>
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-black text-white">권리 도감</h1>
        <p className="text-sm text-white/60 mt-1">챕터를 깨면 그 챕터의 개념 카드가 열려요!</p>
        <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden max-w-xs mx-auto">
          <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
            style={{ width: `${total ? (collected / total) * 100 : 0}%` }} />
        </div>
      </div>

      {CODEX.map((group) => {
        const unlocked = prog.cleared.includes(group.chapterId)
        return (
          <section key={group.chapterId} className="flex flex-col gap-2">
            <h2 className="text-sm font-bold text-white/70 flex items-center gap-2">
              {unlocked ? '📂' : '🔒'} {group.title}
              {!unlocked && <span className="text-[11px] text-white/40 font-normal">— 챕터를 깨면 열려요</span>}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {group.cards.map((card) => (
                <div
                  key={card.term}
                  className={`rounded-xl border p-3 flex flex-col gap-1 transition ${
                    unlocked
                      ? 'border-amber-300/30 bg-amber-300/5'
                      : 'border-white/10 bg-white/[0.02]'
                  }`}
                >
                  <div className="text-3xl">{unlocked ? card.emoji : '❓'}</div>
                  <div className="text-sm font-bold text-white">{unlocked ? card.term : '???'}</div>
                  <div className="text-[11px] text-white/60 leading-snug">
                    {unlocked ? card.desc : '아직 잠겨 있어요'}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
