import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CharacterAvatar } from '@/components/CharacterAvatar'
import { LevelBadge } from '@/components/LevelBadge'
import { Tutorial } from '@/components/Tutorial'
import { unlockAudio, setMuted } from '@/lib/sfx'
import { useGameStore } from '@/store/gameStore'
import { clearSession } from '@/lib/auth'
import { saveCurrentSlot } from '@/lib/profileSwitch'

export function MainMenu() {
  const navigate = useNavigate()
  const muted = useGameStore((s) => s.muted)
  const toggleMute = useGameStore((s) => s.toggleMute)
  const studentName = useGameStore((s) => s.studentName)
  const bgmEnabled = useGameStore((s) => s.bgmEnabled)
  const bgmVolume = useGameStore((s) => s.bgmVolume)
  const toggleBgmEnabled = useGameStore((s) => s.toggleBgmEnabled)
  const setBgmVolume = useGameStore((s) => s.setBgmVolume)
  const [showTutorial, setShowTutorial] = useState(false)

  const start = () => {
    unlockAudio()
    setMuted(muted)
  }

  const handleLogout = () => {
    if (!window.confirm(`정말 로그아웃할까? ${studentName} 의 진도는 저장돼.`)) return
    saveCurrentSlot()
    clearSession()
    // store 의 studentName 도 비워 다음 로그인 학생과 섞이지 않도록.
    useGameStore.setState({ studentName: '' })
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative">
      {/* 우상단 미니 오디오 컨트롤 */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur rounded-full px-2 py-1 border border-white/10">
        <button
          onClick={() => toggleBgmEnabled()}
          aria-label={bgmEnabled ? 'BGM 끄기' : 'BGM 켜기'}
          className="text-base hover:scale-110 transition"
        >
          {bgmEnabled ? '🎵' : '🎶'}
        </button>
        <input
          type="range"
          min="0" max="100" step="5"
          aria-label="BGM 음량"
          disabled={!bgmEnabled || muted}
          value={Math.round(bgmVolume * 100)}
          onChange={(e) => setBgmVolume(parseInt(e.target.value, 10) / 100)}
          className="w-20 accent-space-accent disabled:opacity-30"
        />
        <span className="text-[10px] text-white/60 font-mono w-7 text-right">
          {Math.round(bgmVolume * 100)}
        </span>
      </div>
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl sm:text-6xl font-display font-bold text-white tracking-tight"
      >
        🚀 헤일메리 분수 미션
      </motion.h1>
      <p className="mt-3 text-space-accent text-lg">지구를 구하는 25명의 항해사</p>

      <div className="mt-8 flex flex-col items-center gap-3">
        <CharacterAvatar size={130} />
        {studentName && (
          <div className="flex items-center gap-2">
            <div className="text-white/80 text-sm">⛑ 항해사 <span className="font-bold text-white">{studentName}</span></div>
            <button
              onClick={handleLogout}
              className="px-2 py-0.5 rounded bg-white/10 text-white/70 border border-white/20 text-xs hover:bg-white/20"
            >
              🚪 로그아웃
            </button>
          </div>
        )}
        <LevelBadge />
      </div>

      <div className="mt-10 flex flex-col gap-3 w-full max-w-md">
        {/* 메인 액션 */}
        <Link
          to="/chapters"
          onClick={start}
          className="px-6 py-4 rounded-xl bg-space-accent text-space-900 font-bold text-lg hover:brightness-110 active:scale-95 transition text-center"
        >
          🚀 항해 시작
        </Link>

        {/* 도전 모드 */}
        <div className="grid grid-cols-3 gap-2">
          <Link
            to="/daily"
            className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold border border-yellow-200/50 text-center text-sm"
          >
            🌟<br />오늘의 챌린지
          </Link>
          <Link
            to="/endless"
            className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 text-white font-bold border border-yellow-300/40 text-center text-sm"
          >
            🎮<br />끝없는 항해
          </Link>
          <Link
            to="/timeattack"
            className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-700 text-white font-bold border border-yellow-300/40 text-center text-sm"
          >
            ⏱<br />타임 어택
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <Link
            to="/bossrush"
            className="p-3 rounded-xl bg-gradient-to-br from-fuchsia-600 via-purple-700 to-indigo-700 text-white font-bold border border-yellow-300/40 text-center text-sm"
          >
            👑 BOSS RUSH · 5보스 격파
          </Link>
          <Link
            to="/basic"
            className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-teal-700 text-white font-bold border border-cyan-300/40 text-center text-sm"
          >
            🧮 기초연습 · 통분 단순 계산 훈련
          </Link>
        </div>

        {/* 학습 도구 */}
        <div className="grid grid-cols-3 gap-2">
          <Link to="/wrong-notes" className="p-2 rounded-lg bg-rose-400/10 text-rose-200 border border-rose-300/30 text-xs text-center">
            📝<br />오답 노트
          </Link>
          <Link to="/achievements" className="p-2 rounded-lg bg-amber-400/10 text-amber-200 border border-amber-300/30 text-xs text-center">
            🏅<br />업적
          </Link>
          <Link to="/story" className="p-2 rounded-lg bg-purple-400/10 text-purple-200 border border-purple-300/30 text-xs text-center">
            📚<br />항해 일지
          </Link>
        </div>

        {/* 캐릭터 / 자원 */}
        <div className="grid grid-cols-3 gap-2">
          <Link to="/cabinet" className="p-2 rounded-lg bg-pink-400/10 text-pink-200 border border-pink-300/30 text-xs text-center">
            🧳<br />캐비닛
          </Link>
          <Link to="/shop" className="p-2 rounded-lg bg-emerald-400/10 text-emerald-200 border border-emerald-300/30 text-xs text-center">
            🏪<br />상점
          </Link>
          <Link to="/leaderboard" className="p-2 rounded-lg bg-yellow-400/10 text-yellow-200 border border-yellow-300/30 text-xs text-center">
            🏆<br />리더보드
          </Link>
        </div>

        {/* 설정 */}
        <div className="grid grid-cols-2 gap-2">
          <Link to="/dashboard" className="p-2 rounded-lg bg-white/5 text-white/70 border border-white/15 text-xs text-center">
            📊 진도판 / 학급
          </Link>
          <button
            onClick={() => {
              toggleMute()
              setMuted(!muted)
            }}
            className="p-2 rounded-lg bg-white/10 text-white/70 border border-white/20 text-xs"
          >
            {muted ? '🔇 소리 꺼짐' : '🔊 소리 켜짐'}
          </button>
        </div>
      </div>

      <button
        onClick={() => setShowTutorial(true)}
        className="mt-4 text-white/40 hover:text-white/70 text-xs underline"
      >
        ❓ 게임 가이드 다시 보기
      </button>
      <button
        onClick={() => navigate('/teacher')}
        className="mt-1 text-white/30 hover:text-white/60 text-xs underline"
      >
        👩‍🏫 선생님 메뉴
      </button>
      <p className="mt-4 text-white/30 text-xs">© Project Hail Mary 영감 · 학급 교육용</p>
      <Tutorial forceShow={showTutorial} onClose={() => setShowTutorial(false)} />
      {/* 최초 1회 자동 노출 */}
      <Tutorial />
    </div>
  )
}
