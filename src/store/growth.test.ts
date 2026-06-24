import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'

const dateKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`

describe('combatMods — 과목 중립 성장 효과', () => {
  beforeEach(() => {
    useGameStore.setState({ stats: { lung: 0, reflex: 0, intuition: 0, luck: 0 } })
  })

  it('스탯 0이면 보너스 없음', () => {
    const m = useGameStore.getState().combatMods()
    expect(m).toEqual({ bonusHearts: 0, timeBonusSec: 0, hintCharges: 0, bonusChance: 0 })
  })

  it('스탯에서 효과가 파생되고 상한이 적용된다', () => {
    useGameStore.setState({ stats: { lung: 9, reflex: 3, intuition: 5, luck: 12 } })
    const m = useGameStore.getState().combatMods()
    expect(m.bonusHearts).toBe(2) // floor(9/3)=3 → 상한 2
    expect(m.timeBonusSec).toBe(6) // 3*2
    expect(m.hintCharges).toBe(3) // min(3,5)
    expect(m.bonusChance).toBeCloseTo(0.5) // min(0.5, 12*0.05=0.6)
  })
})

describe('연속 출석(streak)', () => {
  beforeEach(() => {
    useGameStore.setState({
      lastPlayedDate: '',
      currentStreak: 0,
      longestStreak: 0,
      lastFirstClearDate: '',
    })
  })

  it('첫 출석은 streak 1, 새 날(isNewDay)', () => {
    const r = useGameStore.getState().touchDailyStreak()
    expect(r).toEqual({ streak: 1, isNewDay: true })
    expect(useGameStore.getState().currentStreak).toBe(1)
  })

  it('같은 날 다시 호출하면 streak 그대로, isNewDay=false', () => {
    useGameStore.getState().touchDailyStreak()
    const r = useGameStore.getState().touchDailyStreak()
    expect(r.isNewDay).toBe(false)
    expect(r.streak).toBe(1)
  })

  it('어제 출석이 이어지면 streak가 1 증가한다', () => {
    const y = new Date()
    y.setDate(y.getDate() - 1)
    useGameStore.setState({ lastPlayedDate: dateKey(y), currentStreak: 4, longestStreak: 4 })
    const r = useGameStore.getState().touchDailyStreak()
    expect(r.streak).toBe(5)
    expect(useGameStore.getState().longestStreak).toBe(5)
  })

  it('하루 이상 빠지면 streak가 1로 리셋된다', () => {
    const old = new Date()
    old.setDate(old.getDate() - 3)
    useGameStore.setState({ lastPlayedDate: dateKey(old), currentStreak: 9, longestStreak: 9 })
    const r = useGameStore.getState().touchDailyStreak()
    expect(r.streak).toBe(1)
    expect(useGameStore.getState().longestStreak).toBe(9) // 최고 기록은 유지
  })
})

describe('오늘의 첫 클리어 보너스', () => {
  beforeEach(() => useGameStore.setState({ lastFirstClearDate: '' }))

  it('오늘 첫 호출만 true, 이후는 false', () => {
    expect(useGameStore.getState().claimDailyFirstClear()).toBe(true)
    expect(useGameStore.getState().claimDailyFirstClear()).toBe(false)
  })
})
