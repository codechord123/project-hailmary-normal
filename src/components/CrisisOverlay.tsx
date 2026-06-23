import { motion } from 'framer-motion'

interface Props {
  active: boolean
}

export function CrisisOverlay({ active }: Props) {
  if (!active) return null
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.5, 0.9, 0.5] }}
      transition={{ repeat: Infinity, duration: 1.6 }}
      className="pointer-events-none fixed inset-0 z-40"
      style={{
        boxShadow: 'inset 0 0 120px 30px rgba(239, 68, 68, 0.55)',
      }}
    />
  )
}
