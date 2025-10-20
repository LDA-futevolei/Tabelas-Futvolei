import React from 'react'
import { resolveSlotLabel } from './utils/resolveSlotLabel'

// Card quadrado grande para um único slot (uma dupla)
// size: tamanho do lado do quadrado (default 400)
// slot: 0 -> jogo.a, 1 -> jogo.b
export default function SquareSlotCard({ jogo, slot = 0, duplas = [], jogos = [], size = 400, onClick }) {
  const fonteList = Array.isArray(jogo?.fontes) ? jogo.fontes : []
  const label = resolveSlotLabel(slot === 0 ? jogo?.a ?? null : jogo?.b ?? null, fonteList, duplas, slot, jogos)

  const OUTER = 0
  const INNER = 8
  const innerSize = size - INNER * 2

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* moldura */}
      <rect x={OUTER} y={OUTER} width={size} height={size} rx={12} ry={12} fill="#0b0b0b" stroke="#ec4899" strokeWidth={3} />
      {/* base */}
      <rect x={INNER} y={INNER} width={innerSize} height={innerSize} rx={10} ry={10} fill="#151515" />
      {/* título/label centralizado */}
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 32 }} className="match--player-name">
        {label}
      </text>
    </g>
  )
}
