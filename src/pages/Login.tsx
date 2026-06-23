import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  registerStudent, loginStudent, listStudents,
} from '@/lib/auth'
import { switchToStudent } from '@/lib/profileSwitch'

type Mode = 'login' | 'register'

export function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [students] = useState<string[]>(() => listStudents())

  const submit = async () => {
    setError('')
    setBusy(true)
    try {
      if (mode === 'register') {
        if (password !== password2) {
          setError('비밀번호 확인이 일치하지 않아.')
          return
        }
        const r = await registerStudent(name, password)
        if (!r.ok) { setError(r.reason); return }
        // 가입 직후 자동 로그인
        const r2 = await loginStudent(name, password)
        if (!r2.ok) { setError(r2.reason); return }
        switchToStudent(name.trim())
        navigate('/')
      } else {
        const r = await loginStudent(name, password)
        if (!r.ok) { setError(r.reason); return }
        switchToStudent(name.trim())
        navigate('/')
      }
    } finally {
      setBusy(false)
    }
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') submit()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="text-5xl">🚀</div>
        <h1 className="mt-2 text-3xl font-bold text-white">헤일메리 분수 미션</h1>
        <p className="mt-1 text-space-accent text-sm">항해사 로그인</p>
      </motion.div>

      <div className="w-full max-w-sm p-6 rounded-2xl bg-white/5 border border-white/15 backdrop-blur">
        <div className="flex mb-4 rounded-lg bg-black/30 p-1">
          <button
            onClick={() => { setMode('login'); setError('') }}
            className={`flex-1 px-3 py-2 rounded text-sm font-bold ${mode === 'login' ? 'bg-space-accent text-space-900' : 'text-white/60'}`}
          >
            로그인
          </button>
          <button
            onClick={() => { setMode('register'); setError('') }}
            className={`flex-1 px-3 py-2 rounded text-sm font-bold ${mode === 'register' ? 'bg-space-accent text-space-900' : 'text-white/60'}`}
          >
            새로 가입
          </button>
        </div>

        <label className="block text-xs text-white/60 mb-1">이름</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={onKey}
          placeholder="너의 이름"
          maxLength={20}
          className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/20 text-white"
          autoFocus
        />

        <label className="block text-xs text-white/60 mt-3 mb-1">비밀번호 (4자리 이상)</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={onKey}
          placeholder="비밀번호"
          maxLength={20}
          inputMode="numeric"
          className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/20 text-white"
        />

        {mode === 'register' && (
          <>
            <label className="block text-xs text-white/60 mt-3 mb-1">비밀번호 확인</label>
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              onKeyDown={onKey}
              placeholder="비밀번호 다시"
              maxLength={20}
              inputMode="numeric"
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/20 text-white"
            />
          </>
        )}

        {error && (
          <div className="mt-3 p-2 rounded bg-red-500/20 text-red-200 text-sm text-center">
            ❌ {error}
          </div>
        )}

        <button
          onClick={submit}
          disabled={busy}
          className="w-full mt-4 px-4 py-3 rounded-xl bg-space-accent text-space-900 font-bold disabled:opacity-50"
        >
          {busy ? '잠시만…' : mode === 'login' ? '🚪 로그인' : '✨ 가입하고 시작'}
        </button>

        {mode === 'login' && students.length > 0 && (
          <div className="mt-4">
            <div className="text-xs text-white/50 mb-1">최근 가입한 학생</div>
            <div className="flex flex-wrap gap-1">
              {students.slice(0, 12).map((s) => (
                <button
                  key={s}
                  onClick={() => setName(s)}
                  className="px-2 py-1 rounded bg-white/10 text-white/80 border border-white/15 text-xs"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 text-white/40 text-xs text-center max-w-sm">
        모든 진도와 기록은 너의 이름으로 저장돼.
        <br />
        같은 단말의 다른 학생도 로그인하면 자기 기록을 볼 수 있어.
      </p>

      <button
        onClick={() => navigate('/teacher')}
        className="mt-3 text-xs text-white/30 hover:text-white/70 underline"
      >
        👩‍🏫 선생님 메뉴
      </button>
    </div>
  )
}
