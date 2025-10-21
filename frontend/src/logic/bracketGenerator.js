import { isPowerOfTwo, nextPowerOfTwo, gid, resetIds } from './utils.js'

export function gerarClassificatoria(duplas, options = {}) {
  const n = duplas.length
  const spread = !!options.spread
  const prelim = !!options.prelim
  const ladder = options.ladder !== false // por padrão usamos o estilo ladder (Challonge-like)

  // determine bracket size P
  let P
  if (spread) {
    P = isPowerOfTwo(n) ? n : nextPowerOfTwo(n)
  } else {
    // Only add byes when n is odd: if odd, make P = n + 1 (next even); if even, keep P = n
    P = (n % 2 === 1) ? (n + 1) : n
  }

  // seedSlots: either classic spread or sequential
  const ids = duplas.map(d => d.id).slice().sort((a, b) => Number(a) - Number(b))
  let seedSlots = new Array(P).fill(null)
  if (spread) {
    // classic spread positions
    let positions = [1, 2]
    while (positions.length < P) {
      const size = positions.length * 2
      positions = positions.flatMap(x => [x, size + 1 - x])
    }
    for (let i = 0; i < ids.length; i++) seedSlots[positions[i] - 1] = ids[i]
  } else {
    // sequential fill top-to-bottom
    for (let i = 0; i < ids.length; i++) seedSlots[i] = ids[i]
  }

  resetIds(1)
  const jogos = []

  // optional prelims: reduce n down to previous power of two by creating M = n - prevPow2 play-in matches
  // prelim matches will be created and their winners will fill the last slots of the main bracket
  
  let roundOffset = 0
  if (prelim) {
    const prevP = Math.pow(2, Math.floor(Math.log2(n)))
    if (prevP < n) {
      const M = n - prevP
      // choose the 2*M highest seeds to play prelims
      const prelimSeedIds = ids.slice(-2 * M)
      const prelimMatches = []
      for (let i = 0; i < M; i++) {
        const left = prelimSeedIds[i]
        const right = prelimSeedIds[2 * M - 1 - i]
        const pid = gid()
        const fontes = []
        if (left != null) fontes.push({ type: 'seed', id: left })
        if (right != null) fontes.push({ type: 'seed', id: right })
        const pm = { id: pid, fase: 'class', round: 1, region: 'P', a: left ?? null, b: right ?? null, vencedor: null, fontes, tipo: 'prelim', skipRender: false }
        prelimMatches.push(pm)
        jogos.push(pm)
      }

      // build seedSlots for main bracket (size prevP): place remaining seeds first, then prelim winners
      const remainingSeeds = ids.slice(0, ids.length - 2 * M)
      const newSeedSlots = new Array(prevP).fill(null)
      for (let i = 0; i < remainingSeeds.length; i++) newSeedSlots[i] = remainingSeeds[i]
  // insert prelim winners in reverse order so they map correctly to symmetric pairing (slot[i], slot[P-1-i])
  for (let k = 0; k < M; k++) newSeedSlots[remainingSeeds.length + k] = { type: 'from-prelim', ref: prelimMatches[M - 1 - k].id }
      seedSlots = newSeedSlots
      P = prevP
      roundOffset = 1
    }
  }

  // Build winners (upper) bracket matches round-by-round
  const winnersByRound = []
  // first round pairs
  const first = []
  for (let i = 0; i < P / 2; i++) {
    first.push([seedSlots[i], seedSlots[P - 1 - i]])
  }
  winnersByRound.push(first)
  // subsequent round defs (index references)
  let prev = winnersByRound[0]
  while (prev.length > 1) {
    const next = new Array(Math.ceil(prev.length / 2)).fill(null).map((_, i) => ({ leftIndex: 2 * i, rightIndex: 2 * i + 1 }))
    winnersByRound.push(next)
    prev = next
  }

  // create winners matches and collect for lower bracket construction
  for (let r = 0; r < winnersByRound.length; r++) {
    winnersByRound[r] = winnersByRound[r].map((def, idx) => {
      const id = gid()
      let a = null, b = null, fontes = []
      if (r === 0) {
        const slotA = def[0]
        const slotB = def[1]
        // detect if slot is a from-prelim placeholder
        const isFromA = slotA && typeof slotA === 'object' && slotA.type === 'from-prelim'
        const isFromB = slotB && typeof slotB === 'object' && slotB.type === 'from-prelim'
        // slot may be a seed number or an object referring to a prelim match
        if (isFromA) {
          fontes.push({ type: 'from', ref: slotA.ref, path: 'vencedor' })
          a = null
        } else {
          a = slotA
          if (a !== null) fontes.push({ type: 'seed', id: a })
        }
        if (isFromB) {
          fontes.push({ type: 'from', ref: slotB.ref, path: 'vencedor' })
          b = null
        } else {
          b = slotB
          if (b !== null) fontes.push({ type: 'seed', id: b })
        }
        if (a != null && b != null && a === b) b = null
      } else {
        const srcA = winnersByRound[r - 1][def.leftIndex]
        const srcB = winnersByRound[r - 1][def.rightIndex]
        if (srcA) fontes.push({ type: 'from', ref: srcA.id, path: 'vencedor' })
        if (srcB) fontes.push({ type: 'from', ref: srcB.id, path: 'vencedor' })
      }
  let vencedor = null
  // auto-advance only when the opponent truly doesn't exist (not when it's a from-prelim placeholder)
  const hasFromInFontes = Array.isArray(fontes) && fontes.some(f => f && f.type === 'from')
  if (a != null && b == null && !hasFromInFontes) vencedor = a
  if (b != null && a == null && !hasFromInFontes) vencedor = b
      const region = idx < Math.floor(winnersByRound[r].length / 2) ? 'L' : 'R'
  const hasFrom = Array.isArray(fontes) && fontes.some(f => f && f.type === 'from')
  const match = { id, fase: 'class', round: r + 1 + roundOffset, region, a: a ?? null, b: b ?? null, vencedor, fontes, tipo: 'upper', skipRender: (vencedor == null) && ((a == null && b == null) && !hasFrom) }
      jogos.push(match)
      return match
    })
  }

  // Build losers (lower) bracket using alternating pattern.
  // Para spread=true (bracket expandido com byes), começamos com uma rodada L1 de "injeção" onde
  // cada perdedor de W1 cria um jogo (fonte única). Em seguida alternamos: consolidação, injeção de W2, consolidação, injeção de W3, ...
  // Para prelim/compact (P ajustado para potência), usamos o padrão anterior (pairing direto em L1).
  const lowerRounds = []
  const R = winnersByRound.length // number of winners rounds after prelims
  const losersByWRound = [] // 0-based index: losers of winnersByRound[i]
  for (let r = 0; r < R; r++) {
    const arr = []
    for (const m of winnersByRound[r]) arr.push({ type: 'from', ref: m.id, path: 'perdedor' })
    losersByWRound[r] = arr
  }

  let Lk = 1
  let rolling = []
  const useSpreadStyle = !!spread
  if (ladder && useSpreadStyle) {
    // Filtrar apenas perdedores de partidas realmente disputadas (ambos os lados existem)
    const playedLosersByWRound = losersByWRound.map((arr, idx) => {
      // losersByWRound foi montado a partir dos matches; precisamos checar matches
      const srcMatches = winnersByRound[idx] || []
      const res = []
      for (let i = 0; i < srcMatches.length; i++) {
        const m = srcMatches[i]
        if (!m) continue
        const hasBoth = (m.a != null) && (m.b != null)
        if (hasBoth) res.push({ type: 'from', ref: m.id, path: 'perdedor' })
      }
      return res
    })

    // L1 (injeção): um jogo por perdedor de W1 (fonte única)
    const src = playedLosersByWRound[0] || []
    const thisRound = []
    for (let i = 0; i < src.length; i++) {
      const id = gid()
      const fontes = [src[i]].filter(Boolean)
      const match = { id, fase: 'class', round: Lk, region: 'L', a: null, b: null, vencedor: null, fontes, tipo: 'lower' }
      jogos.push(match)
      thisRound.push(match)
    }
    lowerRounds.push(thisRound)
    rolling = thisRound.map(m => ({ type: 'from', ref: m.id, path: 'vencedor' }))

    // L2: injeta PRIMEIRA metade dos perdedores de W2
    if (playedLosersByWRound[1] && playedLosersByWRound[1].length > 0) {
      const drops = playedLosersByWRound[1]
      const half = Math.floor(drops.length / 2)
      const part1 = drops.slice(0, half)
      const L2 = []
      const count = Math.min(rolling.length, part1.length)
      for (let i = 0; i < count; i++) {
        const id = gid()
        const fontes = [rolling[i], part1[i]].filter(Boolean)
        const match = { id, fase: 'class', round: 2, region: 'L', a: null, b: null, vencedor: null, fontes, tipo: 'lower' }
        jogos.push(match)
        L2.push(match)
      }
      lowerRounds.push(L2)
      rolling = L2.map(m => ({ type: 'from', ref: m.id, path: 'vencedor' }))

      // L3: injeta SEGUNDA metade de W2 contra vencedores de L2
      const part2 = drops.slice(half)
      const L3 = []
      const count3 = Math.min(rolling.length, part2.length)
      for (let i = 0; i < count3; i++) {
        const id = gid()
        const fontes = [rolling[i], part2[i]].filter(Boolean)
        const match = { id, fase: 'class', round: 3, region: 'L', a: null, b: null, vencedor: null, fontes, tipo: 'lower' }
        jogos.push(match)
        L3.push(match)
      }
      lowerRounds.push(L3)
      rolling = L3.map(m => ({ type: 'from', ref: m.id, path: 'vencedor' }))
    }

    // A partir daqui: L4 consolida; L5 injeta W3; L6 consolida; L7 injeta W4; etc.
    for (let w = 2, roundNum = 4; w < R; w++) {
      // Consolidação
      const LC = []
      for (let i = 0; i + 1 < rolling.length; i += 2) {
        const id = gid()
        const fontes = [rolling[i], rolling[i + 1]].filter(Boolean)
        const match = { id, fase: 'class', round: roundNum++, region: 'L', a: null, b: null, vencedor: null, fontes, tipo: 'lower' }
        jogos.push(match)
        LC.push(match)
      }
      lowerRounds.push(LC)
      rolling = LC.map(m => ({ type: 'from', ref: m.id, path: 'vencedor' }))

      // Injeção dos perdedores de W(w+1)
      const drops = playedLosersByWRound[w + 1] || []
      if (drops.length === 0) continue
      const LI = []
      const countI = Math.min(rolling.length, drops.length)
      for (let i = 0; i < countI; i++) {
        const id = gid()
        const fontes = [rolling[i], drops[i]].filter(Boolean)
        const match = { id, fase: 'class', round: roundNum++, region: 'L', a: null, b: null, vencedor: null, fontes, tipo: 'lower' }
        jogos.push(match)
        LI.push(match)
      }
      lowerRounds.push(LI)
      rolling = LI.map(m => ({ type: 'from', ref: m.id, path: 'vencedor' }))
    }
  } else if (ladder) {
    // Modo compact/prelim: tentar mapeamento híbrido Challonge-like quando o padrão de prelim gera
    // exatamente 1 jogo do upper R1 sem vínculo com prelim (ex.: n=23 -> M=7, W1=8 => 7 com prelim, 1 sem)
    const prelimMatchesNow = jogos.filter(j => j.tipo === 'prelim')
    const prelimLosers = prelimMatchesNow.map(pm => ({ type: 'from', ref: pm.id, path: 'perdedor' }))
    const w1 = winnersByRound[0] || []
    const hasFromPrelim = (m) => Array.isArray(m.fontes) && m.fontes.some(f => f && f.type === 'from' && prelimMatchesNow.some(pm => pm.id === f.ref))
    const A = [] // losers de W1 com ligação a prelim
    const B = [] // losers de W1 sem ligação a prelim
    for (const m of w1) {
      const desc = { type: 'from', ref: m.id, path: 'perdedor' }
      if (hasFromPrelim(m)) A.push(desc)
      else B.push(desc)
    }
    const special = (B.length === 1 && prelimLosers.length === A.length && A.length > 0)

    const makePairs = (roundNum, arr1, arr2) => {
      const thisRound = []
      const count = Math.min(arr1.length, arr2.length)
      for (let i = 0; i < count; i++) {
        const id = gid()
        const fontes = [arr1[i], arr2[i]].filter(Boolean)
        const match = { id, fase: 'class', round: roundNum, region: 'L', a: null, b: null, vencedor: null, fontes, tipo: 'lower' }
        jogos.push(match)
        thisRound.push(match)
      }
      if (thisRound.length > 0) lowerRounds.push(thisRound)
      return thisRound.map(m => ({ type: 'from', ref: m.id, path: 'vencedor' }))
    }

    if (special) {
      // Caso especial (ex.: 23): padrão desejado ~ 7,4,4,2,2,1,1
      // L1: prelim losers x losers de W1 (com ligação a prelim) => 7
      const L1winners = makePairs(1, prelimLosers, A)
      // L2: consolidar vencedores de L1 (7) junto com B (1) para formar 8 entradas => 4 jogos
      const entrantsL2 = [...L1winners]
      if (B && B.length === 1) entrantsL2.push(B[0])
      const L2 = []
      for (let i = 0; i + 1 < entrantsL2.length; i += 2) {
        const id = gid()
        const fontes = [entrantsL2[i], entrantsL2[i + 1]].filter(Boolean)
        const match = { id, fase: 'class', round: 2, region: 'L', a: null, b: null, vencedor: null, fontes, tipo: 'lower' }
        jogos.push(match)
        L2.push(match)
      }
      if (L2.length > 0) lowerRounds.push(L2)
      const winnersL2 = L2.map(m => ({ type: 'from', ref: m.id, path: 'vencedor' }))
      // L3: winnersL2 x losers de W2 => 4
      const L3winners = makePairs(3, winnersL2, losersByWRound[1] || [])
      // L4: consolidação => 2
      const L4 = []
      for (let i = 0; i + 1 < L3winners.length; i += 2) {
        const id = gid()
        const fontes = [L3winners[i], L3winners[i + 1]].filter(Boolean)
        const match = { id, fase: 'class', round: 4, region: 'L', a: null, b: null, vencedor: null, fontes, tipo: 'lower' }
        jogos.push(match)
        L4.push(match)
      }
      if (L4.length > 0) lowerRounds.push(L4)
      const winnersL4 = L4.map(m => ({ type: 'from', ref: m.id, path: 'vencedor' }))
      // L5: winnersL4 x losers de W3 => 2
      const L5winners = makePairs(5, winnersL4, losersByWRound[2] || [])
      // L6: consolidação => 1
      const L6 = []
      for (let i = 0; i + 1 < L5winners.length; i += 2) {
        const id = gid()
        const fontes = [L5winners[i], L5winners[i + 1]].filter(Boolean)
        const match = { id, fase: 'class', round: 6, region: 'L', a: null, b: null, vencedor: null, fontes, tipo: 'lower' }
        jogos.push(match)
        L6.push(match)
      }
      if (L6.length > 0) lowerRounds.push(L6)
      const winnersL6 = L6.map(m => ({ type: 'from', ref: m.id, path: 'vencedor' }))
      // L7: winnersL6 x losers de W4 (se existir) => 1
      makePairs(7, winnersL6, losersByWRound[3] || [])
    } else {
      // fallback ladder compact genérico
      if (losersByWRound[0] && losersByWRound[0].length > 0) {
        const src = losersByWRound[0]
        const thisRound = []
        for (let i = 0; i + 1 < src.length; i += 2) {
          const id = gid()
          const fontes = [src[i], src[i + 1]].filter(Boolean)
          const match = { id, fase: 'class', round: 1, region: 'L', a: null, b: null, vencedor: null, fontes, tipo: 'lower' }
          jogos.push(match)
          thisRound.push(match)
        }
        lowerRounds.push(thisRound)
        rolling = thisRound.map(m => ({ type: 'from', ref: m.id, path: 'vencedor' }))
      }
      for (Lk = 2; Lk <= (2 * R - 2); Lk++) {
        const thisRound = []
        if (Lk % 2 === 0) {
          // injeção: winners vs losers de W(wIdx)
          const wIdx = Math.floor(Lk / 2)
          const dropIns = losersByWRound[wIdx] || []
          const count = Math.min(rolling.length, dropIns.length)
          for (let i = 0; i < count; i++) {
            const id = gid()
            const fontes = [rolling[i], dropIns[i]].filter(Boolean)
            const match = { id, fase: 'class', round: Lk, region: 'L', a: null, b: null, vencedor: null, fontes, tipo: 'lower' }
            jogos.push(match)
            thisRound.push(match)
          }
        } else {
          // consolidação
          for (let i = 0; i + 1 < rolling.length; i += 2) {
            const id = gid()
            const fontes = [rolling[i], rolling[i + 1]].filter(Boolean)
            const match = { id, fase: 'class', round: Lk, region: 'L', a: null, b: null, vencedor: null, fontes, tipo: 'lower' }
            jogos.push(match)
            thisRound.push(match)
          }
        }
        if (thisRound.length > 0) lowerRounds.push(thisRound)
        rolling = thisRound.map(m => ({ type: 'from', ref: m.id, path: 'vencedor' }))
      }
    }
  } else {
    // Fallback simples: empilhar como antes, caso alguém desligue o ladder
    let carry = []
    for (let r = 0; r < R; r++) {
      // append losers of winners round r in order
      for (const m of winnersByRound[r]) carry.push({ type: 'from', ref: m.id, path: 'perdedor' })
      // flush em pares
      const thisRound = []
      while (carry.length >= 2) {
        const a = carry.shift()
        const b = carry.shift()
        const id = gid()
        const match = { id, fase: 'class', round: lowerRounds.length + 1, region: 'L', a: null, b: null, vencedor: null, fontes: [a, b].filter(Boolean), tipo: 'lower' }
        jogos.push(match)
        thisRound.push(match)
      }
      if (thisRound.length > 0) lowerRounds.push(thisRound)
      carry = thisRound.map(m => ({ type: 'from', ref: m.id, path: 'vencedor' })).concat(carry)
    }
  }

  // add lower-final marker pointing to the ultimate lower winner (if exists)
  if (rolling.length >= 1) {
    const lowerFinalId = gid()
    jogos.push({ id: lowerFinalId, fase: 'class', round: 998, region: 'L', a: null, b: null, vencedor: null, fontes: [{ type: 'lower-winner', region: 'L' }], tipo: 'lower-final' })
  }

  // add upper-final markers
  const regFinalUpper = gid()
  jogos.push({ id: regFinalUpper, fase: 'class', round: 999, region: 'L', a: null, b: null, vencedor: null, fontes: [{ type: 'upper-winner', region: 'L' }], tipo: 'upper-final' })

  // Post-process: hide (skipRender=true) any match that has no direct seeds (a/b null)
  // and whose fontes are all 'from' refs that point to matches currently skipRender (i.e. not visible yet).
  // Iterate until stable because hiding upstream can cause downstream to hide as well.
  let changed = true
  const jogosById = new Map(jogos.map(j => [j.id, j]))
  while (changed) {
    changed = false
    for (const j of jogos) {
      if (!j) continue
      if (j.tipo !== 'upper' && j.tipo !== 'lower') continue
      if ((j.a != null) || (j.b != null)) continue
      if (!Array.isArray(j.fontes) || j.fontes.length === 0) continue
      // consider only fontes that are 'from' refs
      const refs = j.fontes.filter(f => f && f.type === 'from' && f.ref)
      if (refs.length === 0) continue
      // if every referenced source match is skipRender (or missing), then this match should be hidden
      const allHidden = refs.every(f => {
        const src = jogosById.get(f.ref)
        return !src || !!src.skipRender
      })
      if (allHidden && !j.skipRender) {
        j.skipRender = true
        changed = true
      }
    }
  }

  // Não geramos semifinais/finais aqui; a fase de finais cuidará disso.

  return jogos
}