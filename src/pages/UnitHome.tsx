import { useEffect } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { findUnit, subjectOfUnit } from '@/content/registry'
import { useActiveUnit } from '@/content/activeUnit'
import { useUnitProgress, levelOf } from '@/content/progress'

const MECHANIC: Record<string, { label: string; icon: string }> = {
  defense: { label: '디펜스', icon: '🛡️' },
  matching: { label: '매칭', icon: '🃏' },
  boss: { label: '보스전', icon: '👾' },
  finalboss: { label: '최종보스', icon: '🐉' },
}

/**
 * 단원 컨셉 허브 — 수학편 메인 메뉴와 "같은 구조", 단원 컨셉으로 옷을 입힌 화면.
 * 모험 시작(챕터) · 도전 모드 · 학습 도구 자리를 갖춘다.
 * (도전 모드/학습 도구는 다음 단계에서 객관식용으로 붙일 예정 — 지금은 자리만)
 */
export function UnitHome() {
  const { unitId = '' } = useParams()
  const unit = findUnit(unitId)
  const subject = subjectOfUnit(unitId)
  const setActiveUnit = useActiveUnit((s) => s.setActiveUnit)
  const prog = useUnitProgress(unitId)

  // 이 단원을 "지금 학습 중인 단원"으로 기억
  useEffect(() => {
    if (unit) setActiveUnit(unit.id)
  }, [unit, setActiveUnit])

  if (!unit) return <Navigate to="/subjects" replace />

  const n = unit.narrative
  const hero = n?.hero ?? unit.theme
  const startLabel = n?.startLabel ?? '🚀 모험 시작'
  const level = levelOf(prog.xp)
  const totalStars = Object.values(prog.stars).reduce((a, b) => a + b, 0)

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

      {/* 컨셉 헤더 */}
      <div className="text-center">
        <p className="text-xs text-indigo-300/80">{unit.subject} {unit.grade}</p>
        <h1 className="text-2xl font-black text-white">{unit.title}</h1>
        <p className="mt-2 text-space-accent font-bold">⭐ {hero}</p>
        {n?.tagline && <p className="mt-1 text-sm text-white/65 max-w-md">{n.tagline}</p>}
        <div className="mt-2 inline-flex gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-100 font-bold">Lv.{level}</span>
          <span className="px-2 py-1 rounded-full bg-amber-400/15 text-amber-100">⭐ {totalStars}</span>
          <span className="px-2 py-1 rounded-full bg-white/10 text-white/70">XP {prog.xp}</span>
        </div>
      </div>

      <div className="w-full max-w-xl flex flex-col gap-5">
        {/* 모험 시작 — 챕터(항해) */}
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-bold text-white/70">{startLabel}</h2>
          {unit.chapters.map((ch, i) => {
            const m = MECHANIC[ch.mechanic] ?? { label: ch.mechanic, icon: '🎮' }
            const stars = prog.stars[ch.id] ?? 0
            const cleared = prog.cleared.includes(ch.id)
            return (
              <Link
                key={ch.id}
                to={`/play/${unit.id}/${ch.id}`}
                className="rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition p-4 flex items-center gap-4"
              >
                <span className="text-3xl">{m.icon}</span>
                <span className="flex flex-col flex-1">
                  <span className="text-xs text-white/50">
                    챕터 {i + 1} · {m.label} {cleared && <span className="text-green-300">· 클리어</span>}
                  </span>
                  <span className="text-lg font-bold text-white">{ch.title}</span>
                  <span className="text-xs text-white/45">문제 {ch.problems.length}개</span>
                </span>
                <span className="text-sm text-amber-300">
                  {'★'.repeat(stars)}<span className="text-white/20">{'★'.repeat(3 - stars)}</span>
                </span>
              </Link>
            )
          })}
        </section>

        {/* 도전 모드 (자리 — 다음 단계에서 객관식용으로 연결) */}
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-bold text-white/70">⚔️ 도전 모드</h2>
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/unit/${unit.id}/timeattack`}
              className="rounded-xl bg-gradient-to-br from-red-500/30 to-rose-700/30 border border-rose-300/40 text-center p-3 text-sm font-bold text-white hover:brightness-110 transition"
            >
              <div className="text-2xl">⏱</div>타임 어택
            </Link>
            <Link
              to={`/unit/${unit.id}/endless`}
              className="rounded-xl bg-gradient-to-br from-purple-600/30 to-indigo-700/30 border border-indigo-300/40 text-center p-3 text-sm font-bold text-white hover:brightness-110 transition"
            >
              <div className="text-2xl">🌌</div>끝없는 도전
            </Link>
          </div>
        </section>

        {/* 학습 도구 (자리) */}
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-bold text-white/70">📚 학습 도구</h2>
          <div className="grid grid-cols-3 gap-2">
            <Link
              to={`/unit/${unit.id}/wrong`}
              className="rounded-xl bg-rose-400/10 border border-rose-300/30 text-rose-100 text-center p-2 text-xs hover:bg-rose-400/20 transition"
            >
              <div className="text-lg">📝</div>오답 노트
              {prog.wrongIds.length > 0 && (
                <div className="text-[10px] text-rose-200/80">{prog.wrongIds.length}개</div>
              )}
            </Link>
            <Link
              to={`/unit/${unit.id}/achievements`}
              className="rounded-xl bg-amber-400/10 border border-amber-300/30 text-amber-100 text-center p-2 text-xs hover:bg-amber-400/20 transition"
            >
              <div className="text-lg">🏅</div>업적
            </Link>
            <ModeSoon icon="🛍️" label="상점" small />
          </div>
        </section>

        <Link
          to={`/unit-preview?unit=${unit.id}`}
          className="self-center text-sm text-white/55 hover:text-white underline underline-offset-4"
        >
          전체 문제 카드로 풀어보기 →
        </Link>
      </div>
    </div>
  )
}

/** 아직 객관식용으로 연결 전인 모드 자리 */
function ModeSoon({ icon, label, small }: { icon: string; label: string; small?: boolean }) {
  return (
    <div
      className={`rounded-xl bg-white/5 border border-white/10 text-center text-white/40 ${
        small ? 'p-2 text-xs' : 'p-3 text-sm'
      }`}
    >
      <div className={small ? 'text-lg' : 'text-2xl'}>{icon}</div>
      {label}
      <div className="text-[10px] text-white/30 mt-0.5">곧 추가</div>
    </div>
  )
}
