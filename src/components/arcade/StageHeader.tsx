interface Props {
  stage: string // 예: "STAGE 3-1"
  subtitle?: string
  combo: number
  score: number
}

export function StageHeader({ stage, subtitle, combo, score }: Props) {
  return (
    <div className="w-full p-2 rounded-md bg-black/60 border-2 border-yellow-300/60 font-mono">
      <div className="flex items-center justify-between">
        <div className="text-yellow-300 text-sm tracking-widest font-bold">
          ▌{stage}
        </div>
        <div className="flex gap-3 text-xs">
          <span className="text-pink-300">
            COMBO <span className="text-white font-bold">×{combo}</span>
          </span>
          <span className="text-cyan-300">
            SCORE <span className="text-white font-bold">{score.toString().padStart(6, '0')}</span>
          </span>
        </div>
      </div>
      {subtitle && (
        <div className="text-[10px] text-white/70 tracking-wider mt-0.5">{subtitle}</div>
      )}
    </div>
  )
}
