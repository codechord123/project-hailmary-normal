/**
 * 학생 로그인 — 이름 + 비밀번호 (PIN 4자리 권장).
 * 외부 서버 없이 localStorage 만으로 동작.
 *
 * 저장 구조:
 *   hailmary-auth     → { [name]: passwordHash }
 *   hailmary-session  → { name } (현재 로그인 세션)
 *   hailmary-profile-{name} (기존 profileSwitch.ts 가 관리)
 */

const AUTH_KEY = 'hailmary-auth'
const SESSION_KEY = 'hailmary-session'

const safeReadObject = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

const safeWriteObject = (key: string, data: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

/** 간단한 결정적 해시 — 비밀번호 평문 저장 회피 (학습용 보안). */
const hashPassword = async (password: string, salt: string): Promise<string> => {
  const enc = new TextEncoder().encode(`${salt}::${password}::헤일메리`)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', enc)
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
  // 폴백 — 단순 djb2
  let h = 5381
  for (const c of `${salt}::${password}`) h = (h * 33 + c.charCodeAt(0)) >>> 0
  return h.toString(16)
}

interface AuthDb {
  [name: string]: string // password hash
}

const readAuthDb = (): AuthDb => safeReadObject<AuthDb>(AUTH_KEY) ?? {}
const writeAuthDb = (db: AuthDb) => safeWriteObject(AUTH_KEY, db)

interface Session {
  name: string
}

export const getSession = (): Session | null => safeReadObject<Session>(SESSION_KEY)

export const setSession = (name: string) => safeWriteObject(SESSION_KEY, { name })

export const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

/** 신규 가입 — 이름 중복 시 false */
export const registerStudent = async (name: string, password: string): Promise<{ ok: true } | { ok: false; reason: string }> => {
  const n = name.trim()
  if (!n) return { ok: false, reason: '이름을 입력해줘.' }
  if (n.length > 20) return { ok: false, reason: '이름은 20자 이내로 적어줘.' }
  if (!password || password.length < 4) return { ok: false, reason: '비밀번호는 4자리 이상이어야 해.' }
  const db = readAuthDb()
  if (db[n]) return { ok: false, reason: '이미 가입된 이름이야. 로그인 해줘.' }
  const hash = await hashPassword(password, n)
  db[n] = hash
  writeAuthDb(db)
  return { ok: true }
}

/** 로그인 — 이름과 비번 검증. 성공 시 세션 설정. */
export const loginStudent = async (name: string, password: string): Promise<{ ok: true } | { ok: false; reason: string }> => {
  const n = name.trim()
  if (!n || !password) return { ok: false, reason: '이름과 비번을 모두 입력해줘.' }
  const db = readAuthDb()
  const stored = db[n]
  if (!stored) return { ok: false, reason: '등록된 이름이 없어. 먼저 가입해줘.' }
  const hash = await hashPassword(password, n)
  if (hash !== stored) return { ok: false, reason: '비밀번호가 맞지 않아.' }
  setSession(n)
  return { ok: true }
}

/** 등록된 학생 이름 목록 (비번은 노출 X). */
export const listStudents = (): string[] => Object.keys(readAuthDb()).sort()

/** 학생 계정 + 진도 데이터 모두 삭제 (관리자/학생 본인용). */
export const deleteStudent = (name: string) => {
  const db = readAuthDb()
  delete db[name]
  writeAuthDb(db)
  // 세션이 그 학생이면 로그아웃
  const sess = getSession()
  if (sess?.name === name) clearSession()
  try {
    localStorage.removeItem(`hailmary-profile-${name}`)
  } catch {
    /* ignore */
  }
}

export const isLoggedIn = (): boolean => !!getSession()

/** 교사 권한 — 학생 비밀번호 강제 재설정. */
export const resetStudentPassword = async (name: string, newPassword: string): Promise<{ ok: true } | { ok: false; reason: string }> => {
  const db = readAuthDb()
  if (!db[name]) return { ok: false, reason: '등록된 학생이 아닙니다.' }
  if (!newPassword || newPassword.length < 4) return { ok: false, reason: '비밀번호는 4자리 이상이어야 합니다.' }
  db[name] = await hashPassword(newPassword, name)
  writeAuthDb(db)
  return { ok: true }
}

/** 일괄 등록 — 이미 존재하는 이름은 skip. 모두 동일 임시 비번. */
export const bulkRegister = async (
  names: string[],
  defaultPassword: string,
): Promise<{ created: string[]; skipped: string[]; failed: { name: string; reason: string }[] }> => {
  const created: string[] = []
  const skipped: string[] = []
  const failed: { name: string; reason: string }[] = []
  const db = readAuthDb()
  for (const raw of names) {
    const n = raw.trim()
    if (!n) continue
    if (n.length > 20) {
      failed.push({ name: n, reason: '이름 20자 초과' })
      continue
    }
    if (db[n]) {
      skipped.push(n)
      continue
    }
    db[n] = await hashPassword(defaultPassword, n)
    created.push(n)
  }
  writeAuthDb(db)
  return { created, skipped, failed }
}
