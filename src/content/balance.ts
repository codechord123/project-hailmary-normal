/**
 * 미니게임 밸런스 수치 — 한 곳에서 조정.
 * 실기기에서 너무 쉽거나 어려우면 "여기 숫자만" 바꾸면 모든 게임에 반영됩니다.
 */
export const BALANCE = {
  /** 공통 목숨(하트) */
  hearts: 3,
  defense: {
    laneAdvanceSec: 16, // 좌→우 도달 기본 시간(클수록 쉬움)
    advanceFloorSec: 9, // 가속 하한
    accelPerKill: 0.6, // 처치당 단축 폭
    accelGrace: 2, // 가속 면제 처치 수(초반)
  },
  boss: {
    counterPeriodSec: 14, // 반격 주기(답하면 리셋)
    hitsToKillDefault: 4, // 보스 처치에 필요한 정답 수
  },
  oxrush: {
    goal: 12, // 클리어 정답 수
    qBaseSec: 7, // 문항 기본 제한시간
    qMinSec: 3, // 문항 최소 제한시간
    qRampPerCorrect: 0.4, // 정답당 단축 폭
  },
  runner: {
    gateMs: 4500, // 관문 도달 시간(작을수록 빠름)
  },
  timed: {
    minBudgetSec: 30, // 시간제 게임 최소 제한시간
    matchingSecPerPair: 7, // 매칭: 짝당 초
    sortingSecPerItem: 6, // 분류: 사례당 초
  },
}
