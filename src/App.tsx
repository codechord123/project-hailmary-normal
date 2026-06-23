import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { MainMenu } from '@/pages/MainMenu'
import { ChapterSelect } from '@/pages/ChapterSelect'
import { Cabinet } from '@/pages/Cabinet'
import { Dashboard } from '@/pages/Dashboard'
import { Leaderboard } from '@/pages/Leaderboard'
import { ChapterClear } from '@/pages/ChapterClear'
import { Login } from '@/pages/Login'
import { useGameStore } from '@/store/gameStore'
import { setMuted } from '@/lib/sfx'
import { setBgmMuted, setBgmVolume, stop as stopBgm } from '@/lib/bgm'
import { saveCurrentSlot } from '@/lib/profileSwitch'
import { isLoggedIn } from '@/lib/auth'
import { upsertRoster } from '@/lib/classRoster'
import { computeLevelInfo } from '@/lib/leveling'
import { unlock as unlockAchievement } from '@/lib/achievements'
import { AchievementToast } from '@/components/AchievementToast'

/** 로그인 안 한 학생은 /login 으로 강제 이동 */
function RequireLogin({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}

const Chapter1 = lazy(() => import('@/pages/Chapter1').then((m) => ({ default: m.Chapter1 })))
const Chapter1Clear = lazy(() => import('@/pages/Chapter1').then((m) => ({ default: m.Chapter1Clear })))
const Chapter2 = lazy(() => import('@/pages/Chapter2').then((m) => ({ default: m.Chapter2 })))
const Chapter3 = lazy(() => import('@/pages/Chapter3').then((m) => ({ default: m.Chapter3 })))
const Chapter4 = lazy(() => import('@/pages/Chapter4').then((m) => ({ default: m.Chapter4 })))
const Chapter5 = lazy(() => import('@/pages/Chapter5').then((m) => ({ default: m.Chapter5 })))
const Chapter6 = lazy(() => import('@/pages/Chapter6').then((m) => ({ default: m.Chapter6 })))
const Chapter7 = lazy(() => import('@/pages/Chapter7').then((m) => ({ default: m.Chapter7 })))
const Endless = lazy(() => import('@/pages/Endless').then((m) => ({ default: m.Endless })))
const DailyChallenge = lazy(() => import('@/pages/DailyChallenge').then((m) => ({ default: m.DailyChallenge })))
const StoryRecap = lazy(() => import('@/pages/StoryRecap').then((m) => ({ default: m.StoryRecap })))
const Shop = lazy(() => import('@/pages/Shop').then((m) => ({ default: m.Shop })))
const WrongNotes = lazy(() => import('@/pages/WrongNotes').then((m) => ({ default: m.WrongNotes })))
const Achievements = lazy(() => import('@/pages/Achievements').then((m) => ({ default: m.Achievements })))
const TimeAttack = lazy(() => import('@/pages/TimeAttack').then((m) => ({ default: m.TimeAttack })))
const BossRush = lazy(() => import('@/pages/BossRush').then((m) => ({ default: m.BossRush })))
const BasicPractice = lazy(() => import('@/pages/BasicPractice').then((m) => ({ default: m.BasicPractice })))
const TeacherDashboard = lazy(() => import('@/pages/TeacherDashboard').then((m) => ({ default: m.TeacherDashboard })))

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center text-white/60 text-sm">
      ✨ 우주선 시스템 로드 중...
    </div>
  )
}

