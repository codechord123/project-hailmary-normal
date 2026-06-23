import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { listWrongNotes, markResolved, removeNote, clearAllNotes, unresolvedCount, type WrongNote } from '@/lib/wrongNotes'
import { unlock } from '@/lib/achievements'

const CHAPTER_LABEL: Record<string, string> = {
  '1': 'Ch1 깨어남', '2': 'Ch2 식량 점검', '3': 'Ch3 미지의 신호',
  '4': 'Ch4 첫 만남', '5': 'Ch5 동력실', '6': 'Ch6 배양', '7': 'Ch7 귀환',
  daily: '오늘의 챌린지', endless: '끝없는 항해',
}

const fmtDate = (ts: number) => {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function WrongNotes() {
  const [version, setVersion] = useState(0)
  const [filter, setFilter] = useState<'all' | 'unresolved'>('unresolved')
  const notes = useMemo(() => listWrongNotes(), [version])
  const filtered = filter === 'unresolved' ? notes.filter((n) => !n.resolved) : notes
  const refresh = () => setVersion((v) => v + 1)

  return (
    <div className="min-h-screen px-6 py-8 max-w-3xl mx-auto">
      <Link to="/" className="text-white/60 hover:text-white text-sm">← 메인으로</Link>
      <h2 className="mt-3 text-3xl font-bold text-white">📝 오답 노트</h2>
      <p className="text-white/60 text-sm mt-1">
        틀린 문제는 자동으로 여기 모여요. 다시 보고 풀어본 뒤 "해결"로 체크하세요.
      </p>

      <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1">
          <button
            onClick={() => setFilter('unresolved')}
            className={`px-3 py-1.5 rounded text-xs ${
              filter === 'unresolved'
                ? 'bg-yellow-500/30 text-yellow-200 border border-yellow-300/50'
                : 'bg-white/5 text-white/60 border border-white/15'
            }`}
          >
            미해결 ({notes.filter((n) => !n.resolved).length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded text-xs ${
              filter === 'all'
                ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-300/50'
                : 'bg-white/5 text-white/60 border border-white/15'
            }`}
          >
            전체 ({notes.length})
          </button>
        </div>
        {notes.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('모든 오답 노트를 정말 비울까요? 되돌릴 수 없어요.')) {
                clearAllNotes(); refresh()
              }
            }}
            className="text-xs px-3 py-1.5 rounded bg-red-500/15 text-red-300 border border-red-400/30"
          >
            🗑 전체 비우기
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 text-center text-white/40 text-sm">
          {filter === 'unresolved' ? '🎉 미해결 오답이 없어요!' : '아직 기록된 오답이 없어요.'}
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {filtered.map((n) => (
            <NoteCard
              key={n.id}
              note={n}
              onResolve={() => {
                markResolved(n.id)
                if (unresolvedCount() === 0) unlock('notebook-cleared')
                refresh()
              }}
              onDelete={() => { removeNote(n.id); refresh() }}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function NoteCard({ note, onResolve, onDelete }: { note: WrongNote; onResolve: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 ${
        note.resolved
          ? 'bg-emerald-500/5 border-emerald-400/20'
          : 'bg-white/5 border-white/15'
      }`}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded bg-white/10 text-white/80 font-mono">
            {CHAPTER_LABEL[String(note.chapterId)] ?? `Ch${note.chapterId}`}
          </span>
          <span className="text-white/40">{fmtDate(note.notedAt)}</span>
          {note.resolved && <span className="text-emerald-300">✓ 해결</span>}
        </div>
        <div className="flex gap-1">
          <button onClick={() => setOpen((o) => !o)} className="text-xs px-2 py-1 rounded bg-white/10 text-white/80">
            {open ? '접기' : '펼치기'}
          </button>
          {!note.resolved && (
            <button onClick={onResolve} className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-400/40">
              해결
            </button>
          )}
          <button onClick={onDelete} className="text-xs px-2 py-1 rounded bg-red-500/15 text-red-300 border border-red-400/30">
            ✕
          </button>
        </div>
      </div>

      <div className="mt-2 text-sm text-white/90">{note.scenario}</div>
      <div className="mt-1 text-xs text-white/60 italic">{note.prompt}</div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="p-2 rounded bg-red-500/10 border border-red-400/30">
          <div className="text-[10px] text-red-300 uppercase">내 답</div>
          <div className="text-red-100 font-mono mt-0.5">{note.studentAnswerText}</div>
        </div>
        <div className="p-2 rounded bg-emerald-500/10 border border-emerald-400/30">
          <div className="text-[10px] text-emerald-300 uppercase">정답</div>
          <div className="text-emerald-100 font-mono mt-0.5">{note.correctAnswerText}</div>
        </div>
      </div>

      {open && note.hint && (
        <div className="mt-3 p-2 rounded bg-amber-500/10 border border-amber-400/30 text-xs text-amber-200">
          💡 힌트: {note.hint}
        </div>
      )}
    </motion.li>
  )
}
