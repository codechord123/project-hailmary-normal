export interface ThreatEvent {
  id: string
  title: string
  description: string
  choices: Array<{
    label: string
    /** 선택 효과 (한쪽 자원만 사용) */
    oxygenDelta?: number
    timeBonus?: number
    xpBonus?: number
    hint: string
  }>
}

export const THREAT_EVENTS: ThreatEvent[] = [
  {
    id: 'meteor',
    title: '⚠️ 운석 충돌 경보',
    description: '작은 운석군이 접근 중. 회피 기동을 한다면 산소가 줄지만 안전하다.',
    choices: [
      { label: '회피 기동', oxygenDelta: -10, hint: '안전하지만 산소를 소모해.' },
      { label: '버티고 계산 집중', timeBonus: -5, hint: '다음 문제 시간이 5초 줄어들어.' },
    ],
  },
  {
    id: 'glitch',
    title: '🛠 시스템 오작동',
    description: '계산기 회로가 불안정해. 수동 모드로 전환할까?',
    choices: [
      { label: '수동 계산 강행', xpBonus: 15, timeBonus: -3, hint: '시간은 짧지만 XP 보너스가 있어.' },
      { label: '재부팅', oxygenDelta: -8, hint: '산소가 줄지만 다음 문제는 평소대로.' },
    ],
  },
  {
    id: 'rocky-call',
    title: '📡 로키의 통신',
    description: '로키가 잠깐 통신을 걸어왔다. 시간이 조금 걸린다.',
    choices: [
      { label: '대화 나누기', xpBonus: 10, timeBonus: -3, hint: '신뢰도 + 약간의 XP. 시간은 줄어.' },
      { label: '나중에', hint: '아무 일도 일어나지 않아.' },
    ],
  },
]

export const rollEvent = (chance = 0.35): ThreatEvent | null => {
  if (Math.random() > chance) return null
  return THREAT_EVENTS[Math.floor(Math.random() * THREAT_EVENTS.length)]
}
