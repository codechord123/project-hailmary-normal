import { create } from 'zustand'

/**
 * 지금 학습 중인 단원을 기억하는 장치.
 * 앞으로 타임어택·끝없는 항해 등 모든 모드가 이 값을 보고
 * 해당 단원의 문제(콘텐츠 팩)를 불러온다.
 */
const KEY = 'platform-active-unit'

const load = (): string | null => {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

interface ActiveUnitState {
  activeUnitId: string | null
  setActiveUnit: (id: string | null) => void
}

export const useActiveUnit = create<ActiveUnitState>((set) => ({
  activeUnitId: load(),
  setActiveUnit: (id) => {
    try {
      if (id) localStorage.setItem(KEY, id)
      else localStorage.removeItem(KEY)
    } catch {
      /* localStorage 불가 환경 무시 */
    }
    set({ activeUnitId: id })
  },
}))
