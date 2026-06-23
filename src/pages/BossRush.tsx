import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ProblemPanel } from '@/components/problem/ProblemPanel'
import { StageHeader } from '@/components/arcade/StageHeader'
import { ScreenShake } from '@/components/arcade/ScreenShake'
import { DialogueBox } from '@/components/DialogueBox'
import { LevelBadge } from '@/components/LevelBadge'
import { GradeFlash, gradeFor, type Grade } from '@/components/arcade/GradeFlash'
import { RoundIntro } from '@/components/arcade/RoundIntro'
import { useGameStore } from '@/store/gameStore'
import { useShortcuts } from '@/hooks/useShortcuts'
import { genApplied } from '@/lib/problemGen'
import { ADVANCED_PROBLEMS } from '@/data/advancedPool'
import { judge, answerToText, problemAnswerText } from '@/lib/judge'
import { sfx } from '@/lib/sfx'
import { addWrongNote } from '@/lib/wrongNotes'
import { unlock as unlockAch } from '@/lib/achievements'
import type { Problem, StudentAnswer } from '@/types/problem'

const TIME_LIMIT = 150 // 발문 독해 시간 확보
const TIME_PENALTY = 3

type Boss = {
  id: string
  name: string
  emoji: string
  color: string
  hp: number
  gen: () => Problem
}

/** 보스별로 응용 풀의 특정 카테고리만 픽 — 모두 독해 응용. */
const pickFrom = (prefix: string) => {
  const pool = ADVANCED_PROBLEMS.filter((p) => p.id.startsWith(prefix))
  if (pool.length === 0) return genApplied(2)
  const p = pool[Math.floor(Math.random() * pool.length)]
  return { ...p, id: `${p.id}-br-${Math.random().toString(36).slice(2, 6)}` }
}

const BOSSES: Boss[] = [
  // 화염 — 합/차 응용 (route, app, hard 계열)
  { id: 'flame', name: '화염 골렘', emoji: '🔥', color: 'from-orange-500 to-red-600', hp: 3, gen: () => pickFrom('adv-route') },
  // 얼음 — 분수↔소수 변환
  { id: 'ice', name: '얼음 마법사', emoji: '❄', color: 'from-cyan-400 to-blue-600', hp: 3, gen: () => pickFrom('adv-dec') },
  // 번개 — 소수+분수 혼합
  { id: 'thunder', name: '번개 정령', emoji: '⚡', color: 'from-yellow-300 to-amber-500', hp: 3, gen: () => pickFrom('adv-mix') },
  // 독 — 비교 + 응용
  { id: 'poison', name: '독 거미', emoji: '☠', color: 'from-emerald-500 to-green-700', hp: 3, gen: () => pickFrom('adv-app') },
  // 우주 — 최상급 다단계 응용
  { id: 'cosmos', name: '우주의 황제', emoji: '👾', color: 'from-fuchsia-500 to-purple-700', hp: 3, gen: () => pickFrom('adv-hard') },
]

const HI_KEY = 'hailmary-bossrush-hi'
const readHi = (): number => {
  try { return parseInt(localStorage.getItem(HI_KEY) || '0', 10) || 0 } catch { return 0 }
}
const writeHi = (v: number) => { try { localStorage.setItem(HI_KEY, String(v)) } catch { /* ignore */ } }

