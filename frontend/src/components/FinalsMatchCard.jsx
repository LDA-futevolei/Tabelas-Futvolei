import React from 'react'
import { resolveSlotLabel } from './utils/resolveSlotLabel'

// Card especial para fase finais: dois retângulos separados (um por slot), tema dourado
// Mantém compatibilidade de props com MatchCard onde possível
export default function FinalsMatchCard({ jogo, duplas = [], jogos = [], x = 0, y = 0, onClick, onOpenFonte }) {
  const fonteList = Array.isArray(jogo?.fontes) ? jogo.fontes : []
  const f0 = fonteList[0]
  const f1 = fonteList[1]
  
  // Verificar se a fonte está pendente (mesmo lógica do MatchCard)
  const getSrc = (f) => {
    if (!f || f.type !== 'from' || f.ref == null) return null
    return (Array.isArray(jogos) ? jogos.find(j => j.id === f.ref) : null) || null
  }
  const srcA = getSrc(f0)
  const srcB = getSrc(f1)
  
  // Debug: verificar se está encontrando os jogos fonte
  if (f0 && f0.type === 'from') {
    console.debug(`[FinalsMatchCard ${jogo.id}] fonte A:`, f0.ref, 'encontrado:', srcA?.id, 'vencedor:', srcA?.vencedor)
  }
  if (f1 && f1.type === 'from') {
    console.debug(`[FinalsMatchCard ${jogo.id}] fonte B:`, f1.ref, 'encontrado:', srcB?.id, 'vencedor:', srcB?.vencedor)
  }
  
  const preferFonteA = f0 && f0.type === 'from' && (!srcA || srcA.vencedor == null)
  const preferFonteB = f1 && f1.type === 'from' && (!srcB || srcB.vencedor == null)
  
  // Passar null quando fonte pendente para forçar placeholder
  const labelA = preferFonteA
    ? resolveSlotLabel(null, fonteList, duplas, 0, jogos)
    : resolveSlotLabel(jogo?.a ?? null, fonteList, duplas, 0, jogos)
  const labelB = preferFonteB
    ? resolveSlotLabel(null, fonteList, duplas, 1, jogos)
    : resolveSlotLabel(jogo?.b ?? null, fonteList, duplas, 1, jogos)

  const scoreA = (typeof jogo?.placarA !== 'undefined' && jogo?.placarA != null) ? String(jogo.placarA) : ''
  const scoreB = (typeof jogo?.placarB !== 'undefined' && jogo?.placarB != null) ? String(jogo.placarB) : ''
  const vencedor = (typeof jogo?.vencedor !== 'undefined' && jogo?.vencedor != null) ? jogo.vencedor : null
  // Ignorar jogo.a/b quando fonte pendente
  const aSeedVal = preferFonteA ? null : ((typeof jogo?.a === 'number') ? jogo.a : null)
  const bSeedVal = preferFonteB ? null : ((typeof jogo?.b === 'number') ? jogo.b : null)
  const isWinnerA = vencedor != null && aSeedVal != null && vencedor === aSeedVal
  const isWinnerB = vencedor != null && bSeedVal != null && vencedor === bSeedVal

  const GOLD = '#ff2b77' // cor rosa para tema
  const WIDTH = 240
  const HEIGHT = 26
  const GAP = 6
  const SCORE_W = 24
  const SCORE_H = 16

  // helper: descobrir a fonte principal para cada slot (A=0, B=1)
  const getFonteRef = (slotIndex) => {
    const f = Array.isArray(jogo?.fontes) ? jogo.fontes[slotIndex] : null
    if (f && f.type === 'from' && f.ref != null) return f.ref
    // fallback: se só existe 1 fonte, use-a
    if (Array.isArray(jogo?.fontes) && jogo.fontes.length === 1) {
      const only = jogo.fontes[0]
      if (only && only.type === 'from' && only.ref != null) return only.ref
    }
    return null
  }

  const fonteA = getFonteRef(0)
  const fonteB = getFonteRef(1)

  return (
    <g transform={`translate(${x}, ${y})`} onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Slot A */}
      <g>
        <rect x={22} y={0} width={WIDTH} height={HEIGHT} rx={4} ry={4} fill="#141414" stroke={GOLD} strokeWidth={2} />
        {/* label (sem quadrado cinza à esquerda) */}
        <text
          x={30}
          y={16}
          className={`match--player-name ${labelA ? '' : '-placeholder'}`}
          textAnchor="start"
          onClick={(e) => {
            if (!onOpenFonte) return
            if (fonteA == null) return
            e.stopPropagation()
            onOpenFonte(fonteA)
          }}
          style={{ cursor: onOpenFonte && fonteA != null ? 'pointer' : 'inherit' }}
          title={onOpenFonte && fonteA != null ? `Abrir fonte Jogo ${fonteA}` : undefined}
        >
          {labelA}
        </text>
        {/* score em box à direita */}
        {scoreA ? (
          <g>
            <rect x={22 + WIDTH - (SCORE_W + 8)} y={5} width={SCORE_W} height={SCORE_H} rx={3} ry={3} fill={GOLD} />
            <text x={22 + WIDTH - (SCORE_W + 8) + SCORE_W/2} y={5 + SCORE_H/2 + 1} textAnchor="middle" dominantBaseline="middle" className={`fill-black ${isWinnerA ? 'font-bold' : ''}`}>{scoreA}</text>
          </g>
        ) : null}
      </g>

      {/* Slot B */}
      <g transform={`translate(0, ${HEIGHT + GAP})`}>
        <rect x={22} y={0} width={WIDTH} height={HEIGHT} rx={4} ry={4} fill="#141414" stroke={GOLD} strokeWidth={2} />
        <text
          x={30}
          y={16}
          className={`match--player-name ${labelB ? '' : '-placeholder'}`}
          textAnchor="start"
          onClick={(e) => {
            if (!onOpenFonte) return
            if (fonteB == null) return
            e.stopPropagation()
            onOpenFonte(fonteB)
          }}
          style={{ cursor: onOpenFonte && fonteB != null ? 'pointer' : 'inherit' }}
          title={onOpenFonte && fonteB != null ? `Abrir fonte Jogo ${fonteB}` : undefined}
        >
          {labelB}
        </text>
        {scoreB ? (
          <g>
            <rect x={22 + WIDTH - (SCORE_W + 8)} y={5} width={SCORE_W} height={SCORE_H} rx={3} ry={3} fill={GOLD} />
            <text x={22 + WIDTH - (SCORE_W + 8) + SCORE_W/2} y={5 + SCORE_H/2 + 1} textAnchor="middle" dominantBaseline="middle" className={`fill-black ${isWinnerB ? 'font-bold' : ''}`}>{scoreB}</text>
          </g>
        ) : null}
      </g>

      {/* badge "VS" central */}
      <g transform={`translate(${22 + WIDTH/2}, ${HEIGHT + (GAP/2)})`}>
        <rect x={-12} y={-8} width={24} height={16} rx={3} ry={3} fill={GOLD} />
        <text x={0} y={3} textAnchor="middle" className="fill-black" style={{ fontSize: 10, fontWeight: 700 }}>VS</text>
      </g>
    </g>
  )
}
