import React, { useMemo, useState } from 'react'
import { useBracketStore } from '../store/useBracketStore'
import ModalPlacar from './ModalPlacar'
import MatchCard from './MatchCard'

export default function Finais() {
  const jogos = useBracketStore(s => s.jogos || [])
  const duplas = useBracketStore(s => s.participants || s.duplas || [])
  const setPlacar = useBracketStore(s => s.setPlacar)

  const finais = useMemo(() => jogos.filter(j => ['semi', 'final', 'third-place', 'grand-final'].includes(j.tipo)), [jogos])

  const [modalJogo, setModalJogo] = useState(null)

  const onSave = (id, payload) => {
    setPlacar(id, payload)
  }

  return (
    <div className="bg-neutral-900 text-white p-4 rounded space-y-3">
      <h3 className="text-lg font-bold text-pink-400">Fase Finais</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {finais.map(j => (
          <div key={j.id} className="bg-neutral-800 p-3 rounded">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-pink-300 font-semibold">{j.tipo === 'semi' ? `Semi ${j.id}` : j.tipo === 'final' ? 'Final' : j.tipo === 'third-place' ? '3º lugar' : 'Grand Final'}</div>
                <div className="text-xs text-neutral-300">Jogo {j.id}</div>
              </div>
              <div>
                <button onClick={() => setModalJogo(j)} className="px-2 py-1 bg-pink-600 rounded text-sm">Editar</button>
              </div>
            </div>
            <div className="mt-3">
              <svg width="100%" height="70">
                <MatchCard jogo={j} jogos={jogos} duplas={duplas} x={0} y={0} />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {modalJogo && (
        <ModalPlacar jogo={modalJogo} onSave={onSave} onClose={() => setModalJogo(null)} />
      )}
    </div>
  )
}
