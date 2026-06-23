/**
 * 외부 오디오 없이 WebAudio로 합성하는 chiptune BGM.
 * 챕터별 트랙 정의 + 멜로디/베이스 2-track 시퀀서.
 */

type Note = { freq: number; dur: number } // freq 0 = rest, dur = beats

interface Track {
  bpm: number
  melody: Note[]
  bass: Note[]
  leadType: OscillatorType
  bassType: OscillatorType
  leadGain: number
  bassGain: number
}

const N = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0,
  R: 0,
}

const TRACKS: Record<string, Track> = {
  chapter1: {
    bpm: 90, leadType: 'triangle', bassType: 'sine', leadGain: 0.08, bassGain: 0.06,
    melody: [
      { freq: N.C5, dur: 1 }, { freq: N.E5, dur: 1 }, { freq: N.G5, dur: 1 }, { freq: N.E5, dur: 1 },
      { freq: N.F5, dur: 1 }, { freq: N.D5, dur: 1 }, { freq: N.C5, dur: 1 }, { freq: N.R, dur: 1 },
      { freq: N.A4, dur: 1 }, { freq: N.C5, dur: 1 }, { freq: N.E5, dur: 1 }, { freq: N.C5, dur: 1 },
      { freq: N.D5, dur: 1 }, { freq: N.B4, dur: 1 }, { freq: N.C5, dur: 2 },
    ],
    bass: [
      { freq: N.C3, dur: 4 }, { freq: N.F3, dur: 4 }, { freq: N.A3, dur: 4 }, { freq: N.G3, dur: 4 },
    ],
  },
  chapter2: {
    // 슈터 — 빠른 박자
    bpm: 140, leadType: 'square', bassType: 'sawtooth', leadGain: 0.07, bassGain: 0.05,
    melody: [
      { freq: N.E5, dur: 0.5 }, { freq: N.E5, dur: 0.5 }, { freq: N.R, dur: 0.5 }, { freq: N.E5, dur: 0.5 },
      { freq: N.R, dur: 0.5 }, { freq: N.C5, dur: 0.5 }, { freq: N.E5, dur: 0.5 }, { freq: N.G5, dur: 1 },
      { freq: N.R, dur: 1 }, { freq: N.G4, dur: 1 }, { freq: N.R, dur: 1 },
    ],
    bass: [
      { freq: N.E3, dur: 1 }, { freq: N.E3, dur: 1 }, { freq: N.C3, dur: 1 }, { freq: N.G3, dur: 1 },
    ],
  },
  chapter3: {
    // 보스 — 긴장
    bpm: 100, leadType: 'sawtooth', bassType: 'square', leadGain: 0.07, bassGain: 0.06,
    melody: [
      { freq: N.A4, dur: 1 }, { freq: N.C5, dur: 0.5 }, { freq: N.B4, dur: 0.5 }, { freq: N.A4, dur: 1 },
      { freq: N.G4, dur: 1 }, { freq: N.F4, dur: 2 }, { freq: N.E4, dur: 2 },
      { freq: N.A4, dur: 1 }, { freq: N.E5, dur: 1 }, { freq: N.D5, dur: 1 }, { freq: N.C5, dur: 1 },
    ],
    bass: [
      { freq: N.A3, dur: 2 }, { freq: N.F3, dur: 2 }, { freq: N.E3, dur: 2 }, { freq: N.D3, dur: 2 },
    ],
  },
  chapter4: {
    // 디펜스 — 행진
    bpm: 110, leadType: 'square', bassType: 'triangle', leadGain: 0.07, bassGain: 0.06,
    melody: [
      { freq: N.D5, dur: 1 }, { freq: N.D5, dur: 1 }, { freq: N.A4, dur: 1 }, { freq: N.A4, dur: 1 },
      { freq: N.B4, dur: 1 }, { freq: N.B4, dur: 1 }, { freq: N.A4, dur: 2 },
      { freq: N.G4, dur: 1 }, { freq: N.G4, dur: 1 }, { freq: N.F4, dur: 1 }, { freq: N.F4, dur: 1 },
      { freq: N.E4, dur: 1 }, { freq: N.E4, dur: 1 }, { freq: N.D4, dur: 2 },
    ],
    bass: [
      { freq: N.D3, dur: 2 }, { freq: N.A3, dur: 2 },
    ],
  },
  chapter5: {
    // 리액터 — 인더스트리얼 펄스
    bpm: 120, leadType: 'square', bassType: 'sawtooth', leadGain: 0.06, bassGain: 0.07,
    melody: [
      { freq: N.E4, dur: 0.5 }, { freq: N.R, dur: 0.5 }, { freq: N.E4, dur: 0.5 }, { freq: N.G4, dur: 0.5 },
      { freq: N.B4, dur: 1 }, { freq: N.A4, dur: 0.5 }, { freq: N.G4, dur: 1.5 },
      { freq: N.E4, dur: 0.5 }, { freq: N.R, dur: 0.5 }, { freq: N.E4, dur: 1 },
    ],
    bass: [
      { freq: N.E3, dur: 1 }, { freq: N.E3, dur: 1 }, { freq: N.G3, dur: 1 }, { freq: N.A3, dur: 1 },
    ],
  },
  chapter6: {
    // 매칭 — 신비
    bpm: 80, leadType: 'sine', bassType: 'triangle', leadGain: 0.07, bassGain: 0.06,
    melody: [
      { freq: N.E5, dur: 1 }, { freq: N.G5, dur: 1 }, { freq: N.F5, dur: 1 }, { freq: N.D5, dur: 1 },
      { freq: N.B4, dur: 2 }, { freq: N.C5, dur: 2 },
      { freq: N.A4, dur: 1 }, { freq: N.C5, dur: 1 }, { freq: N.E5, dur: 1 }, { freq: N.A5, dur: 1 },
    ],
    bass: [
      { freq: N.A3, dur: 2 }, { freq: N.E3, dur: 2 }, { freq: N.F3, dur: 2 }, { freq: N.G3, dur: 2 },
    ],
  },
  chapter7: {
    // 최종 보스 — 장엄
    bpm: 130, leadType: 'sawtooth', bassType: 'square', leadGain: 0.08, bassGain: 0.07,
    melody: [
      { freq: N.D5, dur: 1 }, { freq: N.A4, dur: 0.5 }, { freq: N.D5, dur: 0.5 }, { freq: N.F5, dur: 1 },
      { freq: N.E5, dur: 1 }, { freq: N.D5, dur: 2 },
      { freq: N.C5, dur: 1 }, { freq: N.A4, dur: 0.5 }, { freq: N.C5, dur: 0.5 }, { freq: N.E5, dur: 1 },
      { freq: N.D5, dur: 1 }, { freq: N.A4, dur: 2 },
    ],
    bass: [
      { freq: N.D3, dur: 2 }, { freq: N.A3, dur: 2 }, { freq: N.F3, dur: 2 }, { freq: N.D3, dur: 2 },
    ],
  },
  endless: {
    bpm: 120, leadType: 'square', bassType: 'sine', leadGain: 0.06, bassGain: 0.05,
    melody: [
      { freq: N.G4, dur: 1 }, { freq: N.B4, dur: 1 }, { freq: N.D5, dur: 1 }, { freq: N.B4, dur: 1 },
      { freq: N.E5, dur: 1 }, { freq: N.D5, dur: 1 }, { freq: N.B4, dur: 1 }, { freq: N.G4, dur: 1 },
    ],
    bass: [
      { freq: N.G3, dur: 4 }, { freq: N.E3, dur: 4 },
    ],
  },
}

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
let muted = false
let userVolume = 0.5 // 0..1, gameStore에서 주입
let active: { trackId: string; timeouts: number[]; melodyOsc?: OscillatorNode; bassOsc?: OscillatorNode } | null = null

