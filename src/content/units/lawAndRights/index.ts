import type { UnitDef } from '@/content/types'
import { chapter1 } from './chapter1'
import { chapter2 } from './chapter2'
import { chapter3 } from './chapter3'
import { chapter4 } from './chapter4'

/**
 * 단원: 사회 5-1 「법의 역할과 인권」
 * 세계관: 권리 수호자 히어로.
 * "책꽂이"의 첫 번째 책. 다음 단원은 이와 같은 모양으로 한 권 더 만들면 됨.
 */
export const lawAndRightsUnit: UnitDef = {
  id: 'social-5-1-law-rights',
  subject: '사회',
  grade: '5-1',
  title: '법의 역할과 인권',
  theme: '권리 수호자 히어로',
  narrative: {
    hero: '권리 수호자',
    tagline: '법과 인권의 힘으로 도시를 지키는 수호자가 되어 보자!',
    startLabel: '🛡️ 모험 시작',
    resourceName: '정의 에너지',
  },
  chapters: [chapter1, chapter2, chapter3, chapter4],
}
