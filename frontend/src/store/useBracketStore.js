import { create } from 'zustand'
import { gerarClassificatoria } from '../logic/bracketGenerator'
import { montarFinais } from '../logic/finalsSetup'

export const useBracketStore = create((set, get) => ({
  
  faseAtual: 'classificacao', 
  duplas: [], 
  participants: [], 
  jogos: [], 
  chapels: [], 

  
  initDuplas: (nomesOuQtd) => {
    console.debug('[store] initDuplas called', nomesOuQtd)
    let duplas
    if (Array.isArray(nomesOuQtd)) {
      duplas = nomesOuQtd.map((nome, i) => ({ id: i + 1, nome }))
    } else {
      const n = Number(nomesOuQtd) || 16
      duplas = Array.from({ length: n }, (_, i) => ({ id: i + 1, nome: `Participante ${i + 1}` }))
    }
    set({ duplas })
  },

  addDupla: (nome) => {
    set((s) => {
      const exists = s.participants.some(p => String(p.nome).toLowerCase() === String(nome).toLowerCase())
      if (exists) return {}
      const maxId = Math.max(0, ...s.participants.map(p => p.id || 0))
      const novo = { id: maxId + 1, nome }
      return { participants: [...s.participants, novo] }
    })
  },

  removeDupla: (id) => {
    set((s) => ({ participants: s.participants.filter(d => d.id !== id) }))
  },

  bulkAddDuplas: (nomes) => {
    if (!Array.isArray(nomes)) return
    set((s) => {
      const existingNames = new Set(s.participants.map(p => String(p.nome).toLowerCase()))
      const maxId = Math.max(0, ...s.participants.map(p => p.id || 0))
      const novos = []
      let idx = 0
      for (const nome of nomes) {
        const n = String(nome).trim()
        if (!n) continue
        if (existingNames.has(n.toLowerCase())) continue
        idx++
        novos.push({ id: maxId + idx, nome: n })
        existingNames.add(n.toLowerCase())
      }
      return { participants: [...s.participants, ...novos] }
    })
  },

  
  shuffleArray: (arr) => {
    const a = arr.slice()
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = a[i]
      a[i] = a[j]
      a[j] = tmp
    }
    return a
  },

  
  gerarClassificatoria: () => {
    console.debug('[store] gerarClassificatoria called')
    const { duplas, participants, shuffleArray } = get()
    const source = (participants && participants.length > 0) ? participants : duplas
    const seedsList = shuffleArray(source.map(p => p.id))
    const jogos = gerarClassificatoria(seedsList.map(id => ({ id })))
    set({ jogos, faseAtual: 'classificacao' })

    
    
  },

  
  inserirChapeu: ({ round = 0, region = 'L', a = null, b = null }) => {
    const id = Date.now() 
    const j = {
      id,
      fase: 'class',
      round,
      region, 
      a,
      b,
      vencedor: null,
      fontes: [],
      tipo: 'chapeu'
    }
    set((s) => ({ chapels: [...s.chapels, j], jogos: [...s.jogos, j] }))
    return id
  },

  
  setResultado: (idJogo, vencedor) => {
    console.debug('[store] setResultado', idJogo, vencedor)
    set((state) => {
      const jogos = state.jogos.map((j) => (j.id === idJogo ? { ...j, vencedor } : j))
      return { jogos }
    })
  },

  
  setPlacar: (idJogo, { placarA = null, placarB = null, vencedor = undefined } = {}) => {
    console.debug('[store] setPlacar', idJogo, placarA, placarB, vencedor)
    set((state) => {
      const jogos = state.jogos.map((j) =>
        j.id === idJogo ? { ...j, placarA, placarB, vencedor: vencedor !== undefined ? vencedor : j.vencedor } : j
      )
      return { jogos }
    })
  },

  
  avancarParaFinais: () => {
    console.debug('[store] avancarParaFinais called')
    const { jogos } = get()
    const finais = montarFinais(jogos)
    const jogosComFinais = [...jogos.filter(j => j.fase === 'class'), ...finais]
    set({ jogos: jogosComFinais, faseAtual: 'finais' })
  },

  
  selecionar: (selector) => selector(get()),
}))
