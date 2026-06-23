import { useEffect } from 'react'

interface ShortcutMap {
  onSubmit?: () => void
  onHint?: () => void
  onNotebook?: () => void
  onSkip?: () => void
}

/** 챕터 페이지에서 키보드 단축키 활성화 */
export function useShortcuts(map: ShortcutMap, enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const handler = (e: KeyboardEvent) => {
      // 입력 필드에선 비활성 (Enter는 form submit 의도 있을 수 있음)
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea') {
        // Enter on input → submit
        if (e.key === 'Enter' && map.onSubmit) {
          e.preventDefault()
          map.onSubmit()
        }
        return
      }
      const k = e.key.toLowerCase()
      if (e.key === 'Enter' && map.onSubmit) {
        e.preventDefault(); map.onSubmit()
      } else if (k === 'h' && map.onHint) {
        e.preventDefault(); map.onHint()
      } else if (k === 'n' && map.onNotebook) {
        e.preventDefault(); map.onNotebook()
      } else if (k === 'escape' && map.onSkip) {
        e.preventDefault(); map.onSkip()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [enabled, map.onSubmit, map.onHint, map.onNotebook, map.onSkip])
}
