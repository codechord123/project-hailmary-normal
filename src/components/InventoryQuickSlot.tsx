import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { ITEMS, type ItemId } from '@/data/items'

type ItemEffect = (id: ItemId) => void

interface Props {
  /** 챕터 내 아이템 효과 매핑 */
  onUseOxygen?: () => void
  onUseBomb?: () => void
  onUseMagnet?: () => void
  onUseShield?: () => void
  onUseTimeFreeze?: () => void
  onUseSimplifyAid?: () => void
  onUseHintFormula?: () => void
  /** shield 활성 여부 표시 */
  shieldActive?: boolean
  /** simplify-aid 활성 여부 표시 */
  simplifyAidActive?: boolean
}

export function InventoryQuickSlot(props: Props) {
  const store = useGameStore()
  const [tooltipId, setTooltipId] = useState<ItemId | null>(null)

  const handlers: Record<ItemId, () => void> = {
    'oxygen-pack': () => {
      if (store.useItem('oxygen-pack')) {
        store.addOxygen(25)
        props.onUseOxygen?.()
      }
    },
    'time-freeze': () => {
      if (store.useItem('time-freeze')) props.onUseTimeFreeze?.()
    },
    'simplify-aid': () => {
      if (store.useItem('simplify-aid')) props.onUseSimplifyAid?.()
    },
    bomb: () => {
      if (store.useItem('bomb')) props.onUseBomb?.()
    },
    magnet: () => {
      if (store.useItem('magnet')) props.onUseMagnet?.()
    },
    shield: () => {
      if (store.useItem('shield')) props.onUseShield?.()
    },
    'hint-formula': () => {
      if (store.useItem('hint-formula')) props.onUseHintFormula?.()
    },
  }

  const enabled: Record<ItemId, boolean> = {
    'oxygen-pack': !!props.onUseOxygen,
    'time-freeze': !!props.onUseTimeFreeze,
    'simplify-aid': !!props.onUseSimplifyAid && !props.simplifyAidActive,
    bomb: !!props.onUseBomb,
    magnet: !!props.onUseMagnet,
    shield: !!props.onUseShield && !props.shieldActive,
    'hint-formula': !!props.onUseHintFormula,
  }

  const ids: ItemId[] = ['oxygen-pack', 'hint-formula', 'bomb', 'magnet', 'shield', 'time-freeze', 'simplify-aid']

  const handlePress = (id: ItemId, qty: number, disabled: boolean) => {
    // 잔량 0이거나 비활성 슬롯은 툴팁만 토글
    if (qty < 1 || disabled) {
      setTooltipId((cur) => (cur === id ? null : id))
      return
    }
    handlers[id]()
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1.5 text-xs">
        {ids.map((id) => {
          const qty = store.items[id] ?? 0
          const item = ITEMS[id]
          const isActive =
            (id === 'shield' && props.shieldActive) || (id === 'simplify-aid' && props.simplifyAidActive)
          return (
            <button
              key={id}
              onClick={() => handlePress(id, qty, !enabled[id])}
              onMouseEnter={() => setTooltipId(id)}
              onMouseLeave={() => setTooltipId(null)}
              disabled={qty < 1}
              className={`px-2 py-1 rounded border text-white/80 disabled:opacity-30 ${
                isActive
                  ? 'border-emerald-400 bg-emerald-500/30'
                  : 'border-white/20 bg-white/10 hover:bg-white/20'
              }`}
            >
              {item.icon} ×{qty}
              {isActive && ' ✓'}
            </button>
          )
        })}
      </div>
      {tooltipId && (
        <div className="absolute z-30 left-0 top-full mt-1 max-w-xs p-2 rounded-lg bg-black/90 border border-white/20 text-xs text-white/90 shadow-lg">
          <div className="font-bold">
            {ITEMS[tooltipId].icon} {ITEMS[tooltipId].name}
          </div>
          <div className="mt-0.5 text-white/70">{ITEMS[tooltipId].description}</div>
        </div>
      )}
    </div>
  )
}

export type { ItemEffect }
