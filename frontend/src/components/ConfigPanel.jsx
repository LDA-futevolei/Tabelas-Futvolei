import React, { useEffect, useState } from 'react'
import { getAtualCampeonato, getMeta, putMeta } from '../logic/api'

export default function ConfigPanel() {
  const [camp, setCamp] = useState(null)
  const [nome, setNome] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    (async () => {
      const c = await getAtualCampeonato()
      setCamp(c)
      if (c && c.idCampeonato) {
        const m = await getMeta(c.idCampeonato)
        if (m && (m.titulo || m.nome)) setNome(m.titulo || m.nome)
      }
    })()
  }, [])

  const onSave = async () => {
    if (!camp || !camp.idCampeonato) {
      setMsg('❌ Nenhum campeonato ativo. Crie em /torneios')
      return
    }
    try {
      setSaving(true)
      setMsg('')
      await putMeta(camp.idCampeonato, { titulo: nome })
      setMsg('✅ Nome salvo!')
      setTimeout(() => setMsg(''), 2000)
    } catch (e) {
      setMsg('❌ Erro ao salvar: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm text-neutral-300 mb-1">Nome do torneio</label>
        <input
          value={nome}
          onChange={e => setNome(e.target.value)}
          placeholder="Ex.: Copa Futvôlei Outubro"
          className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 focus:outline-none"
        />
      </div>
      <button
        onClick={onSave}
        disabled={saving}
        className={`px-4 py-2 rounded font-semibold ${saving ? 'bg-neutral-700' : 'bg-pink-600 hover:bg-pink-500'}`}
      >{saving ? 'Salvando...' : 'Salvar'}</button>
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  )
}