const getMaster = (): GainNode | null => {
  const c = getCtx()
  if (!c) return null
  if (!masterGain) {
    masterGain = c.createGain()
    masterGain.gain.value = userVolume
    masterGain.connect(c.destination)
  }
  return masterGain
}

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

export const setBgmMuted = (m: boolean) => {
  muted = m
  if (m) stop()
}

export const setBgmVolume = (v: number) => {
  userVolume = Math.max(0, Math.min(1, v))
  const g = getMaster()
  if (g) g.gain.setValueAtTime(userVolume, getCtx()!.currentTime)
}

const scheduleLoop = (track: Track, notes: 'melody' | 'bass', osc: OscillatorNode, gain: GainNode) => {
  const c = getCtx()
  if (!c) return
  const beatSec = 60 / track.bpm
  const seq = notes === 'melody' ? track.melody : track.bass
  let t = c.currentTime + 0.05
  const loopLen = seq.reduce((s, n) => s + n.dur, 0) * beatSec
  // 4번 루프 예약하고 마지막에서 재예약
  for (let loopI = 0; loopI < 4; loopI++) {
    for (const n of seq) {
      const dur = n.dur * beatSec
      if (n.freq > 0) {
        osc.frequency.setValueAtTime(n.freq, t)
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(notes === 'melody' ? track.leadGain : track.bassGain, t + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.95)
      } else {
        gain.gain.setValueAtTime(0, t)
      }
      t += dur
    }
  }
  // 4 loop 직전에 재예약
  const reschedule = window.setTimeout(() => {
    if (active && active.trackId) scheduleLoop(track, notes, osc, gain)
  }, loopLen * 3 * 1000)
  if (active) active.timeouts.push(reschedule)
}

export const playBgm = (trackId: string) => {
  if (muted) return
  if (active?.trackId === trackId) return
  stop()
  const track = TRACKS[trackId]
  if (!track) return
  const c = getCtx()
  if (!c) return
  if (c.state === 'suspended') c.resume().catch(() => {})

  const melodyOsc = c.createOscillator()
  const melodyGain = c.createGain()
  melodyOsc.type = track.leadType
  melodyGain.gain.value = 0
  melodyOsc.connect(melodyGain)
  melodyGain.connect(getMaster() ?? c.destination)
  melodyOsc.start()

  const bassOsc = c.createOscillator()
  const bassGain = c.createGain()
  bassOsc.type = track.bassType
  bassGain.gain.value = 0
  bassOsc.connect(bassGain)
  bassGain.connect(getMaster() ?? c.destination)
  bassOsc.start()

  active = { trackId, timeouts: [], melodyOsc, bassOsc }
  scheduleLoop(track, 'melody', melodyOsc, melodyGain)
  scheduleLoop(track, 'bass', bassOsc, bassGain)
}

export const stop = () => {
  if (!active) return
  try {
    active.melodyOsc?.stop()
    active.bassOsc?.stop()
  } catch {
    /* ignore */
  }
  active.timeouts.forEach((id) => clearTimeout(id))
  active = null
}

export const isPlaying = () => active !== null
