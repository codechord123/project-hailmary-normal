import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Props {
  open: boolean
  onClose: () => void
}

const COLORS = ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#ffffff', '#000000']

export function NotebookOverlay({ open, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const [color, setColor] = useState('#fbbf24')
  const [size, setSize] = useState(3)
  const [erase, setErase] = useState(false)

  useEffect(() => {
    if (!open) return
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    // Resize to display size (devicePixelRatio aware)
    const dpr = window.devicePixelRatio || 1
    const rect = c.getBoundingClientRect()
    c.width = rect.width * dpr
    c.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [open])

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!
    const rect = c.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    drawing.current = true
    last.current = point(e)
    ;(e.target as HTMLCanvasElement).setPointerCapture(e.pointerId)
  }

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const c = canvasRef.current!
    const ctx = c.getContext('2d')!
    const p = point(e)
    const l = last.current!
    ctx.globalCompositeOperation = erase ? 'destination-out' : 'source-over'
    ctx.strokeStyle = color
    ctx.lineWidth = erase ? size * 4 : size
    ctx.beginPath()
    ctx.moveTo(l.x, l.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
  }

  const end = () => {
    drawing.current = false
    last.current = null
  }

  const clear = () => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.restore()
  }

  if (!open) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="relative w-full max-w-3xl h-[85vh] sm:h-[80vh] rounded-2xl bg-amber-50 border-4 border-amber-700 flex flex-col overflow-hidden shadow-2xl"
      >
        {/* 항상 보이는 닫기 버튼 (우상단 고정) */}
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-2 right-2 z-10 w-10 h-10 rounded-full bg-amber-700 text-white text-xl font-bold shadow-lg hover:bg-amber-800 active:scale-95"
        >
          ✕
        </button>

        {/* 툴바 — 모바일에서 wrap 허용 */}
        <div className="flex flex-wrap items-center gap-1.5 p-2 pr-14 bg-amber-100 border-b border-amber-700/40">
          <span className="text-amber-900 font-bold text-sm">📝</span>
          <div className="flex gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => { setColor(c); setErase(false) }}
                aria-label={`색상 ${c}`}
                className={`w-6 h-6 rounded-full border-2 ${
                  color === c && !erase ? 'border-amber-700' : 'border-amber-700/30'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex gap-1 items-center">
            <input
              type="range" min={1} max={10} step={1}
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value, 10))}
              className="w-16 sm:w-20"
              aria-label="굵기"
            />
          </div>
          <button
            onClick={() => setErase((e) => !e)}
            className={`px-2 py-1 rounded text-xs ${
              erase ? 'bg-amber-700 text-white' : 'bg-white text-amber-900 border border-amber-700/40'
            }`}
          >
            🩹
          </button>
          <button
            onClick={clear}
            className="px-2 py-1 rounded text-xs bg-white text-amber-900 border border-amber-700/40"
          >
            🗑
          </button>
        </div>

        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          className="flex-1 touch-none cursor-crosshair bg-amber-50"
          style={{ width: '100%', height: '100%' }}
        />
        <div className="text-center text-xs text-amber-900/60 py-1 bg-amber-100 border-t border-amber-700/40">
          손가락이나 펜으로 자유롭게 풀이 과정을 적어보자. 채점되지 않아 — 학습 보조 도구.
        </div>
      </motion.div>
    </motion.div>
  )
}
