import BracketSVG from '../components/BracketSVG'
import Participants from '../components/Participants'
import Finais from '../components/Finais'
import { useBracketStore } from '../store/useBracketStore'

export default function BracketPage() {
  const faseAtual = useBracketStore(s => s.faseAtual)
  return (
    <div className="min-h-screen bg-neutral-900 text-white p-4">
      <div className="w-full space-y-4">
        <div className="max-w-7xl mx-auto px-4">
          <Participants />
        </div>
        <div className="w-full">
          <div className="max-w-7xl mx-auto px-4">
            {faseAtual === 'finais' ? <Finais /> : <BracketSVG />}
          </div>
        </div>
      </div>
    </div>
  )
}
