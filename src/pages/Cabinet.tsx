import { Link } from 'react-router-dom'
import { useGameStore, type Stats } from '@/store/gameStore'
import { computeLevelInfo } from '@/lib/leveling'
import { CharacterAvatar } from '@/components/CharacterAvatar'
import { LevelBadge } from '@/components/LevelBadge'
import { SUITS, HELMETS } from '@/data/cosmetics'
import { ITEMS, type ItemId } from '@/data/items'

const STAT_LABELS: Record<keyof Stats, { name: string; icon: string; effect: string }> = {
  lung: { name: '폐활량', icon: '🫁', effect: '레벨당 산소 최대치 +10' },
  reflex: { name: '반응속도', icon: '⚡', effect: '레벨당 문제 시간 +3초' },
  intuition: { name: '직감', icon: '🧠', effect: '레벨당 힌트 효율 향상' },
  luck: { name: '행운', icon: '🍀', effect: '레벨당 보너스 XP 확률 +5%' },
}

export function Cabinet() {
  const store = useGameStore()
  const info = computeLevelInfo(store.totalXp)

  return (
    <div className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <Link to="/" className="text-white/60 hover:text-white text-sm">
        ← 메인으로
      </Link>
      <h2 className="mt-4 text-3xl font-bold text-white">내 캐비닛</h2>

      {/* 캐릭터 + 레벨 */}
      <section className="mt-6 flex flex-col sm:flex-row gap-6 items-center p-5 rounded-2xl bg-white/5 border border-white/10">
        <div className="bg-gradient-to-b from-space-700 to-space-900 rounded-xl p-3">
          <CharacterAvatar size={140} pose="wave" />
        </div>
        <div className="flex-1 w-full">
          <LevelBadge />
          <div className="mt-3 text-sm text-white/70">
            <span className={info.titleColor}>● {info.title}</span> — 항해를 거듭하며 성장 중
          </div>
        </div>
      </section>

      {/* 스탯 */}
      <section className="mt-6 p-5 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">스탯</h3>
          <button
            onClick={() => store.resetStats()}
            className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white/80"
          >
            리셋
          </button>
        </div>
        <div className="text-xs text-pink-300 mt-1">
          분배 가능 포인트: {store.statPoints}
        </div>
        <ul className="mt-3 space-y-2">
          {(Object.keys(STAT_LABELS) as (keyof Stats)[]).map((k) => {
            const meta = STAT_LABELS[k]
            return (
              <li key={k} className="flex items-center gap-3 p-2 rounded-lg bg-black/20">
                <span className="text-2xl">{meta.icon}</span>
                <div className="flex-1">
                  <div className="text-white font-semibold">{meta.name} · Lv {store.stats[k]}</div>
                  <div className="text-xs text-white/50">{meta.effect}</div>
                </div>
                <button
                  onClick={() => store.allocateStat(k)}
                  disabled={store.statPoints < 1}
                  className="px-3 py-1 rounded bg-space-accent text-space-900 font-bold text-sm disabled:opacity-30"
                >
                  + 1
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      {/* 코스튬 */}
      <section className="mt-6 p-5 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-lg font-bold text-white">우주복</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {SUITS.map((s) => {
            const locked = info.level < s.unlockLevel
            const selected = store.cosmetics.suit === s.id
            return (
              <button
                key={s.id}
                disabled={locked}
                onClick={() => store.setCosmetic('suit', s.id)}
                className={`px-3 py-2 rounded-lg border text-sm ${
                  selected
                    ? 'border-space-accent bg-space-accent/20 text-white'
                    : locked
                      ? 'border-white/10 bg-white/5 text-white/30'
                      : 'border-white/20 bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                <span
                  className="inline-block w-3 h-3 rounded-full mr-2 align-middle"
                  style={{ backgroundColor: s.primary }}
                />
                {s.name}
                {locked && <span className="ml-1 text-xs">🔒 Lv{s.unlockLevel}</span>}
              </button>
            )
          })}
        </div>

        <h3 className="mt-5 text-lg font-bold text-white">헬멧</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {HELMETS.map((h) => {
            const locked = info.level < h.unlockLevel
            const selected = store.cosmetics.helmet === h.id
            return (
              <button
                key={h.id}
                disabled={locked}
                onClick={() => store.setCosmetic('helmet', h.id)}
                className={`px-3 py-2 rounded-lg border text-sm ${
                  selected
                    ? 'border-space-accent bg-space-accent/20 text-white'
                    : locked
                      ? 'border-white/10 bg-white/5 text-white/30'
                      : 'border-white/20 bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {h.name}
                {locked && <span className="ml-1 text-xs">🔒 Lv{h.unlockLevel}</span>}
              </button>
            )
          })}
        </div>
      </section>

      {/* 인벤토리 */}
      <section className="mt-6 p-5 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-lg font-bold text-white">인벤토리</h3>
        <ul className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {(Object.keys(ITEMS) as ItemId[]).map((id) => {
            const item = ITEMS[id]
            const qty = store.items[id] ?? 0
            return (
              <li key={id} className="p-3 rounded-lg bg-black/20 border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="text-white text-sm font-semibold">
                      {item.name} ×{qty}
                    </div>
                    <div className="text-xs text-white/50">{item.description}</div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
