import { useMemo } from 'react'
import { useBracketStore } from '../store/useBracketStore'
import GameCard from './GameCard'
import layoutFinais from '../logic/layout/layoutFinais.json'

export default function BracketFinais() {

  const jogos = useBracketStore(s => s.jogos)
  const setResultado = useBracketStore(s => s.setResultado)

  const jogosFinais = useMemo(() => jogos.filter(j => j.fase === 'finais'), [jogos])

  const onResult = (id, vencedor) => setResultado(id, vencedor)

  return (
    <div className="relative bg-neutral-100 rounded-xl p-4 min-h-[700px]">
      {jogosFinais.map(jogo => {
        const pos = layoutFinais?.[jogo.id] || { x: 20, y: 20 }
        return (
          <div key={jogo.id} className="absolute" style={{ left: pos.x, top: pos.y }}>
            <GameCard jogo={jogo} onResult={onResult} />
          </div>
        )
      })}
    </div>
  )
}