import React, { useState } from 'react'
import { useBracketStore } from '../store/useBracketStore'

export default function Participants({ onAfterGenerate } = {}) {
  const participants = useBracketStore(s => s.participants || [])
  const addDupla = useBracketStore(s => s.addDupla)
  const removeDupla = useBracketStore(s => s.removeDupla)
  const bulkAddDuplas = useBracketStore(s => s.bulkAddDuplas)
  const gerarClassificatoria = useBracketStore(s => s.gerarClassificatoria)

  const [name, setName] = useState('')
  const [bulk, setBulk] = useState('')
  

  const onAdd = () => {
    if (!name.trim()) return
    addDupla(name.trim())
    setName('')
  }

  const onBulk = () => {
    const lines = bulk.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    if (lines.length === 0) return
    bulkAddDuplas(lines)
    setBulk('')
  }

  return (
    <div className="bg-neutral-900 text-white p-4 rounded space-y-3">
      <h3 className="text-lg font-bold text-pink-400">Participantes</h3>
      <div className="flex gap-2">
        <input value={name} onChange={e => setName(e.target.value)} className="flex-1 p-2 rounded bg-gray-800" placeholder="Entre com os nomes das duplas" />
        <button onClick={onAdd} className="px-3 py-2 bg-pink-600 rounded">+ Add</button>
      </div>

      <div>
        <label className="text-sm">Bulk add (uma linha por participante)</label>
  <textarea value={bulk} onChange={e => setBulk(e.target.value)} className="w-full p-2 rounded bg-gray-800 mt-1" rows={4} placeholder={`Adicione os participantes`} />
        <div className="flex justify-end mt-2">
          <button onClick={onBulk} className="px-3 py-2 bg-pink-600 rounded">Adicionar em massa</button>
        </div>
      </div>

      <div>
        <p className="text-sm mb-2">Lista</p>
        <ul className="space-y-1 max-h-40 overflow-auto text-sm">
          {participants.map(d => (
            <li key={d.id} className="flex justify-between items-center bg-neutral-800 p-2 rounded">
              <span>{d.nome || `Dupla ${d.id}`}</span>
              <button onClick={() => removeDupla(d.id)} className="text-xs text-red-400">Remover</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-between items-center gap-3">
        <div className="text-xs text-gray-400">Total: {participants.length}</div>
        <button
          onClick={() => { gerarClassificatoria({ prelim: true }); if (typeof onAfterGenerate === 'function') onAfterGenerate(); }}
          className="px-3 py-2 bg-green-600 rounded"
        >Gerar Classificatória (Prelim)</button>
      </div>
    </div>
  )
}
