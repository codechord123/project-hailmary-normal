import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { ContentProblem } from '@/content/types'
import { judgeContent } from '@/content/judge'
import { sfx } from '@/lib/sfx'
import { useGameJuice, JuiceOverlay } from '@/content/components/GameJuice'
import { GameResult } from '@/content/components/GameResult'
import { starsFromHearts } from '@/content/score'
import { BALANCE } from '@/content/balance'

interface Props {
  problems: ContentProblem[]
  title: string
  intro?: string
  bossName?: string
  bossEmoji?: string
  /** 처치에 필요한 정답 수 (클수록 보스가 강함) */
  hitsToKill?: number
  onClear: (result: { score: number; bestCombo: number; stars: number }) => void
  onExit: () => void
  /** 문제 채점 결과 기록 (오답 노트·XP용) */
  onAnswer?: (problemId: string, correct: boolean) => void
}

const START_HEARTS = BALANCE.hearts
const COUNTER_PERIOD = BALANCE.boss.counterPeriodSec // 보스 반격 주기(초) — 답하면 리셋

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * 보스전 미니게임 (챕터 3 보스전 / 챕터 4 최종보스 공용).
 * 문제를 맞혀 보스에게 데미지를 주고, 틀리면 반격당한다.
 * ContentProblem(객관식·OX) 풀을 순환 소비. (matching 문제는 호출부에서 걸러 전달)
 */
