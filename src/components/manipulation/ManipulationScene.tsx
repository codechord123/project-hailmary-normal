import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import type { Fraction } from '@/types/fraction'
import { lcm } from '@/lib/fractionMath'
import { SCENE_THEMES, type SceneThemeId } from './themes'

interface Particle {
  id: number
  x: number
  y: number
  color: string
}

interface Props {
  a: Fraction
  b: Fraction
  themeId: SceneThemeId
  /** problem.id 변경 시 셀 초기화 */
  resetKey: string
  /** 학생이 모든 셀을 결과로 옮겼을 때 호출 — 답 자동 제안 */
  onComplete?: (combined: Fraction) => void
  /** 셀이 결과로 이동/이탈할 때 — sfx 트리거용 */
  onTransfer?: () => void
}

type Slot = 'A' | 'B' | 'result'
interface Cell {
  id: string
  origin: 'A' | 'B'
  slot: Slot
  /** 통분 시 이 셀 1개가 결과에서 차지하는 칸 수 (= LCM / 원래 분모) */
  factor: number
}

export function ManipulationScene({ a, b, themeId, resetKey, onComplete, onTransfer }: Props) {
  const theme = SCENE_THEMES[themeId]
  // 통분: 공통분모 = 두 분모의 최소공배수
  const common = lcm(a.denominator, b.denominator)
  const fA = common / a.denominator
  const fB = common / b.denominator
  const needsConvert = fA !== 1 || fB !== 1

  const initialCells = useMemo<Cell[]>(() => {
    const out: Cell[] = []
    for (let i = 0; i < a.numerator; i++) out.push({ id: `a-${i}`, origin: 'A', slot: 'A', factor: fA })
    for (let i = 0; i < b.numerator; i++) out.push({ id: `b-${i}`, origin: 'B', slot: 'B', factor: fB })
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  const [cells, setCells] = useState<Cell[]>(initialCells)
  const [particles, setParticles] = useState<Particle[]>([])
  const particleIdRef = useRef(0)
  const completedRef = useRef(false)

  const burstParticles = () => {
    const id = ++particleIdRef.current
    const batch: Particle[] = Array.from({ length: 4 }).map((_, i) => ({
      id: id * 10 + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: theme.particleColor,
    }))
    setParticles((ps) => [...ps, ...batch])
    setTimeout(() => {
      setParticles((ps) => ps.filter((p) => !batch.some((b) => b.id === p.id)))
    }, 700)
  }

  useEffect(() => {
    setCells(initialCells)
    completedRef.current = false
  }, [initialCells])

  const inA = cells.filter((c) => c.slot === 'A')
  const inB = cells.filter((c) => c.slot === 'B')
  const inResult = cells.filter((c) => c.slot === 'result')

  const totalCells = cells.length
  const resultUnits = inResult.reduce((s, c) => s + c.factor, 0)

  useEffect(() => {
    if (inResult.length === totalCells && totalCells > 0 && !completedRef.current) {
      completedRef.current = true
      onComplete?.({ numerator: resultUnits, denominator: common })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inResult.length, totalCells])

  const transfer = (id: string) => {
    setCells((cs) => cs.map((c) => (c.id === id ? { ...c, slot: 'result' } : c)))
    onTransfer?.()
    burstParticles()
  }

  const sendBack = (id: string) => {
    setCells((cs) => cs.map((c) => (c.id === id ? { ...c, slot: c.origin } : c)))
    onTransfer?.()
    completedRef.current = false
  }

  const resetAll = () => {
    setCells(initialCells)
    completedRef.current = false
  }

  return (
    <div className={`relative w-full p-3 rounded-2xl bg-gradient-to-b ${theme.bgGradient}`}>
      {/* 전송 파티클 */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ left: `${p.x}%`, top: `${p.y}%`, opacity: 1, scale: 1 }}
            animate={{ top: `${p.y - 30}%`, opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
            style={{ backgroundColor: p.color, boxShadow: `0 0 6px ${p.color}` }}
          />
        ))}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-white/60">손가락으로 셀을 옮겨 합쳐봐 👆</div>
        <button
          onClick={resetAll}
          className="text-xs px-2 py-1 rounded bg-white/10 text-white/70 hover:bg-white/20"
        >
          ↺ 다시 배치
        </button>
      </div>

      {/* 통분 안내 — 분모가 다를 때 */}
      {needsConvert && (
        <div className="mb-2 p-2 rounded-lg bg-indigo-500/15 border border-indigo-400/40 text-[11px] text-indigo-100 text-center leading-relaxed">
          🔄 <b>통분</b>: 공통분모를 <b>{common}</b>로 맞췄어!
          <br />
          {fA > 1 && <>A의 1칸 = 결과 <b>{fA}칸</b> </>}
          {fB > 1 && <>· B의 1칸 = 결과 <b>{fB}칸</b></>}
        </div>
      )}

      <LayoutGroup>
        {/* 결과 컨테이너 (위) */}
        <Container
          label={theme.labelResult}
          subLabel={`${resultUnits} / ${common}`}
          theme={theme}
          isResult
          highlight={inResult.length === totalCells}
        >
          <AnimatePresence>
            {inResult.map((cell) => (
              <ResultGroup key={cell.id} cell={cell} theme={theme} onTap={() => sendBack(cell.id)} />
            ))}
            {Array.from({ length: Math.max(0, common - resultUnits) }).map((_, i) => (
              <EmptySlot key={`r-empty-${i}`} theme={theme} />
            ))}
          </AnimatePresence>
        </Container>

        {/* 소스 두 개 (아래) */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Container
            label={`${theme.labelA} (분모 ${a.denominator})`}
            subLabel={`${inA.length} / ${a.numerator} 남음`}
            theme={theme}
          >
            <AnimatePresence>
              {inA.map((cell) => (
                <CellChip key={cell.id} cell={cell} theme={theme} onTap={() => transfer(cell.id)} />
              ))}
              {Array.from({ length: Math.max(0, a.numerator - inA.length) }).map((_, i) => (
                <EmptySlot key={`a-empty-${i}`} theme={theme} />
              ))}
            </AnimatePresence>
          </Container>

          <Container
            label={`${theme.labelB} (분모 ${b.denominator})`}
            subLabel={`${inB.length} / ${b.numerator} 남음`}
            theme={theme}
          >
            <AnimatePresence>
              {inB.map((cell) => (
                <CellChip key={cell.id} cell={cell} theme={theme} onTap={() => transfer(cell.id)} />
              ))}
              {Array.from({ length: Math.max(0, b.numerator - inB.length) }).map((_, i) => (
                <EmptySlot key={`b-empty-${i}`} theme={theme} />
              ))}
            </AnimatePresence>
          </Container>
        </div>
      </LayoutGroup>
    </div>
  )
}

function Container({
  label,
  subLabel,
  theme,
  children,
  isResult,
  highlight,
}: {
  label: string
  subLabel: string
  theme: ReturnType<typeof getTheme>
  children: React.ReactNode
  isResult?: boolean
  highlight?: boolean
}) {
  return (
    <motion.div
      animate={highlight ? { scale: [1, 1.03, 1] } : {}}
      transition={{ duration: 0.5, repeat: highlight ? Infinity : 0, repeatType: 'reverse' }}
      className={`relative p-2 sm:p-3 border-2 ${theme.containerClass} ${theme.containerRounded} ${
        isResult ? 'min-h-[88px]' : 'min-h-[72px]'
      }`}
    >
      <div className="flex items-center justify-between mb-1 gap-1">
        <div className="text-[10px] sm:text-xs font-semibold text-white/80">{label}</div>
        <div className="text-[10px] text-white/50 whitespace-nowrap">{subLabel}</div>
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </motion.div>
  )
}

/** 결과에 들어간 셀 — 통분되어 factor칸으로 확장 표시 */
function ResultGroup({
  cell,
  theme,
  onTap,
}: {
  cell: Cell
  theme: ReturnType<typeof getTheme>
  onTap: () => void
}) {
  const shapeClass =
    theme.cellShape === 'circle' || theme.cellShape === 'pill' ? 'rounded-full' : 'rounded-md'
  return (
    <motion.button
      layoutId={cell.id}
      onClick={onTap}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 360, damping: 24 }}
      className={`flex gap-0.5 p-0.5 ${cell.factor > 1 ? 'ring-1 ring-white/30 rounded-md' : ''}`}
      aria-label={`${cell.origin} 셀 (결과 ${cell.factor}칸)`}
    >
      {Array.from({ length: cell.factor }).map((_, i) => (
        <span
          key={i}
          className={`${theme.cellColor} ${theme.cellGlow} ${shapeClass} w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs`}
        >
          <span className="select-none">{theme.cellIcon}</span>
        </span>
      ))}
    </motion.button>
  )
}