export default function App() {
  const muted = useGameStore((s) => s.muted)
  const presentationMode = useGameStore((s) => s.presentationMode)
  const bgmEnabled = useGameStore((s) => s.bgmEnabled)
  const bgmVolume = useGameStore((s) => s.bgmVolume)
  useEffect(() => {
    setMuted(muted)
    setBgmMuted(muted || !bgmEnabled)
    if (muted || !bgmEnabled) stopBgm()
  }, [muted, bgmEnabled])
  useEffect(() => {
    setBgmVolume(bgmVolume)
  }, [bgmVolume])

  // 진도 자동 저장 — 어떤 페이지에서도 변경 감지
  const studentName = useGameStore((s) => s.studentName)
  const classCode = useGameStore((s) => s.classCode)
  const totalXp = useGameStore((s) => s.totalXp)
  const clearedChapters = useGameStore((s) => s.clearedChapters)
  const chapterRecords = useGameStore((s) => s.chapterRecords)
  useEffect(() => {
    if (!studentName.trim()) return
    saveCurrentSlot()
    // 명부에도 자동 반영 — 리더보드에 모든 학생 기록이 공유 (같은 단말 기준)
    const info = computeLevelInfo(totalXp)
    const totalStars = Object.values(chapterRecords).reduce(
      (s, r) => s + (r?.stars ?? 0), 0,
    )
    let endlessBest = 0
    try {
      endlessBest = parseInt(localStorage.getItem('hailmary-endless-hi') || '0', 10) || 0
    } catch { /* ignore */ }
    upsertRoster({
      name: studentName,
      classCode,
      level: info.level,
      title: info.title,
      totalXp,
      clearedCount: clearedChapters.length,
      totalStars,
      endlessBest,
      lastUpdated: Date.now(),
    })
  }, [studentName, classCode, totalXp, clearedChapters, chapterRecords])

  // 첫 진입 + 챕터/레벨 기반 업적 자동 해금
  useEffect(() => {
    unlockAchievement('first-launch')
  }, [])
  useEffect(() => {
    if (clearedChapters.includes(1)) unlockAchievement('chapter1')
    if (clearedChapters.includes(3)) unlockAchievement('chapter3')
    if (clearedChapters.length >= 7) unlockAchievement('all-chapters')
  }, [clearedChapters])

  return (
    <BrowserRouter>
      <div
        className={`min-h-screen bg-gradient-to-b from-space-900 via-space-800 to-space-900 text-white ${
          presentationMode ? 'text-lg sm:text-xl' : ''
        }`}
      >
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RequireLogin><MainMenu /></RequireLogin>} />
            <Route path="/chapters" element={<RequireLogin><ChapterSelect /></RequireLogin>} />
            <Route path="/chapter/1" element={<RequireLogin><Chapter1 /></RequireLogin>} />
            <Route path="/chapter/1/clear" element={<RequireLogin><Chapter1Clear /></RequireLogin>} />
            <Route path="/chapter/2" element={<RequireLogin><Chapter2 /></RequireLogin>} />
            <Route path="/chapter/3" element={<RequireLogin><Chapter3 /></RequireLogin>} />
            <Route path="/chapter/4" element={<RequireLogin><Chapter4 /></RequireLogin>} />
            <Route path="/chapter/5" element={<RequireLogin><Chapter5 /></RequireLogin>} />
            <Route path="/chapter/6" element={<RequireLogin><Chapter6 /></RequireLogin>} />
            <Route path="/chapter/7" element={<RequireLogin><Chapter7 /></RequireLogin>} />
            <Route path="/chapter/:chapter/clear" element={<RequireLogin><ChapterClear /></RequireLogin>} />
            <Route path="/cabinet" element={<RequireLogin><Cabinet /></RequireLogin>} />
            <Route path="/dashboard" element={<RequireLogin><Dashboard /></RequireLogin>} />
            <Route path="/leaderboard" element={<RequireLogin><Leaderboard /></RequireLogin>} />
            <Route path="/endless" element={<RequireLogin><Endless /></RequireLogin>} />
            <Route path="/daily" element={<RequireLogin><DailyChallenge /></RequireLogin>} />
            <Route path="/story" element={<RequireLogin><StoryRecap /></RequireLogin>} />
            <Route path="/shop" element={<RequireLogin><Shop /></RequireLogin>} />
            <Route path="/wrong-notes" element={<RequireLogin><WrongNotes /></RequireLogin>} />
            <Route path="/achievements" element={<RequireLogin><Achievements /></RequireLogin>} />
            <Route path="/timeattack" element={<RequireLogin><TimeAttack /></RequireLogin>} />
            <Route path="/bossrush" element={<RequireLogin><BossRush /></RequireLogin>} />
            <Route path="/basic" element={<RequireLogin><BasicPractice /></RequireLogin>} />
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="*" element={<RequireLogin><MainMenu /></RequireLogin>} />
          </Routes>
        </Suspense>
        <AchievementToast />
      </div>
    </BrowserRouter>
  )
}
