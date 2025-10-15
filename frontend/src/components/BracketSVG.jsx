import React, { useMemo } from "react";
import { estruturaDouble16 } from "./utils/estruturaDouble16";

const CARD_W = 180;
const CARD_H = 60;
const MARGEM = 80;
const TOPO = 40;
const ESP_H = 180;
const GAP_CENTRO = 240;

export default function BracketSVG() {
  const { nodes, largura, altura } = useMemo(() => calcularPosicoes(), []);

  return (
    <div className="w-full h-screen bg-black overflow-hidden flex justify-center items-center">
      <svg
        width="300%" // 🔹 aumenta horizontalmente (zoom-out)
        height="150%" // 🔹 aumenta verticalmente
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${largura} ${altura}`}
      >
        {nodes.map((n) => (
          <g key={n.id}>
            <rect
              x={n.x}
              y={n.y}
              width={CARD_W}
              height={CARD_H}
              rx="12"
              ry="12"
              fill="#111"
              stroke="#ec4899"
              strokeWidth="2"
            />
            <text
              x={n.x + CARD_W / 2}
              y={n.y + 20}
              textAnchor="middle"
              fill="#ec4899"
              fontSize="12"
            >
              {`Jogo ${n.id}`}
            </text>
            <text x={n.x + 10} y={n.y + 38} fill="#fff" fontSize="11">
              {formatDupla(n.duplaA)}
            </text>
            <text x={n.x + 10} y={n.y + 53} fill="#fff" fontSize="11">
              {formatDupla(n.duplaB)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/** ===================== LÓGICA DE POSIÇÃO ===================== */
function calcularPosicoes() {
  const upperIds = new Set([1,2,3,4,5,6,7,8,13,14,15,16,21,22,27]);
  const lowerIds = new Set([9,10,11,12,17,18,19,20,23,24,25,28]);

  const byId = new Map(estruturaDouble16.map((j) => [j.id, j]));
  const roundsUpper = Math.max(...[...upperIds].map((id) => byId.get(id)?.rodada || 1));
  const roundsLower = Math.max(...[...lowerIds].map((id) => byId.get(id)?.rodada || 1));

  // 🔹 Aumenta horizontal e verticalmente conforme número de rodadas
  const larguraTotal = (roundsUpper + roundsLower) * ESP_H + 1000;
  const alturaTotal = 1400;

  const yCache = new Map();
  const xCache = new Map();

  const refId = (v) => {
    const m = typeof v === "string" && v.match(/Jogo\s+(\d+)/i);
    return m ? Number(m[1]) : null;
  };

  const getX = (id) => {
    if (xCache.has(id)) return xCache.get(id);
    const rodada = byId.get(id)?.rodada || 1;
    let x;
    if (upperIds.has(id)) x = MARGEM + (rodada - 1) * ESP_H;
    else if (lowerIds.has(id)) x = larguraTotal - (MARGEM + CARD_W + (rodada - 1) * ESP_H);
    else x = larguraTotal / 2 - CARD_W / 2;
    xCache.set(id, x);
    return x;
  };

  const getYUpperRound1 = (id) => TOPO + (id - 1) * (CARD_H * 2.2);
  const getYLowerRound1 = (id) => TOPO + (8 * CARD_H * 2.2) + (id - 9) * (CARD_H * 2.2);

  const getY = (id) => {
    if (yCache.has(id)) return yCache.get(id);
    const jogo = byId.get(id);
    if (upperIds.has(id) && jogo.rodada === 1) return yCache.set(id, getYUpperRound1(id)).get(id);
    if (lowerIds.has(id) && jogo.rodada === 1) return yCache.set(id, getYLowerRound1(id)).get(id);

    const aRef = refId(jogo.duplaA);
    const bRef = refId(jogo.duplaB);
    if (aRef && bRef) {
      const yA = getY(aRef);
      const yB = getY(bRef);
      const y = (yA + yB + CARD_H) / 2 - CARD_H / 2;
      yCache.set(id, y);
      return y;
    }
    return TOPO + jogo.rodada * CARD_H * 2.2;
  };

  const nodes = estruturaDouble16.map((j) => ({
    id: j.id,
    x: getX(j.id),
    y: getY(j.id),
    duplaA: j.duplaA,
    duplaB: j.duplaB,
  }));

  return { nodes, largura: larguraTotal, altura: alturaTotal };
}

function formatDupla(v) {
  if (typeof v === "number") return `Dupla ${v}`;
  return v || "";
}
