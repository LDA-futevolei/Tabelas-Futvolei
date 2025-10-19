import React, { useState, useEffect } from "react";
import { useBracketStore } from "../store/useBracketStore";
import { resolveSlotLabel } from './utils/resolveSlotLabel'

export default function ModalPlacar({ jogo, onSave, onClose }) {
  const duplas = useBracketStore(s => s.participants || s.duplas || []);
  const jogosStore = useBracketStore(s => s.jogos || [])
  const [placarA, setPlacarA] = useState(jogo?.placarA ?? '')
  const [placarB, setPlacarB] = useState(jogo?.placarB ?? '')
  const [manualWinner, setManualWinner] = useState(null)

  useEffect(() => {
    setPlacarA(jogo?.placarA ?? '')
    setPlacarB(jogo?.placarB ?? '')
    setManualWinner(null)
  }, [jogo])

  if (!jogo) return null;

  const labelA = resolveSlotLabel(jogo.a, jogo.fontes || [], duplas, 0, jogosStore)
  const labelB = resolveSlotLabel(jogo.b, jogo.fontes || [], duplas, 1, jogosStore)

  const winnerAuto = (() => {
    const a = Number(placarA)
    const b = Number(placarB)
    if (Number.isNaN(a) || Number.isNaN(b)) return null
    if (a > b) return jogo.a
    if (b > a) return jogo.b
    return null
  })()

  const winnerFinal = manualWinner ?? winnerAuto

  const salvar = () => {
    const payload = { placarA: placarA === '' ? null : Number(placarA), placarB: placarB === '' ? null : Number(placarB) }
    if (winnerFinal) payload.vencedor = winnerFinal
    onSave(jogo.id, payload)
    onClose()
  }

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/70 z-50">
      <div className="bg-gray-900 text-white p-6 rounded-xl w-96">
        <h2 className="text-pink-400 font-bold mb-4">Jogo {jogo.id}</h2>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-sm mb-1">{labelA}</label>
            <input
              type="number"
              className="w-full bg-gray-800 p-2 rounded"
              value={placarA}
              onChange={e => setPlacarA(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">{labelB}</label>
            <input
              type="number"
              className="w-full bg-gray-800 p-2 rounded"
              value={placarB}
              onChange={e => setPlacarB(e.target.value)}
            />
          </div>
        </div>

        <div className="text-sm mb-4">
          <p>Vencedor automático: {winnerAuto ? (winnerAuto === jogo.a ? labelA : labelB) : 'Empate/Indefinido'}</p>
          <label className="block mt-2">Escolher manualmente (W.O, ajuste):</label>
          <select
            value={manualWinner ?? ''}
            onChange={e => setManualWinner(e.target.value || null)}
            className="w-full bg-gray-800 p-2 rounded mt-1"
          >
            <option value="">Automático</option>
            <option value={jogo.a}>{labelA}</option>
            <option value={jogo.b}>{labelB}</option>
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-3 py-1 bg-gray-700 rounded">Cancelar</button>
          <button onClick={salvar} className="px-3 py-1 bg-pink-600 hover:bg-pink-700 rounded">Salvar</button>
        </div>
      </div>
    </div>
  );
}
