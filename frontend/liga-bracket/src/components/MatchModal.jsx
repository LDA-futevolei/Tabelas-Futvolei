import React from "react";

export default function MatchModal({
  selectedMatch,
  setSelectedMatch,
  handleSaveResult,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80">
        <h3 className="text-lg font-bold mb-3 text-center text-pink-600">
          Editar Resultado
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span>{selectedMatch.teamA}</span>
            <input
              type="text"
              className="border border-gray-400 bg-white w-16 p-1 text-center"
              value={selectedMatch.scoreA}
              onChange={(e) =>
                setSelectedMatch({
                  ...selectedMatch,
                  scoreA: e.target.value,
                })
              }
            />
          </div>

          <div className="flex justify-between">
            <span>{selectedMatch.teamB}</span>
            <input
              type="text"
              className="border border-gray-400 bg-white w-16 p-1 text-center"
              value={selectedMatch.scoreB}
              onChange={(e) =>
                setSelectedMatch({
                  ...selectedMatch,
                  scoreB: e.target.value,
                })
              }
            />
          </div>

          <div className="mt-4 flex flex-col items-center gap-2">
            <label className="text-sm text-gray-600">Vencedor:</label>
            <select
              className="border p-1 w-full"
              value={selectedMatch.winner || ""}
              onChange={(e) =>
                setSelectedMatch({
                  ...selectedMatch,
                  winner: e.target.value,
                })
              }
            >
              <option value="">Selecione</option>
              <option value={selectedMatch.teamA}>{selectedMatch.teamA}</option>
              <option value={selectedMatch.teamB}>{selectedMatch.teamB}</option>
            </select>
          </div>

          <div className="flex justify-between mt-5">
            <button
              onClick={() => setSelectedMatch(null)}
              className="bg-gray-300 hover:bg-gray-400 text-black px-3 py-1 rounded"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveResult}
              className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
