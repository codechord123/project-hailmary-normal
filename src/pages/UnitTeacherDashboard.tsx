import { Link, Navigate, useParams } from 'react-router-dom'
import { findUnit } from '@/content/registry'
import { useProgress, rowsForUnit } from '@/content/progress'
import { isTeacherUnlocked } from '@/lib/teacherAuth'

/** 교사용 — 한 단원의 학생별 진도(이 단말 기준). PIN 잠금은 /teacher 와 공유. */
export function UnitTeacherDashboard() {
  const { unitId = '' } = useParams()
  const unit = findUnit(unitId)
  const data = useProgress((s) => s.data)

  if (!unit) return <Navigate to="/subjects" replace />

  if (!isTeacherUnlocked()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="text-5xl">🔒</div>
        <p className="text-white/75">선생님 메뉴에서 PIN으로 잠금을 해제한 뒤 이용해 주세요.</p>
        <Link to="/teacher" className="px-5 py-3 rounded-xl font-bold bg-indigo-500 hover:bg-indigo-400 transition">
          👩‍🏫 선생님 메뉴로
        </Link>
        <Link to={`/unit/${unit.id}`} className="text-sm text-white/50 hover:text-white">← 단원으로</Link>
      </div>
    )
  }

  const rows = rowsForUnit(data, unit.id)
  const total = unit.chapters.length

  const exportCsv = () => {
    const header = ['이름', '클리어챕터', `총${total}`, '별', '오답수', '타임어택최고', '끝없는최고']
    const lines = rows.map((r) => [
      r.student,
      r.progress.cleared.length,
      total,
      Object.values(r.progress.stars).reduce((a, b) => a + b, 0),
      r.progress.wrongIds.length,
      r.progress.bestTimeAttack,
      r.progress.bestEndless,
    ].join(','))
    const csv = '﻿' + [header.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${unit.title}_진도.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen px-4 py-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <Link to={`/unit/${unit.id}`} className="text-sm text-white/60 hover:text-white">← 단원</Link>
        <button onClick={exportCsv} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-300/40 text-xs font-bold">
          ⬇ CSV 내보내기
        </button>
      </div>

      <h1 className="mt-3 text-2xl font-black text-white">👩‍🏫 {unit.title} · 학생 진도</h1>
      <p className="text-xs text-white/50 mt-1">이 기기에서 학습한 학생 기준이에요. ({rows.length}명)</p>

      {rows.length === 0 ? (
        <p className="mt-8 text-white/60 text-center">아직 이 단원을 학습한 학생이 없어요.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/50 text-xs border-b border-white/10">
                <th className="text-left py-2 px-2">이름</th>
                <th className="py-2 px-2">클리어</th>
                <th className="py-2 px-2">⭐</th>
                <th className="py-2 px-2">오답</th>
                <th className="py-2 px-2">타임어택</th>
                <th className="py-2 px-2">끝없는</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const stars = Object.values(r.progress.stars).reduce((a, b) => a + b, 0)
                return (
                  <tr key={r.student} className="border-b border-white/5">
                    <td className="py-2 px-2 font-bold text-white">{r.student}</td>
                    <td className="py-2 px-2 text-center text-white/80">{r.progress.cleared.length}/{total}</td>
                    <td className="py-2 px-2 text-center text-amber-300">{stars}</td>
                    <td className="py-2 px-2 text-center text-rose-300">{r.progress.wrongIds.length}</td>
                    <td className="py-2 px-2 text-center text-white/70">{r.progress.bestTimeAttack}</td>
                    <td className="py-2 px-2 text-center text-white/70">{r.progress.bestEndless}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
