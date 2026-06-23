import { Link, useParams, Navigate } from 'react-router-dom'
import { findUnit, subjectOfUnit } from '@/content/registry'

const MECHANIC: Record<string, { label: string; icon: string }> = {
  defense: { label: '디펜스', icon: '🛡️' },
  matching: { label: '매칭', icon: '🃏' },
  boss: { label: '보스전', icon: '👾' },
  finalboss: { label: '최종보스', icon: '🐉' },
}

/** 책꽂이 3단계 — 단원 안에서 챕터 선택 */
export function UnitHome() {
  const { unitId = '' } = useParams()
  const unit = findUnit(unitId)
  const subject = subjectOfUnit(unitId)

  if (!unit) return <Navigate to="/subjects" replace />

  return (
    <div className="min-h-screen px-4 py-8 flex flex-col items-center gap-6">
      <div className="w-full max-w-xl flex items-center justify-between">
        <Link
          to={subject ? `/subject/${subject.id}` : '/subjects'}
          className="text-sm text-white/60 hover:text-white"
        >
          ← 단원
        </Link>
      </div>

      <div className="text-center">
        <p className="text-xs text-indigo-300/80">{unit.subject} {unit.grade} · {unit.theme}</p>
        <h1 className="text-2xl font-black text-white">{unit.title}</h1>
        <p className="mt-1 text-sm text-white/60">챕터를 골라 시작해요.</p>
      </div>

      <div className="w-full max-w-xl flex flex-col gap-3">
        {unit.chapters.map((ch, i) => {
          const m = MECHANIC[ch.mechanic] ?? { label: ch.mechanic, icon: '🎮' }
          return (
            <Link
              key={ch.id}
              to={`/play/${unit.id}/${ch.id}`}
              className="rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition p-4 flex items-center gap-4"
            >
              <span className="text-3xl">{m.icon}</span>
              <span className="flex flex-col flex-1">
                <span className="text-xs text-white/50">챕터 {i + 1} · {m.label}</span>
                <span className="text-lg font-bold text-white">{ch.title}</span>
                <span className="text-xs text-white/45">문제 {ch.problems.length}개</span>
              </span>
              <span className="text-white/40">▶</span>
            </Link>
          )
        })}
      </div>

      <Link
        to={`/unit-preview?unit=${unit.id}`}
        className="text-sm text-white/55 hover:text-white underline underline-offset-4"
      >
        전체 문제 한 번에 풀어보기 →
      </Link>
    </div>
  )
}
