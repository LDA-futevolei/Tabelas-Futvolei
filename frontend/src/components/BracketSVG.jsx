import React, { useState, useMemo } from "react";
import MatchCard from "./MatchCard";
import RoundLabels from "./RoundLabels";
import ModalPlacar from "./ModalPlacar";
import { useBracketStore } from "../store/useBracketStore";


const COLUMN_WIDTH = 260;
const ROW_HEIGHT = 64;
const TOP_PADDING = 40;
const BOTTOM_START = 520;

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

  const resolveFontesToAB = (jogo) => {
    // return a shallow copy with a/b filled where possible using jogosMap
    if (!jogo || !jogo.fontes || jogo.fontes.length === 0) return jogo
    const resolved = { ...jogo }
    const vals = []
    for (const f of jogo.fontes) {
      if (!f) continue
      if (f.type === 'seed' && typeof f.id !== 'undefined') vals.push(f.id)
      else if (f.type === 'from' && f.ref) {
        const src = jogosMap.get(f.ref)
        if (!src) continue
        if (f.path === 'vencedor' && src.vencedor != null) vals.push(src.vencedor)
        else if (f.path === 'perdedor' && src.vencedor != null) {
          // infer perdedor when vencedor known
          const p = (src.a === src.vencedor) ? src.b : src.a
          vals.push(p)
        }
      }
    }
    resolved.a = typeof vals[0] !== 'undefined' ? vals[0] : resolved.a
    resolved.b = typeof vals[1] !== 'undefined' ? vals[1] : resolved.b
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
      const dupes = Array.from(occ.entries()).filter(([id, cnt]) => cnt > 1)
      if (dupes.length > 0) {
        console.warn('[BracketSVG] duplicate visible seed occurrences detected', { dupes, visible })
      }
    } catch (e) {
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

  const positionsByRound = [] 

    rounds.forEach((roundIndex, colIndex) => {
      const rawMatches = grouped.upper.get(roundIndex) || []
      const matches = orderMatches(rawMatches.filter(m => !m.skipRender))
      const columnHeight = matches.length * ROW_HEIGHT
      const startY = TOP_PADDING + Math.max(0, (maxUpperRows * ROW_HEIGHT - columnHeight) / 2)

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

    const sourceDuplas = (participants && participants.length > 0) ? participants : duplas
    return positionsByRound.flatMap(col => col.map(pos => {
      const jogoForRender = resolveFontesToAB(pos.jogo)
      return (
        <MatchCard key={pos.id} jogo={jogoForRender} jogos={jogos} x={pos.x} y={pos.y} onClick={() => setModalJogo(pos.jogo)} duplas={sourceDuplas} />
      )
    }))
  };
  
  const labelsUpper = Array.from(grouped.upper.keys()).sort((a,b) => a - b).map(r => `Upper R${r}`);

  
  const upperRounds = Array.from(grouped.upper.keys()).sort((a,b) => a - b);
  const maxUpperRows = upperRounds.reduce((mx, r) => Math.max(mx, (grouped.upper.get(r) || []).length), 0);
  const colsUpper = Math.max(1, upperRounds.length);
  const totalCols = colsUpper;
  const svgWidth = Math.max(800, totalCols * COLUMN_WIDTH + 200);
  const svgHeight = Math.max(400, TOP_PADDING + maxUpperRows * ROW_HEIGHT + 200);

  return (
    
    <div className="w-full p-4 bg-neutral-900 overflow-auto min-h-screen">
      

      
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
  <RoundLabels rounds={labelsUpper} y={0} />

  {renderUpper()}
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
