import { useGameStore } from '@/store/gameStore'
import { sfx } from '@/lib/sfx'

/**
 * 콘텐츠 단원(사회 등)의 플레이를 "공유 프로필"에 반영한다.
 * 과목·단원이 달라도 XP·레벨·에너지(상점 화폐)·업적은 한 계정에서 공유.
 *
 * 보상은 평평하지 않다 — 콤보·별점이 높을수록 더 많이 받는다(숙련 동기).
 * 행운(luck) 스탯이 높으면 추가 보너스가 터질 확률이 올라간다.
 */

/** 정답 1개 보상 — 공유 XP + 에너지(상점 화폐). 콤보가 쌓일수록 보너스. */
export function awardAnswer(correct: boolean, combo = 0) {
  if (!correct) return
  const s = useGameStore.getState()
  const comboBonus = Math.min(5, Math.floor(combo / 5)) // 5콤보마다 +1 (최대 +5)
  s.addEnergy(3 + comboBonus)
  const r = s.addXp(5 + comboBonus)
  if (r.leveledUp) sfx.levelUp()
}

export interface ClearReward {
  stars?: number
  bestCombo?: number
}

/**
 * 챕터/스테이지 클리어 보상.
 * XP·에너지가 별점 배율(1.0/1.5/2.0)과 최고 콤보에 비례한다.
 * 행운 보너스가 터지면 보상이 1.5배.
 */
export function awardClear(opts: ClearReward = {}) {
  const s = useGameStore.getState()
  const stars = Math.max(1, Math.min(3, opts.stars ?? 3))
  const combo = Math.max(0, opts.bestCombo ?? 0)
  const starMult = 1 + 0.5 * (stars - 1) // ★1=1.0, ★2=1.5, ★3=2.0
  const comboXp = Math.min(60, combo * 4)
  const comboEnergy = Math.min(20, combo)

  let xp = Math.round(50 * starMult) + comboXp
  let energy = Math.round(20 * starMult) + comboEnergy

  // 행운 보너스 — 확률적으로 보상 1.5배 (앱 런타임에서만 호출되므로 Math.random OK)
  const mods = s.combatMods()
  const lucky = Math.random() < mods.bonusChance
  if (lucky) {
    xp = Math.round(xp * 1.5)
    energy = Math.round(energy * 1.5)
  }

  // 오늘의 첫 클리어 보너스 (매일 돌아올 이유)
  const firstToday = s.claimDailyFirstClear()
  if (firstToday) {
    xp += 30
    energy += 15
  }

  s.addEnergy(energy)
  const r = s.addXp(xp)
  if (r.leveledUp) sfx.levelUp()
  return { xp, energy, lucky, firstToday }
}
