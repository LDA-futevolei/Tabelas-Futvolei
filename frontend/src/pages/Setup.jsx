import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Participants from '../components/Participants'
import { useBracketStore } from '../store/useBracketStore'
import { putClassificacaoLayout, putFinaisLayout, getAtualCampeonato } from '../logic/api'
import { downloadJSON } from '../logic/utils'
import BracketSVG from '../components/BracketSVG'
import Finais from '../components/Finais'
import ConfigPanel from '../components/ConfigPanel'

export default function Setup() {
  
  const faseAtual = useBracketStore(s => s.faseAtual)
  const setFaseAtual = useBracketStore(s => s.setFaseAtual)
  const avancarParaFinais = useBracketStore(s => s.avancarParaFinais)
  const jogos = useBracketStore(s => s.jogos)
  const participants = useBracketStore(s => s.participants)
  const [tab, setTab] = useState('participantes') // participantes | chaves | configuracoes
  
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const canExport = useMemo(() => (participants?.length || 0) > 0 || (jogos?.length || 0) > 0, [participants, jogos])

  const handleSave = async () => {
    setSaving(true)
    setSaveMessage('')
    try {
      // Pegar o campeonato atual
      const camp = await getAtualCampeonato()
      if (!camp || !camp.idCampeonato) {
        setSaveMessage('❌ Nenhum campeonato ativo. Crie um em /torneios primeiro.')
        return
      }

      // Separar jogos de classificação e finais
      const jogosClass = jogos.filter(j => j.fase === 'class')
      const jogosFinais = jogos.filter(j => j.fase === 'finais')

      // Salvar classificação
      const dataClass = { jogos: jogosClass, participants }
      await putClassificacaoLayout(camp.idCampeonato, dataClass)

      // Salvar finais
      const dataFinais = { jogos: jogosFinais }
      await putFinaisLayout(camp.idCampeonato, dataFinais)

      setSaveMessage('✅ Torneio salvo com sucesso!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (e) {
      console.error(e)
      setSaveMessage('❌ Erro ao salvar: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleExportJSON = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      faseAtual,
      participants,
      jogos,
    }
    const name = `torneio-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`
    downloadJSON(payload, name)
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Setup do Campeonato</h1>
          <nav className="flex gap-2 text-sm">
            <Link className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700" to="/tabela?fase=classificacao">Ver Tabela (Classificação)</Link>
            <Link className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700" to="/tabela?fase=finais">Ver Tabela (Finais)</Link>
            <Link className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700" to="/torneios">Meus Torneios</Link>
          </nav>
        </header>

        {/* Tabs internas */}
        <div className="flex items-center gap-2">
          <button onClick={() => setTab('participantes')} className={`px-3 py-1 rounded ${tab==='participantes'?'bg-pink-600':'bg-neutral-800'}`}>Participantes</button>
          <button onClick={() => setTab('chaves')} className={`px-3 py-1 rounded ${tab==='chaves'?'bg-pink-600':'bg-neutral-800'}`}>Chaves</button>
          <button onClick={() => setTab('configuracoes')} className={`px-3 py-1 rounded ${tab==='configuracoes'?'bg-pink-600':'bg-neutral-800'}`}>Configurações</button>
        </div>

        {/* Conteúdo por aba */}
        {tab === 'participantes' && (
          <Participants onAfterGenerate={() => { setFaseAtual('classificacao'); setTab('chaves') }} />
        )}
        {tab === 'chaves' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button className={`px-3 py-1 rounded ${faseAtual !== 'finais' ? 'bg-pink-600' : 'bg-neutral-700'}`} onClick={() => setFaseAtual('classificacao')}>Classificação</button>
              <button className={`px-3 py-1 rounded ${faseAtual === 'finais' ? 'bg-pink-600' : 'bg-neutral-700'}`} onClick={() => avancarParaFinais()}>Fase Finais</button>
            </div>
            {faseAtual === 'finais' ? (
              <div className="w-fit">
                <Finais />
              </div>
            ) : (
              <div className="max-w-full overflow-auto">
                <BracketSVG />
              </div>
            )}
          </div>
        )}
        {tab === 'configuracoes' && (
          <section className="bg-neutral-900 text-white p-4 rounded space-y-3 border border-neutral-700">
            <h3 className="text-lg font-bold text-pink-400">Configurações</h3>
            <ConfigPanel />
          </section>
        )}

        {/* Botão de salvar e Exportar JSON */}
        <section className="bg-neutral-900 text-white p-4 rounded space-y-3 border border-pink-600">
          <h3 className="text-lg font-bold text-pink-400">Salvar Torneio</h3>
          <p className="text-sm text-neutral-300">Salve o torneio atual (participantes, classificação e finais) no banco de dados ou exporte um arquivo JSON para importar depois.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || jogos.length === 0}
              className={`px-4 py-2 rounded font-semibold ${
                saving || jogos.length === 0
                  ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                  : 'bg-pink-600 hover:bg-pink-500'
              }`}
            >
              {saving ? 'Salvando...' : '💾 Salvar Torneio'}
            </button>
            <button
              onClick={handleExportJSON}
              disabled={!canExport}
              className={`px-4 py-2 rounded font-semibold ${
                !canExport
                  ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                  : 'bg-neutral-800 hover:bg-neutral-700'
              }`}
            >
              ⬇️ Exportar JSON
            </button>
            {saveMessage && <span className="text-sm">{saveMessage}</span>}
          </div>
          {jogos.length === 0 && (
            <p className="text-xs text-yellow-400">⚠️ Gere a classificatória antes de salvar.</p>
          )}
        </section>

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
