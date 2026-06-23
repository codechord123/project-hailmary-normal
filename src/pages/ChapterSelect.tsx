import { Link } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { CharacterAvatar } from '@/components/CharacterAvatar'
import { LevelBadge } from '@/components/LevelBadge'

const CHAPTERS = [
  { id: 1, title: '깨어남', topic: '통분(이분모) 덧셈', available: true, badge: '🤲 조작' },
  { id: 2, title: '식량 점검', topic: '통분(이분모) 뺄셈', available: true, badge: '🚀 슈팅' },
  { id: 3, title: '미지의 신호', topic: '약분과 통분', available: true, badge: '🕹 보스' },
  { id: 4, title: '첫 만남', topic: '다른 분모 덧셈', available: true, badge: '🛡 디펜스' },
  { id: 5, title: '위기의 동력실', topic: '다른 분모 뺄셈', available: true, badge: '⚡ 리액터' },
  { id: 6, title: '아스트로파지 배양', topic: '대분수 변환', available: true, badge: '🃏 매칭' },
  { id: 7, title: '귀환 미션', topic: '종합 + 메가 보스', available: true, badge: '👹 풀보스' },
] as const

export function ChapterSelect() {
  const records = useGameStore((s) => s.chapterRecords)

  return (
    <div className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <Link to="/" className="text-white/60 hover:text-white text-sm">
        ← 메인으로
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <CharacterAvatar size={70} />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">챕터 선택</h2>
          <LevelBadge compact />
        </div>
      </div>

      {/* 진행률 게이지 */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-white/60">
          <span>전체 진행률</span>
          <span>{Object.keys(records).length} / {CHAPTERS.length} 챕터</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-pink-400 transition-all"
            style={{ width: `${(Object.keys(records).length / CHAPTERS.length) * 100}%` }}
          />
        </div>
      </div>

      <Link to="/endless" className="mt-4 block p-3 rounded-xl bg-gradient-to-r from-purple-700 to-pink-600 border border-yellow-300/40 text-white">
        <div className="font-bold">🎮 끝없는 항해 · ENDLESS MODE</div>
        <div className="text-xs text-white/80">랜덤 응용 문제 · 산소가 다할 때까지 · 최고기록 도전</div>
      </Link>

      <ul className="mt-4 space-y-3">
        {CHAPTERS.map((c) => {
          const record = records[c.id]
          const inner = (
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div>
                <div className="text-white font-semibold flex items-center gap-2 flex-wrap">
                  Chapter {c.id}. {c.title}
                  {c.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-200 border border-yellow-300/40">
                      {c.badge}
                    </span>
                  )}
                  {record && (
                    <span className="text-yellow-300">
                      {'★'.repeat(record.stars)}
                      <span className="text-white/20">{'★'.repeat(3 - record.stars)}</span>
                    </span>
                  )}
                </div>
                <div className="text-white/50 text-sm">{c.topic}</div>
                {record && (
                  <div className="text-xs text-white/40 mt-0.5">최고 콤보 {record.bestCombo}</div>
                )}
              </div>
              <span className="text-space-accent text-2xl">{c.available ? '▶' : '🔒'}</span>
            </div>
          )
          return c.available ? (
            <li key={c.id}>
              <Link to={`/chapter/${c.id}`} className="block hover:opacity-90">
                {inner}
              </Link>
            </li>
          ) : (
            <li key={c.id} className="opacity-40 cursor-not-allowed">
              {inner}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
