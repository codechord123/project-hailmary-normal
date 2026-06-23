/**
 * 전체 백업/복원 — 이 단말의 모든 학습 데이터(계정·진도·레벨·명부 등)를
 * JSON 파일 하나로 내보내고 불러온다. 서버 없이 기기 간 이전·백업용.
 */
const TAG = 'hailmary-platform-backup'

export function exportBackup() {
  const data: Record<string, string> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k) data[k] = localStorage.getItem(k) ?? ''
  }
  const payload = { _app: TAG, exportedAt: new Date().toISOString(), data }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `학습데이터_백업_${stamp}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/** 파일을 읽어 복원. 성공 시 true (호출부에서 새로고침 권장). */
export async function importBackup(file: File): Promise<{ ok: boolean; reason?: string }> {
  try {
    const text = await file.text()
    const parsed = JSON.parse(text)
    if (parsed?._app !== TAG || typeof parsed.data !== 'object') {
      return { ok: false, reason: '이 앱의 백업 파일이 아니에요.' }
    }
    // 기존 데이터를 백업 내용으로 교체
    localStorage.clear()
    for (const [k, v] of Object.entries(parsed.data as Record<string, string>)) {
      localStorage.setItem(k, v)
    }
    return { ok: true }
  } catch {
    return { ok: false, reason: '파일을 읽을 수 없어요.' }
  }
}
