import { motion } from 'framer-motion'

interface Props {
  speaker: string
  text: string
  tone?: 'rocky' | 'narrator' | 'system'
}

export function DialogueBox({ speaker, text, tone = 'narrator' }: Props) {
  const color =
    tone === 'rocky'
      ? 'border-rocky/60 text-rocky'
      : tone === 'system'
        ? 'border-space-accent text-space-accent'
        : 'border-white/40 text-white'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-l-4 ${color} bg-black/30 rounded-r-lg p-4`}
    >
      <div className="text-xs uppercase tracking-wider opacity-70 mb-1">{speaker}</div>
      <div className="text-base text-white leading-relaxed">{text}</div>
    </motion.div>
  )
}
