import { motion, useAnimationControls } from 'framer-motion'
import { useEffect, type ReactNode } from 'react'

interface Props {
  shake: number // 증가할 때마다 흔들림 1회 재생 (값 자체는 무의미)
  children: ReactNode
  intensity?: number
}

/**
 * 화면 흔들림 래퍼 — shake 값이 증가하면 한 번 흔든다.
 * key 리마운트 대신 애니메이션 컨트롤을 써서 자식 트리를 보존한다
 * (드래그/입력 상태가 초기화되지 않음).
 */
export function ScreenShake({ shake, children, intensity = 8 }: Props) {
  const controls = useAnimationControls()
  useEffect(() => {
    if (shake > 0) {
      controls.start({
        x: [0, -intensity, intensity, -intensity * 0.6, intensity * 0.6, 0],
        transition: { duration: 0.35 },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shake])
  return <motion.div animate={controls}>{children}</motion.div>
}
