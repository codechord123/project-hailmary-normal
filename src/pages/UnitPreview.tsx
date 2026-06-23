import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { lawAndRightsUnit } from '@/content/units/lawAndRights'
import { ContentProblemCard } from '@/content/components/ContentProblemCard'
import type { ContentProblem } from '@/content/types'

interface Entry {
  chapterTitle: string
  chapterIntro?: string
  mechanic: string
  /** 챕터의 첫 문제인지 (구분선/인트로 표시용) */
  firstOfChapter: boolean
  problem: ContentProblem
}

const MECHANIC_LABEL: Record<string, string> = {
  defense: '디펜스',
  matching: '매칭',
  boss: '보스전',
  finalboss: '최종보스',
}

/**
 * 단원 미리보기 — 합의한 문제 데이터가 실제 화면에 어떻게 보이는지
 * 눈으로 확인하고 손으로 풀어보는 임시 페이지. (미니게임 연결 전 단계)
 */
export function UnitPreview() {
  const entries: Entry[] = useMemo(
    () =>
      lawAndRightsUnit.chapters.flatMap((ch) =>
        ch.problems.map((problem, i) => ({
          chapterTitle: ch.title,
          chapterIntro: ch.intro,
          mechanic: ch.mechanic,
          firstOfChapter: i === 0,
          problem,
        })),
      ),
    [],
  )

  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState({ correct: 0, answered: 0 })
  const [resultThis, setResultThis] = useState<boolean | null>(null)

  const entry = entries[idx]
  const atEnd = idx >= entries.length - 1

  const handleResult = (correct: boolean) => {
    setResultThis(correct)
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), answered: s.answered + 1 }))
  }

  const next = () => {
    setResultThis(null)
    setIdx((i) => Math.min(i + 1, entries.length - 1))
  }

  const restart = () => {
    setIdx(0)
    setScore({ correct: 0, answered: 0 })
    setResultThis(null)
  }

  return (
    <div className="min-h-screen px-4 py-6 flex flex-col items-center gap-5">
      {/* 헤더 */}
      <div className="w-full max-w-xl flex items-center justify-between">
        <Link to="/" className="text-sm text-white/60 hover:text-white">← 메뉴</Link>
        <div className="text-sm text-white/70">
          {idx + 1} / {entries.length} · 맞힘 {score.correct}/{score.answered}
        </div>
      </div>

      <div className="w-full max-w-xl text-center">
        <p className="text-xs text-indigo-300/80">
          {lawAndRightsUnit.subject} {lawAndRightsUnit.grade} · {lawAndRightsUnit.theme}
        </p>
        <h1 className="text-xl font-black text-white">{lawAndRightsUnit.title} — 미리보기</h1>
      </div>

      {/* 챕터 인트로 (챕터 첫 문제에서만) */}
      {entry.firstOfChapter && (
        <div className="w-full max-w-xl rounded-2xl bg-indigo-500/10 border border-indigo-400/30 p-4">
          <p className="text-sm font-bold text-indigo-200">
            📖 {entry.chapterTitle}
            <span className="ml-2 text-xs font-normal text-white/50">
              미니게임: {MECHANIC_LABEL[entry.mechanic] ?? entry.mechanic}
            </span>
          </p>
          {entry.chapterIntro && (
            <p className="mt-1 text-sm text-white/75 leading-relaxed">{entry.chapterIntro}</p>
          )}
        </div>
      )}

      {/* 문제 카드 */}
      <ContentProblemCard
        key={entry.problem.id}
        problem={entry.problem}
        onResult={handleResult}
      />

      {/* 다음 / 다시 */}
      {resultThis !== null && (
        atEnd ? (
          <div className="w-full max-w-xl flex flex-col items-center gap-3">
            <p className="text-lg font-bold text-white">
              🏁 끝! 총 {score.correct} / {score.answered} 문제를 맞혔어요.
            </p>
            <button
              onClick={restart}
              className="px-5 py-3 rounded-xl font-bold bg-indigo-500 hover:bg-indigo-400 transition"
            >
              처음부터 다시
            </button>
          </div>
        ) : (
          <button
            onClick={next}
            className="w-full max-w-xl px-5 py-3 rounded-xl font-bold bg-white/10 hover:bg-white/20 transition"
          >
            다음 문제 →
          </button>
        )
      )}
    </div>
  )
}
