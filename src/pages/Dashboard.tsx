import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { computeLevelInfo } from '@/lib/leveling'
import { CharacterAvatar } from '@/components/CharacterAvatar'
import {
  listProfiles, switchToStudent, deleteProfile,
} from '@/lib/profileSwitch'

const CHAPTERS = [
  { id: 1, title: '깨어남', topic: '통분 덧셈', genre: '🤲 조작' },
  { id: 2, title: '식량 점검', topic: '통분 뺄셈', genre: '🚀 슈팅' },
  { id: 3, title: '미지의 신호', topic: '약분 통분', genre: '🕹 보스' },
  { id: 4, title: '첫 만남', topic: '다른 분모 +', genre: '🛡 디펜스' },
  { id: 5, title: '동력실', topic: '다른 분모 −', genre: '⚡ 리액터' },
  { id: 6, title: '배양', topic: '대분수', genre: '🃏 매칭' },
  { id: 7, title: '귀환', topic: '종합', genre: '👹 풀보스' },
]

export function Dashboard() {
  const store = useGameStore()
  const info = computeLevelInfo(store.totalXp)
  const [editName, setEditName] = useState(store.studentName)
  const [editCode, setEditCode] = useState(store.classCode)
  const [profiles, setProfiles] = useState<string[]>([])
  const [newStudentName, setNewStudentName] = useState('')

  useEffect(() => {
    setProfiles(listProfiles())
  }, [store.studentName])

  const handleSwitch = (name: string) => {
    if (name === store.studentName) return
    if (window.confirm(`현재 학생(${store.studentName || '미지정'})의 진도를 저장하고 ${name}(으)로 전환할까요?`)) {
      switchToStudent(name)
      setEditName(name)
      setEditCode(useGameStore.getState().classCode)
    }
  }

  const handleNewStudent = () => {
    const n = newStudentName.trim()
    if (!n) return
    if (window.confirm(`새 학생 "${n}"으로 시작할까요? 현재 진도는 저장돼.`)) {
      switchToStudent(n, store.classCode)
      setEditName(n)
      setNewStudentName('')
    }
  }

  const [warn, setWarn] = useState<string | null>(null)
  const handleDeleteProfile = (name: string) => {
    if (name === store.studentName) {
      setWarn('현재 사용 중인 프로파일은 삭제할 수 없어요. 먼저 다른 학생으로 전환하세요.')
      setTimeout(() => setWarn(null), 3000)
      return
    }
    if (window.confirm(`정말 ${name} 학생 프로파일을 삭제할까요? 되돌릴 수 없어요.`)) {
      deleteProfile(name)
      setProfiles(listProfiles())
    }
  }

  const totalCleared = store.clearedChapters.length
  const totalStars = Object.values(store.chapterRecords).reduce((s, r) => s + r.stars, 0)

  return (
    <div className="min-h-screen px-6 py-8 max-w-3xl mx-auto">
      <Link to="/" className="text-white/60 hover:text-white text-sm">
        ← 메인으로
      </Link>
      <h2 className="mt-3 text-3xl font-bold text-white">📊 항해 진도판</h2>
      {warn && (
        <div className="mt-2 p-2 rounded bg-red-500/20 border border-red-400/40 text-red-200 text-xs">{warn}</div>
      )}
      <p className="text-white/60 text-sm mt-1">선생님 / 보호자가 학습 진행을 한눈에 확인할 수 있어요.</p>

      {/* 학생 정보 */}
      <section className="mt-6 p-5 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-4">
          <CharacterAvatar size={80} />
          <div className="flex-1">
            <div className="text-white/60 text-xs">학생 이름</div>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => store.setStudentName(editName)}
              placeholder="이름 입력"
              className="w-full mt-1 px-3 py-1.5 rounded bg-black/40 text-white border border-white/20 focus:outline-none focus:border-space-accent"
            />
            <div className="mt-2 text-white/60 text-xs">학급 코드 (선택)</div>
            <input
              value={editCode}
              onChange={(e) => setEditCode(e.target.value)}
              onBlur={() => store.setClassCode(editCode)}
              placeholder="예: 5-3 또는 6반"
              className="w-full mt-1 px-3 py-1.5 rounded bg-black/40 text-white border border-white/20 focus:outline-none focus:border-space-accent text-sm"
            />
          </div>
        </div>
      </section>

      {/* 프로파일 스위처 */}
      <section className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-white">👥 학생 빠른 전환</h3>
          <span className="text-[10px] text-white/40">{profiles.length}명 저장됨</span>
        </div>
        {profiles.length === 0 ? (
          <div className="text-xs text-white/40">아직 등록된 프로파일이 없어요. 위 이름란 작성 후 자동 저장돼요.</div>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {profiles.map((p) => {
              const isCurrent = p === store.studentName
              return (
                <li key={p} className="flex items-center">
                  <button
                    onClick={() => handleSwitch(p)}
                    disabled={isCurrent}
                    className={`px-3 py-1 rounded-l border text-xs ${
                      isCurrent
                        ? 'border-space-accent bg-space-accent/30 text-white'
                        : 'border-white/20 bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {isCurrent && '● '}{p}
                  </button>
                  <button
                    onClick={() => handleDeleteProfile(p)}
                    className="px-2 py-1 rounded-r border border-l-0 border-white/20 bg-white/5 text-white/40 hover:text-red-300 text-xs"
                    title="삭제"
                  >
                    ✕
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        <div className="mt-3 flex gap-2">
          <input
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            placeholder="새 학생 이름"
            className="flex-1 px-2 py-1 rounded bg-black/40 text-white border border-white/20 focus:outline-none focus:border-space-accent text-xs"
          />
          <button
            onClick={handleNewStudent}
            disabled={!newStudentName.trim()}
            className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 text-xs disabled:opacity-30"
          >
            + 새 학생
          </button>
        </div>
      </section>

      {/* 요약 통계 */}
      <section className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat label="레벨" value={`Lv.${info.level}`} accent={info.titleColor} />
        <Stat label="칭호" value={info.title} accent={info.titleColor} />
        <Stat label="클리어 챕터" value={`${totalCleared} / 7`} accent="text-cyan-300" />
        <Stat label="총 별" value={`${totalStars} / 21`} accent="text-yellow-300" />
      </section>

      {/* 챕터별 진도 */}
      <section className="mt-4 p-5 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-3">챕터별 진도</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/50 text-xs">
                <th className="py-1">챕터</th>
                <th>장르</th>
                <th>주제</th>
                <th>상태</th>
                <th>별</th>
                <th>최고 콤보</th>
              </tr>
            </thead>
            <tbody>
              {CHAPTERS.map((c) => {
                const cleared = store.clearedChapters.includes(c.id)
                const record = store.chapterRecords[c.id]
                return (
                  <tr key={c.id} className="border-t border-white/10">
                    <td className="py-2 text-white font-semibold">{c.id}. {c.title}</td>
                    <td className="text-white/70 text-xs">{c.genre}</td>
                    <td className="text-white/60 text-xs">{c.topic}</td>
                    <td>
                      {cleared ? (
                        <span className="text-emerald-300 text-xs font-bold">✓ 클리어</span>
                      ) : (
                        <span className="text-white/30 text-xs">미진행</span>
                      )}
                    </td>
                    <td className="text-yellow-300">
                      {record ? '★'.repeat(record.stars) : '—'}
                      <span className="text-white/15">{record ? '★'.repeat(3 - record.stars) : ''}</span>
                    </td>
                    <td className="text-pink-300 text-xs">{record ? `×${record.bestCombo}` : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 학급 적용 옵션 */}
      <section className="mt-4 p-5 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-3">수업 활용 옵션</h3>
        <label className="flex items-center justify-between p-3 rounded-lg bg-black/30 cursor-pointer">
          <div>
            <div className="text-white font-semibold">📺 발표 모드</div>
            <div className="text-xs text-white/60 mt-0.5">UI 단순화 + 글자 키움. 교실 빔프로젝터용.</div>
          </div>
          <input
            type="checkbox"
            checked={store.presentationMode}
            onChange={() => store.togglePresentationMode()}
            className="w-5 h-5 accent-space-accent"
          />
        </label>

        <label className="mt-2 flex items-center justify-between p-3 rounded-lg bg-black/30 cursor-pointer">
          <div>
            <div className="text-white font-semibold">🎵 배경음악 (BGM)</div>
            <div className="text-xs text-white/60 mt-0.5">챕터별 chiptune 배경음.</div>
          </div>
          <input
            type="checkbox"
            checked={store.bgmEnabled}
            onChange={() => store.toggleBgmEnabled()}
            className="w-5 h-5 accent-space-accent"
          />
        </label>
        <div className={`mt-2 p-3 rounded-lg bg-black/30 ${!store.bgmEnabled ? 'opacity-40' : ''}`}>
          <div className="text-xs text-white/70">BGM 음량 {Math.round(store.bgmVolume * 100)}%</div>
          <input
            type="range"
            min="0" max="100" step="1"
            disabled={!store.bgmEnabled}
            value={Math.round(store.bgmVolume * 100)}
            onChange={(e) => store.setBgmVolume(parseInt(e.target.value, 10) / 100)}
            className="w-full mt-1 accent-space-accent"
          />
        </div>
        <button
          onClick={() => {
            if (window.confirm('정말 모든 진도와 캐릭터를 초기화할까요?')) {
              store.reset()
            }
          }}
          className="mt-3 w-full px-3 py-2 rounded-lg bg-red-500/15 text-red-300 border border-red-500/30 text-sm"
        >
          🗑 진도 전체 초기화 (다음 학생 사용 전)
        </button>
      </section>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="p-3 rounded-lg bg-black/30 border border-white/10">
      <div className="text-[10px] text-white/50 uppercase">{label}</div>
      <div className={`text-xl font-bold ${accent} mt-0.5`}>{value}</div>
    </div>
  )
}
