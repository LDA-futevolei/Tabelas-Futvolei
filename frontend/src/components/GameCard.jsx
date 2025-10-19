import { resolveSlotLabel } from './utils/resolveSlotLabel'
import { useBracketStore } from '../store/useBracketStore'

export default function GameCard({ jogo, onResult }) {
  const participants = useBracketStore(s => s.participants || s.duplas || [])
  const label = (() => {
    if (jogo.tipo === 'upper') return `Upper R${jogo.round}`
    if (jogo.tipo === 'lower') return `Lower R${jogo.round}`
    if (jogo.tipo === 'upper-final') return `Upper Winner (${jogo.region})`
    if (jogo.tipo === 'lower-final') return `Lower Winner (${jogo.region})`
    if (jogo.tipo === 'semi') return `Semifinal ${jogo.region === 'L' ? '1' : '2'}`
    if (jogo.tipo === 'final') return 'Final'
    if (jogo.tipo === 'third') return '3º / 4º'
    if (jogo.tipo === 'chapeu') return `Jogo Chapéu (R${jogo.round})`
    return 'Jogo'
  })()

  const jogosStore = useBracketStore(s => s.jogos || [])
  const aNome = typeof jogo.a === 'object' ? jogo.a?.nome : resolveSlotLabel(jogo.a, jogo.fontes || [], participants, 0, jogosStore)
  const bNome = typeof jogo.b === 'object' ? jogo.b?.nome : resolveSlotLabel(jogo.b, jogo.fontes || [], participants, 1, jogosStore)

  return (
    <div className="w-64 rounded-2xl shadow p-3 bg-white border border-neutral-200">
      <div className="text-xs text-neutral-500 mb-1">{label}</div>
      <div className="font-semibold truncate">{aNome}</div>
      <div className="font-semibold truncate">{bNome}</div>

      <div className="flex gap-2 mt-3">
        <button
          className="px-2 py-1 text-sm rounded bg-neutral-800 text-white"
          onClick={() => onResult?.(jogo.id, jogo.a)}
        >{aNome} venceu</button>
        <button
          className="px-2 py-1 text-sm rounded bg-neutral-200"
          onClick={() => onResult?.(jogo.id, jogo.b)}
        >{bNome} venceu</button>
      </div>
    </div>
  )
}