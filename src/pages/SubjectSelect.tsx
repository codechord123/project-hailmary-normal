import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SUBJECTS } from '@/content/registry'

/** 책꽂이 1단계 — 과목 선택 */
export function SubjectSelect() {
  return (
    <div className="min-h-screen px-4 py-8 flex flex-col items-center gap-6">
      <div className="w-full max-w-xl flex items-center justify-between">
        <Link to="/" className="text-sm text-white/60 hover:text-white">← 메뉴</Link>
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-black text-white">📚 학습 단원 고르기</h1>
        <p className="mt-1 text-sm text-white/60">과목을 먼저 골라요.</p>
      </div>

      <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SUBJECTS.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              to={`/subject/${s.id}`}
              className="rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition p-5 flex items-center gap-4"
            >
              <span className="text-4xl">{s.icon}</span>
              <span className="flex flex-col">
                <span className="text-lg font-bold text-white">{s.name}</span>
                <span className="text-xs text-white/50">단원 {s.units.length}개</span>
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
