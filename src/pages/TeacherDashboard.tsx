import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  isPinSet,
  isTeacherUnlocked,
  setTeacherPin,
  verifyTeacherPin,
  lockTeacher,
  resetTeacherPin,
} from '@/lib/teacherAuth'
import {
  listStudents,
  deleteStudent,
  resetStudentPassword,
  bulkRegister,
} from '@/lib/auth'
import { deleteProfile, listProfiles } from '@/lib/profileSwitch'
import { listRoster, removeRoster } from '@/lib/classRoster'

type Mode = 'gate' | 'set-pin' | 'dashboard'

/**
 * 교사 전용 대시보드 — PIN 으로 잠그고, 학급 학생 관리.
 * - 학생 진도 / 별 / 레벨 한눈에 확인
 * - 비번 초기화, 진도 삭제, 계정 삭제
 * - 명단 붙여넣기 → 일괄 계정 생성
 * - CSV 내보내기 (학부모/기록 보고)
 */
export function TeacherDashboard() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>(() =>
    !isPinSet() ? 'set-pin' : isTeacherUnlocked() ? 'dashboard' : 'gate',
  )

  if (mode === 'set-pin') return <SetPinView onDone={() => setMode('dashboard')} />
  if (mode === 'gate') return <GateView onUnlock={() => setMode('dashboard')} />

  return (
    <DashboardView
      onLock={() => {
        lockTeacher()
        navigate('/')
      }}
    />
  )
}

