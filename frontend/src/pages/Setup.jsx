import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Participants from '../components/Participants'
import { useBracketStore } from '../store/useBracketStore'
import ConfigPanel from '../components/ConfigPanel'
import SidebarNav from '../components/SidebarNav'
import BracketSection from '../components/BracketSection'

export default function Setup() {
  const setFaseAtual = useBracketStore(s => s.setFaseAtual)
  const [tab, setTab] = useState('participantes') // participantes | chaves | configuracoes

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto p-4">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Setup do Campeonato</h1>
          <nav className="flex gap-2 text-sm">
            <Link className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700" to="/tabela?fase=classificacao">Ver Tabela (Classificação)</Link>
            <Link className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700" to="/tabela?fase=finais">Ver Tabela (Finais)</Link>
            <Link className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700" to="/torneios">Meus Torneios</Link>
          </nav>
        </header>
        <div className="flex gap-6">
          {/* Sidebar */}
          <SidebarNav active={tab} onNavigate={setTab} />

          {/* Conteúdo */}
          <div className="flex-1 space-y-6">
            {/* Conteúdo por aba */}
            {tab === 'participantes' && (
              <Participants onAfterGenerate={() => { setFaseAtual('classificacao'); setTab('chaves') }} />
            )}
            {tab === 'chaves' && (
              <BracketSection />
            )}
            {tab === 'configuracoes' && (
              <section className="bg-neutral-900 text-white p-4 rounded space-y-3 border border-neutral-700">
                <h3 className="text-lg font-bold text-pink-400">Configurações</h3>
                <ConfigPanel />
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
