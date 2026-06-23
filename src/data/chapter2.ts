import type { Fraction } from '@/types/fraction'
import { subtractFractions } from '@/lib/fractionMath'

export interface ShooterWave {
  id: string
  a: Fraction
  b: Fraction
  enemy: '🐛' | '👾' | '🪳' | '🦠' | '🛸'
  speedSec: number // 화면 최상단에서 바닥 도달까지 초
  requireSimplified: boolean
  /** 문제 독해용 시나리오 (응용 문항) */
  story?: string
}

const expected = (a: Fraction, b: Fraction): Fraction => subtractFractions(a, b)
export { expected as chapter2Expected }

// 속도 ↑ — 응용 독해 시간 확보를 위해 +6~+8초.
export const chapter2Waves: ShooterWave[] = [
  {
    id: 'c2-1', // 5/6 - 1/4 = 10/12 - 3/12 = 7/12
    a: { numerator: 5, denominator: 6 },
    b: { numerator: 1, denominator: 4 },
    enemy: '🐛',
    speedSec: 42,
    requireSimplified: true,
    story:
      '우주선 식량 저장고에는 한 통의 5/6 만큼 비축 식량이 들어 있었어. 그런데 외계 미생물이 침입해서 그 중 1/4 통 분량을 갉아먹어 버렸대. 미생물을 격퇴하려면 우리가 아직 쓸 수 있는 식량이 얼마나 남았는지 정확히 알아야 해. 두 분수를 통분해서 빼고, 기약분수로 답해줘!',
  },
  {
    id: 'c2-2', // 11/12 - 1/3 = 11/12 - 4/12 = 7/12
    a: { numerator: 11, denominator: 12 },
    b: { numerator: 1, denominator: 3 },
    enemy: '👾',
    speedSec: 40,
    requireSimplified: true,
    story:
      '우주선 물탱크는 한 통이 가득 차야 100%야. 점검 직전에는 11/12 만큼 물이 차 있었는데, 새벽 사이에 작은 가열로 인해 1/3 통 분량의 물이 증발해 버렸어. 남은 식수량을 정확히 측정해야 다음 점검 일정을 잡을 수 있어. 통분해서 빼고 기약분수로 알려줘!',
  },
  {
    id: 'c2-3', // 5/8 - 1/3 = 15/24 - 8/24 = 7/24
    a: { numerator: 5, denominator: 8 },
    b: { numerator: 1, denominator: 3 },
    enemy: '🪳',
    speedSec: 38,
    requireSimplified: true,
    story:
      '항해 시작 전 연료 탱크에는 한 통의 5/8 만큼 연료가 채워져 있었어. 그런데 첫 워프 점화를 한 번 시행하니까 1/3 통 분량의 연료가 한꺼번에 소모됐대. 다음 점프를 계획하려면 남은 연료의 비율을 정확히 계산해야 해. 통분해서 빼고 기약분수로!',
  },
  {
    id: 'c2-4', // 9/10 - 2/5 = 9/10 - 4/10 = 5/10 → 1/2 (약분!)
    a: { numerator: 9, denominator: 10 },
    b: { numerator: 2, denominator: 5 },
    enemy: '🦠',
    speedSec: 36,
    requireSimplified: true,
    story:
      '비상 전지는 가득 차 있을 때 100% 이고, 지금은 9/10 만큼 충전돼 있었어. 그런데 지구와의 장거리 통신을 시도하느라 통신기가 한 번에 2/5 통 분량의 전력을 끌어 썼대. 남은 전력으로 다음 통신이 가능한지 확인하려면 잔량을 정확히 알아야 해. 통분해서 빼고 기약분수로 답해!',
  },
  {
    id: 'c2-5', // 4/5 - 1/3 = 12/15 - 5/15 = 7/15
    a: { numerator: 4, denominator: 5 },
    b: { numerator: 1, denominator: 3 },
    enemy: '🐛',
    speedSec: 35,
    requireSimplified: true,
    story:
      '응급 산소 라인은 한 통의 4/5 만큼 가스가 차 있어서 항해 내내 안정적이었어. 그런데 정비 도중에 작은 균열이 생기는 바람에 1/3 통 분량의 산소가 새어 나가 버렸대. 응급 처치를 결정하려면 지금 남아 있는 산소가 얼마인지 확인해야 해. 통분해서 빼고 기약분수로!',
  },
  {
    id: 'c2-6', // 11/15 - 1/6 = 22/30 - 5/30 = 17/30
    a: { numerator: 11, denominator: 15 },
    b: { numerator: 1, denominator: 6 },
    enemy: '👾',
    speedSec: 34,
    requireSimplified: true,
    story:
      '리액터를 식히는 냉각수 탱크는 한 통의 11/15 만큼 채워져 있었어. 그런데 미세한 누출이 발생해서 1/6 통 분량이 사라져 버렸지. 리액터 과열을 막으려면 잔량을 정확히 알아 두는 게 좋겠어. 두 분수를 통분해서 빼고 기약분수로 알려줘!',
  },
  {
    id: 'c2-7', // 7/8 - 5/12 = 21/24 - 10/24 = 11/24
    a: { numerator: 7, denominator: 8 },
    b: { numerator: 5, denominator: 12 },
    enemy: '🪳',
    speedSec: 32,
    requireSimplified: true,
    story:
      '비상 산소팩은 한 통의 7/8 만큼 산소가 들어 있어 든든했어. 그런데 외벽 수리 작업을 진행하느라 5/12 통 분량을 한꺼번에 사용했대. 다음 임무에 쓸 수 있는 산소가 얼마인지 확인하려면 잔량을 알아야 해. 통분해서 빼고 기약분수로 답해!',
  },
  {
    id: 'c2-8', // 보스 — 7/9 - 1/4 = 28/36 - 9/36 = 19/36
    a: { numerator: 7, denominator: 9 },
    b: { numerator: 1, denominator: 4 },
    enemy: '🛸',
    speedSec: 32,
    requireSimplified: true,
    story:
      '🛸 보스 모선이 침입했어! 우주선 외벽 보호막은 전체의 7/9 까지 충전돼 있었는데, 보스의 첫 일격으로 1/4 만큼이 깎여 나갔어. 다음 공격을 막아내려면 남은 보호막 비율을 알아야 반격 시점을 정할 수 있어. 통분해서 빼고 기약분수로!',
  },
]
