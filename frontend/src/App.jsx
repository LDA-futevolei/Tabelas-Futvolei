import BracketPage from './pages/BracketPage'

export default function App() {
  return (
    
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="w-full p-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Futevôlei – Double Elimination</h1>
        <BracketPage />
      </div>
    </div>
  )
}