export function BossRush() {
  const store = useGameStore()
  const [bossIdx, setBossIdx] = useState(0)
  const [hp, setHp] = useState(BOSSES[0].hp)
  const [problem, setProblem] = useState<Problem>(() => BOSSES[0].gen())
  const [studentAnswer, setStudentAnswer] = useState<StudentAnswer>({ kind: 'fraction', value: null })
  const [timeMs, setTimeMs] = useState(TIME_LIMIT * 1000)
  const [over, setOver] = useState<'win' | 'lose' | null>(null)
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle')
  const [shake, setShake] = useState(0)
  const [grade, setGrade] = useState<Grade>(null)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [hi, setHiState] = useState(readHi())
  const [showIntro, setShowIntro] = useState(true)
  const [bossEnter, setBossEnter] = useState(false)

  const boss = BOSSES[bossIdx]

  // 타이머
  useEffect(() => {
    if (over || showIntro) return
    const id = setInterval(() => {
      setTimeMs((t) => Math.max(0, t - 100))
    }, 100)
    return () => clearInterval(id)
  }, [over, showIntro])

  useEffect(() => {
    if (timeMs <= 0 && !over) {
      setOver('lose')
      sfx.crisis()
    }
  }, [timeMs, over])

  // 첫 보스 등장 효과
  useEffect(() => {
    if (showIntro) return
    setBossEnter(true)
    const t = setTimeout(() => setBossEnter(false), 600)
    return () => clearTimeout(t)
  }, [bossIdx, showIntro])

  const submit = useCallback(() => {
    if (over) return
    const r = judge(problem, studentAnswer)
    if (r.kind === 'wrong' || r.kind === 'need-simplify') {
      setCombo(0)
      setFeedback('wrong')
      setShake((s) => s + 1)
      setTimeMs((t) => Math.max(0, t - TIME_PENALTY * 1000))
      sfx.wrong()
      addWrongNote({
        chapterId: 'endless' as any,
        problemId: problem.id,
        problemKind: problem.kind,
        scenario: problem.scenario,
        prompt: problem.prompt,
        studentAnswerText: answerToText(studentAnswer),
        correctAnswerText: problemAnswerText(problem),
        hint: problem.hint,
      })
      return
    }
    const newCombo = combo + 1
    setCombo(newCombo)
    setMaxCombo((m) => Math.max(m, newCombo))
    const crit = newCombo >= 5
    const dmg = crit ? 2 : 1
    const newHp = Math.max(0, hp - dmg)
    setHp(newHp)
    store.addXp(20 + (problem.difficulty ?? 1) * 5)
    setFeedback('correct')
    const g = gradeFor(newCombo, crit)
    setGrade(g)
    setTimeout(() => setGrade(null), 700)
    if (crit) sfx.crit()
    else sfx.hit()

    if (newHp <= 0) {
      // 보스 처치
      sfx.bossDie()
      setTimeout(() => {
        const next = bossIdx + 1
        if (next >= BOSSES.length) {
          // 클리어!
          const score = Math.floor(timeMs / 100) + maxCombo * 100
          if (score > hi) {
            writeHi(score)
            setHiState(score)
          }
          setOver('win')
          unlockAch('boss-rush-clear')
          if (timeMs > 45000) unlockAch('boss-rush-s')
          sfx.clear()
        } else {
          setBossIdx(next)
          setHp(BOSSES[next].hp)
          setProblem(BOSSES[next].gen())
          setStudentAnswer({ kind: 'fraction', value: null })
          setFeedback('idle')
        }
      }, 700)
    } else {
      // 다음 문제
      setTimeout(() => {
        setProblem(boss.gen())
        setStudentAnswer({ kind: 'fraction', value: null })
        setFeedback('idle')
      }, 500)
    }
  }, [over, problem, studentAnswer, combo, hp, store, boss, bossIdx, timeMs, maxCombo, hi])

  useShortcuts({ onSubmit: feedback === 'idle' && !over ? submit : undefined })

  const restart = () => {
    setBossIdx(0)
    setHp(BOSSES[0].hp)
    setProblem(BOSSES[0].gen())
    setStudentAnswer({ kind: 'fraction', value: null })
    setTimeMs(TIME_LIMIT * 1000)
    setOver(null)
    setFeedback('idle')
    setCombo(0)
    setMaxCombo(0)
    setShowIntro(true)
  }

  if (over) {
    const won = over === 'win'
    const score = Math.floor(timeMs / 100) + maxCombo * 100
    const rank = won ? (timeMs > 45000 ? 'S' : timeMs > 30000 ? 'A' : timeMs > 15000 ? 'B' : 'C') : null
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-8xl">
          {won ? '👑' : '💀'}
        </motion.div>
        <h2 className={`mt-4 text-4xl font-bold font-mono tracking-widest ${won ? 'text-yellow-300' : 'text-red-400'}`}>
          {won ? 'CHAMPION!' : 'DEFEATED'}
        </h2>
        <div className="mt-6 font-mono text-white/90 space-y-2">
          {won && rank && (
            <div className="text-6xl font-bold mb-2">
              <span className={
                rank === 'S' ? 'text-yellow-300' : rank === 'A' ? 'text-pink-300' : rank === 'B' ? 'text-cyan-300' : 'text-white/70'
              }>RANK {rank}</span>
            </div>
          )}
          <div>SCORE: <span className="text-yellow-200 text-2xl font-bold">{score.toLocaleString()}</span></div>
          <div>MAX COMBO: <span className="text-pink-300">×{maxCombo}</span></div>
          <div>BEST: <span className="text-purple-300">{hi.toLocaleString()}</span></div>
        </div>
        <div className="mt-8 flex gap-3">
          <button onClick={restart} className="px-6 py-3 rounded-xl bg-space-accent text-space-900 font-bold">↺ 재도전</button>
          <Link to="/" className="px-6 py-3 rounded-xl bg-white/10 text-white border border-white/20">메인으로</Link>
        </div>
      </div>
    )
  }

  const timePct = (timeMs / (TIME_LIMIT * 1000)) * 100
  const danger = timeMs < 15000
  const hpPct = (hp / boss.hp) * 100

  return (
    <div className="min-h-screen px-4 sm:px-6 py-4 max-w-2xl mx-auto flex flex-col">
      <ScreenShake shake={shake}>
        <header className="flex items-center justify-between">
          <Link to="/" className="text-white/60 hover:text-white text-sm">← 메인</Link>
          <LevelBadge compact />
        </header>

        <StageHeader
          stage={`BOSS RUSH ${bossIdx + 1}/${BOSSES.length}`}
          subtitle={`BEST ${hi.toLocaleString()} · 5보스 격파!`}
          combo={combo}
          score={0}
        />

        {/* 보스 카드 */}
        <motion.div
          key={boss.id}
          initial={{ scale: 0.8, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className={`mt-3 p-3 rounded-xl bg-gradient-to-br ${boss.color} border-2 border-white/30 ${bossEnter ? 'animate-pulse' : ''}`}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={bossEnter ? { scale: [1, 1.4, 1], rotate: [0, -10, 10, 0] } : {}}
              transition={{ duration: 0.6 }}
              className="text-5xl"
            >
              {boss.emoji}
            </motion.div>
            <div className="flex-1">
              <div className="font-mono font-bold text-white text-lg drop-shadow">{boss.name}</div>
              <div className="mt-1 flex gap-1">
                {Array.from({ length: boss.hp }).map((_, i) => (
                  <span key={i} className={`inline-block w-4 h-4 rounded-sm border border-black/40 ${i < hp ? 'bg-red-400' : 'bg-black/40'}`} />
                ))}
              </div>
              <div className="mt-1 h-2 rounded-full bg-black/40 overflow-hidden">
                <motion.div
                  animate={{ width: `${hpPct}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-red-400 to-red-200"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* 타이머 */}
        <div className="mt-3">
          <div className="flex justify-between text-xs font-mono">
            <span className={danger ? 'text-red-300 font-bold animate-pulse' : 'text-white/70'}>
              {danger ? '⚠ 시간 위급!' : '⏱ 남은 시간'}
            </span>
            <span className={`font-bold ${danger ? 'text-red-300' : 'text-white/90'}`}>
              {(timeMs / 1000).toFixed(1)}s
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-black/60 overflow-hidden border border-white/15">
            <motion.div
              animate={{ width: `${timePct}%` }}
              transition={{ duration: 0.1 }}
              className={`h-full ${danger ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-cyan-400 to-yellow-300'}`}
            />
          </div>
        </div>

        <div className="mt-3">
          <DialogueBox speaker={boss.name} tone="system" text={problem.scenario} />
          <div className="mt-1">
            <DialogueBox speaker={`★${problem.difficulty}`} tone="narrator" text={problem.prompt} />
          </div>
        </div>

        <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <ProblemPanel problem={problem} onAnswerChange={setStudentAnswer} disabled={feedback === 'correct'} />
        </div>

        <AnimatePresence>
          {feedback === 'wrong' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 p-2 rounded bg-red-500/20 text-red-200 text-xs text-center">
              ❌ 빗나감 (시간 -{TIME_PENALTY}초)
            </motion.div>
          )}
          {feedback === 'correct' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 p-2 rounded bg-emerald-500/20 text-emerald-200 text-xs text-center">
              ⚔ 명중! {combo >= 5 ? '치명타 2뎀!' : '1뎀!'}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3 flex gap-2">
          {feedback === 'idle' && (
            <button onClick={submit} className="flex-1 px-4 py-3 rounded-xl bg-space-accent text-space-900 font-bold">
              공격! (Enter)
            </button>
          )}
          {feedback === 'wrong' && (
            <button onClick={() => setFeedback('idle')} className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20">
              재공격
            </button>
          )}
        </div>
      </ScreenShake>

      <GradeFlash grade={grade} combo={combo} />
      <RoundIntro show={showIntro} title="BOSS RUSH" subtitle={`5체의 보스를 ${TIME_LIMIT}초 안에!`} onFinished={() => setShowIntro(false)} />
    </div>
  )
}
