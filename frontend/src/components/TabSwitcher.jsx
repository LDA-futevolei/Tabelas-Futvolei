import { useMemo } from 'react'
import { useBracketStore } from '../store/useBracketStore'

export default function TabSwitcher() {
  const faseAtual = useBracketStore(s => s.faseAtual)
  const setFaseAtual = useBracketStore(s => s.setFaseAtual)
  const participants = useBracketStore(s => s.participants || s.duplas || [])
  const jogos = useBracketStore(s => s.jogos)
  const avancarParaFinais = useBracketStore(s => s.avancarParaFinais)

  const classDone = useMemo(() => {
    const classJogos = jogos.filter(j => j.fase === 'class')
    return classJogos.length > 0 && classJogos.filter(j => !j.vencedor).length === 0
  }, [jogos])

  return (
    <div className="flex items-center gap-2 mb-4">
      <button
        className={`px-4 py-2 rounded-2xl shadow ${
          faseAtual === 'classificacao' ? 'bg-neutral-900 text-white' : 'bg-white'
        }`}
  onClick={() => setFaseAtual('classificacao')}
      >
        Classificatória
      </button>

      <button
        className={`px-4 py-2 rounded-2xl shadow ${
          faseAtual === 'finais' ? 'bg-neutral-900 text-white' : 'bg-white'
        }`}
  onClick={() => setFaseAtual('finais')}
      >
        Fase Finais
      </button>

      <div className="ml-auto flex items-center gap-2">
        <button
          className="px-3 py-2 rounded-lg bg-white shadow border"
          onClick={() => window.location.reload()}
        >
          Reset
        </button>
        <button
          className="px-3 py-2 rounded-lg bg-white shadow border"
          onClick={() => alert(`Participantes: ${participants.length}`)}
        >
          Info
        </button>
        <button
          className={`px-3 py-2 rounded-lg ${
            classDone
              ? 'bg-emerald-600 text-white'
              : 'bg-neutral-300 text-neutral-600 cursor-not-allowed'
          }`}
          disabled={!classDone}
          onClick={avancarParaFinais}
        >
          Gerar Finais
        </button>
      </div>
    </div>
  )
}
