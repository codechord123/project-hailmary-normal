import { useRef, useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { sfx } from '@/lib/sfx'

const MAX_HEARTS = 5

/**
 * 목숨 + 보호막 공용 훅.
 * 시작 목숨 = base + 성장 스탯(체력)에서 파생된 보너스 하트(과목 중립).
 * lose(): 보호막이 있으면 소모만 하고 목숨 유지, 없으면 −1. 죽으면 true 반환.
 * arm(): 보호막 장착. addLife(): 목숨 +1(최대 5). reset(): 초기화.
 */
export function useLives(base: number) {
  // 마운트 시점의 성장 보너스를 한 번 반영 (레벨이 높을수록 하트 ↑)
  const bonus = useGameStore.getState().combatMods().bonusHearts
  const start = Math.min(MAX_HEARTS, base + bonus)
  const heartsRef = useRef(start)
  const [hearts, setHeartsState] = useState(start)
  const shieldRef = useRef(false)
  const [shielded, setShielded] = useState(false)

  const set = (n: number) => { heartsRef.current = n; setHeartsState(n) }

  const lose = (): boolean => {
    if (shieldRef.current) { shieldRef.current = false; setShielded(false); return false }
    set(Math.max(0, heartsRef.current - 1))
    return heartsRef.current <= 0
  }
  const arm = () => { shieldRef.current = true; setShielded(true) }
  const addLife = () => set(Math.min(MAX_HEARTS, heartsRef.current + 1))
  const reset = () => { shieldRef.current = false; setShielded(false); set(start) }

  return { hearts, shielded, lose, arm, addLife, reset, MAX_HEARTS, startHearts: start }
}

export interface ShopItem {
  id: string
  icon: string
  label: string
  cost: number
  onBuy: () => void
  disabled?: boolean
}

/** 공유 에너지(⚡)로 일회용 아이템을 사는 인게임 상점 바 */
export function GameItemBar({ items }: { items: ShopItem[] }) {
  const energy = useGameStore((s) => s.energy)
  const addEnergy = useGameStore((s) => s.addEnergy)

  return (
    <div className="flex flex-wrap gap-1.5 justify-center items-center">
      <span className="text-xs text-yellow-300 font-bold mr-1">⚡ {energy}</span>
      {items.map((it) => {
        const afford = energy >= it.cost && !it.disabled
        return (
          <button
            key={it.id}
            disabled={!afford}
            onClick={() => {
              addEnergy(-it.cost)
              if (it.id === 'shield') sfx.shield()
              else if (it.id === 'life') sfx.lifeUp()
              else sfx.buy()
              it.onBuy()
            }}
            className="px-2 py-1 rounded-lg text-xs font-bold border border-white/15 bg-white/5 disabled:opacity-30 enabled:hover:bg-white/10 transition"
            title={it.label}
          >
            {it.icon}<span className="ml-1 text-yellow-300/80">⚡{it.cost}</span>
          </button>
        )
      })}
    </div>
  )
}

/** 목숨 표시 (보호막이면 🛡️ 강조) */
export function HeartBar({ hearts, max, shielded }: { hearts: number; max: number; shielded: boolean }) {
  return (
    <span className="text-rose-300">
      {shielded && <span className="mr-1">🛡️</span>}
      {'❤️'.repeat(Math.max(0, hearts))}{'🤍'.repeat(Math.max(0, max - Math.max(0, hearts)))}
    </span>
  )
}
