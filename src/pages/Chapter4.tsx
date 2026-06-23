import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { chapter4Targets, chapter4Expected, LANE_ADVANCE_SEC, type DefenseTarget } from '@/data/chapter4'
import { buildFractionChoices } from '@/lib/choiceGen'
import { ResourceBar } from '@/components/ResourceBar'
import { LevelBadge } from '@/components/LevelBadge'
import { StageHeader } from '@/components/arcade/StageHeader'
import { ScreenShake } from '@/components/arcade/ScreenShake'
import { useChapterRun } from '@/hooks/useChapterRun'
import { valueEquals, simplify } from '@/lib/fractionMath'
import { sfx } from '@/lib/sfx'
import { NotebookOverlay } from '@/components/NotebookOverlay'
import { StoryOverlay } from '@/components/StoryOverlay'
import { STORY } from '@/data/story'
import { playBgm, stop as stopBgm } from '@/lib/bgm'
import { BonusProblemOverlay } from '@/components/BonusProblemOverlay'
import { pickBonusProblem } from '@/data/bonusProblems'
import { GradeFlash, gradeFor, type Grade } from '@/components/arcade/GradeFlash'
import { RoundIntro } from '@/components/arcade/RoundIntro'
import type { Fraction } from '@/types/fraction'

interface ActiveLane {
  laneIdx: number
  target: DefenseTarget
  /** 화면 좌측에서 출발 (0) → 우측 베이스 (1) */
  spawnTime: number
}

const KILLS_TO_CLEAR = 9

