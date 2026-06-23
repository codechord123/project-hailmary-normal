import { useGameStore } from '@/store/gameStore'
import { sfx } from '@/lib/sfx'

/**
 * 콘텐츠 단원(사회 등)의 플레이를 "공유 프로필"에 반영한다.
 * 과목·단원이 달라도 XP·레벨·에너지(상점 화폐)·업적은 한 계정에서 공유.
 */

/** 정답 1개 보상 — 공유 XP + 에너지(상점 화폐) */
export function awardAnswer(correct: boolean) {
  if (!correct) return
  const s = useGameStore.getState()
  s.addEnergy(3)
  const r = s.addXp(5)
  if (r.leveledUp) sfx.levelUp()
}

/** 챕터/스테이지 클리어 보상 */
export function awardClear() {
  const s = useGameStore.getState()
  s.addEnergy(20)
  const r = s.addXp(50)
  if (r.leveledUp) sfx.levelUp()
}
