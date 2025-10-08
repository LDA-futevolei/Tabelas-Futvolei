import React from "react";

export default function LayoutSvg({ bracket }) {
  const width = 150 * (bracket.upper.length + bracket.lower.length + 1);
  const height = 50 * Math.max(
    ...bracket.upper.map(r => r.jogos.length),
    ...bracket.lower.map(r => r.jogos.length)
  );

  const gapX = 150;
  const gapY = 50;

  const getY = (index, roundLength) => index * gapY * Math.pow(2, bracket.upper.length - roundLength);

  return (
    <svg width={width} height={height}>
      {/* Upper Bracket */}
      {bracket.upper.map((round, rx) =>
        round.jogos.map((jogo, ix) => {
          const x = rx * gapX;
          const y = ix * gapY * 2;
          return (
            <g key={jogo.id}>
              <rect x={x} y={y} width={140} height={40} fill="#1F1F1F" stroke="#EC4899" rx="8" />
              <text x={x + 5} y={y + 15} fill="#EC4899" fontSize="12">
                {jogo.duplaA}
              </text>
              <text x={x + 5} y={y + 30} fill="#EC4899" fontSize="12">
                {jogo.duplaB}
              </text>
              <text x={x + 100} y={y + 25} fill="#F472B6" fontSize="10">
                {jogo.id}
              </text>
            </g>
          );
        })
      )}

      {/* Lower Bracket */}
      {bracket.lower.map((round, rx) =>
        round.jogos.map((jogo, ix) => {
          const x = (bracket.upper.length + rx + 1) * gapX;
          const y = ix * gapY * 2;
          return (
            <g key={jogo.id}>
              <rect x={x} y={y} width={140} height={40} fill="#1F1F1F" stroke="#EC4899" rx="8" />
              <text x={x + 5} y={y + 15} fill="#EC4899" fontSize="12">
                {jogo.duplaA}
              </text>
              <text x={x + 5} y={y + 30} fill="#EC4899" fontSize="12">
                {jogo.duplaB}
              </text>
              <text x={x + 100} y={y + 25} fill="#F472B6" fontSize="10">
                {jogo.id}
              </text>
            </g>
          );
        })
      )}

      {/* Final */}
      <g>
        <rect
          x={bracket.upper.length * gapX}
          y={height / 2 - 20}
          width={140}
          height={40}
          fill="#1F1F1F"
          stroke="#EC4899"
          rx="8"
        />
        <text x={bracket.upper.length * gapX + 5} y={height / 2 - 5} fill="#EC4899" fontSize="12">
          {bracket.final.duplaA}
        </text>
        <text x={bracket.upper.length * gapX + 5} y={height / 2 + 15} fill="#EC4899" fontSize="12">
          {bracket.final.duplaB}
        </text>
        <text x={bracket.upper.length * gapX + 100} y={height / 2 + 5} fill="#F472B6" fontSize="10">
          {bracket.final.id}
        </text>
      </g>
    </svg>
  );
}
