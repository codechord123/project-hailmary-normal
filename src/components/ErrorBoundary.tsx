import React from 'react'

interface State {
  error: Error | null
}

/** 페이지 단위 에러 발생 시 화이트 스크린 대신 안내 + 복구 버튼 표시. */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // 개발 시에는 콘솔에, 프로덕션에서는 무시.
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary', error, info)
    }
  }

  reset = () => {
    this.setState({ error: null })
    // 해시 라우터 영향 없이 메인으로
    window.location.assign('/')
  }

  reload = () => window.location.reload()

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-space-900 text-white">
        <div className="text-6xl">⚠️</div>
        <h2 className="mt-4 text-2xl font-bold text-yellow-300">잠깐 문제가 생겼어!</h2>
        <p className="mt-2 text-white/70 text-sm max-w-md">
          예상치 못한 오류로 화면이 멈췄어. 다시 시도하면 대부분 풀려.
          진도는 저장돼 있으니 걱정하지 마.
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={this.reset} className="px-5 py-2.5 rounded-xl bg-space-accent text-space-900 font-bold">
            🏠 메인으로
          </button>
          <button onClick={this.reload} className="px-5 py-2.5 rounded-xl bg-white/10 text-white border border-white/20">
            ↻ 새로고침
          </button>
        </div>
        {import.meta.env.DEV && (
          <pre className="mt-4 max-w-md max-h-40 overflow-auto text-xs text-red-300 bg-black/40 p-2 rounded">
            {this.state.error.message}
          </pre>
        )}
      </div>
    )
  }
}
