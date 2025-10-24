import React from 'react'

function IconUsers({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  )
}

function IconBracket({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h4v4H4zM16 6h4v4h-4zM10 10h4M4 14h4v4H4zM16 14h4v4h-4zM10 14h4"/>
    </svg>
  )
}

export default function SidebarNav({ active = 'participantes', onNavigate = () => {} }) {
  const Item = ({ id, icon, label }) => {
    const isActive = active === id
    return (
      <button
        onClick={() => onNavigate(id)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
          isActive ? 'bg-pink-600 text-white' : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
        }`}
      >
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </button>
    )
  }

  return (
    <aside className="w-60 shrink-0 space-y-2">
      <div className="text-xs uppercase tracking-wide text-neutral-400 px-1">Setup</div>
      <Item id="participantes" icon={<IconUsers />} label="Participantes" />
      <Item id="chaves" icon={<IconBracket />} label="Bracket" />
    </aside>
  )
}
