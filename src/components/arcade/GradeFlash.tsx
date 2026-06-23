import { motion, AnimatePresence } from 'framer-motion'

export type Grade = 'PERFECT' | 'GREAT' | 'GOOD' | null

const STYLE: Record<NonNullable<Grade>, { color: string; bg: string; shadow: string; size: string }> = {
  PERFECT: {
    color: 'text-yellow-300',
    bg: 'from-yellow-400 via-orange-400 to-red-500',
    shadow: 'drop-shadow-[4px_4px_0_rgba(0,0,0,0.7)]',
    size: 'text-6xl sm:text-7xl',
  },
  GREAT: {
    color: 'text-cyan-200',
    bg: 'from-cyan-300 via-blue-400 to-purple-500',
    shadow: 'drop-shadow-[3px_3px_0_rgba(0,0,0,0.6)]',
    size: 'text-5xl sm:text-6xl',
  },
  GOOD: {
    color: 'text-emerald-200',
    bg: 'from-emerald-300 via-green-400 to-teal-500',
    shadow: 'drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]',
    size: 'text-4xl sm:text-5xl',
  },
}

interface Props {
  grade: Grade
  combo?: number
}

export function GradeFlash({ grade, combo }: Props) {
  return (
    <AnimatePresence>
      {grade && (
        <motion.div
          key={`${grade}-${combo}`}
          initial={{ scale: 0, rotate: -20, opacity: 0 }}
          animate={{ scale: [0, 1.4, 1], rotate: [-20, 5, 0], opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.4, repeat: 2 }}
              className={`font-black font-mono ${STYLE[grade].size} ${STYLE[grade].shadow} bg-gradient-to-br ${STYLE[grade].bg} bg-clip-text text-transparent`}
              style={{ WebkitTextStroke: '2px black' } as any}
            >
              {grade}!
            </motion.div>
            {combo && combo >= 2 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="mt-1 font-mono text-2xl font-black text-pink-300 drop-shadow-[2px_2px_0_rgba(0,0,0,0.6)]"
                style={{ WebkitTextStroke: '1px black' } as any}
              >
                ×{combo} COMBO!
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** 정답 시 콤보·크리티컬 기반으로 등급 산정 */
export const gradeFor = (combo: number, isCrit: boolean): Grade => {
  if (isCrit) return 'PERFECT'
  if (combo >= 3) return 'GREAT'
  return 'GOOD'
}
