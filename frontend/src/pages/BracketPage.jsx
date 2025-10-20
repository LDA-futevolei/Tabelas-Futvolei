import BracketSVG from '../components/BracketSVG'
import Participants from '../components/Participants'
import Finais from '../components/Finais'
import { useBracketStore } from '../store/useBracketStore'

export default function BracketPage() {
  const faseAtual = useBracketStore(s => s.faseAtual)
  const setFaseAtual = useBracketStore(s => s.setFaseAtual)
  const avancarParaFinais = useBracketStore(s => s.avancarParaFinais)
  return (
    <div className="min-h-screen bg-neutral-900 text-white p-4">
      <div className="w-full space-y-4">
        <div className="max-w-7xl mx-auto px-4">
          <Participants />
        </div>
        <div className="w-full">
          {/* Barra de abas permanece dentro do container */}
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-2 mb-4">
              <button
                className={`px-3 py-1 rounded ${faseAtual !== 'finais' ? 'bg-pink-600' : 'bg-neutral-700'}`}
                onClick={() => setFaseAtual('classificacao')}
              >Classificação</button>
              <button
                className={`px-3 py-1 rounded ${faseAtual === 'finais' ? 'bg-pink-600' : 'bg-neutral-700'}`}
                onClick={() => {
                  // ao entrar nas finais, garante montar as chaves
                  avancarParaFinais()
                }}
              >Fase Finais</button>
            </div>
          </div>

          {/* Bracket: finais sem limite de largura para permitir crescer conforme o SVG */}
          {faseAtual === 'finais' ? (
            <div className="w-fit mx-auto">
              <Finais />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-4">
              <BracketSVG />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
