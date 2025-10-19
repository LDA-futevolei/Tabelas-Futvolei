import BracketSVG from '../components/BracketSVG'
import Participants from '../components/Participants'

export default function BracketPage() {
  return (
    
    <div className="min-h-screen bg-neutral-900 text-white p-4">
      <div className="w-full space-y-4">
        <div className="max-w-7xl mx-auto px-4">
          <Participants />
        </div>
        <div className="w-full">
          <BracketSVG />
        </div>
      </div>
    </div>
  )
}
