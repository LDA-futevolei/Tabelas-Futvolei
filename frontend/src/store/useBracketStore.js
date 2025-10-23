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
        // resolve effective slot ids for A/B even if fields are null, using fontes
        const jogosById = new Map(jogos.map(j => [j.id, j]))
        const resolveFromFonte = (f) => {
          if (!f) return null
          if (f.type === 'seed' && f.id != null) return f.id
          if (f.type === 'from' && f.ref != null) {
            const src = jogosById.get(f.ref)
            if (!src) return null
            if (f.path === 'vencedor') return src.vencedor ?? null
            if (f.path === 'perdedor') {
              // derive loser of src if possible
              const sw = src.vencedor
              if (sw == null) return null
              let sa = src.a, sb = src.b
              // try resolve src sides from its fontes just in case
              if ((sa == null || sb == null) && Array.isArray(src.fontes)) {
                for (let i = 0; i < src.fontes.length; i++) {
                  const sf = src.fontes[i]
                  const val = resolveFromFonte(sf)
                  if (val == null) continue
                  if (i === 0 && sa == null) sa = val
                  else if (i === 1 && sb == null) sb = val
                }
              }
              if (sa == null || sb == null) return null
              return sw === sa ? sb : sa
            }
          }
          return null
        }
        const fontes = Array.isArray(updated.fontes) ? updated.fontes : []
        // map fonte index to slot STRICTLY: fonte[0]→A, fonte[1]→B
        let effA = updated.a
        let effB = updated.b
        if ((effA == null || effB == null) && fontes.length > 0) {
          const f0 = fontes[0]
          const f1 = fontes[1]
          if (effA == null && f0) effA = resolveFromFonte(f0)
          if (effB == null && f1) effB = resolveFromFonte(f1)
          // NO fallback: never fill both slots with the same value
        }
        // determine loser where possible
        const loser = (effA != null && effB != null) ? ((effA === win) ? effB : effA) : null

        // propagate to downstream matches that reference this match DIRECTLY
        console.debug(`[propagate] Buscando jogos que referenciam Jogo ${idJogo}...`)
        for (const tgt of jogos) {
          if (!Array.isArray(tgt.fontes)) continue
          for (let fi = 0; fi < tgt.fontes.length; fi++) {
            const f = tgt.fontes[fi]
            if (!f || f.type !== 'from' || f.ref !== idJogo) continue
            // we have a DIRECT reference; decide value based on path
            console.debug(`[propagate] ✓ Encontrado: Jogo ${tgt.id} (fase: ${tgt.fase}, tipo: ${tgt.tipo}) fonte[${fi}] → path: ${f.path}`)
            const path = f.path
            if (path === 'vencedor') {
              // place winner ONLY into the corresponding slot based on fonte index
              // NEVER fill both slots with the same value
              if (fi === 0) {
                // First fonte always goes to slot A
                console.debug(`[propagate] Jogo ${idJogo} → Jogo ${tgt.id} slot A = ${win}`)
                tgt.a = win
              } else if (fi === 1) {
                // Second fonte always goes to slot B
                console.debug(`[propagate] Jogo ${idJogo} → Jogo ${tgt.id} slot B = ${win}`)
                tgt.b = win
              }
            } else if (path === 'perdedor') {
              if (loser == null) continue
              if (fi === 0) {
                // First fonte always goes to slot A
                console.debug(`[propagate] Jogo ${idJogo} (perdedor) → Jogo ${tgt.id} slot A = ${loser}`)
                tgt.a = loser
              } else if (fi === 1) {
                // Second fonte always goes to slot B
                console.debug(`[propagate] Jogo ${idJogo} (perdedor) → Jogo ${tgt.id} slot B = ${loser}`)
                tgt.b = loser
              }
            }
          }
        }

        // Propagar automaticamente para marcadores (upper-final/lower-final)
        // Esses marcadores têm UMA fonte e devem copiar o vencedor do jogo-fonte
        for (const marker of jogos) {
          if ((marker.tipo === 'upper-final' || marker.tipo === 'lower-final') && Array.isArray(marker.fontes) && marker.fontes.length === 1) {
            const f = marker.fontes[0]
            if (f && f.type === 'from' && f.path === 'vencedor' && f.ref != null) {
              const src = jogos.find(j => j.id === f.ref)
              if (src && src.vencedor != null) {
                // Copiar vencedor do jogo-fonte para o marcador
                if (marker.vencedor !== src.vencedor) {
                  console.debug(`[propagate] Marcador ${marker.id} (${marker.tipo}) copiando vencedor do Jogo ${src.id}: ${src.vencedor}`)
                  marker.vencedor = src.vencedor
                  marker.a = src.vencedor // para compatibilidade
                }
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

  // permite alternar manualmente a fase
  setFaseAtual: (fase) => {
    set({ faseAtual: fase })
  },

  
  selecionar: (selector) => selector(get()),
}))
