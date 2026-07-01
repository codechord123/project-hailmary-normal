import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { findUnit } from '@/content/registry'
import { useUnitProgress, useProgress, weaknessScore } from '@/content/progress'
import { ContentProblemCard } from '@/content/components/ContentProblemCard'
import { explainFor } from '@/content/units/lawAndRights/explanations'
import type { ContentProblem } from '@/content/types'

const MASTERY = 2 // 찍기 방지 — 연속 정답 N회로 통과

/** mcq 보기를 시드 기반으로 섞어 위치 찍기 방지 (correctIndexes 재매핑) */
function shuffleMcq(p: ContentProblem, seed: number): ContentProblem {
  if (p.kind !== 'mcq') return p
  const order = p.choices.map((_, i) => i)
  let s = (seed + 1) >>> 0
  for (const ch of p.id) s = (s * 31 + ch.charCodeAt(0)) >>> 0
  for (let i = order.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    const j = s % (i + 1)
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  const choices = order.map((i) => p.choices[i])
  const correctIndexes = p.correctIndexes.map((ci) => order.indexOf(ci)).sort((a, b) => a - b)
  return { ...p, choices, correctIndexes }
}

/** 오답 노트 — 틀린 문제를 모아 다시 풀고, '연속 정답'으로 마스터해야 노트에서 지운다(찍기 방지). */
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
      .filter((p): p is ContentProblem => p != null && p.kind !== 'order') // order는 카드로 못 풂 → 제외
      .sort((a, b) => weaknessScore(prog, a.id) - weaknessScore(prog, b.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit])

  // order(순서) 문제는 카드로 복습 불가 → 노트에서 자동 정리(타임라인 게임에서 재연습)
  useEffect(() => {
    if (!unit) return
    const all = unit.chapters.flatMap((c) => c.problems)
    for (const id of prog.wrongIds) {
      if (all.find((p) => p.id === id)?.kind === 'order') removeWrong(unit.id, id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [idx, setIdx] = useState(0)
  const [attempt, setAttempt] = useState(0) // 같은 문제 재출제(보기 재배치) 트리거
  const [streak, setStreak] = useState(0) // 현재 문제 연속 정답
  const [reviewed, setReviewed] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(false)

  if (!unit) return <Navigate to="/subjects" replace />

  const remaining = prog.wrongIds.length
  const current = queue[idx]
  const shown = current ? shuffleMcq(current, attempt) : null
  const mastered = lastCorrect && streak >= MASTERY

  const handleResult = (correct: boolean) => {
    setReviewed(true)
    setLastCorrect(correct)
    if (correct) {
      const ns = streak + 1
      setStreak(ns)
      if (ns >= MASTERY && current) removeWrong(unit.id, current.id) // 마스터 → 노트에서 제거
    } else {
      setStreak(0) // 틀리면 연속 정답 초기화 (찍기 무력화)
    }
  }

  const proceed = () => {
    setReviewed(false)
    if (mastered) {
      // 통과 → 다음 문제
      setIdx((i) => i + 1); setStreak(0); setAttempt((a) => a + 1)
    } else {
      // 같은 문제 다시 (보기 재배치)
      setAttempt((a) => a + 1)
    }
  }

  const skip = () => {
    // 나중에 — 노트에 남겨두고 다음으로
    setReviewed(false); setStreak(0); setIdx((i) => i + 1); setAttempt((a) => a + 1)
  }

  return (
    <div className="min-h-screen px-4 py-6 flex flex-col items-center gap-5">
      <div className="w-full max-w-xl flex items-center justify-between">
        <Link to={`/unit/${unit.id}`} className="text-sm text-white/60 hover:text-white">← 허브</Link>
        <div className="text-sm text-white/70">📝 남은 오답 {remaining}</div>
      </div>

      <h1 className="text-xl font-black text-white">오답 노트</h1>
      {queue.length > 0 && (
        <p className="text-xs text-white/45 -mt-3">찍기 방지 — <b className="text-white/70">연속 {MASTERY}번</b> 맞혀야 노트에서 지워져요.</p>
      )}

      {queue.length === 0 ? (
        <p className="text-white/60 mt-6">🎉 오답이 없어요! 모든 문제를 잘 풀었네요.</p>
      ) : !current || !shown ? (
        <div className="flex flex-col items-center gap-3 mt-6">
          <p className="text-white/70">이번 복습을 마쳤어요.</p>
          <Link to={`/unit/${unit.id}`} className="px-5 py-3 rounded-xl font-bold bg-indigo-500 hover:bg-indigo-400 transition">허브로</Link>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span>{idx + 1} / {queue.length}</span>
            <span className="flex items-center gap-1">
              {Array.from({ length: MASTERY }, (_, i) => (
                <span key={i} className={`w-4 h-1.5 rounded-full ${i < streak ? 'bg-green-400' : 'bg-white/15'}`} />
              ))}
              <span className="ml-1">연속 {streak}/{MASTERY}</span>
            </span>
          </div>

          <ContentProblemCard
            key={`${current.id}-${attempt}`}
            problem={shown}
            explain={explainFor(current)}
            onResult={handleResult}
          />

          {reviewed && (
            <div className="w-full max-w-xl flex flex-col gap-2">
              <button
                onClick={proceed}
                className={`w-full px-5 py-3 rounded-xl font-bold transition active:scale-95 ${
                  mastered ? 'bg-green-500 hover:bg-green-400' : 'bg-indigo-500 hover:bg-indigo-400'
                }`}
              >
                {mastered
                  ? '✓ 통과! 다음 문제 →'
                  : lastCorrect
                    ? `좋아요! 한 번 더 풀어요 (연속 ${streak}/${MASTERY})`
                    : '다시 풀기 (보기를 섞어요)'}
              </button>
              <button onClick={skip} className="w-full px-4 py-2 rounded-lg text-xs text-white/45 hover:text-white/70">
                나중에 — 이 문제는 노트에 남겨두기
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
