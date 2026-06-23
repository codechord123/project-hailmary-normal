export type SceneThemeId = 'oxygen' | 'water' | 'fuel' | 'battery' | 'code'

export interface SceneTheme {
  id: SceneThemeId
  labelA: string
  labelB: string
  labelResult: string
  cellColor: string
  cellGlow: string
  cellIcon: string
  containerClass: string
  containerRounded: string
  particleColor: string
  cellShape: 'circle' | 'square' | 'hex' | 'pill'
  bgGradient: string
  /** 전송 시 따라붙는 마이크로 텍스트 */
  transferSound: string
}

export const SCENE_THEMES: Record<SceneThemeId, SceneTheme> = {
  oxygen: {
    id: 'oxygen',
    labelA: '산소 탱크 A',
    labelB: '산소 탱크 B',
    labelResult: '합쳐진 산소 탱크',
    cellColor: 'bg-cyan-400',
    cellGlow: 'shadow-[0_0_12px_rgba(34,211,238,0.7)]',
    cellIcon: '💨',
    containerClass: 'border-cyan-400/40 bg-cyan-400/5',
    containerRounded: 'rounded-full',
    particleColor: '#22d3ee',
    cellShape: 'circle',
    bgGradient: 'from-cyan-500/10 to-transparent',
    transferSound: 'whoosh',
  },
  water: {
    id: 'water',
    labelA: '수조 1',
    labelB: '수조 2',
    labelResult: '한 통에 모은 물',
    cellColor: 'bg-blue-400',
    cellGlow: 'shadow-[0_0_12px_rgba(96,165,250,0.7)]',
    cellIcon: '💧',
    containerClass: 'border-blue-400/40 bg-blue-400/5',
    containerRounded: 'rounded-2xl',
    particleColor: '#60a5fa',
    cellShape: 'pill',
    bgGradient: 'from-blue-500/10 to-transparent',
    transferSound: 'drop',
  },
  fuel: {
    id: 'fuel',
    labelA: '연료 셀 1',
    labelB: '연료 셀 2',
    labelResult: '합성된 연료',
    cellColor: 'bg-orange-400',
    cellGlow: 'shadow-[0_0_14px_rgba(251,146,60,0.8)]',
    cellIcon: '⛽',
    containerClass: 'border-orange-400/40 bg-orange-400/5',
    containerRounded: 'rounded-xl',
    particleColor: '#fb923c',
    cellShape: 'hex',
    bgGradient: 'from-orange-500/10 to-transparent',
    transferSound: 'spark',
  },
  battery: {
    id: 'battery',
    labelA: '비상 배터리 A',
    labelB: '비상 배터리 B',
    labelResult: '충전된 배터리',
    cellColor: 'bg-emerald-400',
    cellGlow: 'shadow-[0_0_14px_rgba(52,211,153,0.8)]',
    cellIcon: '⚡',
    containerClass: 'border-emerald-400/40 bg-emerald-400/5',
    containerRounded: 'rounded-lg',
    particleColor: '#34d399',
    cellShape: 'square',
    bgGradient: 'from-emerald-500/10 to-transparent',
    transferSound: 'charge',
  },
  code: {
    id: 'code',
    labelA: '코드 조각 1',
    labelB: '코드 조각 2',
    labelResult: '복구된 항법 코드',
    cellColor: 'bg-fuchsia-500',
    cellGlow: 'shadow-[0_0_12px_rgba(217,70,239,0.7)]',
    cellIcon: '⌬',
    containerClass: 'border-fuchsia-500/40 bg-fuchsia-500/5',
    containerRounded: 'rounded-md',
    particleColor: '#d946ef',
    cellShape: 'square',
    bgGradient: 'from-fuchsia-500/10 to-transparent',
    transferSound: 'glitch',
  },
}