export function Chapter4() {
  const [lanes, setLanes] = useState<(ActiveLane | null)[]>([null, null, null])
  const [targetIdx, setTargetIdx] = useState<number | null>(null)
  // 레인별 카드 4개 (정답 1 + 오답 3, 셔플)
  const [laneChoices, setLaneChoices] = useState<Record<string, Fraction[]>>({})
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'simplify' | 'breach'>('idle')
  const [shake, setShake] = useState(0)
  const [killed, setKilled] = useState(0)
  const [killAnim, setKillAnim] = useState<number | null>(null)
  const queueRef = useRef<DefenseTarget[]>([...chapter4Targets])
  const [tick, setTick] = useState(0)
  const run = useChapterRun({ chapterId: 4, maxScore: KILLS_TO_CLEAR * 500 })
  const bonus = useMemo(() => pickBonusProblem(4), [])

  // 매 200ms tick (적의 진행도 계산용)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 200)
    return () => clearInterval(id)
  }, [])

  // 초기 스폰 + BGM
  useEffect(() => {
    setLanes((ls) => ls.map((_, i) => spawnLane(i, queueRef)))
    playBgm('chapter4')
    return () => stopBgm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 진행도 검사 — 적이 베이스 도달
  useEffect(() => {
    lanes.forEach((l, i) => {
      if (!l) return
      const progress = (Date.now() - l.spawnTime) / 1000 / LANE_ADVANCE_SEC
      if (progress >= 1) {
        // 베이스 침투
        run.onTimeout(15)
        setShake((s) => s + 1)
        setFeedback('breach')
        setLanes((cur) => cur.map((c, j) => (j === i ? spawnLane(i, queueRef) : c)))
        setTimeout(() => setFeedback('idle'), 1200)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick])

  // 산소 0
  useEffect(() => {
    if (run.isDead) {
      run.store.resetForChapter()
      setKilled(0)
      queueRef.current = [...chapter4Targets]
      setLanes((ls) => ls.map((_, i) => spawnLane(i, queueRef)))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.isDead])

  const [showBonus, setShowBonus] = useState(false)
  const [showNotebook, setShowNotebook] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const [grade, setGrade] = useState<Grade>(null)
  const [showRoundIntro, setShowRoundIntro] = useState(true)
  // 클리어 체크
  useEffect(() => {
    if (killed >= KILLS_TO_CLEAR) {
      setShowBonus(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [killed])

  // 레인별 카드 자동 생성 (적이 바뀔 때마다)
  useEffect(() => {
    setLaneChoices((cur) => {
      const next = { ...cur }
      lanes.forEach((lane) => {
        if (lane && !next[lane.target.id]) {
          const correct = simplify(chapter4Expected(lane.target))
          next[lane.target.id] = buildFractionChoices(correct)
        }
      })
      return next
    })
  }, [lanes])

  const chooseCard = useCallback((laneIdx: number, choice: Fraction) => {
    const lane = lanes[laneIdx]
    if (!lane) return
    const expected = chapter4Expected(lane.target)
    if (!valueEquals(choice, expected)) {
      // 오답 시 산소 차감 ↑↑ + 적이 8초만큼 베이스 쪽으로 점프 (찍기 방지)
      run.onWrong(18)
      setFeedback('wrong')
      setShake((s) => s + 1)
      setLanes((cur) =>
        cur.map((l, j) =>
          j === laneIdx && l
            ? { ...l, spawnTime: l.spawnTime - 8000 }
            : l,
        ),
      )
      return
    }
    // 처치
    sfx.crit()
    setKillAnim(laneIdx)
    setTimeout(() => setKillAnim(null), 600)
    const crit = run.combo >= 3
    run.onCorrect({ xpBase: 28, scoreGain: 350, crit, difficulty: 2 })
    const g = gradeFor(run.combo + 1, crit)
    setGrade(g)
    setTimeout(() => setGrade(null), 700)
    setKilled((k) => k + 1)
    setLanes((cur) => cur.map((c, j) => (j === laneIdx ? spawnLane(laneIdx, queueRef) : c)))
    setTargetIdx(null)
    setFeedback('idle')
  }, [lanes, run])

  return (
    <div className="min-h-screen px-4 sm:px-6 py-4 max-w-2xl mx-auto flex flex-col">
      <ScreenShake shake={shake}>
        <header className="flex items-center justify-between">
          <Link to="/chapters" className="text-white/60 hover:text-white text-sm">
            ← 챕터 선택
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowNotebook(true)} className="px-2 py-1 rounded bg-amber-400/20 text-amber-200 border border-amber-300/40 text-xs">📝 노트</button>
            <LevelBadge compact />
          </div>
        </header>

        <StageHeader
          stage={`STAGE 4 · DEFENSE`}
          subtitle={`첫 만남 — 다른 분모 덧셈 디펜스 (${killed}/${KILLS_TO_CLEAR})`}
          combo={run.combo}
          score={run.score}
        />
        <ResourceBar />

        {/* 3 레인 */}
        <div className="mt-3 space-y-2">
          {lanes.map((lane, i) => {
            const progress = lane ? Math.min(1, (Date.now() - lane.spawnTime) / 1000 / LANE_ADVANCE_SEC) : 0
            const isTarget = targetIdx === i
            const isKill = killAnim === i
            return (
              <button
                key={i}
                onClick={() => setTargetIdx(i)}
                className={`w-full relative h-20 rounded-lg border-2 overflow-hidden text-left transition ${
                  isTarget
                    ? 'border-yellow-300 bg-yellow-300/10'
                    : 'border-white/15 bg-black/30 hover:border-white/30'
                }`}
              >
                {/* 베이스 게이지 */}
                <div
                  className="absolute inset-y-0 left-0 bg-red-500/20"
                  style={{ width: `${progress * 100}%` }}
                />
                {/* 적 */}
                <AnimatePresence mode="wait">
                  {lane && !isKill && (
                    <motion.div
                      key={lane.target.id}
                      initial={{ left: '-10%' }}
                      animate={{ left: `${progress * 80 + 5}%` }}
                      exit={{ scale: 0 }}
                      className="absolute top-1/2 -translate-y-1/2 flex items-center gap-2"
                      transition={{ duration: 0.2, ease: 'linear' }}
                    >
                      <div className="text-3xl">{lane.target.enemy}</div>
                      <div className="px-2 py-0.5 rounded bg-black/70 text-xs text-white font-mono">
                        ? + ?
                      </div>
                    </motion.div>
                  )}
                  {isKill && (
                    <motion.div
                      key="boom"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 2, 0] }}
                      transition={{ duration: 0.5 }}
                      className="absolute top-1/2 -translate-y-1/2 text-4xl"
                      style={{ left: `${progress * 80 + 5}%` }}
                    >
                      💥
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* 베이스 */}
                <div className="absolute right-1 top-1/2 -translate-y-1/2 text-2xl">🛡</div>
                <div className="absolute top-1 left-2 text-[10px] text-white/40 font-mono">
                  LANE {i + 1} {isTarget && '◀ 조준'}
                </div>
              </button>
            )
          })}
        </div>

        {/* 피드백 */}
        {feedback === 'wrong' && (
          <div className="mt-2 p-2 rounded bg-red-500/20 text-red-200 text-sm text-center font-bold">
            ❌ 오답! 산소 -18, 적이 8초만큼 베이스로 점프했어. (찍기 금지!)
          </div>
        )}
        {feedback === 'simplify' && (
          <div className="mt-2 p-2 rounded bg-yellow-500/20 text-yellow-200 text-xs text-center">
            🤏 기약분수로! (산소 -4)
          </div>
        )}
        {feedback === 'breach' && (
          <div className="mt-2 p-2 rounded bg-red-700/40 text-red-100 text-xs text-center font-bold">
            💢 베이스 침투! (산소 -15)
          </div>
        )}

        {/* 4지선다 카드 */}
        <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="text-xs text-white/60 text-center mb-2">
            {targetIdx === null
              ? '레인 선택 → 정답 카드 탭'
              : `LANE ${targetIdx + 1} — 합한 분수를 골라`}
          </div>
          {targetIdx !== null && lanes[targetIdx]?.target.story && (
            <div className="mb-3 p-2 rounded-lg bg-amber-400/10 border border-amber-300/30 text-sm text-amber-100 leading-relaxed">
              📖 {lanes[targetIdx]!.target.story}
            </div>
          )}
          {targetIdx !== null && lanes[targetIdx] && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(laneChoices[lanes[targetIdx]!.target.id] ?? []).map((c, i) => (
                <button
                  key={i}
                  onClick={() => chooseCard(targetIdx, c)}
                  className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-700/30 border-2 border-cyan-400/40 hover:border-yellow-300 hover:scale-105 transition active:scale-95"
                >
                  <div className="text-2xl text-white font-mono font-bold">
                    <span className="inline-flex flex-col items-center">
                      <span>{c.numerator}</span>
                      <span className="border-t-2 border-white w-6 my-0.5" />
                      <span>{c.denominator}</span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScreenShake>

      {showBonus && (
        <BonusProblemOverlay chapterId={4}
          problem={bonus}
          onPass={() => run.finish()}
          onFail={() => run.store.addOxygen(-5)}
        />
      )}
      <NotebookOverlay open={showNotebook} onClose={() => setShowNotebook(false)} />
      {showIntro && <StoryOverlay lines={STORY[4].intro} onClose={() => setShowIntro(false)} />}
      <GradeFlash grade={grade} combo={run.combo} />
      <RoundIntro show={showRoundIntro} title="STAGE 4 — 첫 만남" subtitle="외계 함대 접근 중" onFinished={() => setShowRoundIntro(false)} />
    </div>
  )
}

function spawnLane(laneIdx: number, queueRef: React.MutableRefObject<DefenseTarget[]>): ActiveLane {
  if (queueRef.current.length === 0) queueRef.current = [...chapter4Targets]
  const t = queueRef.current[Math.floor(Math.random() * queueRef.current.length)]
  queueRef.current = queueRef.current.filter((x) => x.id !== t.id)
  return { laneIdx, target: { ...t, id: `${t.id}-${Date.now()}-${laneIdx}` }, spawnTime: Date.now() }
}
