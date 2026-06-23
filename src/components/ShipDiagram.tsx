interface Props {
  modules: number // 총 모듈 수
  repaired: number // 복구된 모듈 수
}

export function ShipDiagram({ modules, repaired }: Props) {
  return (
    <svg viewBox="0 0 200 80" className="w-full max-w-sm">
      {/* 동체 */}
      <ellipse cx="100" cy="40" rx="80" ry="22" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
      {/* 조종실 */}
      <ellipse cx="160" cy="40" rx="20" ry="14" fill="#0f172a" stroke="#5eead4" strokeWidth="1.5" />
      <ellipse cx="166" cy="38" rx="10" ry="6" fill="#7dd3fc" opacity="0.6" />
      {/* 엔진 */}
      <rect x="10" y="32" width="14" height="16" fill="#334155" />
      <rect x="6" y="36" width="6" height="8" fill="#f59e0b" />
      {/* 모듈 점등 (정답 진행에 따라 켜짐) */}
      {Array.from({ length: modules }).map((_, i) => {
        const x = 50 + i * (90 / modules)
        const on = i < repaired
        return (
          <g key={i}>
            <circle cx={x} cy="40" r="5" fill={on ? '#5eead4' : '#475569'} />
            {on && <circle cx={x} cy="40" r="8" fill="#5eead4" opacity="0.25" />}
          </g>
        )
      })}
      {/* 안테나 */}
      <line x1="100" y1="18" x2="100" y2="6" stroke="#5eead4" strokeWidth="1.5" />
      <circle cx="100" cy="6" r="2" fill="#5eead4" />
    </svg>
  )
}
