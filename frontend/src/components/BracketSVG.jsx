import React, { useMemo } from "react";
import { estruturaDouble16 } from "./utils/estruturaDouble16";

// Ajustes visuais
const CARD_W = 180;
const CARD_H = 60;
const MARGEM = 80;
const TOPO = 40;
const ESP_H = 180;  // distância entre colunas (rounds)
const GAP_CENTRO = 240; // espaço entre upper e lower (no meio)

export default function BracketSVG() {
  // Calcula posições com base no grafo (winner/loser) da estrutura
  const { nodes, largura, altura } = useMemo(() => calcularPosicoes(), []);

  // Drag (estilo Challonge)
  const onMouseDown = (e) => {
    const el = e.currentTarget;
    let sx = e.clientX;
    let sy = e.clientY;
    const sl = el.scrollLeft;
    const st = el.scrollTop;
    const move = (ev) => {
      el.scrollLeft = sl - (ev.clientX - sx);
      el.scrollTop = st - (ev.clientY - sy);
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div
  onMouseDown={onMouseDown}
  className="w-full h-screen bg-black overflow-hidden select-none cursor-grab active:cursor-grabbing"
  style={{ userSelect: "none" }}
>
      <svg width={largura} height={altura} viewBox={`0 0 ${largura} ${altura}`}>
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
            <text
              x={n.x + 10}
              y={n.y + 38}
              fill="#fff"
              fontSize="11"
            >
              {formatDupla(n.duplaA)}
            </text>
            <text
              x={n.x + 10}
              y={n.y + 53}
              fill="#fff"
              fontSize="11"
            >
              {formatDupla(n.duplaB)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/** ===== LÓGICA DE POSICIONAMENTO ===== */
function calcularPosicoes() {
  // Índices upper/lower conforme estrutura que montamos antes
  const upperIds = new Set([1,2,3,4,5,6,7,8,13,14,15,16,21,22,27,29]);
  const lowerIds = new Set([9,10,11,12,17,18,19,20,23,24,25,28]);

  // Mapa por id
  const byId = new Map(estruturaDouble16.map(j => [j.id, j]));

  // Rodadas máximas de cada lado
  const roundsUpper = Math.max(...[...upperIds].map(id => byId.get(id)?.rodada || 1));
  const roundsLower = Math.max(...[...lowerIds].map(id => byId.get(id)?.rodada || 1));

  // Largura total (left upper + gap + right lower)
  const larguraUpper = MARGEM + CARD_W + (roundsUpper - 1) * ESP_H;
  const larguraLower = CARD_W + (roundsLower - 1) * ESP_H + MARGEM;
  const larguraTotal = larguraUpper + GAP_CENTRO + larguraLower;

  // Caches de Y e X
  const yCache = new Map();
  const xCache = new Map();

  // Helpers
  const getRodada = (id) => byId.get(id).rodada;

  const getX = (id) => {
    if (xCache.has(id)) return xCache.get(id);
    const rodada = getRodada(id);

    let x;
    if (upperIds.has(id)) {
      // Upper: da esquerda para o centro
      x = MARGEM + (rodada - 1) * ESP_H;
    } else {
      // Lower: da direita para o centro (espelhado)
      const offset = (rodada - 1) * ESP_H;
      x = larguraTotal - (MARGEM + CARD_W + offset);
    }
    xCache.set(id, x);
    return x;
  };

  // Extrai referências "Vencedor Jogo N" / "Perdedor Jogo N"
  const refId = (val) => {
    if (typeof val !== "string") return null;
    const m = val.match(/Jogo\s+(\d+)/i);
    return m ? Number(m[1]) : null;
  };

  // Y da rodada 1 (upper): distribui 8 jogos igualmente
  const getYUpperRound1 = (id) => {
    // IDs 1..8
    const idx = id - 1; // 0..7
    return TOPO + idx * 2 * CARD_H; // espaçamento grande entre jogos
  };

  // Y genérico por média das origens
  const getY = (id) => {
    if (yCache.has(id)) return yCache.get(id);
    const jogo = byId.get(id);

    // primeira rodada do upper
    if (upperIds.has(id) && jogo.rodada === 1) {
      const y = getYUpperRound1(id);
      yCache.set(id, y);
      return y;
    }

    // Demais rodadas: média das origens (vencedor/perdedor)
    const aRef = refId(jogo.duplaA);
    const bRef = refId(jogo.duplaB);

    // Para lower rodada 1 (jogos 9..12), duplaA/B são "Perdedor Jogo n"
    // Para rounds >1, sempre referenciam "Vencedor/Perdedor Jogo n"
    // Então sempre podemos pegar a média dos Y de aRef e bRef.
    if (aRef && bRef) {
      const yA = getY(aRef);
      const yB = getY(bRef);
      const y = (yA + yB + CARD_H) / 2 - CARD_H / 2;
      yCache.set(id, y);
      return y;
    }

    // fallback (se ocorrer algum caso sem refs): empilha pela rodada
    const y = TOPO + (jogo.rodada - 1) * CARD_H * 1.5;
    yCache.set(id, y);
    return y;
  };

  // Monta nós com x/y já calculados
  const nodes = estruturaDouble16.map((j) => ({
    id: j.id,
    x: getX(j.id),
    y: getY(j.id),
    duplaA: j.duplaA,
    duplaB: j.duplaB,
  }));

  // Altura total baseada no maior Y
  const maxY = Math.max(...nodes.map(n => n.y)) + CARD_H + TOPO;
  const alturaTotal = Math.max(maxY, 800); // mínimo de 800 p/ evitar corte

  // Centro do SVG (posição central)
const centroX = larguraTotal / 2 - CARD_W / 2;
const centroY = (alturaTotal / 2) - 200;

// Jogo 30 = Final
nodes.push({
  id: 30,
  x: centroX,
  y: centroY,
  duplaA: "Vencedor Upper",
  duplaB: "Vencedor Lower",
});

// Jogo 31 = 3º lugar
nodes.push({
  id: 31,
  x: centroX,
  y: centroY + 180,
  duplaA: "Perdedor Semi Upper",
  duplaB: "Perdedor Semi Lower",
});

  return { nodes, largura: larguraTotal, altura: alturaTotal };
}

/** Formata texto do card */
function formatDupla(v) {
  if (typeof v === "number") return `Dupla ${v}`;
  return v || "";
}
