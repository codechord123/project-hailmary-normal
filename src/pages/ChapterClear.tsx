import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { computeLevelInfo } from '@/lib/leveling'
import { ITEMS, type ItemId } from '@/data/items'
import { getDailyBest } from '@/lib/dailyChallenge'
import { unresolvedCount } from '@/lib/wrongNotes'
import { STORY } from '@/data/story'
import { StoryOverlay } from '@/components/StoryOverlay'
import { useState } from 'react'

const NEXT_CHAPTER: Record<string, string> = {
  '1': '/chapter/3', // (챕터 2가 잠금되어 있을 때 가이드)
  '2': '/chapter/3',
  '3': '/chapter/4',
  '4': '/chapter/5',
  '5': '/chapter/6',
  '6': '/chapter/7',
  '7': '/',
}

const RANK_COLOR: Record<string, string> = {
  S: 'text-yellow-300 drop-shadow-[0_0_24px_rgba(253,224,71,0.7)]',
  A: 'text-pink-300',
  B: 'text-cyan-300',
  C: 'text-white/70',
}

export function ChapterClear() {
  const { chapter } = useParams<{ chapter: string }>()
  const totalXp = useGameStore((s) => s.totalXp)
  const info = computeLevelInfo(totalXp)
  const state = (window.history.state?.usr ?? {}) as {
    stars?: number
    rank?: string
    maxCombo?: number
    score?: number
    rewardItemId?: ItemId
    bossDefeated?: boolean
  }
  const stars = state.stars ?? 1
  const rank = state.rank ?? 'C'
  const reward = state.rewardItemId ? ITEMS[state.rewardItemId] : null
  const nextRoute = NEXT_CHAPTER[chapter ?? '1'] ?? '/chapters'
  const dailyDone = getDailyBest() !== null
  const wrongCount = unresolvedCount()
  const chapterNum = parseInt(chapter ?? '1', 10)
  const outroLines = STORY[chapterNum]?.outro ?? []
  const [showOutro, setShowOutro] = useState(outroLines.length > 0)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className={`text-9xl font-black font-mono ${RANK_COLOR[rank] ?? RANK_COLOR.C}`}
      >
        {rank}
      </motion.div>
      <h2 className="mt-2 text-3xl font-bold text-white">
        {state.bossDefeated ? '🏆 보스 처치!' : `챕터 ${chapter} 클리어`}
      </h2>
      <div className="mt-3 text-yellow-300 text-3xl">
        {'★'.repeat(stars)}<span className="text-white/15">{'★'.repeat(3 - stars)}</span>
      </div>

      <div className="mt-4 font-mono text-white/80 space-y-1">
        <div>SCORE: <span className="text-yellow-200">{(state.score ?? 0).toLocaleString()}</span></div>
        <div>MAX COMBO: <span className="text-pink-200">×{state.maxCombo ?? 0}</span></div>
        <div>현재 레벨: <span className={info.titleColor}>Lv.{info.level} {info.title}</span></div>
      </div>

      {reward && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="mt-5 p-4 rounded-xl bg-yellow-400/15 border border-yellow-300/40"
        >
          <div className="text-xs text-yellow-200">획득 보상</div>
          <div className="text-2xl mt-1">{reward.icon} {reward.name}</div>
        </motion.div>
      )}

      {!dailyDone && (
        <motion.div
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.8, type: 'spring' }}
          className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-600/20 border border-yellow-300/40 max-w-sm"
        >
          <div className="text-xs text-yellow-200">💡 추천</div>
          <div className="text-white font-bold mt-1">오늘의 챌린지가 아직 남았어!</div>
          <div className="text-xs text-white/70 mt-1">매일 자정에 새로 갱신되는 10문제 종합 챌린지.</div>
          <Link
            to="/daily"
            className="block mt-2 px-4 py-2 rounded-lg bg-amber-500 text-space-900 font-bold text-center hover:brightness-110"
          >
            🌟 오늘의 챌린지 도전 →
          </Link>
        </motion.div>
      )}

      {wrongCount > 0 && (
        <motion.div
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.6, type: 'spring' }}
          className="mt-3 p-3 rounded-2xl bg-rose-500/20 border border-rose-400/40 max-w-sm text-center"
        >
          <div className="text-xs text-rose-200">💡 학습 팁</div>
          <div className="text-white text-sm mt-1">
            오답 노트에 <b>미해결 {wrongCount}건</b> 이 있어요.
            다시 풀어보고 진짜 내 것으로 만들어요!
          </div>
          <Link
            to="/wrong-notes"
            className="block mt-2 px-3 py-1.5 rounded-lg bg-rose-400 text-space-900 font-bold text-xs"
          >
            📝 오답 노트 열기
          </Link>
        </motion.div>
      )}

      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Link to={`/chapter/${chapter}`} className="px-6 py-3 rounded-xl bg-white/10 text-white border border-white/20">
          ↺ 재도전
        </Link>
        <Link to={nextRoute} className="px-6 py-3 rounded-xl bg-space-accent text-space-900 font-bold">
          다음 →
        </Link>
        <Link to="/chapters" className="px-6 py-3 rounded-xl bg-white/10 text-white border border-white/20">
          챕터 선택
        </Link>
      </div>

      {showOutro && (
        <StoryOverlay lines={outroLines} onClose={() => setShowOutro(false)} />
      )}

      {outroLines.length > 0 && !showOutro && (
        <div className="fixed bottom-3 right-3 flex flex-col gap-2">
          <button
            onClick={() => setShowOutro(true)}
            className="px-3 py-2 rounded-lg bg-purple-500/20 text-purple-200 border border-purple-300/40 text-xs"
          >
            📖 스토리 다시 보기
          </button>
          <Link
            to="/story"
            className="px-3 py-2 rounded-lg bg-cyan-400/20 text-cyan-200 border border-cyan-300/40 text-xs text-center"
          >
            📚 항해 일지
          </Link>
        </div>
      )}
    </div>
  )
}
