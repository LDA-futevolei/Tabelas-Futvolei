import { useState } from "react";
import BracketColumn from "./components/BracketColumn";

export default function App() {
    const [numPlayers, setNumPlayers] = useState(8);
    const [bracket, setBracket] = useState({ upper: [], lower: [] });
    const [selectedMatch, setSelectedMatch] = useState(null);

    const generateBracket = () => {
        const matches = [];
        for (let i = 1; i <= numPlayers; i += 2) {
            matches.push({
                id: i,
                teamA: `Dupla ${i}`,
                teamB: `Dupla ${i + 1 <= numPlayers ? i + 1 : "BYE"}`,
                scoreA: "",
                scoreB: "",
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
                    scoreA: "",
                    scoreB: "",
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
                scoreA: "",
                scoreB: "",
                winner: null,
            });
        }

        setBracket(updated);
        setSelectedMatch(null);
    };

    return (
        <div class="min-h-screen w-screen bg-black text-pink-400 flex flex-col">
            <h1 className="text-3xl font-bold mb-6 text-pink-500 text-center">
                Liga dos Amigos 🏐
            </h1>

            <div className="mb-6 flex flex-wrap justify-center gap-3">
                <label className="text-pink-400 font-medium">
                    Número de duplas:
                </label>
                <input
                    type="number"
                    min="2"
                    value={numPlayers}
                    onChange={(e) => setNumPlayers(Number(e.target.value))}
                    className="border border-pink-500 p-1 w-20 text-black text-center rounded"
                />
                <button
                    onClick={generateBracket}
                    className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-1 rounded-lg font-semibold shadow"
                >
                    Gerar Bracket
                </button>
            </div>

            <div className="flex justify-center items-start w-full h-full min-h-screen px-4 gap-8">
                {/* Upper Bracket rounds */}
                {bracket.upper.map((round, i) => (
                    <BracketColumn
                        key={i}
                        rounds={[round]}
                        title={`Upper Round ${i + 1}`}
                        onMatchClick={handleMatchClick}
                        side="left"
                    />
                ))}

                {/* Lower Bracket rounds */}
                {bracket.lower.map((round, i) => (
                    <BracketColumn
                        key={i}
                        rounds={[round]}
                        title={`Lower Round ${i + 1}`}
                        onMatchClick={handleMatchClick}
                        side="right"
                    />
                ))}
            </div>

            {selectedMatch && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-gray-900 border border-pink-600 rounded-2xl shadow-lg p-6 w-80">
                        <h3 className="text-lg font-bold mb-3 text-center text-pink-400">
                            Editar resultado
                        </h3>

                        <div className="space-y-3">
                            <div class="flex justify-between w-full px-8 flex-grow">
                                <span>{selectedMatch.teamA}</span>
                                <input
                                    type="number"
                                    className="border border-gray-500 bg-white text-black w-16 p-1 text-center rounded"
                                    value={selectedMatch.scoreA}
                                    onChange={(e) =>
                                        setSelectedMatch({
                                            ...selectedMatch,
                                            scoreA: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div class="flex justify-between w-full px-8 flex-grow">
                                <span>{selectedMatch.teamB}</span>
                                <input
                                    type="number"
                                    className="border border-gray-500 bg-white text-black w-16 p-1 text-center rounded"
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
                                <label className="text-sm text-gray-400">Vencedor:</label>
                                <select
                                    className="border border-pink-600 bg-gray-800 p-1 w-full rounded text-white"
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
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
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
            )}
        </div>
    );
}
