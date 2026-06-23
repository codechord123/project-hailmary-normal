import { Link, useParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { findSubject } from '@/content/registry'

/** 책꽂이 2단계 — 과목 안에서 단원 선택 */
export function UnitSelect() {
  const { subjectId = '' } = useParams()
  const subject = findSubject(subjectId)

  if (!subject) return <Navigate to="/subjects" replace />

  return (
    <div className="min-h-screen px-4 py-8 flex flex-col items-center gap-6">
      <div className="w-full max-w-xl flex items-center justify-between">
        <Link to="/subjects" className="text-sm text-white/60 hover:text-white">← 과목</Link>
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-black text-white">
          {subject.icon} {subject.name} — 단원 고르기
        </h1>
      </div>

      <div className="w-full max-w-xl flex flex-col gap-3">
        {subject.units.map((u, i) => {
          const meta = u.kind === 'content' ? u.def : u
          // content → 단원 챕터 화면, legacy → 기존 게임 허브로
          const to = u.kind === 'content' ? `/unit/${u.def.id}` : u.route
          const sub =
            u.kind === 'content'
              ? `${u.def.chapters.length}개 챕터`
              : '기존 게임 전체 (항해·타임어택 등)'
          return (
            <motion.div
              key={meta.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                to={to}
                className="block rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.01] transition p-5 flex flex-col gap-1"
              >
                <span className="text-xs text-indigo-300/80">{meta.grade} · {meta.theme}</span>
                <span className="text-lg font-bold text-white">{meta.title}</span>
                <span className="text-xs text-white/50">{sub}</span>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
