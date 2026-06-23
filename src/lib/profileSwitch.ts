/**
 * 한 단말 다중 학생 프로파일 — Zustand persist 키와 별개로
 * 각 학생의 store snapshot을 hailmary-profile-{name} 키로 보관.
 *
 * 전환 흐름:
 *  1. 현재 store 상태 → 현재 학생 슬롯에 저장
 *  2. 다른 학생 슬롯에서 데이터 로드
 *  3. setState로 store 갱신
 */

import { useGameStore } from '@/store/gameStore'

const SLOT_PREFIX = 'hailmary-profile-'

const slotKey = (name: string) => `${SLOT_PREFIX}${name}`

const dumpCurrentStore = () => {
  const s = useGameStore.getState()
  // 함수와 maxOxygen/baseTimePerProblem 제외
  return {
    oxygen: s.oxygen,
    energy: s.energy,
    bond: s.bond,
    clearedChapters: s.clearedChapters,
    chapterRecords: s.chapterRecords,
    totalXp: s.totalXp,
    statPoints: s.statPoints,
    stats: s.stats,
    cosmetics: s.cosmetics,
    items: s.items,
    muted: s.muted,
    studentName: s.studentName,
    classCode: s.classCode,
    presentationMode: s.presentationMode,
    bgmEnabled: s.bgmEnabled,
    bgmVolume: s.bgmVolume,
  }
}

const safeRead = (key: string) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const safeWrite = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

export const saveCurrentSlot = () => {
  const s = useGameStore.getState()
  if (!s.studentName.trim()) return
  safeWrite(slotKey(s.studentName), dumpCurrentStore())
}

export const switchToStudent = (newName: string, classCode = '') => {
  // 1) 현재 학생을 슬롯에 저장
  saveCurrentSlot()
  // 2) 새 학생 슬롯 로드 (없으면 초기 상태 + 이름만 변경)
  const slot = safeRead(slotKey(newName))
  const state = useGameStore.getState()
  if (slot) {
    useGameStore.setState({
      ...slot,
      studentName: newName,
      classCode: slot.classCode ?? classCode,
    })
  } else {
    // 신규 학생 — reset 후 이름만 설정
    state.reset()
    useGameStore.setState({
      studentName: newName,
      classCode: classCode,
      bgmEnabled: state.bgmEnabled,
      bgmVolume: state.bgmVolume,
      muted: state.muted,
      presentationMode: state.presentationMode,
    })
  }
}

export const listProfiles = (): string[] => {
  const out: string[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(SLOT_PREFIX)) {
        out.push(k.slice(SLOT_PREFIX.length))
      }
    }
  } catch {
    /* ignore */
  }
  return out.sort()
}

export const deleteProfile = (name: string) => {
  try {
    localStorage.removeItem(slotKey(name))
  } catch {
    /* ignore */
  }
}
