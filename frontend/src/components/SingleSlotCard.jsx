import React from 'react'
import { resolveSlotLabel } from './utils/resolveSlotLabel'

// Renders a single-slot mini card (only one team name), styled to align with MatchCard ports
// slot: 0 -> jogo.a, 1 -> jogo.b
export default function SingleSlotCard({ jogo, slot = 0, duplas = [], jogos = [], x = 0, y = 0, onClick }) {
  const fonteList = Array.isArray(jogo?.fontes) ? jogo.fontes : []
  const label = resolveSlotLabel(slot === 0 ? jogo?.a ?? null : jogo?.b ?? null, fonteList, duplas, slot, jogos)
  return (
    <g transform={`translate(${x}, ${y})`} onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* wrapper and base to keep left/right ports aligned with MatchCard (left:24, right:228) */}
      <rect x={24} y={0} width={204} height={24} rx={3} ry={3} fill="#111" stroke="#ec4899" strokeWidth={2} />
      <rect x={26} y={2} width={200} height={20} rx={3} ry={3} fill="#1a1a1a" />
      <text x={55} y={16} className="match--player-name" textAnchor="start">{label}</text>
    </g>
  )
}
