import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  /** 목표 처치 수를 모두 막으면 호출 */
  onClear: (result: { score: number; bestCombo: number; stars: number }) => void
  /** 나가기 */
  onExit: () => void
  /** 문제 채점 결과 기록 (오답 노트·XP용) */
  onAnswer?: (problemId: string, correct: boolean) => void
}

interface Threat {
  uid: string
  problem: ContentProblem
  spawnTime: number
}

const LANES = 3
const LANE_ADVANCE_SEC = BALANCE.defense.laneAdvanceSec // 좌→우 베이스까지 도달 시간
const START_HEARTS = BALANCE.hearts
const ENEMIES = ['🌀', '🔥', '⚡', '🌪️', '💢', '🌊']

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * 디펜스 미니게임 (챕터 1 — 「법이 뭐길래?」).
 * 레인으로 "혼란"이 밀려오고, 알맞은 보기로 막아 도시를 지킨다.
 * 분수 엔진과 독립적으로, ContentProblem(객관식·OX) 풀만 소비한다.
 */
export function DefenseGame({ problems, title, intro, onClear, onExit, onAnswer }: Props) {
  const goal = Math.max(3, problems.length)
  const queueRef = useRef<ContentProblem[]>([])
  const spawnThreat = useCallback(
    (laneIdx: number): Threat => {
      if (queueRef.current.length === 0) queueRef.current = shuffle(problems)
      const problem = queueRef.current.shift()!
      return { uid: `${problem.id}-${Date.now()}-${laneIdx}`, problem, spawnTime: Date.now() }
    },
    [problems],
  )

  const [lanes, setLanes] = useState<(Threat | null)[]>(() =>
    Array.from({ length: LANES }, () => null),
  )
  const [now, setNow] = useState(Date.now())
  const [target, setTarget] = useState<number | null>(null)
  const [hearts, setHearts] = useState(START_HEARTS)
  const [killed, setKilled] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [flash, setFlash] = useState<'hit' | 'miss' | null>(null)
  const [killAnim, setKillAnim] = useState<number | null>(null)
  const [mcqPick, setMcqPick] = useState<number[]>([])
  const [status, setStatus] = useState<'play' | 'clear' | 'over'>('play')
  const juice = useGameJuice()
  // 처치가 쌓일수록 점진 가속 (하한 9초, 초반 2회는 가속 없음)
  const advanceSec = Math.max(
    BALANCE.defense.advanceFloorSec,
    LANE_ADVANCE_SEC - Math.max(0, killed - BALANCE.defense.accelGrace) * BALANCE.defense.accelPerKill,
  )

  // 첫 스폰
  useEffect(() => {
    setLanes((ls) => ls.map((_, i) => spawnThreat(i)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 진행 tick
  useEffect(() => {
    if (status !== 'play') return
    const id = setInterval(() => setNow(Date.now()), 120)
    return () => clearInterval(id)
  }, [status])

  const loseHeart = useCallback((reason: string) => {
    setFeedback(reason)
    setFlash('miss')
    setCombo(0)
    setTimeout(() => setFlash(null), 250)
    setHearts((h) => {
      const next = h - 1
      if (next <= 0) setStatus('over')
      return next
    })
  }, [])

  // 베이스 침투 검사
  useEffect(() => {
    if (status !== 'play') return
    lanes.forEach((l, i) => {
      if (!l) return
      const progress = (now - l.spawnTime) / 1000 / advanceSec
      if (progress >= 1) {
        loseHeart('💢 혼란이 도시에 닿았어요!')
        setLanes((cur) => cur.map((c, j) => (j === i ? spawnThreat(i) : c)))
        if (target === i) setTarget(null)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now])

  // 클리어 검사
  useEffect(() => {
    if (killed >= goal && status === 'play') {
      setStatus('clear')
      sfx.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [killed])

  const resolve = useCallback(
    (laneIdx: number, correct: boolean) => {
      const lane = lanes[laneIdx]
      if (!lane) return
      onAnswer?.(lane.problem.id, correct)
      sfx[correct ? 'correct' : 'wrong']()
      if (correct) {
        setKillAnim(laneIdx)
        setFlash('hit')
        setTimeout(() => setKillAnim(null), 500)
        setTimeout(() => setFlash(null), 250)
        const newCombo = combo + 1
        setCombo(newCombo)
        setBestCombo((b) => Math.max(b, newCombo))
        setScore((s) => s + 100 + newCombo * 20)
        juice.correct(newCombo, { x: (laneIdx + 0.5) / LANES })
        setKilled((k) => k + 1)
        setFeedback(null)
        setLanes((cur) => cur.map((c, j) => (j === laneIdx ? spawnThreat(laneIdx) : c)))
        setTarget(null)
        setMcqPick([])
      } else {
        // 오답 — 혼란이 베이스 쪽으로 4초만큼 점프 (찍기 방지)
        setFlash('miss')
        setCombo(0)
        setTimeout(() => setFlash(null), 250)
        setFeedback('❌ 아니에요! 혼란이 더 빠르게 다가와요.')
        setLanes((cur) =>
          cur.map((l, j) => (j === laneIdx && l ? { ...l, spawnTime: l.spawnTime - 4000 } : l)),
        )
        setMcqPick([])
      }
    },
    [lanes, combo, spawnThreat, onAnswer],
  )

  const targetThreat = target !== null ? lanes[target] : null
  const targetProblem = targetThreat?.problem

  const restart = () => {
    queueRef.current = []
    setLanes(Array.from({ length: LANES }, (_, i) => spawnThreat(i)))
    setNow(Date.now())
    setTarget(null)
    setHearts(START_HEARTS)
    setKilled(0)
    setCombo(0)
    setBestCombo(0)
    setScore(0)
    setFeedback(null)
    setMcqPick([])
    setKillAnim(null)
    setFlash(null)
    setStatus('play')
  }

  // ── 결과 화면 ──
  if (status === 'clear') {
    return (
      <GameResult
        emoji="🎉"
        title="도시를 지켜냈어요!"
        confetti
        stars={starsFromHearts(hearts, START_HEARTS)}
        lines={[`처치 ${killed}`, `최고 콤보 ${bestCombo}`, `점수 ${score}`]}
        primary={{ label: '완료', onClick: () => onClear({ score, bestCombo, stars: starsFromHearts(hearts, START_HEARTS) }) }}
        secondary={{ label: '다시 하기', onClick: restart }}
      />
    )
  }
  if (status === 'over') {
    return (
      <GameResult
        emoji="🛑"
        title="도시가 혼란에 빠졌어요…"
        lines={[`처치 ${killed} / ${goal}`, '다시 도전해 볼까요?']}
        primary={{ label: '다시 도전', onClick: restart }}
        secondary={{ label: '나가기', onClick: onExit }}
      />
    )
  }

  return (
    <motion.div
      className="min-h-screen px-4 sm:px-6 py-4 max-w-2xl mx-auto flex flex-col relative"
      animate={flash === 'miss' ? { x: [0, -8, 8, -4, 0] } : { x: 0 }}
      transition={{ duration: 0.25 }}
    >
      <JuiceOverlay floaters={juice.floaters} grade={juice.grade} combo={combo} confetti={juice.confetti} />
      <header className="flex items-center justify-between">
        <button onClick={onExit} className="text-white/60 hover:text-white text-sm">← 나가기</button>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-rose-300">{'❤️'.repeat(hearts)}{'🤍'.repeat(Math.max(0, START_HEARTS - hearts))}</span>
        </div>
      </header>

      {/* 상태바 */}
      <div className="mt-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 flex items-center justify-between">
        <div className="text-sm font-bold text-indigo-200">🛡️ {title}</div>
        <div className="text-xs text-white/60 flex gap-3">
          <span>막음 {killed}/{goal}</span>
          <span>콤보 {combo}</span>
          <span>점수 {score}</span>
        </div>
      </div>

      {intro && killed === 0 && (
        <p className="mt-2 text-xs text-white/55 text-center leading-relaxed">{intro}</p>
      )}

      {/* 레인 */}
      <div className="mt-3 space-y-2">
        {lanes.map((lane, i) => {
          const progress = lane ? Math.min(1, (now - lane.spawnTime) / 1000 / advanceSec) : 0
          const isTarget = target === i
          const isKill = killAnim === i
          const enemyIdx = lane ? (lane.uid.charCodeAt(0) + i) % ENEMIES.length : 0
          return (
            <button
              key={i}
              onClick={() => { setTarget(i); setMcqPick([]) }}
              className={`w-full relative h-20 rounded-lg border-2 overflow-hidden text-left transition ${
                isTarget ? 'border-yellow-300 bg-yellow-300/10' : 'border-white/15 bg-black/30 hover:border-white/30'
              }`}
            >
              <div
                className="absolute inset-y-0 left-0 bg-red-500/15"
                style={{ width: `${progress * 100}%` }}
              />
              <AnimatePresence mode="wait">
                {lane && !isKill && (
                  <motion.div
                    key={lane.uid}
                    initial={{ left: '-8%' }}
                    animate={{ left: `${progress * 80 + 4}%` }}
                    exit={{ scale: 0 }}
                    className="absolute top-1/2 -translate-y-1/2 text-3xl"
                    transition={{ duration: 0.12, ease: 'linear' }}
                  >
                    {ENEMIES[enemyIdx]}
                  </motion.div>
                )}
                {isKill && (
                  <motion.div
                    key="boom"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 2, 0] }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-1/2 -translate-y-1/2 text-4xl"
                    style={{ left: `${progress * 80 + 4}%` }}
                  >
                    💥
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="absolute right-1 top-1/2 -translate-y-1/2 text-2xl">🏙️</div>
              <div className="absolute top-1 left-2 text-[10px] text-white/40 font-mono">
                레인 {i + 1} {isTarget && '◀ 조준'}
              </div>
            </button>
          )
        })}
      </div>

      {feedback && (
        <div className="mt-2 p-2 rounded bg-red-500/20 text-red-100 text-sm text-center font-bold">
          {feedback}
        </div>
      )}

      {/* 답 패널 */}
      <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 min-h-[7rem]">
        {!targetProblem ? (
          <div className="text-xs text-white/55 text-center py-6">
            레인을 눌러 조준한 뒤, 알맞은 답으로 혼란을 막아요!
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {targetProblem.scenario && (
              <p className="text-sm text-white/80 leading-relaxed">{targetProblem.scenario}</p>
            )}
            {targetProblem.figure && (
              <div className="rounded-lg border border-dashed border-amber-300/40 bg-amber-300/5 p-2 text-xs text-amber-100/90">
                🖼️ {targetProblem.figure}
              </div>
            )}
            <p className="font-bold text-white">
              {targetProblem.kind === 'ox' ? targetProblem.statement : targetProblem.prompt}
            </p>

            {targetProblem.kind === 'mcq' && !targetProblem.multiple && (
              <div className="grid grid-cols-1 gap-2">
                {targetProblem.choices.map((c, ci) => (
                  <button
                    key={ci}
                    onClick={() => resolve(target!, judgeContent(targetProblem, { kind: 'mcq', values: [ci] }))}
                    className="text-left px-4 py-2.5 rounded-lg bg-gradient-to-br from-indigo-500/25 to-violet-700/25 border border-indigo-400/40 hover:border-yellow-300 hover:scale-[1.02] transition active:scale-95 text-white/90"
                  >
                    <span className="font-bold mr-2">{['①','②','③','④','⑤'][ci] ?? ci + 1}</span>{c}
                  </button>
                ))}
              </div>
            )}

            {targetProblem.kind === 'mcq' && targetProblem.multiple && (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-1 gap-2">
                  {targetProblem.choices.map((c, ci) => {
                    const on = mcqPick.includes(ci)
                    return (
                      <button
                        key={ci}
                        onClick={() => setMcqPick((p) => (on ? p.filter((x) => x !== ci) : [...p, ci]))}
                        className={`text-left px-4 py-2.5 rounded-lg border transition ${
                          on ? 'border-indigo-400 bg-indigo-400/20 text-white' : 'border-white/15 bg-white/5 text-white/85 hover:bg-white/10'
                        }`}
                      >
                        <span className="font-bold mr-2">{['①','②','③','④','⑤'][ci] ?? ci + 1}</span>{c}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => resolve(target!, judgeContent(targetProblem, { kind: 'mcq', values: mcqPick }))}
                  disabled={mcqPick.length === 0}
                  className="px-4 py-2 rounded-lg bg-indigo-500 enabled:hover:bg-indigo-400 disabled:opacity-40 font-bold transition"
                >
                  확인 (여러 개)
                </button>
              </div>
            )}

            {targetProblem.kind === 'ox' && (
              <div className="flex gap-3 justify-center">
                {([true, false] as const).map((v) => (
                  <button
                    key={String(v)}
                    aria-label={v ? '맞음 (O)' : '틀림 (X)'}
                    onClick={() => resolve(target!, judgeContent(targetProblem, { kind: 'ox', value: v }))}
                    className="w-20 h-20 rounded-2xl text-3xl font-black border-2 border-white/20 bg-white/5 hover:bg-white/10 hover:border-yellow-300 transition active:scale-95"
                  >
                    {v ? '⭕' : '❌'}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
