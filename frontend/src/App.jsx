import React, { useState } from "react";
import LayoutSvg from "./components/LayoutSvg";
import { gerarBracketSvg } from "./components/utils/gerarBracketSvg";

export default function App() {
  const [numDuplas, setNumDuplas] = useState(8);
  const [bracket, setBracket] = useState(null);

  return (
    <div className="w-full h-screen bg-black text-pink-400 flex flex-col items-center overflow-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-pink-500 text-center">
        Liga de Futevôlei 🏐
      </h1>

      <div className="mb-6 flex flex-wrap justify-center gap-3">
        <label className="text-pink-400 font-medium">Número de duplas:</label>
        <input
          min="2"
          type="number"
          value={numDuplas}
          onChange={(e) => setNumDuplas(Number(e.target.value))}
          className="border border-pink-500 p-1 w-20 text-black text-center rounded"
        />
        <button
          onClick={() => setBracket(gerarBracketSvg(numDuplas))}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-1 rounded-lg font-semibold shadow"
        >
          Gerar Bracket
        </button>
      </div>

      {bracket && <LayoutSvg bracket={bracket} />}
    </div>
  );
}
