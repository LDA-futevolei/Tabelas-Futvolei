import React from "react";

export default function RoundLabels({ rounds, y, isLosers }) {
  const color = isLosers ? "#aaa" : "#fff";
  return (
    <g transform={`translate(0, ${y})`}>
      {rounds.map((label, i) => (
        <g key={i} transform={`translate(${i * 244}, 0)`}>
          <rect width="243" height="25" fill="#111" stroke="#ec4899" strokeWidth="1" />
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
