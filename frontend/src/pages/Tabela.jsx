import React, { useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useBracketStore } from '../store/useBracketStore'
import Finais from '../components/Finais'
import BracketSVG from '../components/BracketSVG'

export default function Tabela() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const faseQS = searchParams.get('fase')
  
  const setFaseAtual = useBracketStore(s => s.setFaseAtual)
  const avancarParaFinais = useBracketStore(s => s.avancarParaFinais)
  const jogosCount = useBracketStore(s => (s.jogos || []).length)
  useMemo(() => {
    if (faseQS === 'finais') {
      avancarParaFinais()
    } else if (faseQS === 'classificacao') {
      setFaseAtual('classificacao')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const wrapRef = useRef(null)
  const toggleFull = async () => {
    const el = wrapRef.current
    if (!el) return
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (e) {
      console.warn('Fullscreen API não disponível', e)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Overlay com botão de tela cheia e navegação de fases */}
      <div className="fixed top-3 right-3 z-20 flex gap-2">
        {faseQS === 'classificacao' && (
          <button onClick={() => { avancarParaFinais(); navigate('/tabela?fase=finais') }} className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 rounded text-sm">Ir para Finais</button>
        )}
        {faseQS === 'finais' && (
          <button onClick={() => { setFaseAtual('classificacao'); navigate('/tabela?fase=classificacao') }} className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 rounded text-sm">Voltar Classificação</button>
        )}
        <button onClick={toggleFull} className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 rounded text-sm">Tela cheia</button>
      </div>

      {/* Conteúdo puro da tabela */}
      <div ref={wrapRef} className="w-full h-full flex items-start justify-center pt-4 bg-neutral-900">
        {jogosCount === 0 ? (
          <div className="text-center opacity-80 mt-12">
            <p>Nenhuma tabela gerada ainda.</p>
            <p className="text-sm mt-1">Vá para <a className="underline text-pink-400" href="/setup">/setup</a> para cadastrar participantes e gerar a classificatória.</p>
          </div>
        ) : faseQS === 'classificacao' ? (
          <div className="max-w-full overflow-auto">
            <BracketSVG />
          </div>
        ) : (
          <div className="w-fit">
            <Finais />
          </div>
        )}
      </div>
    </div>
  )
}
