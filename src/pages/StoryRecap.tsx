import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { STORY, SPEAKER_COLOR } from '@/data/story'
import { StoryOverlay } from '@/components/StoryOverlay'
import { useGameStore } from '@/store/gameStore'
import type { StoryLine } from '@/data/story'

const CHAPTER_TITLES: Record<number, string> = {
  1: '깨어남',
  2: '식량 점검',
  3: '미지의 신호',
  4: '첫 만남',
  5: '위기의 동력실',
  6: '아스트로파지 배양',
  7: '귀환 미션',
}

export function StoryRecap() {
  const cleared = useGameStore((s) => s.clearedChapters)
  const records = useGameStore((s) => s.chapterRecords)
  const [playLines, setPlayLines] = useState<StoryLine[] | null>(null)

  const allChapters = Object.keys(STORY).map(Number).sort((a, b) => a - b)

  const totalStars = Object.values(records).reduce((s, r) => s + r.stars, 0)
  const maxBestCombo = Object.values(records).reduce((m, r) => Math.max(m, r.bestCombo), 0)
  const clearedCount = cleared.length
  const totalChapters = allChapters.length
  const totalElapsedMs = Object.values(records).reduce((s, r) => s + (r.elapsedMs ?? 0), 0)
  const validAccuracies = Object.values(records)
    .map((r) => r.accuracy)
    .filter((a): a is number => a != null)
  const avgAccuracy =
    validAccuracies.length > 0
      ? validAccuracies.reduce((s, a) => s + a, 0) / validAccuracies.length
      : null
  const fmtMs = (ms: number) => {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    return m > 0 ? `${m}분 ${s % 60}초` : `${s}초`
  }

  return (
    <div className="min-h-screen px-6 py-8 max-w-3xl mx-auto">
      <Link to="/" className="text-white/60 hover:text-white text-sm">
        ← 메인으로
      </Link>
      <h2 className="mt-3 text-3xl font-bold text-white">📚 항해 일지</h2>
      <p className="text-white/60 text-sm mt-1">
        헤일메리호의 모든 기록 — 클리어한 챕터의 이야기를 다시 볼 수 있어요.
      </p>

      {/* 항해 통계 */}
      <section className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-sm font-bold text-white mb-2">📊 항해 통계</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
          <Stat label="클리어" value={`${clearedCount}/${totalChapters}`} color="text-cyan-300" />
          <Stat label="총 별" value={`${totalStars}/${totalChapters * 3}`} color="text-yellow-300" />
          <Stat label="최고 콤보" value={`×${maxBestCombo}`} color="text-pink-300" />
          <Stat label="총 풀이 시간" value={fmtMs(totalElapsedMs)} color="text-emerald-300" />
          <Stat label="평균 정답률" value={avgAccuracy != null ? `${Math.round(avgAccuracy * 100)}%` : '—'} color="text-amber-300" />
        </div>
      </section>

      <div className="mt-6 space-y-3">
        {allChapters.map((id) => {
          const isCleared = cleared.includes(id)
          const story = STORY[id]
          const rec = records[id]
          return (
            <motion.section
              key={id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: id * 0.05 }}
              className={`p-4 rounded-2xl border ${
                isCleared
                  ? 'bg-white/5 border-white/15'
                  : 'bg-white/[0.02] border-white/5 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-white font-bold">
                  Chapter {id}. {CHAPTER_TITLES[id]}
                  {isCleared && <span className="ml-2 text-emerald-300 text-xs">✓ 클리어</span>}
                  {!isCleared && <span className="ml-2 text-white/30 text-xs">🔒 잠김</span>}
                </h3>
                {rec && (
                  <div className="text-[10px] text-white/60 font-mono">
                    {'★'.repeat(rec.stars)}{'☆'.repeat(3 - rec.stars)} · ×{rec.bestCombo}
                    {rec.elapsedMs != null && <> · ⏱ {fmtMs(rec.elapsedMs)}</>}
                    {rec.accuracy != null && <> · 🎯 {Math.round(rec.accuracy * 100)}%</>}
                    {rec.attempts != null && <> · 시도 {rec.attempts}회</>}
                  </div>
                )}
                {isCleared && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPlayLines(story.intro)}
                      className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 text-xs"
                    >
                      ▶ Intro
                    </button>
                    <button
                      onClick={() => setPlayLines(story.outro)}
                      className="px-2 py-1 rounded bg-purple-500/20 text-purple-200 border border-purple-400/40 text-xs"
                    >
                      ▶ Outro
                    </button>
                  </div>
                )}
              </div>

              {isCleared && (
                <details className="mt-2">
                  <summary className="text-xs text-white/50 cursor-pointer">대사 미리보기</summary>
                  <div className="mt-2 space-y-1">
                    {[...story.intro, ...story.outro].slice(0, 6).map((line, i) => (
                      <div key={i} className="text-xs">
                        <span className={`font-bold ${SPEAKER_COLOR[line.speaker]}`}>
                          {line.speaker}:
                        </span>{' '}
                        <span className="text-white/80">{line.text}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </motion.section>
          )
        })}
      </div>

      {playLines && (
        <StoryOverlay lines={playLines} onClose={() => setPlayLines(null)} />
      )}
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-2 rounded-lg bg-black/30">
      <div className="text-[10px] text-white/50 uppercase">{label}</div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
    </div>
  )
}
