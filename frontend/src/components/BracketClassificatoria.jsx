import { useEffect, useMemo } from 'react'
import { useBracketStore } from '../store/useBracketStore'
import GameCard from './GameCard'
import layoutClass from '../logic/layout/layoutClassificatoria.json'

export default function BracketClassificatoria() {
  const duplas = useBracketStore(s => s.participants || s.duplas || [])
  const jogos = useBracketStore(s => s.jogos)
  const gerarClassificatoria = useBracketStore(s => s.gerarClassificatoria)
  const initDuplas = useBracketStore(s => s.initDuplas)
  const setResultado = useBracketStore(s => s.setResultado)

  
  const jogosClass = useMemo(() => jogos.filter(j => j.fase === 'class'), [jogos])

  
  useEffect(() => {
    if (duplas.length === 0) {
      initDuplas(16)
    }
    
  }, [duplas.length, initDuplas])

  useEffect(() => {
    if (duplas.length > 0 && jogosClass.length === 0) {
      gerarClassificatoria()
    }
  }, [duplas.length, jogosClass.length, gerarClassificatoria])

  const byRegion = useMemo(() => {
    const b = { L: [], R: [] }
    jogosClass.forEach(j => b[j.region]?.push(j))
    return b
  }, [jogosClass])

  const onResult = (id, vencedor) => setResultado(id, vencedor)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {['L', 'R'].map(region => (
        <div key={region} className="relative bg-neutral-800 rounded-xl p-4 min-h-[800px] overflow-auto text-white">
          <h3 className="font-bold mb-2">Região {region === 'L' ? 'Esquerda' : 'Direita'}</h3>
          {(byRegion[region] || []).map(jogo => {
            const pos = layoutClass?.[`${region}-${jogo.tipo}-R${jogo.round}`] || { x: 20, y: 20 }
            return (
              <div key={jogo.id} className="absolute" style={{ left: pos.x, top: pos.y }}>
                <GameCard jogo={jogo} onResult={onResult} />
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