function CellChip({
  cell,
  theme,
  onTap,
}: {
  cell: Cell
  theme: ReturnType<typeof getTheme>
  onTap: () => void
}) {
  const shapeClass =
    theme.cellShape === 'circle'
      ? 'rounded-full'
      : theme.cellShape === 'pill'
        ? 'rounded-full'
        : theme.cellShape === 'hex'
          ? 'rounded-md rotate-3'
          : 'rounded-md'
  return (
    <motion.button
      layoutId={cell.id}
      onClick={onTap}
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: 1.08 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 360, damping: 24 }}
      className={`relative ${theme.cellColor} ${theme.cellGlow} ${shapeClass} w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-sm`}
      aria-label={`${cell.origin} 셀`}
    >
      <span className="select-none">{theme.cellIcon}</span>
      {cell.factor > 1 && (
        <span className="absolute -top-1 -right-1 bg-white text-space-900 text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
          ×{cell.factor}
        </span>
      )}
    </motion.button>
  )
}

function EmptySlot({ theme }: { theme: ReturnType<typeof getTheme> }) {
  const shapeClass =
    theme.cellShape === 'circle' || theme.cellShape === 'pill' ? 'rounded-full' : 'rounded-md'
  return (
    <div className={`w-7 h-7 sm:w-8 sm:h-8 border border-dashed border-white/15 ${shapeClass}`} />
  )
}

// 타입 헬퍼 (Container/CellChip 시그니처용)
function getTheme(_id: SceneThemeId) {
  return SCENE_THEMES.oxygen
}
