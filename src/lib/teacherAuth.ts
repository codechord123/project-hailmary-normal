/**
 * 교사용 PIN — 학생이 대시보드/관리 페이지에 접근 못 하도록 차단.
 * 단순 SHA-256 해시 + localStorage. 외부 서버 없이 동작.
 *
 * 첫 진입 시 PIN 미설정 → 새로 설정 모드.
 * 이후 진입 시 PIN 입력으로 잠금 해제 (세션 단위).
 */

const PIN_HASH_KEY = 'hailmary-teacher-pin'
const SESSION_KEY = 'hailmary-teacher-session'

const hash = async (pin: string): Promise<string> => {
  const enc = new TextEncoder().encode(`teacher::${pin}::헤일메리`)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', enc)
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
  let h = 5381
  for (const c of `t::${pin}`) h = (h * 33 + c.charCodeAt(0)) >>> 0
  return h.toString(16)
}

export const isPinSet = (): boolean => {
  try {
    return !!localStorage.getItem(PIN_HASH_KEY)
  } catch {
    return false
  }
}

export const setTeacherPin = async (pin: string): Promise<{ ok: true } | { ok: false; reason: string }> => {
  if (!pin || pin.length < 4) return { ok: false, reason: 'PIN은 4자리 이상이어야 해요.' }
  if (pin.length > 12) return { ok: false, reason: 'PIN은 12자리 이내로 정해주세요.' }
  try {
    localStorage.setItem(PIN_HASH_KEY, await hash(pin))
    sessionStorage.setItem(SESSION_KEY, '1')
    return { ok: true }
  } catch {
    return { ok: false, reason: '저장에 실패했어요.' }
  }
}

export const verifyTeacherPin = async (pin: string): Promise<boolean> => {
  try {
    const stored = localStorage.getItem(PIN_HASH_KEY)
    if (!stored) return false
    if ((await hash(pin)) !== stored) return false
    sessionStorage.setItem(SESSION_KEY, '1')
    return true
  } catch {
    return false
  }
}

export const isTeacherUnlocked = (): boolean => {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export const lockTeacher = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

/** PIN 자체를 재설정 (분실 시 — 학생 데이터는 유지) */
export const resetTeacherPin = () => {
  try {
    localStorage.removeItem(PIN_HASH_KEY)
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}
