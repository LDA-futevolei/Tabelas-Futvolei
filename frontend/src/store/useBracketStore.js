import { create } from 'zustand'
import { gerarClassificatoria as gerarClassificatoriaLogic } from '../logic/bracketGenerator'
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

  
  gerarClassificatoria: (options = {}) => {
    console.debug('[store] gerarClassificatoria called', options)
    const { duplas, participants, shuffleArray } = get()
    const source = (participants && participants.length > 0) ? participants : duplas
    const seedsList = shuffleArray(source.map(p => p.id))
  const jogos = gerarClassificatoriaLogic(seedsList.map(id => ({ id })), options)
  set({ jogos, faseAtual: 'classificacao', lastGenOptions: options })
  console.debug('[store] gerarClassificatoria result', { count: jogos.length, sample: jogos.slice(0,6).map(j=>({id:j.id,tipo:j.tipo,round:j.round,a:j.a,b:j.b})) , options })
  },

  
  inserirChapeu: ({ round = 0, region = 'L', a = null, b = null }) => {
    // determine target round: if caller passed round>0 use it, otherwise pick next round in this region
    const state = get()
    let targetRound = round
    if (!targetRound || targetRound <= 0) {
      // consider only normal upper/lower matches to compute rounds (ignore final markers with high round numbers)
      const classRounds = state.jogos
        .filter(j => j.fase === 'class' && j.region === region && (j.tipo === 'upper' || j.tipo === 'lower'))
        .map(j => Number(j.round) || 0)
      const maxRound = classRounds.length ? Math.max(...classRounds) : 0
      targetRound = Math.max(1, maxRound + 1)
    }

    // avoid inserting duplicate chapeu for same round/region/a/b
    const exists = state.chapels.some(c => c.tipo === 'chapeu' && c.round === targetRound && c.region === region && (String(c.a) === String(a)) && (String(c.b) === String(b)))
    if (exists) return null

    const id = Date.now()
    const j = {
      id,
      fase: 'class',
      round: targetRound,
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
      // update the target match
      const jogos = state.jogos.map((j) =>
        j.id === idJogo ? { ...j, placarA, placarB, vencedor: vencedor !== undefined ? vencedor : j.vencedor } : { ...j }
      )

      // find updated match and compute loser if possible
      const updated = jogos.find(j => j.id === idJogo)
      if (updated && typeof updated.vencedor !== 'undefined' && updated.vencedor !== null) {
        const win = updated.vencedor
        // determine loser where possible
        const loser = (updated.a != null && updated.b != null) ? ((updated.a === win) ? updated.b : updated.a) : null

        // propagate to downstream matches that reference this match
        for (const tgt of jogos) {
          if (!Array.isArray(tgt.fontes)) continue
          for (let fi = 0; fi < tgt.fontes.length; fi++) {
            const f = tgt.fontes[fi]
            if (!f || f.type !== 'from' || f.ref !== idJogo) continue
            // we have a reference; decide value based on path
            const path = f.path
            if (path === 'vencedor') {
              // place winner into corresponding slot (try map by fonte index -> a/b)
              if (fi === 0) {
                if (tgt.a == null) tgt.a = win
              } else if (fi === 1) {
                if (tgt.b == null) tgt.b = win
              } else {
                // fallback: fill first available
                if (tgt.a == null) tgt.a = win
                else if (tgt.b == null) tgt.b = win
              }
            } else if (path === 'perdedor') {
              if (loser == null) continue
              if (fi === 0) {
                if (tgt.a == null) tgt.a = loser
              } else if (fi === 1) {
                if (tgt.b == null) tgt.b = loser
              } else {
                if (tgt.a == null) tgt.a = loser
                else if (tgt.b == null) tgt.b = loser
              }
            }
          }
        }

        // After propagation, update skipRender flags: a match is visible if it has at least one side defined
        for (const m of jogos) {
          if (m.tipo === 'upper' || m.tipo === 'lower' || m.tipo === 'prelim') {
            const hasSeedFonte = Array.isArray(m.fontes) && m.fontes.some(f => f && f.type === 'seed')
            // keep visible if vencedor defined or at least one side defined; hide only when both sides empty and no seed fontes
            m.skipRender = (m.vencedor == null) && ((m.a == null && m.b == null) && !hasSeedFonte)
          }
        }

        // mark updated match visually for a short time
        const mark = jogos.find(j => j.id === idJogo)
        if (mark) {
          mark.justUpdated = true
          setTimeout(() => {
            // clear flag safely by mutating state
            set(s => ({ jogos: s.jogos.map(j => j.id === idJogo ? { ...j, justUpdated: false } : j) }))
          }, 2000)
        }
      }

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
