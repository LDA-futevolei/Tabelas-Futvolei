import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import BracketSVG from "./components/BracketEditor";
import { gerarBracket } from "./components/utils/gerarBracket";

export default function App() {
  const [aberta, setAberta] = useState(true);
  const [numDuplas, setNumDuplas] = useState(16);
  const [bracket, setBracket] = useState(null);

  const handleGerarBracket = () => {
    const nova = gerarBracket(numDuplas);
    setBracket(nova);
  };

  return (
    <div className="flex w-screen min-h-screen bg-black text-pink-400">
      {/* Sidebar */}
      <Sidebar aberta={aberta} setAberta={setAberta} onGerar={handleGerarBracket} />

      {/* Área da bracket */}
      <div className="flex-1 relative overflow-hidden">
        {bracket ? (
          <div className="w-full h-full">
            <BracketSVG bracket={bracket} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-3xl font-bold text-pink-500 mb-4">
              Liga de Futevôlei 🏐
            </h1>
            <div className="flex flex-wrap justify-center gap-3">
              <label className="text-pink-400 font-medium">Número de duplas:</label>
              <input
                min="2"
                type="number"
                value={numDuplas}
                onChange={(e) => setNumDuplas(Number(e.target.value))}
                className="border border-pink-500 p-1 w-20 text-black text-center rounded"
              />
              <button
                onClick={handleGerarBracket}
                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-1 rounded-lg font-semibold shadow"
              >
                Gerar Bracket
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}