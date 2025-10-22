import React, { useEffect, useState } from 'react'
import { apiProfile, listCampeonatos, createCampeonato, getMeta, putMeta } from '../logic/api'

function Toolbar({ onCreate }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-2xl font-bold">Seus Torneios</h1>
      <button onClick={onCreate} className="px-3 py-2 rounded bg-pink-600 hover:bg-pink-500">Criar um torneio</button>
    </div>
  )
}

function TorneioCard({ t, onOpen }) {
  return (
    <div className="bg-neutral-800 rounded p-3 flex items-center justify-between hover:bg-neutral-700 transition cursor-pointer" onClick={onOpen}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-pink-400 font-bold">{String(t.title || 'T').slice(0,1)}</div>
        <div>
          <div className="font-semibold">{t.title || `Campeonato ${t.idCampeonato}`}</div>
          <div className="text-xs text-neutral-400">{new Date(t.inicio).toLocaleDateString()} → {new Date(t.fim).toLocaleDateString()}</div>
        </div>
      </div>
      <div className="text-xs text-neutral-400">ID {t.idCampeonato}</div>
    </div>
  )
}

export default function Torneios() {
  const [profile, setProfile] = useState(null)
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    (async () => {
      const p = await apiProfile()
      if (!p) {
        const q = new URLSearchParams({ redirect: '/torneios' })
        window.location.href = `/dashboard/login?${q}`
        return
      }
      setProfile(p)
      try {
        const items = await listCampeonatos()
        // enriquecer com meta.title
        const withMeta = await Promise.all(items.map(async it => {
          const meta = await getMeta(it.idCampeonato)
          return { ...it, title: meta?.title || null }
        }))
        setList(withMeta)
      } catch {
        setErr('Falha ao carregar seus torneios')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const onCreate = async () => {
    const title = prompt('Título do torneio:') || ''
    try {
      const created = await createCampeonato({})
      if (created?.idCampeonato) {
        if (title) await putMeta(created.idCampeonato, { title })
        // recarregar lista
        const items = await listCampeonatos()
        const withMeta = await Promise.all(items.map(async it => {
          const meta = await getMeta(it.idCampeonato)
          return { ...it, title: meta?.title || null }
        }))
        setList(withMeta)
      }
    } catch {
      alert('Falha ao criar torneio')
    }
  }

  if (loading) return <div className="min-h-screen bg-neutral-900 text-white p-4">Carregando…</div>
  if (err) return <div className="min-h-screen bg-neutral-900 text-white p-4">{err}</div>

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="max-w-6xl mx-auto p-4">
        <Toolbar onCreate={onCreate} />
        <div className="grid gap-2">
          {list.length === 0 && (
            <div className="text-neutral-400">Nenhum torneio ainda. Clique em "Criar um torneio".</div>
          )}
          {list.map(t => (
            <TorneioCard key={t.idCampeonato} t={t} onOpen={() => { window.location.href = '/setup' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
