import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import { apiProfile, listCampeonatos, createCampeonato, getMeta, putMeta } from '../../logic/api'

export default function Dashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState([]) // { idCampeonato, title, periodo }
    const [creating, setCreating] = useState(false)

    
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
                    } catch {
                        // ignora falha de meta por item, usa título padrão
                    }
                    const periodo = (r.inicio && r.fim) ? `${new Date(r.inicio).toLocaleDateString()} - ${new Date(r.fim).toLocaleDateString()}` : ''
                    return { idCampeonato: r.idCampeonato, title, periodo }
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

    return (
        <div className="min-h-screen bg-neutral-900 text-white">
            <div className="max-w-7xl mx-auto p-4 space-y-6">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
                        { user && <p className="text-neutral-300">Bem-vindo, <span className="font-semibold">{user.nome}</span></p>}
                    </div>
                    <button
                        disabled={creating}
                        onClick={handleCreate}
                        className={`px-4 py-2 rounded font-semibold ${creating ? 'bg-neutral-700 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-500'}`}
                    >{creating ? 'Criando...' : '＋ Criar um Torneio'}</button>
                </header>

                <section className="bg-neutral-900 p-4 rounded border border-pink-600">
                    <h2 className="text-xl font-bold text-pink-400 mb-3">Adicionar Suas Tabelas</h2>
                    {loading ? (
                        <p className="text-neutral-400">Carregando...</p>
                    ) : items.length === 0 ? (
                        <p className="text-neutral-400">Nenhum torneio ainda. Clique em "Criar um Torneio" para começar.</p>
                    ) : (
                        <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {items.map(it => (
                                <li key={it.idCampeonato} className="p-3 rounded bg-neutral-800 hover:bg-neutral-700 transition border border-neutral-700">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold">{it.title}</h3>
                                            {it.periodo && <p className="text-xs text-neutral-400">{it.periodo}</p>}
                                        </div>
                                        <div className="flex gap-2">
                                            <a href="/tabela?fase=classificacao" className="text-sm px-2 py-1 rounded bg-neutral-900">Ver</a>
                                            <a href="/setup" className="text-sm px-2 py-1 rounded bg-pink-600">Editar</a>
                                        </div>
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