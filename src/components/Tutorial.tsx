import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'

const KEY_PREFIX = 'hailmary-tutorial-seen'
const seenKey = (name: string) => `${KEY_PREFIX}-${name || '__guest__'}`

interface Slide {
  emoji: string
  title: string
  body: string
}

const SLIDES: Slide[] = [
  {
    emoji: '🚀',
    title: '환영합니다, 항해사!',
    body: '헤일메리호의 마지막 항해사가 되어 분수의 비밀을 풀고 지구를 구해보자.',
  },
  {
    emoji: '🤲',
    title: '7개의 챕터',
    body: '각 챕터는 다른 미니게임으로 분수 계산을 배워요. 조작, 슈팅, 디펜스, 보스전, 매칭, 리액터… 챕터마다 새로운 도전이!',
  },
  {
    emoji: '🎮',
    title: '도전 모드',
    body: '오늘의 챌린지(매일 새 문제), 끝없는 항해(엔들리스), 상점, 항해 일지, 오답 노트, 업적까지 — 다양한 학습 도구가 준비돼 있어요.',
  },
  {
    emoji: '📝',
    title: '오답 노트',
    body: '틀린 문제는 자동으로 오답 노트에 모여요. 다시 풀어보고 "해결"로 체크해서 진짜 내 것으로 만들자!',
  },
  {
    emoji: '🧲',
    title: '아이템 활용',
    body: '챕터에서 받은 아이템을 잘 활용해. 보호막, 시간 정지, 자석(정답 표시), 폭탄… 위기 상황을 돌파하는 열쇠야!',
  },
]

interface Props {
  forceShow?: boolean
  onClose?: () => void
}

export function Tutorial({ forceShow, onClose }: Props) {
  const studentName = useGameStore((s) => s.studentName)
  const [open, setOpen] = useState(false)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (forceShow) {
      setOpen(true)
      return
    }
    try {
      // 학생별로 \"본 적 있음\" 기록 — 새 학생이 로그인하면 다시 등장.
      const seen = localStorage.getItem(seenKey(studentName))
      if (!seen) setOpen(true)
    } catch {
      /* ignore */
    }
  }, [forceShow, studentName])

  const close = () => {
    try {
      localStorage.setItem(seenKey(studentName), '1')
    } catch {
      /* ignore */
    }
    setOpen(false)
    onClose?.()
  }

  if (!open) return null
  const slide = SLIDES[idx]
  const isLast = idx === SLIDES.length - 1

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[55] flex items-center justify-center px-6 bg-black/80 backdrop-blur"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-900 border-2 border-yellow-300/40 shadow-2xl"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
          >
            <div className="text-6xl text-center">{slide.emoji}</div>
            <h3 className="mt-3 text-xl font-bold text-yellow-200 text-center">{slide.title}</h3>
            <p className="mt-2 text-white/90 text-sm leading-relaxed text-center">{slide.body}</p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-5 flex justify-center gap-1.5">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition ${
                i === idx ? 'bg-yellow-300' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          {idx > 0 && (
            <button
              onClick={() => setIdx((i) => i - 1)}
              className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 text-sm"
            >
              ← 이전
            </button>
          )}
          <button
            onClick={isLast ? close : () => setIdx((i) => i + 1)}
            className="flex-1 px-4 py-2 rounded-xl bg-yellow-400 text-space-900 font-bold text-sm"
          >
            {isLast ? '시작!' : '다음 →'}
          </button>
        </div>
        {!isLast && (
          <button
            onClick={close}
            className="mt-2 w-full text-xs text-white/40 hover:text-white/70"
          >
            건너뛰기
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}
