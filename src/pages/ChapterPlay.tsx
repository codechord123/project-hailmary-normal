import { useEffect, useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { findUnit } from '@/content/registry'
import { useProgress } from '@/content/progress'
import { awardAnswer, awardClear } from '@/content/rewards'
import { unlockAudio } from '@/lib/sfx'
import { playBgm, stop as stopBgm, bgmForMechanic } from '@/lib/bgm'
import { ContentStoryOverlay } from '@/content/components/ContentStoryOverlay'
import { ConceptCard } from '@/content/components/ConceptCard'
import { DefenseGame } from '@/content/minigames/DefenseGame'
import { RunnerGame } from '@/content/minigames/RunnerGame'
import { MatchingGame } from '@/content/minigames/MatchingGame'
import { MemoryGame } from '@/content/minigames/MemoryGame'
import { BossGame } from '@/content/minigames/BossGame'
import { DetectiveGame } from '@/content/minigames/DetectiveGame'
import { BreakoutGame } from '@/content/minigames/BreakoutGame'
import { SortingGame } from '@/content/minigames/SortingGame'
import { OxRushGame } from '@/content/minigames/OxRushGame'
import { SequenceGame } from '@/content/minigames/SequenceGame'

/**
 * 챕터 플레이 — 챕터의 미니게임 메커니즘에 맞는 화면을 띄운다.
 * 정답은 오답 노트·XP로 기록하고, 클리어 시 별점·XP를 저장한다.
 */
export function ChapterPlay() {
  const { unitId = '', chapterId = '' } = useParams()
  const navigate = useNavigate()
  const unit = findUnit(unitId)
  const chapter = unit?.chapters.find((c) => c.id === chapterId)
  const recordAnswer = useProgress((s) => s.recordAnswer)
  const recordClear = useProgress((s) => s.recordClear)
  const [startedId, setStartedId] = useState<string | null>(null)
  const [conceptDoneId, setConceptDoneId] = useState<string | null>(null)

  // 챕터 메커니즘에 맞는 BGM 재생 — 외부 에셋 없이 합성 트랙 재사용. 떠날 때 정지.
  const mechanic = chapter?.mechanic
  useEffect(() => {
    if (!mechanic) return
    unlockAudio()
    playBgm(bgmForMechanic(mechanic))
    return () => stopBgm()
  }, [mechanic])

  if (!unit || !chapter) return <Navigate to="/subjects" replace />

  // 챕터 시작 전 스토리 오버레이 (챕터마다 한 번)
  if (chapter.story && chapter.story.length > 0 && startedId !== chapter.id) {
    return (
      <ContentStoryOverlay
        hero={unit.narrative?.hero ?? unit.theme}
        title={chapter.title}
        lines={chapter.story}
        startLabel={unit.narrative?.startLabel ?? '시작'}
        onStart={() => setStartedId(chapter.id)}
      />
    )
  }

  // 스토리 뒤 핵심 개념 카드 (가르치기 → 풀기)
  if (chapter.concept && conceptDoneId !== chapter.id) {
    return (
      <ConceptCard
        hero={unit.narrative?.hero ?? unit.theme}
        title={chapter.title}
        concept={chapter.concept}
        startLabel={unit.narrative?.startLabel ?? '시작'}
        onStart={() => setConceptDoneId(chapter.id)}
      />
    )
  }

  const backToUnit = () => navigate(`/unit/${unit.id}`)
  const onAnswer = (problemId: string, correct: boolean) => {
    recordAnswer(unit.id, problemId, correct) // 단원별 오답 노트
    awardAnswer(correct) // 공유 XP·에너지
  }
  const onClear = (result?: { stars?: number; bestCombo?: number }) => {
    recordClear(unit.id, chapter.id, result?.stars ?? 3, unit.chapters.length) // 성과 별점(1~3)
    awardClear({ stars: result?.stars, bestCombo: result?.bestCombo }) // 콤보·별점 비례 보상
    backToUnit()
  }

  if (chapter.mechanic === 'runner') {
    return (
      <RunnerGame
        problems={chapter.problems}
        title={chapter.title}
        intro={chapter.intro}
        onAnswer={onAnswer}
        onClear={onClear}
        onExit={backToUnit}
      />
    )
  }

  if (chapter.mechanic === 'defense') {
    return (
      <DefenseGame
        problems={chapter.problems}
        title={chapter.title}
        intro={chapter.intro}
        onAnswer={onAnswer}
        onClear={onClear}
        onExit={backToUnit}
      />
    )
  }

  if (chapter.mechanic === 'sorting') {
    return (
      <SortingGame
        problems={chapter.problems}
        title={chapter.title}
        intro={chapter.intro}
        onAward={(correct) => awardAnswer(correct)}
        onClear={onClear}
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
        onClear={onClear}
        onExit={backToUnit}
      />
    )
  }

  if (chapter.mechanic === 'memory') {
    return (
      <MemoryGame
        problems={chapter.problems}
        title={chapter.title}
        intro={chapter.intro}
        onAward={(correct) => awardAnswer(correct)}
        onClear={onClear}
        onExit={backToUnit}
      />
    )
  }

  if (chapter.mechanic === 'oxrush') {
    return (
      <OxRushGame
        problems={chapter.problems}
        title={chapter.title}
        intro={chapter.intro}
        onAnswer={onAnswer}
        onClear={onClear}
        onExit={backToUnit}
      />
    )
  }

  if (chapter.mechanic === 'detective') {
    return (
      <DetectiveGame
        problems={chapter.problems}
        title={chapter.title}
        intro={chapter.intro}
        onAnswer={onAnswer}
        onClear={onClear}
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
        onAnswer={onAnswer}
        onClear={onClear}
        onExit={backToUnit}
      />
    )
  }

  if (chapter.mechanic === 'timeline') {
    return (
      <SequenceGame
        problems={chapter.problems}
        title={chapter.title}
        intro={chapter.intro}
        onAnswer={onAnswer}
        onClear={onClear}
        onExit={backToUnit}
      />
    )
  }

  if (chapter.mechanic === 'breakout') {
    // 클라이맥스 — 단원 전체의 문제(짝짓기 제외)를 모아 더 다양하게 출제
    const quizPool = unit.chapters
      .flatMap((c) => c.problems)
      .filter((p) => p.kind === 'mcq' || p.kind === 'ox')
    return (
      <BreakoutGame
        problems={quizPool.length >= 12 ? quizPool : chapter.problems}
        title={chapter.title}
        intro={chapter.intro}
        onAnswer={onAnswer}
        onClear={onClear}
        onExit={backToUnit}
      />
    )
  }

  if (chapter.mechanic === 'finalboss') {
    // 단원 마무리 — 전체 챕터 문제(짝짓기 제외)를 모아 종합 결전
    const allProblems = unit.chapters
      .flatMap((c) => c.problems)
      .filter((p) => p.kind !== 'matching')
    return (
      <BossGame
        problems={allProblems}
        title={chapter.title}
        intro={chapter.intro}
        bossName="권리침해 대마왕"
        bossEmoji="🐉"
        hitsToKill={6}
        onAnswer={onAnswer}
        onClear={onClear}
        onExit={backToUnit}
      />
    )
  }

  // 아직 미니게임이 없는 챕터 → 카드 풀이로
  return <Navigate to={`/unit-preview?unit=${unit.id}&chapter=${chapter.id}`} replace />
}
