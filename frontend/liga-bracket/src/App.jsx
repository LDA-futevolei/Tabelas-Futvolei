// FILE: src/App.jsx
import React, { useState } from "react";

export default function App() {
  const [numPlayers, setNumPlayers] = useState(8);

  const [bracket, setBracket] = useState({
    upper: [], 
    lower: [],
  });

  const [selectedMatch, setSelectedMatch] = useState(null);

  const generateBracket = () => {
    const matches = [];
    for (let i = 1; i <= numPlayers; i += 2) {
      matches.push({
        id: i,
        teamA: `Player ${i}`,
        teamB: `Player ${i + 1 <= numPlayers ? i + 1 : "BYE"}`,
        scoreA: 0,
        scoreB: 0,
        winner: null,
      });
    }

    setBracket({ upper: [matches], lower: [] });
  };


  const handleMatchClick = (match) => {
    if (!match.teamB || match.teamB === "BYE") return; 
    setSelectedMatch({ ...match });
  };

  const handleSaveResult = () => {
    const updated = { ...bracket };
    const match = selectedMatch;

   
    updated.upper = updated.upper.map((round) =>
      round.map((m) => (m.id === match.id ? match : m))
    );

    const winner = match.winner;
    const loser = winner === match.teamA ? match.teamB : match.teamA;

    if (winner) {
      if (!updated.upper[1]) updated.upper[1] = [];

      const nextRound = updated.upper[1];
      if (nextRound.length * 2 < updated.upper[0].length) {
        nextRound.push({
          id: Date.now(),
          teamA: winner,
          teamB: null,
          scoreA: 0,
          scoreB: 0,
          winner: null,
        });
      } else {
        const idx = nextRound.findIndex((m) => !m.teamB);
        if (idx !== -1) nextRound[idx].teamB = winner;
      }

      if (!updated.lower[0]) updated.lower[0] = [];
      updated.lower[0].push({
        id: Date.now() + 1,
        teamA: loser,
        teamB: null,
        scoreA: 0,
        scoreB: 0,
        winner: null,
      });
    }

    setBracket(updated);
    setSelectedMatch(null);
  };

  const renderMatches = (rounds, title) =>
    rounds.map((round, rIndex) => (
      <div key={rIndex} className="mb-6">
        <h3 className="font-semibold mb-2">{title} - Round {rIndex + 1}</h3>
        {round.map((match) => (
          <div
            key={match.id}
            onClick={() => handleMatchClick(match)}
            className="cursor-pointer border p-3 mb-3 rounded shadow hover:bg-gray-100 transition"
          >
            <div className="flex justify-between items-center">
              <span>
                {match.teamA} {match.winner === match.teamA && "🏆"}
              </span>
              <span className="font-mono text-gray-700">{match.scoreA}</span>
            </div>
            <div className="flex justify-between items-center border-t mt-1 pt-1">
              <span>
                {match.teamB} {match.winner === match.teamB && "🏆"}
              </span>
              <span className="font-mono text-gray-700">{match.scoreB}</span>
            </div>
          </div>
        ))}
      </div>
    ));

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Two-Sided Double Elimination Bracket
      </h1>

      {}
      <div className="mb-4 flex justify-center gap-4">
        <label>Número de participantes:</label>
        <input
          type="number"
          min="2"
          value={numPlayers}
          onChange={(e) => setNumPlayers(Number(e.target.value))}
          className="border p-1 w-20"
        />
        <button
          onClick={generateBracket}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
        >
          Gerar Bracket
        </button>
      </div>

      {}
      <div className="flex gap-16 justify-center">
        {}
        <div className="flex flex-col items-start">
          {renderMatches(bracket.upper, "Upper Bracket")}
        </div>

        {}
        <div className="flex flex-col items-start">
          {renderMatches(bracket.lower, "Lower Bracket")}
        </div>
      </div>

      {}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-bold mb-3 text-center">
              Editar resultado
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span>{selectedMatch.teamA}</span>
                <input
                  type="number"
                  className="border w-16 p-1 text-center"
                  value={selectedMatch.scoreA}
                  onChange={(e) =>
                    setSelectedMatch({
                      ...selectedMatch,
                      scoreA: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="flex justify-between">
                <span>{selectedMatch.teamB}</span>
                <input
                  type="number"
                  className="border w-16 p-1 text-center"
                  value={selectedMatch.scoreB}
                  onChange={(e) =>
                    setSelectedMatch({
                      ...selectedMatch,
                      scoreB: Number(e.target.value),
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
                  <option value={selectedMatch.teamA}>
                    {selectedMatch.teamA}
                  </option>
                  <option value={selectedMatch.teamB}>
                    {selectedMatch.teamB}
                  </option>
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
