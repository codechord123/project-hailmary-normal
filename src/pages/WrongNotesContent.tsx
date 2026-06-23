import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { findUnit } from '@/content/registry'
import { useUnitProgress, useProgress, weaknessScore } from '@/content/progress'
import { ContentProblemCard } from '@/content/components/ContentProblemCard'
import type { ContentProblem } from '@/content/types'

/** 오답 노트 — 틀린 문제를 모아 다시 풀고, 맞히면 노트에서 지운다. */
export function WrongNotesContent() {
  const { unitId = '' } = useParams()
  const unit = findUnit(unitId)
  const prog = useUnitProgress(unitId)
  const removeWrong = useProgress((s) => s.removeWrong)

  // 시작 시점의 오답 목록을 고정해 순서대로 복습
  const queue = useMemo(() => {
    if (!unit) return []
    const all = unit.chapters.flatMap((c) => c.problems)
    return prog.wrongIds
      .map((id) => all.find((p) => p.id === id))
      .filter((p): p is ContentProblem => Boolean(p))
      .sort((a, b) => weaknessScore(prog, a.id) - weaknessScore(prog, b.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit])

  const [idx, setIdx] = useState(0)

  if (!unit) return <Navigate to="/subjects" replace />

  const remaining = prog.wrongIds.length
  const current = queue[idx]

  return (
    <div className="min-h-screen px-4 py-6 flex flex-col items-center gap-5">
      <div className="w-full max-w-xl flex items-center justify-between">
        <Link to={`/unit/${unit.id}`} className="text-sm text-white/60 hover:text-white">← 허브</Link>
        <div className="text-sm text-white/70">📝 남은 오답 {remaining}</div>
      </div>

      <h1 className="text-xl font-black text-white">오답 노트</h1>
      {queue.length > 0 && (
        <p className="text-xs text-white/45 -mt-3">가장 약한 개념부터 복습 중이에요.</p>
      )}

      {queue.length === 0 ? (
        <p className="text-white/60 mt-6">🎉 오답이 없어요! 모든 문제를 잘 풀었네요.</p>
      ) : !current ? (
        <div className="flex flex-col items-center gap-3 mt-6">
          <p className="text-white/70">이번 복습을 마쳤어요.</p>
          <Link to={`/unit/${unit.id}`} className="px-5 py-3 rounded-xl font-bold bg-indigo-500 hover:bg-indigo-400 transition">허브로</Link>
        </div>
      ) : (
        <>
          <div className="text-xs text-white/50">{idx + 1} / {queue.length}</div>
          <ContentProblemCard
            key={current.id}
            problem={current}
            onResult={(correct) => {
              if (correct) removeWrong(unit.id, current.id)
            }}
          />
          <button
            onClick={() => setIdx((i) => i + 1)}
            className="w-full max-w-xl px-5 py-3 rounded-xl font-bold bg-white/10 hover:bg-white/20 transition"
          >
            다음 →
          </button>
        </>
      )}
    </div>
  )
}