export function BossGame({
  problems, title, intro, bossName = '편견 빌런', bossEmoji = '👾',
  hitsToKill = BALANCE.boss.hitsToKillDefault, onClear, onExit, onAnswer,
}: Props) {
  const queueRef = useRef<ContentProblem[]>([])
  const nextProblem = useCallback((): ContentProblem => {
    if (queueRef.current.length === 0) queueRef.current = shuffle(problems)
    return queueRef.current.shift()!
  }, [problems])

  const [problem, setProblem] = useState<ContentProblem>(() => {
    queueRef.current = shuffle(problems)
    return queueRef.current.shift()!
  })
  const damage = Math.ceil(100 / Math.max(1, hitsToKill))
  const [bossHp, setBossHp] = useState(100)
  const [hearts, setHearts] = useState(START_HEARTS)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [score, setScore] = useState(0)
  const [react, setReact] = useState<'idle' | 'hit' | 'attack'>('idle')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [mcqPick, setMcqPick] = useState<number[]>([])
  const [status, setStatus] = useState<'play' | 'clear' | 'over'>('play')
  const [counter, setCounter] = useState(COUNTER_PERIOD)
  const juice = useGameJuice()

  // 반격 타이머 — 0이 되면 보스가 반격(하트 -1). 답하면 매번 리셋.
  useEffect(() => {
    if (status !== 'play') return
    if (counter <= 0) {
      setReact('attack')
      setTimeout(() => setReact('idle'), 400)
      setFeedback('🗯️ 빌런의 반격! 더 빨리 답해요!')
      setCombo(0)
      setHearts((h) => {
        const n = h - 1
        if (n <= 0) setStatus('over')
        return n
      })
      setCounter(COUNTER_PERIOD)
      return
    }
    const id = setTimeout(() => setCounter((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [counter, status])

  const advance = () => {
    setMcqPick([])
    setProblem(nextProblem())
  }

  const resolve = (correct: boolean) => {
    if (status !== 'play') return
    setCounter(COUNTER_PERIOD) // 답하면 반격 타이머 리셋
    onAnswer?.(problem.id, correct)
    sfx[correct ? 'correct' : 'wrong']()
    if (correct) {
      const newCombo = combo + 1
      setCombo(newCombo)
      setBestCombo((b) => Math.max(b, newCombo))
      setScore((s) => s + 100 + newCombo * 20)
      juice.correct(newCombo, { x: 0.5, amount: damage })
      setReact('hit')
      setFeedback('💥 명중! 빌런에게 데미지!')
      setTimeout(() => setReact('idle'), 400)
      setBossHp((hp) => {
        const next = Math.max(0, hp - damage)
        if (next <= 0) { setStatus('clear'); sfx.clear() }
        return next
      })
      if (bossHp - damage > 0) setTimeout(advance, 500)
    } else {
      setCombo(0)
      setReact('attack')
      setFeedback('🗯️ 빗나갔어요! 빌런의 반격!')
      setTimeout(() => setReact('idle'), 400)
      setHearts((h) => {
        const next = h - 1
        if (next <= 0) setStatus('over')
        return next
      })
      if (hearts - 1 > 0) setTimeout(advance, 600)
    }
  }

  const restart = () => {
    queueRef.current = shuffle(problems)
    setProblem(queueRef.current.shift()!)
    setBossHp(100)
    setHearts(START_HEARTS)
    setCounter(COUNTER_PERIOD)
    setCombo(0)
    setBestCombo(0)
    setScore(0)
    setReact('idle')
    setFeedback(null)
    setMcqPick([])
    setStatus('play')
  }

  if (status === 'clear') {
    return (
      <GameResult emoji="🎉" title={`${bossName}을(를) 무찔렀어요!`} confetti
        stars={starsFromHearts(hearts, START_HEARTS)}
        lines={[`최고 콤보 ${bestCombo}`, `점수 ${score}`]}
        primary={{ label: '완료', onClick: () => onClear({ score, bestCombo, stars: starsFromHearts(hearts, START_HEARTS) }) }}
        secondary={{ label: '다시 하기', onClick: restart }} />
    )
  }
  if (status === 'over') {
    return (
      <GameResult emoji="🛑" title="이번엔 빌런에게 졌어요…"
        lines={['인권을 다시 떠올리고', '재도전해 볼까요?']}
        primary={{ label: '다시 도전', onClick: restart }}
        secondary={{ label: '나가기', onClick: onExit }} />
    )
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-4 max-w-2xl mx-auto flex flex-col relative">
      <JuiceOverlay floaters={juice.floaters} grade={juice.grade} combo={combo} />
      <header className="flex items-center justify-between">
        <button onClick={onExit} className="text-white/60 hover:text-white text-sm">← 나가기</button>
        <div className="text-sm text-rose-300">
          {'❤️'.repeat(hearts)}{'🤍'.repeat(Math.max(0, START_HEARTS - hearts))}
        </div>
      </header>

      <div className="mt-1 text-center text-sm font-bold text-indigo-200">👾 {title}</div>

      {/* 보스 */}
      <div className="mt-3 flex flex-col items-center gap-2">
        <motion.div
          className="text-7xl"
          animate={
            react === 'hit' ? { scale: [1, 0.8, 1], rotate: [0, -8, 8, 0] }
            : react === 'attack' ? { x: [0, 12, -12, 0] }
            : { y: [0, -6, 0] }
          }
          transition={react === 'idle' ? { duration: 2, repeat: Infinity } : { duration: 0.4 }}
        >
          {react === 'hit' ? '😵' : bossEmoji}
        </motion.div>
        <div className="text-xs text-white/60">{bossName}</div>
        {/* HP 바 */}
        <div className="w-56 h-3 rounded-full bg-white/10 overflow-hidden border border-white/20">
          <motion.div
            className="h-full bg-gradient-to-r from-rose-500 to-red-600"
            animate={{ width: `${bossHp}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="text-[11px] text-white/50 flex gap-3">
          <span>HP {bossHp}</span><span>콤보 {combo}</span>
          <span className={counter <= 4 ? 'text-red-400 font-bold' : ''}>⚔️ {counter}s</span>
        </div>
      </div>

      {feedback && (
        <div className={`mt-3 p-2 rounded text-sm text-center font-bold ${
          react === 'attack' ? 'bg-red-500/20 text-red-100' : 'bg-emerald-500/20 text-emerald-100'
        }`}>
          {feedback}
        </div>
      )}

      {/* 문제 패널 */}
      <div className="mt-3 p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3">
        {problem.scenario && (
          <p className="text-sm text-white/80 leading-relaxed">{problem.scenario}</p>
        )}
        {problem.figure && (
          <div className="rounded-lg border border-dashed border-amber-300/40 bg-amber-300/5 p-2 text-xs text-amber-100/90">
            🖼️ {problem.figure}
          </div>
        )}
        <p className="font-bold text-white">
          {problem.kind === 'ox' ? problem.statement : problem.prompt}
        </p>

        {problem.kind === 'mcq' && !problem.multiple && (
          <div className="grid grid-cols-1 gap-2">
            {problem.choices.map((c, ci) => (
              <button key={ci}
                onClick={() => resolve(judgeContent(problem, { kind: 'mcq', values: [ci] }))}
                className="text-left px-4 py-2.5 rounded-lg bg-gradient-to-br from-indigo-500/25 to-violet-700/25 border border-indigo-400/40 hover:border-yellow-300 hover:scale-[1.02] transition active:scale-95 text-white/90">
                <span className="font-bold mr-2">{['①','②','③','④','⑤'][ci] ?? ci + 1}</span>{c}
              </button>
            ))}
          </div>
        )}

        {problem.kind === 'mcq' && problem.multiple && (
          <div className="flex flex-col gap-2">
            {problem.choices.map((c, ci) => {
              const on = mcqPick.includes(ci)
              return (
                <button key={ci}
                  onClick={() => setMcqPick((p) => (on ? p.filter((x) => x !== ci) : [...p, ci]))}
                  className={`text-left px-4 py-2.5 rounded-lg border transition ${
                    on ? 'border-indigo-400 bg-indigo-400/20 text-white' : 'border-white/15 bg-white/5 text-white/85 hover:bg-white/10'
                  }`}>
                  <span className="font-bold mr-2">{['①','②','③','④','⑤'][ci] ?? ci + 1}</span>{c}
                </button>
              )
            })}
            <button
              onClick={() => resolve(judgeContent(problem, { kind: 'mcq', values: mcqPick }))}
              disabled={mcqPick.length === 0}
              className="px-4 py-2 rounded-lg bg-indigo-500 enabled:hover:bg-indigo-400 disabled:opacity-40 font-bold transition">
              공격! (여러 개 선택)
            </button>
          </div>
        )}

        {problem.kind === 'ox' && (
          <div className="flex gap-3 justify-center">
            {([true, false] as const).map((v) => (
              <button key={String(v)}
                aria-label={v ? '맞음 (O)' : '틀림 (X)'}
                onClick={() => resolve(judgeContent(problem, { kind: 'ox', value: v }))}
                className="w-20 h-20 rounded-2xl text-3xl font-black border-2 border-white/20 bg-white/5 hover:bg-white/10 hover:border-yellow-300 transition active:scale-95">
                {v ? '⭕' : '❌'}
              </button>
            ))}
          </div>
        )}
      </div>

      {intro && combo === 0 && score === 0 && (
        <p className="mt-3 text-xs text-white/50 text-center leading-relaxed">{intro}</p>
      )}
    </div>
  )
}
