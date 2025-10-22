import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Participants from '../components/Participants'
import { useBracketStore } from '../store/useBracketStore'

export default function Setup() {
  const navigate = useNavigate()
  const faseAtual = useBracketStore(s => s.faseAtual)
  const setFaseAtual = useBracketStore(s => s.setFaseAtual)
  const avancarParaFinais = useBracketStore(s => s.avancarParaFinais)

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Setup do Campeonato</h1>
          <nav className="flex gap-2 text-sm">
            <Link className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700" to="/tabela?fase=classificacao">Ver Tabela (Classificação)</Link>
            <Link className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700" to="/tabela?fase=finais">Ver Tabela (Finais)</Link>
            <Link className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700" to="/dashboard">Dashboard</Link>
          </nav>
        </header>

        {/* Painel de participantes + gerar classificatória */}
  <Participants onAfterGenerate={() => { navigate('/tabela?fase=classificacao') }} />

        {/* Ações rápidas de fase */}
        <section className="bg-neutral-900 text-white p-4 rounded space-y-3">
          <h3 className="text-lg font-bold text-pink-400">Fases</h3>
          <div className="flex flex-wrap gap-2 items-center">
            <button
              className={`px-3 py-1 rounded ${faseAtual !== 'finais' ? 'bg-pink-600' : 'bg-neutral-700'} `}
              onClick={() => setFaseAtual('classificacao')}
            >Ir para Classificação</button>
            <button
              className={`px-3 py-1 rounded ${faseAtual === 'finais' ? 'bg-pink-600' : 'bg-neutral-700'} `}
              onClick={() => avancarParaFinais()}
            >Montar/Ir para Finais</button>
          </div>
          <p className="text-xs text-neutral-400">Dica: você pode abrir a exibição pública em outra aba usando os links "Ver Tabela" acima.</p>
        </section>
      </div>
    </div>
  )
}
