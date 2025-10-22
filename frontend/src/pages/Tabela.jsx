import React, { useMemo, useRef } from 'react'
import { useBracketStore } from '../store/useBracketStore'
import Finais from '../components/Finais'
import BracketSVG from '../components/BracketSVG'

export default function Tabela() {
  const setFaseAtual = useBracketStore(s => s.setFaseAtual)
  const avancarParaFinais = useBracketStore(s => s.avancarParaFinais)

  // fase via querystring ?fase=finais|classificacao
  const params = new URLSearchParams(window.location.search)
  const faseQS = params.get('fase')
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
      {/* Overlay com botão de tela cheia */}
      <div className="fixed top-3 right-3 z-20">
        <button onClick={toggleFull} className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 rounded text-sm">Tela cheia</button>
      </div>

      {/* Conteúdo puro da tabela */}
      <div ref={wrapRef} className="w-full h-full flex items-start justify-center pt-4">
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
