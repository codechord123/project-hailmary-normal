/**
 * 오답 노트 — 학습 도구의 핵심.
 * 학생이 틀린 문제와 입력값, 정답, 챕터/문제 ID를 저장.
 * 나중에 다시 보고 풀이를 검토할 수 있도록 한다.
 */

import type { Problem } from '@/types/problem'

const KEY = 'hailmary-wrong-notes'
const MAX_NOTES = 200 // 너무 쌓이지 않게 cap

export interface WrongNote {
  id: number // timestamp
  chapterId: number | 'daily' | 'endless'
  problemId: string
  problemKind: Problem['kind']
  scenario: string
  prompt: string
  studentAnswerText: string // 학생이 입력한 답 (사람이 읽을 수 있는 형태)
  correctAnswerText: string
  hint?: string
  notedAt: number
  resolved?: boolean // 학생이 "다시 풀어봤어요" 체크
}

const safeRead = (): WrongNote[] => {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const safeWrite = (notes: WrongNote[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(notes.slice(-MAX_NOTES)))
  } catch {
    /* ignore */
  }
}

export const addWrongNote = (note: Omit<WrongNote, 'id' | 'notedAt'>) => {
  const all = safeRead()
  all.push({ ...note, id: Date.now() + Math.random(), notedAt: Date.now() })
  safeWrite(all)
}

export const listWrongNotes = (): WrongNote[] =>
  safeRead().sort((a, b) => b.notedAt - a.notedAt)

export const markResolved = (id: number) => {
  const all = safeRead().map((n) => (n.id === id ? { ...n, resolved: true } : n))
  safeWrite(all)
}

export const removeNote = (id: number) => {
  safeWrite(safeRead().filter((n) => n.id !== id))
}

export const clearAllNotes = () => {
  safeWrite([])
}

export const unresolvedCount = (): number =>
  safeRead().filter((n) => !n.resolved).length
