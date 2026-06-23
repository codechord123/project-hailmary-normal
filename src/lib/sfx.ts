/** 외부 오디오 파일 없이 WebAudio로 합성한 효과음. */

let ctx: AudioContext | null = null
let muted = false

const getCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch {
      return null
    }
  }
  return ctx
}

export const unlockAudio = () => {
  const c = getCtx()
  if (c && c.state === 'suspended') c.resume().catch(() => {})
}

export const setMuted = (m: boolean) => {
  muted = m
}

const tone = (freq: number, durMs: number, type: OscillatorType = 'sine', gain = 0.15) => {
  if (muted) return
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, c.currentTime)
  g.gain.setValueAtTime(gain, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + durMs / 1000)
  osc.connect(g)
  g.connect(c.destination)
  osc.start()
  osc.stop(c.currentTime + durMs / 1000)
}

export const sfx = {
  correct: () => {
    tone(660, 90, 'triangle')
    setTimeout(() => tone(990, 150, 'triangle'), 80)
  },
  wrong: () => {
    tone(220, 220, 'sawtooth', 0.12)
  },
  levelUp: () => {
    ;[523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 140, 'triangle'), i * 110))
  },
  tick: () => tone(880, 40, 'square', 0.05),
  crisis: () => {
    tone(180, 600, 'sawtooth', 0.18)
  },
  clear: () => {
    ;[523, 659, 784, 1047, 1319].forEach((f, i) =>
      setTimeout(() => tone(f, 120, 'triangle'), i * 90),
    )
  },
  hit: () => {
    tone(880, 60, 'square', 0.12)
    setTimeout(() => tone(440, 90, 'square', 0.1), 50)
  },
  crit: () => {
    tone(660, 50, 'square', 0.18)
    setTimeout(() => tone(990, 60, 'square', 0.18), 40)
    setTimeout(() => tone(1320, 100, 'triangle', 0.16), 90)
  },
  bossLaugh: () => {
    ;[140, 130, 120, 130, 140].forEach((f, i) =>
      setTimeout(() => tone(f, 110, 'sawtooth', 0.16), i * 90),
    )
  },
  bossDie: () => {
    ;[300, 240, 180, 120, 80, 40].forEach((f, i) =>
      setTimeout(() => tone(f, 180, 'sawtooth', 0.2), i * 110),
    )
    setTimeout(() => tone(1200, 280, 'triangle', 0.2), 700)
  },
}
