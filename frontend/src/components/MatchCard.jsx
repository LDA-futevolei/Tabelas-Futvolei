import React from "react";
import { resolveSlotLabel } from './utils/resolveSlotLabel'

export default function MatchCard({ jogo, x, y, onClick, duplas = [], jogos = [] }) {
  const isHidden = jogo.skipRender
  const isPrelim = jogo.tipo === 'prelim'
  const isUpdated = jogo.justUpdated
  const labelA = jogo.a != null ? resolveSlotLabel(jogo.a, jogo.fontes || [], duplas, 0, jogos) : resolveSlotLabel(null, jogo.fontes || [], duplas, 0, jogos)
  const labelB = jogo.b != null ? resolveSlotLabel(jogo.b, jogo.fontes || [], duplas, 1, jogos) : resolveSlotLabel(null, jogo.fontes || [], duplas, 1, jogos)

  // produce clipPath ids unique per jogo
  const clipId = `match-clippath-${jogo.id}`
  // show individual scores on the right side (Challonge-like): one small box per player row
  const sourceMatch = (jogos && jogos.length) ? (jogos.find(j => j.id === jogo.id) || jogo) : jogo
  const scoreA = (typeof sourceMatch.placarA !== 'undefined' && sourceMatch.placarA != null) ? String(sourceMatch.placarA) : ''
  const scoreB = (typeof sourceMatch.placarB !== 'undefined' && sourceMatch.placarB != null) ? String(sourceMatch.placarB) : ''
  const vencedorVal = (typeof sourceMatch.vencedor !== 'undefined' && sourceMatch.vencedor != null) ? sourceMatch.vencedor : null
  const aSeedVal = typeof sourceMatch.a !== 'undefined' ? sourceMatch.a : null
  const bSeedVal = typeof sourceMatch.b !== 'undefined' ? sourceMatch.b : null
  const isWinnerA = vencedorVal != null && aSeedVal != null && vencedorVal === aSeedVal
  const isWinnerB = vencedorVal != null && bSeedVal != null && vencedorVal === bSeedVal

  return (
    <g transform={`translate(${x}, ${y})`} onClick={onClick} style={{ cursor: 'pointer' }} className={`match ${isHidden ? '-pending' : ''} ${isPrelim ? 'match--prelim' : ''} ${isUpdated ? 'match--updated' : ''}`} data-identifier={jogo.id}>
      <defs>
        <clipPath id={clipId}><rect x="26" y="5" width="200" height="45" rx="3" ry="3"></rect></clipPath>
      </defs>
      <text x="11" y="31" width="24" height="10" textAnchor="middle" className="match--identifier">{jogo.id}</text>
      <rect x="24" y="3" width="204" height="49" rx="3" ry="3" className="match--wrapper-background" fill={isHidden ? '#0d0d0d' : '#111'} stroke={isHidden ? '#444' : '#ec4899'} strokeWidth={2} opacity={isHidden ? 0.5 : 1} />
      <rect x="26" y="5" width="200" height="45" rx="3" ry="3" className="match--base-background" fill="#1a1a1a" />
  {/* score rendered inside each player row (no external boxes) */}
      <g clipPath={`url(#${clipId})`}>
        <svg x="0" y="5" className="match--player">
          <title>{labelA}</title>
          <path d="M 50 0 h 147 v 22 h -147 Z" className={`match--player-background ${labelA ? '' : '-empty'}`} />
          <path d="M 26 0 h 24 v 22 h -24 Z" className="match--seed-background" />
          <text x="38" y="14" textAnchor="middle" className="match--seed">{typeof jogo.a === 'number' ? jogo.a : ''}</text>
          <text x="55" y="15" className={`match--player-name ${labelA ? '' : '-placeholder'}`} textAnchor="start">{labelA}</text>
          {/* score value only — no background rect */}
          {scoreA ? <text x="212" y="11" textAnchor="middle" dominantBaseline="middle" className={`match--score-text ${isWinnerA? 'match--score-text--winner':''} ${(!isWinnerA && vencedorVal!=null)? 'match--score-text--loser':''}`} style={{pointerEvents:'none'}}>{scoreA}</text> : null}
        </svg>
        <svg x="0" y="28" className="match--player">
          <title>{labelB}</title>
          <path d="M 50 0 h 147 v 22 h -147 Z" className={`match--player-background ${labelB ? '' : '-empty'}`} />
          <path d="M 26 0 h 24 v 22 h -24 Z" className="match--seed-background" />
          <text x="38" y="14" textAnchor="middle" className="match--seed">{typeof jogo.b === 'number' ? jogo.b : ''}</text>
          <text x="55" y="15" className={`match--player-name ${labelB ? '' : '-placeholder'}`} textAnchor="start">{labelB}</text>
          <line x1="26" y1="-0.5" x2="200" y2="-0.5" className="match--player-divider" />
          {/* score value only — no background rect */}
          {scoreB ? <text x="212" y="11" textAnchor="middle" dominantBaseline="middle" className={`match--score-text ${isWinnerB? 'match--score-text--winner':''} ${(!isWinnerB && vencedorVal!=null)? 'match--score-text--loser':''}`} style={{pointerEvents:'none'}}>{scoreB}</text> : null}
        </svg>
      </g>
    </g>
  )
}
