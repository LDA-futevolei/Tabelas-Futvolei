import { useEffect, useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom'
import { apiProfile, listCampeonatos, createCampeonato, getMeta, putMeta } from '../../logic/api'
import { useBracketStore } from '../../store/useBracketStore'

export default function Dashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState([]) // { idCampeonato, title, periodo, inicio, fim, arquivado }
    const [creating, setCreating] = useState(false)
    const [query, setQuery] = useState('')
    const [tab, setTab] = useState('todos') // todos|pendente|progresso|completo|arquivado
    const selectState = useBracketStore(s => ({
        faseAtual: s.faseAtual,
        participants: s.participants,
        duplas: s.duplas,
        jogos: s.jogos,
        chapels: s.chapels,
    }))

    
    useEffect(() => {
        async function boot() {
            try {
                const prof = await apiProfile()
                if (!prof) {
                    window.location = "/dashboard/login";
                    return
                }
                setUser(prof)
                const rows = await listCampeonatos()
                // carrega meta (título) para cada campeonato
                const mapped = await Promise.all((rows || []).map(async (r) => {
                    let title = `Torneio #${r.idCampeonato}`
                    try {
                        const meta = await getMeta(r.idCampeonato)
                        if (meta && (meta.titulo || meta.nome)) title = meta.titulo || meta.nome
                        r._arquivado = Boolean(meta?.arquivado)
                    } catch {
                        // ignora falha de meta por item, usa título padrão
                    }
                    const periodo = (r.inicio && r.fim) ? `${new Date(r.inicio).toLocaleDateString()} - ${new Date(r.fim).toLocaleDateString()}` : ''
                    return { idCampeonato: r.idCampeonato, title, periodo, inicio: r.inicio, fim: r.fim, arquivado: r._arquivado }
                }))
                setItems(mapped)
            } catch (err) {
                alert("Falha ao carregar dados: " + err.message)
            } finally {
                setLoading(false)
            }
        }
        boot();
    }, []);

    const handleCreate = async () => {
        const nome = window.prompt('Nome do torneio:')
        if (!nome) return
        try {
            setCreating(true)
            const created = await createCampeonato({})
            if (!created || !created.idCampeonato) throw new Error('Criação falhou')
            await putMeta(created.idCampeonato, { titulo: nome })
            // vai para a tela de setup
            navigate('/setup')
        } catch (e) {
            alert('Erro ao criar torneio: ' + e.message)
        } finally {
            setCreating(false)
        }
    }

    const handleExport = () => {
        try {
            const payload = {
                generatedAt: new Date().toISOString(),
                ...selectState,
            }
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `tabela-bracket-${Date.now()}.json`
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
        } catch (e) {
            alert('Falha ao exportar JSON: ' + e.message)
        }
    }

    const statusOf = (it) => {
        const now = new Date()
        const ini = it.inicio ? new Date(it.inicio) : null
        const fim = it.fim ? new Date(it.fim) : null
        if (it.arquivado) return 'arquivado'
        if (ini && now < ini) return 'pendente'
        if (ini && fim && now >= ini && now <= fim) return 'progresso'
        if (fim && now > fim) return 'completo'
        return 'pendente'
    }

    const pct = (it) => {
        const now = Date.now()
        const ini = it.inicio ? new Date(it.inicio).getTime() : null
        const fim = it.fim ? new Date(it.fim).getTime() : null
        if (!ini || !fim) return 0
        if (now <= ini) return 0
        if (now >= fim) return 100
        return Math.round(((now - ini) / (fim - ini)) * 100)
    }

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        return items.filter(it => {
            if (tab !== 'todos' && statusOf(it) !== tab) return false
            if (!q) return true
            return it.title.toLowerCase().includes(q)
        })
    }, [items, query, tab])

    const counts = useMemo(() => {
        const c = { todos: items.length, pendente: 0, progresso: 0, completo: 0, arquivado: 0 }
        for (const it of items) c[statusOf(it)]++
        return c
    }, [items])

    const toggleArchive = async (it) => {
        try {
            const newVal = !it.arquivado
            await putMeta(it.idCampeonato, { arquivado: newVal })
            setItems(s => s.map(x => x.idCampeonato === it.idCampeonato ? { ...x, arquivado: newVal } : x))
        } catch (e) {
            alert('Falha ao atualizar status: ' + e.message)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-900 text-white">
            <div className="max-w-7xl mx-auto p-4 space-y-6">
                {/* Header */}
                <header className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold">Seus Torneios</h1>
                        { user && <p className="text-neutral-300">Bem-vindo, <span className="font-semibold">{user.nome}</span></p>}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 rounded font-semibold bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
                        >EXPORTAR JSON</button>
                        <button
                            disabled={creating}
                            onClick={handleCreate}
                            className={`px-4 py-2 rounded font-semibold ${creating ? 'bg-neutral-700 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-500'}`}
                        >{creating ? 'Criando...' : 'CRIAR UM TORNEIO'}</button>
                    </div>
                </header>

                {/* Tabs e busca */}
                <div className="flex flex-wrap items-center gap-3">
                    <nav className="flex flex-wrap gap-2 text-sm">
                        {['todos','pendente','progresso','completo','arquivado'].map(key => (
                            <button key={key}
                                onClick={() => setTab(key)}
                                className={`px-3 py-1.5 rounded border ${tab===key?'border-pink-500 bg-neutral-800':'border-neutral-700 bg-neutral-900 hover:bg-neutral-800'}`}
                            >
                                {key==='todos'?'TODOS': key==='pendente'?'PENDENTE': key==='progresso'?'EM PROGRESSO': key==='completo'?'COMPLETO':'ARQUIVADO'}
                                <span className="ml-2 text-xs opacity-70">{counts[key] ?? 0}</span>
                            </button>
                        ))}
                    </nav>
                    <div className="flex-1" />
                    <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Procure os seus Torneios" className="w-full md:w-80 px-3 py-2 rounded bg-neutral-800 border border-neutral-700 outline-none" />
                </div>

                {/* Lista */}
                <section className="bg-neutral-900 p-4 rounded border border-neutral-800">
                    {loading ? (
                        <p className="text-neutral-400">Carregando...</p>
                    ) : filtered.length === 0 ? (
                        <p className="text-neutral-400">Nenhum torneio encontrado.</p>
                    ) : (
                        <ul className="divide-y divide-neutral-800">
                            {filtered.map(it => (
                                <li key={it.idCampeonato} className="py-4 flex items-center justify-between">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold truncate max-w-[50vw]">{it.title}</h3>
                                            <span className={`text-[10px] px-2 py-0.5 rounded uppercase ${
                                                statusOf(it)==='pendente'?'bg-yellow-900 text-yellow-200':
                                                statusOf(it)==='progresso'?'bg-blue-900 text-blue-200':
                                                statusOf(it)==='completo'?'bg-green-900 text-green-200':
                                                'bg-neutral-700 text-neutral-200'
                                            }`}>{
                                                statusOf(it)==='pendente'?'Pendente':
                                                statusOf(it)==='progresso'?'Em Progresso':
                                                statusOf(it)==='completo'?'Completo':'Arquivado'
                                            }</span>
                                        </div>
                                        {it.periodo && <p className="text-xs text-neutral-400 mt-0.5">{it.periodo}</p>}
                                        <div className="h-1 mt-2 rounded bg-neutral-800 overflow-hidden w-64">
                                            <div style={{ width: pct(it)+'%' }} className="h-full bg-pink-600" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a href="/tabela?fase=classificacao" className="text-sm px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700">Ver</a>
                                        <a href="/setup" className="text-sm px-3 py-1 rounded bg-pink-600 hover:bg-pink-500">Editar</a>
                                        <button onClick={()=>toggleArchive(it)} className="text-sm px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700">
                                            {it.arquivado? 'Desarquivar':'Arquivar'}
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}