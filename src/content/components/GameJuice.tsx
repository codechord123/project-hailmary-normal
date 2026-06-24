import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DamageFloater, type DamageNumber } from '@/components/arcade/DamageFloater'
import { GradeFlash, gradeFor, type Grade } from '@/components/arcade/GradeFlash'

/**
 * 공용 게임 연출 훅 — 콘텐츠 미니게임들이 공유하는 타격감.
 * correct(combo): 데미지 숫자 + 등급 플래시 + 색종이(콘페티) 폭발
 * wrong(): 화면 흔들기 카운터 증가 (ScreenShake 와 함께 사용)
 */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface Confetto { id: number; cx: number; dx: number; dy: number; rot: number; color: string }

const CONFETTI_COLORS = ['#fde047', '#34d399', '#60a5fa', '#f472b6', '#fb923c', '#a78bfa']

export function useGameJuice() {
  const [shake, setShake] = useState(0)
  const [grade, setGrade] = useState<Grade>(null)
  const [floaters, setFloaters] = useState<DamageNumber[]>([])
  const [confetti, setConfetti] = useState<Confetto[]>([])
  const idRef = useRef(0)

  const correct = useCallback(
    (combo: number, opts?: { x?: number; amount?: number; crit?: boolean }) => {
      if (prefersReducedMotion()) return
      const id = ++idRef.current
      const crit = opts?.crit ?? combo >= 4
      const amount = opts?.amount ?? 10 + combo * 2
      const x = opts?.x ?? 0.5
      // 동시 표시 상한(메모리/성능 방어): 최근 6개만 유지
      setFloaters((f) => [...f.slice(-5), { id, amount, type: crit ? 'crit' : 'normal', x }])
      setTimeout(() => setFloaters((f) => f.filter((n) => n.id !== id)), 900)
      setGrade(gradeFor(combo, crit))
      setTimeout(() => setGrade(null), 700)
      // 콘페티 폭발 — 콤보가 높을수록 더 많이
      const n = Math.min(26, 10 + combo * 2)
      const batch: Confetto[] = Array.from({ length: n }, () => {
        const cid = ++idRef.current
        const ang = Math.random() * Math.PI * 2
        const dist = 60 + Math.random() * 120
        return {
          id: cid, cx: x,
          dx: Math.cos(ang) * dist,
          dy: Math.sin(ang) * dist - 40,
          rot: (Math.random() - 0.5) * 540,
          color: CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0],
        }
      })
      setConfetti((c) => [...c.slice(-40), ...batch])
      const ids = new Set(batch.map((b) => b.id))
      setTimeout(() => setConfetti((c) => c.filter((p) => !ids.has(p.id))), 950)
    },
    [],
  )

  const wrong = useCallback(() => setShake((s) => s + 1), [])

  return { shake, grade, floaters, confetti, correct, wrong }
}

/** 연출 오버레이 — relative 컨테이너 안에 떨어뜨려 사용 */
export function JuiceOverlay({
  floaters, grade, combo, confetti,
}: {
  floaters: DamageNumber[]
  grade: Grade
  combo: number
  confetti?: Confetto[]
}) {
  return (
    <div aria-hidden className="contents">
      <DamageFloater numbers={floaters} />
      <GradeFlash grade={grade} combo={combo} />
      {confetti && confetti.length > 0 && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          <AnimatePresence>
            {confetti.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
                animate={{ opacity: 0, scale: 0.5, x: c.dx, y: c.dy, rotate: c.rot }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="absolute w-2 h-2 rounded-[1px]"
                style={{ left: `${c.cx * 100}%`, top: '42%', background: c.color }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
