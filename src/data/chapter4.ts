import type { Fraction } from '@/types/fraction'
import { addFractions } from '@/lib/fractionMath'

export interface DefenseTarget {
  id: string
  a: Fraction
  b: Fraction
  enemy: string
  requireSimplified: boolean
  /** 응용 시나리오 — 독해해서 푸는 문제 */
  story: string
}

export const chapter4Targets: DefenseTarget[] = [
  {
    id: 'c4-1', // 5/8 + 1/3 = 15/24 + 8/24 = 23/24
    a: { numerator: 5, denominator: 8 }, b: { numerator: 1, denominator: 3 },
    enemy: '👽', requireSimplified: true,
    story:
      '함대 보급선 A 는 한 통의 5/8 만큼 자원을 싣고 출발했고, 보급선 B 는 1/3 만큼을 싣고 따로 도착하고 있어. 두 보급선이 합류하면 베이스에 쌓일 총 자원량을 미리 파악해야 다음 임무를 계획할 수 있어. 두 분수를 통분해서 더한 뒤 기약분수로 알려줘!',
  },
  {
    id: 'c4-2', // 5/6 + 3/8 = 20/24 + 9/24 = 29/24 (가분수)
    a: { numerator: 5, denominator: 6 }, b: { numerator: 3, denominator: 8 },
    enemy: '🤖', requireSimplified: true,
    story:
      '아군 드론이 외계 잔해에서 5/6 통의 에너지를 회수해 왔어. 그 직후에 정찰선도 별도로 3/8 통의 에너지를 더 발견해서 가져왔지. 두 자원을 모두 합치면 총 얼마인지 알아야 분배가 가능해. 통분해서 더한 뒤 기약분수로 답해줘 (가분수도 괜찮아)!',
  },
  {
    id: 'c4-3', // 5/12 + 1/8 = 10/24 + 3/24 = 13/24
    a: { numerator: 5, denominator: 12 }, b: { numerator: 1, denominator: 8 },
    enemy: '🦑', requireSimplified: true,
    story:
      '우주선 화물칸은 두 개로 나뉘어 있고, 1번 칸에는 한 통의 5/12 만큼, 2번 칸에는 1/8 만큼 물자가 들어 있어. 두 칸의 짐을 하나로 합쳐 적재 공간을 정리하려 해. 합친 후의 전체 적재량을 알아야 다음 보급 일정을 정할 수 있어. 통분해서 더하고 기약분수로 답해!',
  },
  {
    id: 'c4-4', // 3/5 + 1/4 = 12/20 + 5/20 = 17/20
    a: { numerator: 3, denominator: 5 }, b: { numerator: 1, denominator: 4 },
    enemy: '👹', requireSimplified: true,
    story:
      '오늘의 귀환 임무를 항해사와 로키가 나누어 수행 중이야. 항해사는 자기가 맡은 부분의 3/5 를, 로키는 자기가 맡은 부분의 1/4 을 끝냈어. 두 사람이 합쳐서 임무 전체의 얼마를 끝낸 셈인지 계산해서, 다음 작업 분담을 정해보자. 통분 후 기약분수로!',
  },
  {
    id: 'c4-5', // 2/7 + 3/4 = 8/28 + 21/28 = 29/28 (가분수)
    a: { numerator: 2, denominator: 7 }, b: { numerator: 3, denominator: 4 },
    enemy: '🐙', requireSimplified: true,
    story:
      '냉각 시스템에는 현재 한 통의 2/7 만큼 액체가 남아 있어. 안전한 운영을 위해 추가로 3/4 통의 보충액을 부으려고 해. 부은 다음 시스템 전체의 액체량이 얼마인지 알아야 압력 조절을 정확히 할 수 있어. 통분해서 더한 뒤 기약 가분수로 답해줘!',
  },
  {
    id: 'c4-6', // 3/4 + 5/12 = 9/12 + 5/12 = 14/12 = 7/6 (약분 필요)
    a: { numerator: 3, denominator: 4 }, b: { numerator: 5, denominator: 12 },
    enemy: '👽', requireSimplified: true,
    story:
      '항해 초기부터 비축해 둔 식량은 한 박스의 3/4 였는데, 최근 신규 보급선에서 5/12 박스 분량이 추가로 도착했어. 두 식량을 합치면 베이스가 보유한 총 식량이 얼마인지 알아야 다음 보급 일정을 정할 수 있어. 통분해서 더하고 기약 가분수로 답해!',
  },
  {
    id: 'c4-7', // 7/10 + 3/5 = 7/10 + 6/10 = 13/10 (가분수)
    a: { numerator: 7, denominator: 10 }, b: { numerator: 3, denominator: 5 },
    enemy: '🦠', requireSimplified: true,
    story:
      '실험실에서 백신을 만들기 위해 두 가지 농축액을 섞으려고 해. 첫 번째 비커에는 한 통의 7/10 만큼 백신 농축액이, 두 번째 비커에는 3/5 만큼 일반 농축액이 들어 있어. 둘을 섞은 후의 총 부피를 알아야 다음 반응 단계를 진행할 수 있어. 통분해서 더하고 기약 가분수로!',
  },
  {
    id: 'c4-8', // 7/15 + 1/6 = 14/30 + 5/30 = 19/30
    a: { numerator: 7, denominator: 15 }, b: { numerator: 1, denominator: 6 },
    enemy: '🛸', requireSimplified: true,
    story:
      '함선의 메인 무기는 완충일 때 100%로 발사 가능해. 점검 시점에 무기 충전량이 7/15 였는데, 보조 발전기를 가동해서 1/6 만큼을 더 채울 수 있었어. 지금 시점의 총 충전 비율을 알아야 다음 발사 시점을 정할 수 있어. 통분해서 더하고 기약분수로!',
  },
  {
    id: 'c4-9', // 7/12 + 5/18 = 21/36 + 10/36 = 31/36
    a: { numerator: 7, denominator: 12 }, b: { numerator: 5, denominator: 18 },
    enemy: '🤖', requireSimplified: true,
    story:
      '우주선 방어 체계는 메인 실드와 보조 실드 두 겹으로 작동해. 지금 메인 실드는 전체의 7/12 만큼 가동 중이고, 보조 실드는 5/18 만큼 추가로 가동되고 있어. 두 방어막의 합쳐진 방어력 비율을 알아야 적의 공격을 견딜 수 있는지 판단할 수 있어. 통분해서 더하고 기약분수로!',
  },
  {
    id: 'c4-10', // 5/9 + 1/6 = 10/18 + 3/18 = 13/18
    a: { numerator: 5, denominator: 9 }, b: { numerator: 1, denominator: 6 },
    enemy: '👽', requireSimplified: true,
    story:
      '지구로 보내는 구조 신호가 가는 도중에 두 행성을 지나가야 해. 행성 A 까지는 전체 신호 강도의 5/9 만큼이 도달했고, 행성 B 까지는 1/6 만큼이 별도로 도달했어. 두 행성에 닿은 총 신호 비율을 알아야 지구가 받을 신호의 강도를 추정할 수 있어. 통분해서 더하고 기약분수로!',
  },
  {
    id: 'c4-11', // 1/2 + 3/10 = 5/10 + 3/10 = 8/10 = 4/5 (약분 필요)
    a: { numerator: 1, denominator: 2 }, b: { numerator: 3, denominator: 10 },
    enemy: '🦑', requireSimplified: true,
    story:
      '귀환까지 가야 할 전체 항로 중 우리는 이미 1/2 를 마쳤어. 어제 추가 비행으로 3/10 을 더 갔지. 지금까지 완료한 비율이 얼마인지 알아야 남은 보급량이 충분한지 계획할 수 있어. 통분해서 더하고 기약분수로 답해줘!',
  },
  {
    id: 'c4-12', // 4/9 + 1/2 = 8/18 + 9/18 = 17/18
    a: { numerator: 4, denominator: 9 }, b: { numerator: 1, denominator: 2 },
    enemy: '🐙', requireSimplified: true,
    story:
      '합류 지점에서 아군 함대는 전체 진형 위치의 4/9 만큼 도착했고, 동맹군 함대는 1/2 만큼 별도 위치에 도착했어. 두 함대의 합쳐진 도달률을 알아야 합류 시점을 정확히 조정할 수 있어. 두 분수를 통분해서 더하고 기약분수로!',
  },
]

export const chapter4Expected = (t: DefenseTarget) => addFractions(t.a, t.b)

/** 한 적이 화면 끝에 도달하기까지 (초) — 응용 독해 시간 확보 */
export const LANE_ADVANCE_SEC = 42
/** 동시 등장 레인 수 */
export const LANE_COUNT = 3
