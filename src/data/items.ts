export type ItemId =
  | 'oxygen-pack'
  | 'time-freeze'
  | 'simplify-aid'
  | 'bomb'
  | 'magnet'
  | 'shield'
  | 'hint-formula'

export interface ItemDef {
  id: ItemId
  name: string
  icon: string
  description: string
}

export const ITEMS: Record<ItemId, ItemDef> = {
  'oxygen-pack': {
    id: 'oxygen-pack',
    name: '응급 산소팩',
    icon: '🫀',
    description: '산소를 +25 회복한다.',
  },
  'time-freeze': {
    id: 'time-freeze',
    name: '시간 정지 코어',
    icon: '⏱️',
    description: '현재 문제 타이머를 10초 동안 멈춘다.',
  },
  'simplify-aid': {
    id: 'simplify-aid',
    name: '약분 도우미',
    icon: '🧪',
    description: '이번 챕터 동안 기약분수 요구를 해제한다.',
  },
  bomb: {
    id: 'bomb',
    name: '플라즈마 폭탄',
    icon: '💣',
    description: '현재 적에게 즉시 큰 피해. 보스도 50 데미지.',
  },
  magnet: {
    id: 'magnet',
    name: '정답 자석',
    icon: '🧲',
    description: '현재 문제 답을 자동 표시. 단, 획득 XP 절반.',
  },
  shield: {
    id: 'shield',
    name: '보호막',
    icon: '🛡️',
    description: '다음 오답 1회를 무효 처리한다.',
  },
  'hint-formula': {
    id: 'hint-formula',
    name: '식 힌트',
    icon: '💡',
    description: '현재 문제의 식을 보여준다 (답은 직접 풀어야 해). 획득 XP 30% 감소.',
  },
}

/** 챕터 클리어 시 무작위 보상 풀 */
export const CHAPTER_REWARD_POOL: ItemId[] = [
  'oxygen-pack',
  'oxygen-pack',
  'time-freeze',
  'simplify-aid',
  'bomb',
  'magnet',
  'shield',
  'hint-formula',
  'hint-formula',
]
