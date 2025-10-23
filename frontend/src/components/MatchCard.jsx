import React from "react";
import { resolveSlotLabel } from './utils/resolveSlotLabel'

export default function MatchCard({ jogo, x, y, onClick, duplas = [], jogos = [] }) {
  const isHidden = jogo.skipRender
  const isPrelim = jogo.tipo === 'prelim'
  const isUpdated = jogo.justUpdated
  const fonteList = Array.isArray(jogo?.fontes) ? jogo.fontes : []
  const f0 = fonteList[0]
  const f1 = fonteList[1]
  // Preferir placeholder quando a fonte é 'from' e o JOGO DE ORIGEM ainda não tem vencedor
  const getSrc = (f) => {
    if (!f || f.type !== 'from' || f.ref == null) return null
    return (Array.isArray(jogos) ? jogos.find(j => j.id === f.ref) : null) || null
  }
  const srcA = getSrc(f0)
  const srcB = getSrc(f1)
  // Se a fonte é 'from' e o jogo de origem NÃO tem vencedor, forçar placeholder
  const preferFonteA = f0 && f0.type === 'from' && (!srcA || srcA.vencedor == null)
  const preferFonteB = f1 && f1.type === 'from' && (!srcB || srcB.vencedor == null)
  // SEMPRE passar null quando fonte está pendente, mesmo se jogo.a/b já tem valor
  const labelA = preferFonteA
    ? resolveSlotLabel(null, fonteList, duplas, 0, jogos)
    : resolveSlotLabel(jogo?.a ?? null, fonteList, duplas, 0, jogos)
  const labelB = preferFonteB
    ? resolveSlotLabel(null, fonteList, duplas, 1, jogos)
    : resolveSlotLabel(jogo?.b ?? null, fonteList, duplas, 1, jogos)

  // produce clipPath ids unique per jogo
  const clipId = `match-clippath-${jogo.id}`
  // show individual scores on the right side (Challonge-like): one small box per player row
  const sourceMatch = (jogos && jogos.length) ? (jogos.find(j => j.id === jogo.id) || jogo) : jogo
  const scoreA = (typeof sourceMatch.placarA !== 'undefined' && sourceMatch.placarA != null) ? String(sourceMatch.placarA) : ''
  const scoreB = (typeof sourceMatch.placarB !== 'undefined' && sourceMatch.placarB != null) ? String(sourceMatch.placarB) : ''
  const vencedorVal = (typeof sourceMatch.vencedor !== 'undefined' && sourceMatch.vencedor != null) ? sourceMatch.vencedor : null
  // Para determinar winner/loser visual, IGNORAR jogo.a/b quando fonte está pendente
  const aSeedVal = preferFonteA ? null : (typeof sourceMatch.a !== 'undefined' ? sourceMatch.a : null)
  const bSeedVal = preferFonteB ? null : (typeof sourceMatch.b !== 'undefined' ? sourceMatch.b : null)
  const isWinnerA = vencedorVal != null && aSeedVal != null && vencedorVal === aSeedVal
  const isWinnerB = vencedorVal != null && bSeedVal != null && vencedorVal === bSeedVal

  // NUNCA mostrar seed quando a fonte está pendente (mesmo se jogo.a/b tiver valor)
  const showSeedA = !preferFonteA && (typeof jogo?.a === 'number')
  const showSeedB = !preferFonteB && (typeof jogo?.b === 'number')

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
          <text x="38" y="14" textAnchor="middle" className="match--seed">{showSeedA ? jogo.a : ''}</text>
          <text x="55" y="15" className={`match--player-name ${labelA ? '' : '-placeholder'}`} textAnchor="start">{labelA}</text>
          {/* score value only — no background rect */}
          {scoreA ? <text x="212" y="11" textAnchor="middle" dominantBaseline="middle" className={`match--score-text ${isWinnerA? 'match--score-text--winner':''} ${(!isWinnerA && vencedorVal!=null)? 'match--score-text--loser':''}`} style={{pointerEvents:'none'}}>{scoreA}</text> : null}
        </svg>
        <svg x="0" y="28" className="match--player">
          <title>{labelB}</title>
          <path d="M 50 0 h 147 v 22 h -147 Z" className={`match--player-background ${labelB ? '' : '-empty'}`} />
          <path d="M 26 0 h 24 v 22 h -24 Z" className="match--seed-background" />
          <text x="38" y="14" textAnchor="middle" className="match--seed">{showSeedB ? jogo.b : ''}</text>
          <text x="55" y="15" className={`match--player-name ${labelB ? '' : '-placeholder'}`} textAnchor="start">{labelB}</text>
          <line x1="26" y1="-0.5" x2="200" y2="-0.5" className="match--player-divider" />
          {/* score value only — no background rect */}
          {scoreB ? <text x="212" y="11" textAnchor="middle" dominantBaseline="middle" className={`match--score-text ${isWinnerB? 'match--score-text--winner':''} ${(!isWinnerB && vencedorVal!=null)? 'match--score-text--loser':''}`} style={{pointerEvents:'none'}}>{scoreB}</text> : null}
        </svg>
      </g>
    </g>
  )
}
