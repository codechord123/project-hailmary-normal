import { Link } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { ITEMS, type ItemId } from '@/data/items'

interface ShopEntry {
  id: ItemId
  costEnergy: number
}

const SHOP_LIST: ShopEntry[] = [
  // 가격 ↑↑ — 문제를 풀게 만들기 위해 아이템 의존도 ↓
  { id: 'oxygen-pack', costEnergy: 15 },
  { id: 'hint-formula', costEnergy: 18 }, // 식만 보여주고 답은 직접 — 학습 보조
  { id: 'time-freeze', costEnergy: 25 },
  { id: 'simplify-aid', costEnergy: 35 },
  { id: 'shield', costEnergy: 20 },
  { id: 'magnet', costEnergy: 40 },
  { id: 'bomb', costEnergy: 50 },
]

export function Shop() {
  const store = useGameStore()

  const buy = (entry: ShopEntry) => {
    if (store.energy < entry.costEnergy) return
    store.addEnergy(-entry.costEnergy)
    store.giveItem(entry.id, 1)
  }

  const bundleCost = (entry: ShopEntry) => Math.ceil(entry.costEnergy * 5 * 0.85) // 15% 할인
  const buyBundle = (entry: ShopEntry) => {
    const cost = bundleCost(entry)
    if (store.energy < cost) return
    store.addEnergy(-cost)
    store.giveItem(entry.id, 5)
  }

  return (
    <div className="min-h-screen px-6 py-8 max-w-3xl mx-auto">
      <Link to="/" className="text-white/60 hover:text-white text-sm">
        ← 메인으로
      </Link>
      <h2 className="mt-3 text-3xl font-bold text-white">🏪 우주 상점</h2>
      <p className="text-white/60 text-sm mt-1">
        에너지 ⚡로 아이템을 구매. 에너지는 챕터에서 정답을 맞히면 모이는 자원.
      </p>

      <div className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-300/30 flex items-center justify-between">
        <span className="text-white">보유 에너지</span>
        <span className="text-yellow-300 text-2xl font-bold">⚡ {store.energy}</span>
      </div>

      <ul className="mt-5 grid sm:grid-cols-2 gap-3">
        {SHOP_LIST.map((entry) => {
          const item = ITEMS[entry.id]
          const owned = store.items[entry.id] ?? 0
          const canBuy = store.energy >= entry.costEnergy
          return (
            <li key={entry.id} className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold">{item.name}</div>
                  <div className="text-xs text-white/50">보유 ×{owned}</div>
                </div>
              </div>
              <p className="text-xs text-white/70 mt-2 leading-relaxed">{item.description}</p>
              <button
                onClick={() => buy(entry)}
                disabled={!canBuy}
                className="w-full mt-3 px-3 py-2 rounded-lg bg-space-accent text-space-900 font-bold text-sm disabled:opacity-30"
              >
                ⚡ {entry.costEnergy} · 1개 구매
              </button>
              <button
                onClick={() => buyBundle(entry)}
                disabled={store.energy < bundleCost(entry)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-yellow-400/20 text-yellow-200 border border-yellow-300/40 font-bold text-xs disabled:opacity-30"
              >
                🎁 ⚡ {bundleCost(entry)} · 5개 묶음 (15% 할인)
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
