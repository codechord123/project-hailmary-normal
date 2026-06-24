import { ConfettiBurst } from '@/components/ConfettiBurst'

interface Action {
  label: string
  onClick: () => void
}

/**
 * 공용 결과 화면 — 콘텐츠 미니게임의 클리어/실패 화면을 통일.
 * stars 가 있으면 별점, confetti 가 true면 축하 컨페티 표시.
 */
export function GameResult({
  emoji, title, stars, lines, confetti, primary, secondary,
}: {
  emoji: string
  title: string
  stars?: number
  lines: string[]
  confetti?: boolean
  primary: Action
  secondary: Action
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center">
      {confetti && <ConfettiBurst show />}
      <div className="text-6xl">{emoji}</div>
      <h1 className="text-2xl font-black text-white">{title}</h1>
      {stars != null && (
        <div className="text-amber-300 text-2xl" aria-label={`별 ${stars}개`}>
          {'★'.repeat(stars)}<span className="text-white/20">{'★'.repeat(Math.max(0, 3 - stars))}</span>
        </div>
      )}
      <div className="text-white/70 flex flex-col gap-1">
        {lines.map((l, i) => <span key={i}>{l}</span>)}
      </div>
      <div className="flex gap-3">
        <button onClick={primary.onClick} className="px-6 py-3 rounded-xl font-bold bg-indigo-500 hover:bg-indigo-400 transition">{primary.label}</button>
        <button onClick={secondary.onClick} className="px-6 py-3 rounded-xl font-bold bg-white/10 hover:bg-white/20 transition">{secondary.label}</button>
      </div>
    </div>
  )
}