function SetPinView({ onDone }: { onDone: () => void }) {
  const [pin, setPin] = useState('')
  const [pin2, setPin2] = useState('')
  const [err, setErr] = useState('')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pin !== pin2) return setErr('두 PIN이 일치하지 않아요.')
    const r = await setTeacherPin(pin)
    if (!r.ok) return setErr(r.reason)
    onDone()
  }
  return (
    <Shell title="🔐 교사 PIN 설정">
      <p className="text-white/70 text-sm">
        이 단말의 교사 대시보드를 보호할 PIN 을 정해주세요. 학생에게 노출되지 않도록 4~12자리로 설정하세요.
      </p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input
          type="password"
          inputMode="numeric"
          placeholder="새 PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/40 border border-white/20"
        />
        <input
          type="password"
          inputMode="numeric"
          placeholder="새 PIN 확인"
          value={pin2}
          onChange={(e) => setPin2(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/40 border border-white/20"
        />
        {err && <div className="text-red-300 text-sm">{err}</div>}
        <button className="w-full py-3 rounded-xl bg-space-accent text-space-900 font-bold">PIN 설정하고 들어가기</button>
      </form>
    </Shell>
  )
}

function GateView({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('')
  const [err, setErr] = useState('')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    if (await verifyTeacherPin(pin)) onUnlock()
    else setErr('PIN이 맞지 않아요.')
  }
  const onReset = () => {
    if (!window.confirm('PIN을 잊으셨나요? 새로 설정합니다. 학생 데이터는 보존돼요.')) return
    resetTeacherPin()
    window.location.reload()
  }
  return (
    <Shell title="🔐 교사 인증">
      <p className="text-white/70 text-sm">교사 PIN을 입력하세요.</p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/40 border border-white/20"
        />
        {err && <div className="text-red-300 text-sm">{err}</div>}
        <button className="w-full py-3 rounded-xl bg-space-accent text-space-900 font-bold">잠금 해제</button>
        <button type="button" onClick={onReset} className="block w-full text-center text-xs text-white/40 hover:text-white/70 underline">
          PIN을 잊으셨나요? 새로 설정
        </button>
      </form>
    </Shell>
  )
}

interface StudentRow {
  name: string
  hasAccount: boolean
  hasProfile: boolean
  level: number
  title: string
  totalStars: number
  clearedCount: number
  endlessBest: number
  lastUpdated: number
}

function DashboardView({ onLock }: { onLock: () => void }) {
  const [rows, setRows] = useState<StudentRow[]>([])
  const [tab, setTab] = useState<'roster' | 'bulk'>('roster')

  const refresh = () => {
    const accountNames = new Set(listStudents())
    const profileNames = new Set(listProfiles())
    const rosterMap = new Map(listRoster().map((r) => [r.name, r]))
    const allNames = new Set<string>([...accountNames, ...profileNames, ...rosterMap.keys()])
    const list: StudentRow[] = Array.from(allNames)
      .sort((a, b) => a.localeCompare(b, 'ko'))
      .map((name) => {
        const r = rosterMap.get(name)
        return {
          name,
          hasAccount: accountNames.has(name),
          hasProfile: profileNames.has(name),
          level: r?.level ?? 1,
          title: r?.title ?? '신입 항해사',
          totalStars: r?.totalStars ?? 0,
          clearedCount: r?.clearedCount ?? 0,
          endlessBest: r?.endlessBest ?? 0,
          lastUpdated: r?.lastUpdated ?? 0,
        }
      })
    setRows(list)
  }

  useEffect(() => {
    refresh()
  }, [])

  const totalStudents = rows.length
  const sumStars = rows.reduce((s, r) => s + r.totalStars, 0)
  const sumCleared = rows.reduce((s, r) => s + r.clearedCount, 0)

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <Link to="/" className="text-white/60 hover:text-white text-sm">← 메인으로</Link>
        <button onClick={onLock} className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80">
          🔒 잠그기
        </button>
      </div>

      <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-white">👩‍🏫 교사 대시보드</h1>
      <p className="text-xs text-white/50">이 단말에 등록된 학생만 보입니다.</p>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        <Stat label="학생 수" value={totalStudents} />
        <Stat label="누적 별" value={sumStars} />
        <Stat label="클리어 챕터" value={sumCleared} />
      </div>

      <div className="mt-4 flex gap-2 text-sm">
        <TabBtn active={tab === 'roster'} onClick={() => setTab('roster')}>📋 명단 ({totalStudents})</TabBtn>
        <TabBtn active={tab === 'bulk'} onClick={() => setTab('bulk')}>📥 일괄 등록</TabBtn>
      </div>

      {tab === 'roster' && <RosterTab rows={rows} onChanged={refresh} />}
      {tab === 'bulk' && <BulkTab onDone={refresh} switchTab={() => setTab('roster')} />}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
      <div className="text-xs text-white/50">{label}</div>
      <div className="text-xl font-bold text-space-accent">{value}</div>
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg border ${
        active ? 'bg-space-accent text-space-900 border-space-accent font-bold' : 'bg-white/5 text-white/70 border-white/10'
      }`}
    >
      {children}
    </button>
  )
}

function RosterTab({ rows, onChanged }: { rows: StudentRow[]; onChanged: () => void }) {
  const [pwResetFor, setPwResetFor] = useState<string | null>(null)
  const [newPw, setNewPw] = useState('')
  const [msg, setMsg] = useState('')

  const handleResetPw = async (name: string) => {
    setMsg('')
    if (!newPw.trim()) return
    const r = await resetStudentPassword(name, newPw.trim())
    if (!r.ok) return setMsg(r.reason)
    setMsg(`${name} 의 비번을 새로 설정했어요.`)
    setPwResetFor(null)
    setNewPw('')
  }

  const handleDelete = (name: string) => {
    if (!window.confirm(`${name} 의 계정과 모든 진도를 영구 삭제할까요?\n되돌릴 수 없습니다.`)) return
    deleteStudent(name)
    deleteProfile(name)
    removeRoster(name, '')
    setMsg(`${name} 을(를) 삭제했어요.`)
    onChanged()
  }

  const handleClearProgress = (name: string) => {
    if (!window.confirm(`${name} 의 진도(별·레벨·기록)만 초기화합니다. 계정은 유지돼요. 진행할까요?`)) return
    deleteProfile(name)
    removeRoster(name, '')
    setMsg(`${name} 의 진도를 초기화했어요.`)
    onChanged()
  }

  const exportCsv = () => {
    const header = ['이름', '레벨', '칭호', '누적 별', '클리어 챕터', '끝없는 항해 최고', '마지막 활동']
    const fmt = (t: number) => (t ? new Date(t).toLocaleString('ko-KR') : '-')
    const lines = [header.join(',')]
    for (const r of rows) {
      lines.push([r.name, r.level, r.title, r.totalStars, r.clearedCount, r.endlessBest, fmt(r.lastUpdated)].join(','))
    }
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const stamp = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `헤일메리_학급기록_${stamp}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (rows.length === 0) {
    return (
      <div className="mt-6 p-6 rounded-xl bg-white/5 border border-white/10 text-center text-white/60">
        아직 등록된 학생이 없습니다. <br />
        <span className="text-space-accent">📥 일괄 등록</span> 탭에서 학급 명단을 추가해보세요.
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex justify-end">
        <button onClick={exportCsv} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-400/30">
          📊 CSV 내보내기
        </button>
      </div>
      {msg && <div className="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-200 text-sm border border-blue-400/30">{msg}</div>}
      {rows.map((r) => (
        <div key={r.name} className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-start gap-3 flex-wrap">
            <div className="flex-1 min-w-[160px]">
              <div className="font-bold text-white flex items-center gap-2 flex-wrap">
                {r.name}
                {!r.hasAccount && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-200 border border-yellow-300/40">
                    계정 없음 (진도만 있음)
                  </span>
                )}
              </div>
              <div className="text-xs text-white/60 mt-0.5">
                Lv {r.level} · {r.title} · ★ {r.totalStars} · 클리어 {r.clearedCount}/7
                {r.endlessBest > 0 && <> · 끝없는 항해 {r.endlessBest}점</>}
              </div>
              {r.lastUpdated > 0 && (
                <div className="text-[10px] text-white/30 mt-0.5">마지막 활동 {new Date(r.lastUpdated).toLocaleString('ko-KR')}</div>
              )}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {r.hasAccount && (
                <button
                  onClick={() => setPwResetFor(pwResetFor === r.name ? null : r.name)}
                  className="text-xs px-2 py-1 rounded bg-blue-500/20 hover:bg-blue-500/40 text-blue-200 border border-blue-400/30"
                >
                  🔑 비번 재설정
                </button>
              )}
              {r.hasProfile && (
                <button
                  onClick={() => handleClearProgress(r.name)}
                  className="text-xs px-2 py-1 rounded bg-orange-500/20 hover:bg-orange-500/40 text-orange-200 border border-orange-400/30"
                >
                  ↺ 진도 초기화
                </button>
              )}
              <button
                onClick={() => handleDelete(r.name)}
                className="text-xs px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/40 text-red-200 border border-red-400/30"
              >
                🗑 삭제
              </button>
            </div>
          </div>
          {pwResetFor === r.name && (
            <div className="mt-3 flex gap-2 flex-wrap">
              <input
                type="text"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="새 비밀번호 (4자리 이상)"
                className="flex-1 min-w-[160px] px-3 py-2 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 text-sm"
              />
              <button
                onClick={() => handleResetPw(r.name)}
                className="px-3 py-2 rounded-lg bg-space-accent text-space-900 font-bold text-sm"
              >
                적용
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function BulkTab({ onDone, switchTab }: { onDone: () => void; switchTab: () => void }) {
  const [text, setText] = useState('')
  const [pw, setPw] = useState('1234')
  const [result, setResult] = useState<{ created: string[]; skipped: string[]; failed: { name: string; reason: string }[] } | null>(null)
  const [working, setWorking] = useState(false)

  const parseNames = (raw: string): string[] => {
    return raw
      .split(/[\n,;\t]+/)
      .map((s) => s.trim())
      .filter(Boolean)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const names = parseNames(text)
    if (names.length === 0) return
    if (pw.length < 4) {
      setResult({ created: [], skipped: [], failed: [{ name: '-', reason: '비번 4자리 이상' }] })
      return
    }
    setWorking(true)
    const r = await bulkRegister(names, pw)
    setWorking(false)
    setResult(r)
    onDone()
  }

  const preview = parseNames(text)

  return (
    <div className="mt-4 space-y-3">
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-400/30 text-blue-100 text-xs">
        💡 학급 명단을 줄바꿈·콤마·세미콜론·탭 어느 것으로 구분해도 인식해요.
        모두 같은 임시 비밀번호로 가입되며, 학생이 처음 로그인한 뒤 개별 변경하면 됩니다.
      </div>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-xs text-white/60 mb-1">학생 명단</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder={'예시:\n김민수\n이서연\n박지호\n...'}
            className="w-full px-3 py-2 rounded-xl bg-white/10 text-white placeholder-white/40 border border-white/20 font-mono text-sm"
          />
          {preview.length > 0 && (
            <div className="mt-1 text-xs text-white/50">인식된 학생 수: <span className="text-space-accent font-bold">{preview.length}</span></div>
          )}
        </div>
        <div>
          <label className="block text-xs text-white/60 mb-1">공용 임시 비밀번호 (4자리 이상)</label>
          <input
            type="text"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-white/20"
          />
        </div>
        <button
          type="submit"
          disabled={working || preview.length === 0}
          className="w-full py-3 rounded-xl bg-space-accent text-space-900 font-bold disabled:opacity-40"
        >
          {working ? '등록 중…' : `${preview.length}명 일괄 등록`}
        </button>
      </form>

      {result && (
        <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 text-sm space-y-2">
          {result.created.length > 0 && (
            <div className="text-emerald-300">✅ 신규 등록 {result.created.length}명 — {result.created.slice(0, 12).join(', ')}{result.created.length > 12 && ' …'}</div>
          )}
          {result.skipped.length > 0 && (
            <div className="text-yellow-300">⏭ 이미 존재 {result.skipped.length}명 — {result.skipped.slice(0, 8).join(', ')}{result.skipped.length > 8 && ' …'}</div>
          )}
          {result.failed.length > 0 && (
            <div className="text-red-300">❌ 실패 {result.failed.length}건 — {result.failed.map((f) => `${f.name}(${f.reason})`).join(', ')}</div>
          )}
          {result.created.length > 0 && (
            <button onClick={switchTab} className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-space-accent text-space-900 font-bold">
              📋 명단에서 확인 →
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md p-6 rounded-2xl bg-white/5 border border-white/10">
        <Link to="/" className="text-white/40 hover:text-white text-xs">← 메인</Link>
        <h1 className="mt-2 text-xl font-bold text-white">{title}</h1>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}
