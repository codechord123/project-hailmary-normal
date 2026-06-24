import { useCallback, useRef, useState } from 'react'
import { DamageFloater, type DamageNumber } from '@/components/arcade/DamageFloater'
import { GradeFlash, gradeFor, type Grade } from '@/components/arcade/GradeFlash'

/**
 * 공용 게임 연출 훅 — 콘텐츠 미니게임 6종이 공유하는 타격감.
 * correct(combo): 데미지 숫자 + PERFECT/GREAT 등급 플래시
 * wrong(): 화면 흔들기 카운터 증가 (ScreenShake 와 함께 사용)
 */
export function useGameJuice() {
  const [shake, setShake] = useState(0)
  const [grade, setGrade] = useState<Grade>(null)
  const [floaters, setFloaters] = useState<DamageNumber[]>([])
  const idRef = useRef(0)

  const correct = useCallback(
    (combo: number, opts?: { x?: number; amount?: number; crit?: boolean }) => {
      const id = ++idRef.current
      const crit = opts?.crit ?? combo >= 4
      const amount = opts?.amount ?? 10 + combo * 2
      // 동시 표시 상한(메모리/성능 방어): 최근 6개만 유지
      setFloaters((f) => [...f.slice(-5), { id, amount, type: crit ? 'crit' : 'normal', x: opts?.x ?? 0.5 }])
      setTimeout(() => setFloaters((f) => f.filter((n) => n.id !== id)), 900)
      setGrade(gradeFor(combo, crit))
      setTimeout(() => setGrade(null), 700)
    },
    [],
  )

  const wrong = useCallback(() => setShake((s) => s + 1), [])

  return { shake, grade, floaters, correct, wrong }
}

/** 연출 오버레이 — relative 컨테이너 안에 떨어뜨려 사용 */
export function JuiceOverlay({
  floaters, grade, combo,
}: {
  floaters: DamageNumber[]
  grade: Grade
  combo: number
}) {
  return (
    <>
      <DamageFloater numbers={floaters} />
      <GradeFlash grade={grade} combo={combo} />
    </>
  )
}
