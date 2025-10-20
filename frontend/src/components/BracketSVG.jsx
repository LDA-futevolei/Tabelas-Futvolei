import React, { useState, useMemo, useEffect } from "react";
import MatchCard from "./MatchCard";
import RoundLabels from "./RoundLabels";
import ModalPlacar from "./ModalPlacar";
import { useBracketStore } from "../store/useBracketStore";


const COLUMN_WIDTH = 260;
const ROW_HEIGHT = 64;
const TOP_PADDING = 40;
const BOTTOM_START = 420; // legacy, not used after vertical stacking
const BOTTOM_PADDING = 80; // extra space after upper area before losers labels

export default function BracketSVG() {
  const jogos = useBracketStore((s) => s.jogos || []);
  const duplas = useBracketStore((s) => s.duplas || []);
  const participants = useBracketStore((s) => s.participants || []);
  const setPlacar = useBracketStore((s) => s.setPlacar);
  const initDuplas = useBracketStore((s) => s.initDuplas);
  const gerarClassificatoria = useBracketStore((s) => s.gerarClassificatoria);
  const [modalJogo, setModalJogo] = useState(null);
  const [showInit, setShowInit] = useState(false);
  const [qtd, setQtd] = useState(16);
  // inserirChapeu removed — debug helpers cleaned up

  const grouped = useMemo(() => {
    const map = { upper: new Map(), lower: new Map(), finais: new Map(), other: new Map() };
    jogos.forEach(j => {
      const key = j.tipo === 'upper' ? 'upper' : (j.tipo === 'lower' ? 'lower' : (j.fase === 'finais' ? 'finais' : 'other'));
      const rounds = map[key];
      const r = j.round ?? 0;
      if (!rounds.has(r)) rounds.set(r, []);
      rounds.get(r).push(j);
    });
    return map;
  }, [jogos]);

  const jogosMap = useMemo(() => new Map((jogos || []).map(j => [j.id, j])), [jogos]);

  const lowerMatches = useMemo(() => (jogos || []).filter(j => j.tipo === 'lower'), [jogos]);

  useEffect(() => {
    try {
      console.debug('[BracketSVG] total jogos', jogos.length)
      console.debug('[BracketSVG] lowerMatches count', lowerMatches.length)
      const counts = lowerMatches.reduce((acc, m) => { acc[m.region] = (acc[m.region] || 0) + 1; return acc }, {})
      console.debug('[BracketSVG] lowerByRegion counts', counts)
    } catch {
      // ignore
    }
  }, [jogos, lowerMatches]);

  const resolveFontesToAB = (jogo) => {
    // Resolve a/b preenchendo por fontes; para 'perdedor', resolvemos os lados efetivos do src recursivamente
    if (!jogo) return jogo
    const resolved = { ...jogo }
    const resolveEffectiveSides = (m) => {
      if (!m) return { a: m?.a ?? null, b: m?.b ?? null }
      let a = m.a ?? null
      let b = m.b ?? null
      const fs = Array.isArray(m.fontes) ? m.fontes : []
      if (a != null && b != null) return { a, b }
      for (let i = 0; i < fs.length; i++) {
        const f = fs[i]
        if (!f) continue
        if (f.type === 'seed' && f.id != null) {
          if (i === 0 && a == null) a = f.id
          else if (i === 1 && b == null) b = f.id
          else if (a == null) a = f.id
          else if (b == null) b = f.id
        } else if (f.type === 'from' && f.ref != null) {
          const src = jogosMap.get(f.ref)
          if (!src) continue
          if (f.path === 'vencedor') {
            if (src.vencedor != null) {
              if (i === 0 && a == null) a = src.vencedor
              else if (i === 1 && b == null) b = src.vencedor
              else if (a == null) a = src.vencedor
              else if (b == null) b = src.vencedor
            }
          } else if (f.path === 'perdedor') {
            const sides = resolveEffectiveSides(src)
            if (src.vencedor != null && sides.a != null && sides.b != null) {
              const loser = (src.vencedor === sides.a) ? sides.b : sides.a
              if (i === 0 && a == null) a = loser
              else if (i === 1 && b == null) b = loser
              else if (a == null) a = loser
              else if (b == null) b = loser
            }
          }
        }
      }
      return { a, b }
    }

    if (Array.isArray(jogo.fontes) && jogo.fontes.length > 0) {
      const vals = []
      for (let i = 0; i < jogo.fontes.length; i++) {
        const f = jogo.fontes[i]
        if (!f) continue
        if (f.type === 'seed' && typeof f.id !== 'undefined') vals.push(f.id)
        else if (f.type === 'from' && f.ref) {
          const src = jogosMap.get(f.ref)
          if (!src) continue
          if (f.path === 'vencedor' && src.vencedor != null) vals.push(src.vencedor)
          else if (f.path === 'perdedor') {
            const sides = resolveEffectiveSides(src)
            if (src.vencedor != null && sides.a != null && sides.b != null) {
              vals.push(src.vencedor === sides.a ? sides.b : sides.a)
            }
          }
        }
      }
      if (typeof vals[0] !== 'undefined') resolved.a = vals[0]
      if (typeof vals[1] !== 'undefined') resolved.b = vals[1]
    }
    return resolved
  }

  // dev helper: detect visible duplicates (a or b appearing more than once across visible upper matches)
  useMemo(() => {
    try {
      const visible = (jogos || []).filter(j => j.tipo === 'upper' && !j.skipRender)
      const occ = new Map()
      visible.forEach(j => {
        if (j.a != null) occ.set(j.a, (occ.get(j.a)||0)+1)
        if (j.b != null) occ.set(j.b, (occ.get(j.b)||0)+1)
      })
      const dupes = Array.from(occ.entries()).filter(([, cnt]) => cnt > 1)
      if (dupes.length > 0) {
        console.warn('[BracketSVG] duplicate visible seed occurrences detected', { dupes, visible })
      }
    } catch {
      // ignore
    }
  }, [jogos]);

  
  const orderMatches = (matches) => {
    return matches.slice().sort((a, b) => {
      const aSeed = (a.fontes && a.fontes.find(f => f.type === 'seed')?.id) ?? (typeof a.a === 'number' ? a.a : Number.POSITIVE_INFINITY);
      const bSeed = (b.fontes && b.fontes.find(f => f.type === 'seed')?.id) ?? (typeof b.a === 'number' ? b.a : Number.POSITIVE_INFINITY);
      return (aSeed || 0) - (bSeed || 0) || (a.id - b.id);
    });
  };

  const renderUpper = () => {
    const rounds = Array.from(grouped.upper.keys()).sort((a,b) => a - b);

    const prelimMatches = (jogos || []).filter(j => j.tipo === 'prelim')
    const hasPrelim = prelimMatches.length > 0

    const positionsByRound = []

    // If there are prelim matches, render them as the leftmost column
    if (hasPrelim) {
      const matches = orderMatches(prelimMatches)
      const columnHeight = matches.length * ROW_HEIGHT
      const startY = TOP_PADDING + Math.max(0, (maxUpperRowsEff * ROW_HEIGHT - columnHeight) / 2)
      positionsByRound[0] = matches.map((jogo, i) => ({ id: jogo.id, jogo, colIndex: 0, x: 0 * COLUMN_WIDTH, y: startY + i * ROW_HEIGHT }))
    }

    // Build positions round-by-round for the main upper rounds. If prelim exists, shift columns by +1
    rounds.forEach((roundIndex, idx) => {
      const colIndex = hasPrelim ? idx + 1 : idx
      const rawMatches = grouped.upper.get(roundIndex) || []
      const matches = orderMatches(rawMatches)
      // default column height uses all matches; for first main column we may compress based on visible matches
    let columnHeight = matches.length * ROW_HEIGHT
    let startY = TOP_PADDING + Math.max(0, (maxUpperRowsEff * ROW_HEIGHT - columnHeight) / 2)

      const isFirstMainCol = (hasPrelim ? colIndex === 1 : colIndex === 0)
      if (isFirstMainCol) {
        // compute seed value for ordering: prefer explicit seed fonte id
        const withSeed = matches.map(m => {
          let seedVal = Number.POSITIVE_INFINITY
          if (Array.isArray(m.fontes)) {
            const s = m.fontes.find(f => f.type === 'seed' && typeof f.id !== 'undefined')
            if (s) seedVal = Number(s.id)
          }
          // fallback to a/b numeric
          if (seedVal === Number.POSITIVE_INFINITY) {
            if (typeof m.a === 'number') seedVal = m.a
            else if (typeof m.b === 'number') seedVal = m.b
          }
          return { m, seedVal }
        })
        // sort visually by seed ascending
        withSeed.sort((a,b) => (Number(a.seedVal) || 0) - (Number(b.seedVal) || 0))
        // keep placeholders (including skipRender) so downstream rounds can reference these match ids
        positionsByRound[colIndex] = withSeed.map((entry, i) => ({ id: entry.m.id, jogo: entry.m, colIndex, x: colIndex * COLUMN_WIDTH, y: startY + i * ROW_HEIGHT }))
      } else {
        // for later rounds, compute y from source match positions using fontes refs (more robust than index pairing)
        const prev = positionsByRound[colIndex - 1] || []
        // build map of prev positions by match id for quick lookup
        const prevById = new Map(prev.map(p => [p.id, p]))
        positionsByRound[colIndex] = matches.map((jogo, i) => {
          // find fontes with ref to previous matches
          const refs = (Array.isArray(jogo.fontes) ? jogo.fontes.filter(f => f.type === 'from' && f.ref != null).map(f => f.ref) : [])
          // collect y positions from prevById
          const ys = refs.map(r => prevById.get(r)).filter(Boolean).map(p => p.y + 26)
          // fallback: attempt to infer from index pairs if no refs match
          let y
          if (ys.length > 0) {
            y = ys.reduce((s, v) => s + v, 0) / ys.length - 26
          } else {
            const yA = prev[2 * i] ? prev[2 * i].y : (startY + (2 * i) * ROW_HEIGHT)
            const yB = prev[2 * i + 1] ? prev[2 * i + 1].y : (startY + (2 * i + 1) * ROW_HEIGHT)
            y = (yA + yB) / 2
          }
          return { id: jogo.id, jogo, colIndex, x: colIndex * COLUMN_WIDTH, y }
        })
      }
    })

    const sourceDuplas = (participants && participants.length > 0) ? participants : duplas
    // build connection lines (elbows) from child matches to parent match
    const lines = []
    positionsByRound.forEach((col, colIndex) => {
      if (colIndex === 0) return
      const prev = positionsByRound[colIndex - 1] || []
      col.forEach((pos, i) => {
        const srcA = prev[2 * i]
        const srcB = prev[2 * i + 1]
        const toX = pos.x
        const toY = pos.y + 26
        const fromOffset = 228
        // draw connectors from all source matches (including byes/skipRender) so child matches link correctly
        if (srcA) {
          const fromX = srcA.x + fromOffset
          const fromY = srcA.y + 26
          const d = `M ${fromX} ${fromY} L ${fromX + 8} ${fromY} L ${fromX + 8} ${toY} L ${toX} ${toY}`
          lines.push(<path key={`l-${pos.id}-a`} d={d} stroke="#333" strokeWidth={1} fill="none" />)
        }
        if (srcB) {
          const fromX = srcB.x + fromOffset
          const fromY = srcB.y + 26
          const d = `M ${fromX} ${fromY} L ${fromX + 8} ${fromY} L ${fromX + 8} ${toY} L ${toX} ${toY}`
          lines.push(<path key={`l-${pos.id}-b`} d={d} stroke="#333" strokeWidth={1} fill="none" />)
        }
      })
    })

    const matchNodes = positionsByRound.flatMap(col => col.map(pos => {
      // skip rendering match boxes for skipRender matches in the first column so byes don't show
      if (pos.colIndex === 0 && pos.jogo && pos.jogo.skipRender) return null
      const jogoForRender = resolveFontesToAB(pos.jogo)
      return (
        <g key={pos.id} transform={`translate(${pos.x}, ${pos.y})`}>
          <MatchCard jogo={jogoForRender} jogos={jogos} x={0} y={0} onClick={() => setModalJogo(pos.jogo)} duplas={sourceDuplas} />
        </g>
      )
    })).filter(Boolean)
      return (
        <g>
          <g className="bracket-lines">{lines}</g>
          {matchNodes}
        </g>
      )
  };
  
  const upperRounds = Array.from(grouped.upper.keys()).sort((a,b) => a - b);
  const hasPrelimGlobal = (jogos || []).some(j => j.tipo === 'prelim')
  // if we have prelims, label the leftmost column as Fase 1 (prelim) and shift main rounds by +1
  const labelsUpper = hasPrelimGlobal ? Array.from({ length: 1 + upperRounds.length }, (_, i) => `Fase ${i + 1}`) : upperRounds.map(r => `Fase ${r}`);
  const maxUpperRows = upperRounds.reduce((mx, r) => Math.max(mx, (grouped.upper.get(r) || []).length), 0);
  const prelimCount = (jogos || []).filter(j => j.tipo === 'prelim').length;
  const maxUpperRowsEff = hasPrelimGlobal ? Math.max(maxUpperRows, prelimCount) : maxUpperRows;
  // losers (lower) abaixo da upper (Challonge-like)
  const lowerRounds = Array.from(grouped.lower.keys()).sort((a,b) => a - b);
  const maxLowerRows = lowerRounds.reduce((mx, r) => Math.max(mx, (grouped.lower.get(r) || []).length), 0);
  const hasLowerMatches = lowerRounds.length > 0;
  const effectiveUpperCols = (hasPrelimGlobal ? 1 : 0) + upperRounds.length;
  const colsUpper = Math.max(1, effectiveUpperCols);
  const colsLower = hasLowerMatches ? Math.max(1, lowerRounds.length) : 0;
  const totalCols = Math.max(colsUpper, colsLower);
  const svgWidth = Math.max(1000, totalCols * COLUMN_WIDTH + 320);
  const labelHeight = 32; // altura das labels
  const gapBetween = 28; // espaço entre upper e labels da losers
  const upperAreaHeight = TOP_PADDING + maxUpperRowsEff * ROW_HEIGHT + BOTTOM_PADDING;
  const lowerGroupY = hasLowerMatches ? upperAreaHeight + gapBetween + labelHeight : 0;
  const svgHeightUpper = Math.max(400, upperAreaHeight + 200);
  const svgHeight = hasLowerMatches ? Math.max(svgHeightUpper, lowerGroupY + maxLowerRows * ROW_HEIGHT + 200) : svgHeightUpper;

  return (
    
  <div className="w-full p-4 bg-neutral-900 overflow-x-auto overflow-y-auto min-h-screen">
      {/* debug buttons removed */}

      
      {showInit && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-neutral-800 text-white p-6 rounded shadow-lg w-80">
            <h3 className="text-lg font-bold mb-2">Quantos participantes você quer?</h3>
            <input type="number" className="w-full p-2 rounded bg-gray-700 mb-3" value={qtd} onChange={e => setQtd(Number(e.target.value || 0))} />
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 bg-gray-700 rounded" onClick={() => setShowInit(false)}>Cancelar</button>
              <button className="px-3 py-1 bg-pink-600 rounded" onClick={() => { initDuplas(qtd); gerarClassificatoria(); setShowInit(false); }}>Gerar</button>
            </div>
          </div>
        </div>
      )}

  <svg className="bracket-svg block mx-auto" width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
    {/* Upper labels and bracket */}
    <RoundLabels rounds={labelsUpper} y={0} />
    {renderUpper()}

    {/* Lower labels and bracket (abaixo) */}
    {hasLowerMatches && (
      <g transform={`translate(0, ${lowerGroupY})`}>
        <RoundLabels rounds={Array.from(grouped.lower.keys()).sort((a,b) => a - b).map(r => `Perdedores Fase ${r}`)} y={0} isLosers={true} />
        {(() => {
        // render lower bracket similarly to upper, but offset vertically
        const rounds = Array.from(grouped.lower.keys()).sort((a,b) => a - b);
        const positionsByRound = []
        rounds.forEach((roundIndex, colIndex) => {
          const rawMatches = grouped.lower.get(roundIndex) || []
          const matches = orderMatches(rawMatches)
            const columnHeight = matches.length * ROW_HEIGHT
            const startY = TOP_PADDING + Math.max(0, (maxLowerRows * ROW_HEIGHT - columnHeight) / 2)
          if (colIndex === 0) {
            positionsByRound[colIndex] = matches.map((jogo, i) => ({ id: jogo.id, jogo, x: colIndex * COLUMN_WIDTH, y: startY + i * ROW_HEIGHT }))
          } else {
            const prev = positionsByRound[colIndex - 1] || []
            positionsByRound[colIndex] = matches.map((jogo, i) => {
              const srcA = prev[2 * i]
              const srcB = prev[2 * i + 1]
              const yA = srcA ? srcA.y : (startY + (2 * i) * ROW_HEIGHT)
              const yB = srcB ? srcB.y : (startY + (2 * i + 1) * ROW_HEIGHT)
              const y = (yA + yB) / 2
              return { id: jogo.id, jogo, x: colIndex * COLUMN_WIDTH, y }
            })
          }
        })

        // lines and nodes for lower
        const lines = []
        positionsByRound.forEach((col, colIndex) => {
          if (colIndex === 0) return
          const prev = positionsByRound[colIndex - 1] || []
          col.forEach((pos, i) => {
            const srcA = prev[2 * i]
            const srcB = prev[2 * i + 1]
            const toX = pos.x
            const toY = pos.y + 26
            const fromOffset = 228
            if (srcA) {
              const fromX = srcA.x + fromOffset
              const fromY = srcA.y + 26
              const d = `M ${fromX} ${fromY} L ${fromX + 8} ${fromY} L ${fromX + 8} ${toY} L ${toX} ${toY}`
              lines.push(<path key={`ll-${pos.id}-a`} d={d} stroke="#333" strokeWidth={1} fill="none" />)
            }
            if (srcB) {
              const fromX = srcB.x + fromOffset
              const fromY = srcB.y + 26
              const d = `M ${fromX} ${fromY} L ${fromX + 8} ${fromY} L ${fromX + 8} ${toY} L ${toX} ${toY}`
              lines.push(<path key={`ll-${pos.id}-b`} d={d} stroke="#333" strokeWidth={1} fill="none" />)
            }
          })
        })

          const sourceDuplas = (participants && participants.length > 0) ? participants : duplas
          const nodes = positionsByRound.flatMap(col => col.map(pos => (
            <g key={`lower-${pos.id}`} transform={`translate(${pos.x}, ${pos.y})`}>
              <MatchCard jogo={resolveFontesToAB(pos.jogo)} jogos={jogos} x={0} y={0} onClick={() => setModalJogo(pos.jogo)} duplas={sourceDuplas} />
            </g>
          )))
          return (<g>{lines}{nodes}</g>)
        })()}
      </g>
    )}
  </svg>

      {modalJogo && (
        <ModalPlacar
          jogo={modalJogo}
          onClose={() => setModalJogo(null)}
          onSave={(id, payload) => setPlacar(id, payload)}
        />
      )}
    </div>
  );
}
