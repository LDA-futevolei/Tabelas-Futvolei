import React from "react";

export default function Sidebar({ aberta, setAberta, onGerar }) {
  return (
    <div
      className={`transition-all duration-300 bg-gray-900 border-r border-pink-600 ${
        aberta ? "w-64" : "w-16"
      } flex flex-col`}
    >
      <button
        onClick={() => setAberta(!aberta)}
        className="text-center text-pink-400 hover:text-pink-200 py-3 border-b border-pink-700"
      >
        {aberta ? "◀" : "▶"}
      </button>

      {aberta && (
        <div className="p-4 space-y-3">
          <h2 className="font-bold text-lg text-pink-400">Menu</h2>

          <button
            onClick={onGerar}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-md shadow"
          >
            Gerar Bracket
          </button>

          {/* Outros botões da dashboard aqui depois */}
        </div>
      )}
    </div>
  );
}
