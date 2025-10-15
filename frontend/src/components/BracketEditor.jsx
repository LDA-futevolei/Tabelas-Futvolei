import React, { useState } from "react";
import { estruturaDouble16 } from "./utils/estruturaDouble16";

const CARD_W = 180;
const CARD_H = 60;

export default function BracketEditor() {
  // posições iniciais simples: em grade
  const [nodes, setNodes] = useState(
    estruturaDouble16.map((j, i) => ({
      id: j.id,
      x: 100 + (i % 8) * (CARD_W + 50),
      y: 50 + Math.floor(i / 8) * (CARD_H + 50),
      duplaA: j.duplaA,
      duplaB: j.duplaB,
    }))
  );

  const [dragging, setDragging] = useState(null);

  const handleMouseDown = (e, id) => {
    e.stopPropagation();
    setDragging({
      id,
      startX: e.clientX,
      startY: e.clientY,
    });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setNodes((prev) =>
      prev.map((n) =>
        n.id === dragging.id
          ? {
              ...n,
              x: n.x + (e.clientX - dragging.startX),
              y: n.y + (e.clientY - dragging.startY),
            }
          : n
      )
    );
    setDragging({ ...dragging, startX: e.clientX, startY: e.clientY });
  };

  const handleMouseUp = () => setDragging(null);

  const handleExport = () => {
    const exportData = nodes.map((n) => ({
      id: n.id,
      x: Math.round(n.x),
      y: Math.round(n.y),
    }));
    console.log("📦 Layout exportado:");
    console.log(JSON.stringify(exportData, null, 2));
    alert("Layout exportado! Veja no console (F12).");
  };

  return (
    <div
      className="w-full h-screen bg-black overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ userSelect: "none" }}
    >
      <button
        onClick={handleExport}
        className="absolute top-4 left-4 z-10 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded shadow"
      >
        Salvar layout (console)
      </button>

      <svg width="3000" height="2000">
        {nodes.map((n) => (
          <g
            key={n.id}
            transform={`translate(${n.x}, ${n.y})`}
            onMouseDown={(e) => handleMouseDown(e, n.id)}
            style={{ cursor: "grab" }}
          >
            <rect
              width={CARD_W}
              height={CARD_H}
              rx="12"
              ry="12"
              fill="#111"
              stroke="#ec4899"
              strokeWidth="2"
            />
            <text
              x={CARD_W / 2}
              y={20}
              textAnchor="middle"
              fill="#ec4899"
              fontSize="12"
            >
              {`Jogo ${n.id}`}
            </text>
            <text x={10} y={38} fill="#fff" fontSize="11">
              {formatDupla(n.duplaA)}
            </text>
            <text x={10} y={53} fill="#fff" fontSize="11">
              {formatDupla(n.duplaB)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function formatDupla(v) {
  if (typeof v === "number") return `Dupla ${v}`;
  return v || "";
}
