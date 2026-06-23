import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { findUnit } from '@/content/registry'
import { DefenseGame } from '@/content/minigames/DefenseGame'
import { MatchingGame } from '@/content/minigames/MatchingGame'
import { BossGame } from '@/content/minigames/BossGame'

/**
 * 챕터 플레이 — 챕터의 미니게임 메커니즘에 맞는 화면을 띄운다.
 * 아직 구현 안 된 메커니즘은 카드 풀이(미리보기)로 연결.
 */
export function ChapterPlay() {
  const { unitId = '', chapterId = '' } = useParams()
  const navigate = useNavigate()
  const unit = findUnit(unitId)
  const chapter = unit?.chapters.find((c) => c.id === chapterId)

  if (!unit || !chapter) return <Navigate to="/subjects" replace />

  const backToUnit = () => navigate(`/unit/${unit.id}`)

  if (chapter.mechanic === 'defense') {
    return (
      <DefenseGame
        problems={chapter.problems}
        title={chapter.title}
        intro={chapter.intro}
        onClear={backToUnit}
        onExit={backToUnit}
      />
    )
  }

  if (chapter.mechanic === 'matching') {
    return (
      <MatchingGame
        problems={chapter.problems}
        title={chapter.title}
        intro={chapter.intro}
        onClear={backToUnit}
        onExit={backToUnit}
      />
    )
  }

  if (chapter.mechanic === 'boss') {
    return (
      <BossGame
        problems={chapter.problems}
        title={chapter.title}
        intro={chapter.intro}
        bossName="편견 빌런"
        bossEmoji="👾"
        onClear={backToUnit}
        onExit={backToUnit}
      />
    )
  }

  // 아직 미니게임이 없는 챕터 → 카드 풀이로
  return <Navigate to={`/unit-preview?unit=${unit.id}&chapter=${chapter.id}`} replace />
}
