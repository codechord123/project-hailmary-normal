/**
 * Project Hail Mary 모티프의 연결된 우주 서사.
 * 챕터별 intro/outro 대사 시퀀스. 학생이 skip 가능.
 */

export interface StoryLine {
  speaker: '시스템' | '항해사' | '로키' | '내레이션'
  text: string
}

export interface ChapterStory {
  intro: StoryLine[]
  outro: StoryLine[]
}

export const STORY: Record<number, ChapterStory> = {
  1: {
    intro: [
      { speaker: '내레이션', text: '깊은 정적. 우주는 차갑고 비어 있다…' },
      { speaker: '시스템', text: '동면 캡슐 해제 완료. 항해사, 깨어나세요.' },
      { speaker: '항해사', text: '여긴… 어디지? 내 이름은… 기억이 안 나.' },
      { speaker: '시스템', text: '당신은 지구의 마지막 희망, 헤일메리호의 항해사입니다. 산소 시스템 점검부터 시작하세요.' },
    ],
    outro: [
      { speaker: '항해사', text: '산소 탱크가 합쳐졌어. 숨을 좀 쉴 수 있게 됐어.' },
      { speaker: '내레이션', text: '단편적인 기억이 돌아온다 — 태양이 어두워지고 있던 지구의 풍경.' },
    ],
  },
  2: {
    intro: [
      { speaker: '시스템', text: '식량 모듈에서 외계 미생물 감지. 식량이 줄고 있습니다.' },
      { speaker: '항해사', text: '도둑들을 처치해야 해. 분수 계산기로 무장하자.' },
    ],
    outro: [
      { speaker: '시스템', text: '식량 도둑 격퇴 완료. 7일치 식량 확보.' },
      { speaker: '항해사', text: '근데 저 멀리서 미약한 신호가 잡혀… 누군가 있다.' },
    ],
  },
  3: {
    intro: [
      { speaker: '내레이션', text: '미지의 신호가 점점 강해진다. 외계 우주선의 윤곽이 보인다.' },
      { speaker: '시스템', text: '신호 분석 시작. 수학적 패턴이 감지됩니다.' },
      { speaker: '항해사', text: '저들도 수학을 쓴다고? 약분과 통분으로 의사소통해보자.' },
    ],
    outro: [
      { speaker: '시스템', text: '아스트로파지 정찰병 격퇴. 통신 채널 확보.' },
      { speaker: '내레이션', text: '검은 우주선에서 무언가가 다가온다. 거미처럼 다리가 다섯 개인 작은 존재…' },
    ],
  },
  4: {
    intro: [
      { speaker: '로키', text: '(번역기) …친구. 분수. 의사소통. 가능. 도움?' },
      { speaker: '항해사', text: '말이 통한다! 너의 이름은… 로키라고 부를게.' },
      { speaker: '로키', text: '로… 키. 좋다. 우리 둘. 별. 죽어가는. 도움.' },
      { speaker: '시스템', text: '외계 함대가 접근 중. 협력해서 격퇴 필요.' },
    ],
    outro: [
      { speaker: '로키', text: '함께. 강하다. 너. 친구.' },
      { speaker: '항해사', text: '같이 가자. 우리 별을 구할 방법을 찾자.' },
    ],
  },
  5: {
    intro: [
      { speaker: '시스템', text: '⚠ 동력실 누출. 여러 곳에서 에너지 손실 발생.' },
      { speaker: '로키', text: '통분. 빠르게. 누출. 막아야.' },
      { speaker: '항해사', text: '단계별로 풀어야 해 — 공통분모 → 빼기 → 약분.' },
    ],
    outro: [
      { speaker: '시스템', text: '동력실 안정. 추진력 회복.' },
      { speaker: '로키', text: '잘 했다. 친구. 다음. 단계.' },
      { speaker: '내레이션', text: '두 항해사는 함께 깊은 우주로 향한다.' },
    ],
  },
  6: {
    intro: [
      { speaker: '로키', text: '아스트로파지. 배양. 비율. 정확히. 중요.' },
      { speaker: '항해사', text: '대분수와 가분수를 자유롭게 변환할 수 있어야 해.' },
      { speaker: '시스템', text: '배양액 비율 매칭 시작.' },
    ],
    outro: [
      { speaker: '시스템', text: '아스트로파지 표본 안정 배양 성공.' },
      { speaker: '항해사', text: '지구로 가져갈 해답이 손에 들어왔어.' },
      { speaker: '로키', text: '내. 별. 도. 살아. 돌아간다.' },
    ],
  },
  7: {
    intro: [
      { speaker: '내레이션', text: '귀환 좌표가 모습을 드러낸다. 하지만 그 앞을 가로막는 거대한 존재…' },
      { speaker: '시스템', text: '⚠ 거대 개체 감지. "아스트로파지 여왕". 모든 학습 내용을 동원하세요.' },
      { speaker: '로키', text: '함께. 끝낸다. 친구.' },
      { speaker: '항해사', text: '3페이즈 — 정탐, 광폭화, 최후. 가자.' },
    ],
    outro: [
      { speaker: '시스템', text: '여왕 봉인 완료. 귀환 항로 개방.' },
      { speaker: '로키', text: '너. 친구. 가라. 지구로. 나. 내. 별로.' },
      { speaker: '항해사', text: '언젠가 다시 만나자, 로키. 우리 별이 다시 빛날 때.' },
      { speaker: '내레이션', text: '두 우주선은 서로 다른 방향으로 멀어진다. 그러나 그들은 안다 — 수학은 우주 공통의 언어라는 것을.' },
    ],
  },
}

export const SPEAKER_COLOR: Record<StoryLine['speaker'], string> = {
  시스템: 'text-cyan-300',
  항해사: 'text-white',
  로키: 'text-amber-300',
  내레이션: 'text-purple-200 italic',
}
