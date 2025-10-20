import React from "react";

export default function RoundLabels({ rounds, y, isLosers }) {
  const color = isLosers ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.9)";
  return (
    <g transform={`translate(0, ${y})`}>
      {rounds.map((label, i) => (
        <g key={i} transform={`translate(${i * 244}, 0)`}>
          <rect width="243" height="25" fill="#1b1b1b" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <text
            x="122"
            y="17"
            width="243"
            textAnchor="middle"
            fill={color}
            fontSize="13"
            fontWeight="500"
          >
            {label}
          </text>
        </g>
      ))}
    </g>
  );
}
