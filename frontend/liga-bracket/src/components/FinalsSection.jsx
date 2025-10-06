import React from "react";

export default function FinalsSection() {
  return (
    <div className="text-center text-white space-y-4">
      <h3 className="font-semibold text-pink-500 text-lg">Semifinais</h3>
      <div className="border border-pink-400 p-3 rounded bg-white text-black shadow w-56 mx-auto">
        Vencedor Upper 1 🆚 Vencedor Lower 1
      </div>
      <div className="border border-pink-400 p-3 rounded bg-white text-black shadow w-56 mx-auto">
        Vencedor Upper 2 🆚 Vencedor Lower 2
      </div>

      <h3 className="font-semibold text-pink-500 text-lg mt-6">Final</h3>
      <div className="border border-pink-500 p-4 rounded bg-white text-black shadow w-64 mx-auto font-bold">
        🏆 Campeão 🏆
      </div>
    </div>
  );
}
