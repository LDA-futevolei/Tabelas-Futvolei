import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBracketStore } from '../store/useBracketStore'
import { downloadJSON } from '../logic/utils'
import BracketSVG from './BracketSVG'
import Finais from './Finais'

export default function BracketSection() {
  const faseAtual = useBracketStore(s => s.faseAtual)
  const setFaseAtual = useBracketStore(s => s.setFaseAtual)
  const avancarParaFinais = useBracketStore(s => s.avancarParaFinais)
  const jogos = useBracketStore(s => s.jogos)
  const participants = useBracketStore(s => s.participants)
  
  const containerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [showFullscreen, setShowFullscreen] = useState(false)

  // Drag horizontal com mouse
  const handleMouseDown = (e) => {
    if (!containerRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - containerRef.current.offsetLeft)
    setScrollLeft(containerRef.current.scrollLeft)
  }

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return
    e.preventDefault()
    const x = e.pageX - containerRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    containerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleExportJSON = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      faseAtual,
      participants,
      jogos,
    }
    const name = `finais-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`
    downloadJSON(payload, name)
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho com ícone */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-neutral-800">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h4v4H4zM16 6h4v4h-4zM10 10h4M4 14h4v4H4zM16 14h4v4h-4zM10 14h4"/>
            </svg>
          </span>
          <h2 className="text-xl font-semibold">Bracket</h2>
        </div>
        
        {/* Botão exportar JSON - só aparece na fase finais */}
        {faseAtual === 'finais' && (
          <button
            onClick={handleExportJSON}
            className="px-3 py-2 rounded font-semibold bg-neutral-800 hover:bg-neutral-700 text-sm"
          >
            ⬇️ Exportar JSON
          </button>
        )}
      </div>

      {/* Botões de fase */}
      <div className="flex gap-2">
        <button 
          className={`px-3 py-1 rounded ${faseAtual !== 'finais' ? 'bg-pink-600' : 'bg-neutral-700'}`} 
          onClick={() => setFaseAtual('classificacao')}
        >
          Classificação
        </button>
        <button 
          className={`px-3 py-1 rounded ${faseAtual === 'finais' ? 'bg-pink-600' : 'bg-neutral-700'}`} 
          onClick={() => avancarParaFinais()}
        >
          Fase Finais
        </button>
      </div>

      {/* Renderização do bracket */}
      {faseAtual === 'finais' ? (
        <div className="w-fit">
          <Finais />
        </div>
      ) : (
        <div 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={() => setShowFullscreen(true)}
          onMouseLeave={() => setShowFullscreen(false)}
          className={`max-w-full overflow-auto relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ userSelect: isDragging ? 'none' : 'auto' }}
        >
          <BracketSVG />
          
          {/* Botão de tela cheia */}
          {showFullscreen && (
            <Link
              to={`/tabela?fase=classificacao`}
              className="absolute top-4 right-4 bg-neutral-800 hover:bg-neutral-700 text-white p-2 rounded-lg shadow-lg transition-all"
              title="Ver em tela cheia"
            >
              <span className="text-2xl">🖥️</span>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
