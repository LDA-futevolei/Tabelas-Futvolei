import React from "react";
import { resolveSlotLabel } from './utils/resolveSlotLabel'

export default function MatchCard({ jogo, x, y, onClick, duplas = [], jogos = [] }) {
  
  const labelA = jogo.a != null ? resolveSlotLabel(jogo.a, jogo.fontes || [], duplas, 0, jogos) : resolveSlotLabel(null, jogo.fontes || [], duplas, 0, jogos)
  const labelB = jogo.b != null ? resolveSlotLabel(jogo.b, jogo.fontes || [], duplas, 1, jogos) : resolveSlotLabel(null, jogo.fontes || [], duplas, 1, jogos)

  return (
    <g transform={`translate(${x}, ${y})`} onClick={onClick} style={{ cursor: "pointer" }}>
      <rect
        x="24"
        y="3"
        width="204"
        height="49"
        rx="3"
        ry="3"
        className="match-wrapper"
        fill="#111"
        stroke="#ec4899"
        strokeWidth="2"
      />
      <rect
        x="26"
        y="5"
        width="200"
        height="45"
        rx="3"
        ry="3"
        fill="#1a1a1a"
      />

      
      <text
        x="11"
        y="31"
        textAnchor="middle"
        fill="#ec4899"
        fontSize="10"
        fontWeight="bold"
      >
        {jogo.id}
      </text>

      
      <text
        x="55"
        y="22"
        fill="#fff"
        fontSize="11"
      >
        {labelA}
      </text>

      
      <text
        x="55"
        y="42"
        fill="#fff"
        fontSize="11"
      >
        {labelB}
      </text>

      
      <line x1="26" y1="28" x2="226" y2="28" stroke="#333" strokeWidth="1" />
    </g>
  );
}
