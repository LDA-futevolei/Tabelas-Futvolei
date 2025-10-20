import { isPowerOfTwo, nextPowerOfTwo, gid, resetIds } from './utils.js'

export function gerarClassificatoria(duplas, options = {}) {
  const n = duplas.length
  const spread = !!options.spread
  const prelim = !!options.prelim

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

  // Build losers (lower) bracket iteratively: collect losers of each winners round and pair them
  const lowerRounds = []
  let carry = [] // descriptors for next lower round
  for (let r = 0; r < winnersByRound.length; r++) {
    // append losers of winners round r in order
    for (const m of winnersByRound[r]) carry.push({ type: 'from', ref: m.id, path: 'perdedor' })

    // then try to flush carry into lower rounds
    let thisRound = []
    while (carry.length >= 2) {
      const a = carry.shift()
      const b = carry.shift()
      const id = gid()
      const fontes = []
      if (a) fontes.push(a)
      if (b) fontes.push(b)
  const match = { id, fase: 'class', round: r + 1 + roundOffset, region: 'L', a: null, b: null, vencedor: null, fontes, tipo: 'lower' }
      jogos.push(match)
      thisRound.push(match)
    }
    // winners of this lower round become descriptors for next iteration
    carry = thisRound.map(m => ({ type: 'from', ref: m.id, path: 'vencedor' })).concat(carry)
    if (thisRound.length > 0) lowerRounds.push(thisRound)
  }

  // If any leftover carry, keep pairing until single winner emerges
  let lr = winnersByRound.length + roundOffset
  while (carry.length > 1) {
    const thisRound = []
    while (carry.length >= 2) {
      const a = carry.shift()
      const b = carry.shift()
      const id = gid()
      const match = { id, fase: 'class', round: lr + 1, region: 'L', a: null, b: null, vencedor: null, fontes: [a, b].filter(Boolean), tipo: 'lower' }
      jogos.push(match)
      thisRound.push(match)
    }
    carry = thisRound.map(m => ({ type: 'from', ref: m.id, path: 'vencedor' })).concat(carry)
    lowerRounds.push(thisRound)
    lr++
  }

  // add lower-final marker
  if (lowerRounds.length > 0) {
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

  // Attempt to create two semifinals pairing upper winners with lower winners when possible
  // Strategy:
  // - Identify the last non-empty winners round (upper semis winners)
  // - Identify two lower winners to pair with them (from last lower round or lower-final)
  // - If we can form two such pairs, create two semifinal matches (tipo: 'semi') where each pairs an upper-winner fonte with a lower-winner fonte
  // - Then create a final between the winners of those two semifinals
  // pick the penultimate winners round as the semifinal-producing round (if exists)
  const semisRoundIndex = Math.max(0, winnersByRound.length - 2)
  const upperSemis = winnersByRound[semisRoundIndex] || []

  // collect candidate lower winners (prefer winners of last lower round, then lower-final marker)
  const lowerCandidates = []
  if (lowerRounds.length > 0) {
    const lastLower = lowerRounds[lowerRounds.length - 1]
    for (const m of lastLower) lowerCandidates.push({ type: 'from', ref: m.id, path: 'vencedor' })
  }
  // If we had a lower-final marker earlier, include it as candidate
  const lowerFinalMarkers = jogos.filter(j => j.tipo === 'lower-final')
  for (const lf of lowerFinalMarkers) lowerCandidates.push({ type: 'from', ref: lf.id, path: 'vencedor' })

  // Build semifinals only if we have at least two upper semis and two lower candidates
  if (upperSemis.length >= 2 && lowerCandidates.length >= 2) {
    // pick the last two upper matches (these produce the upper finalists) but we want their winners to participate in semis
    const upperPair = upperSemis.slice(-2)
    const semiMatches = []
    for (let i = 0; i < 2; i++) {
      const id = gid()
      const fontes = []
      // upper winner fonte
      if (upperPair[i]) fontes.push({ type: 'from', ref: upperPair[i].id, path: 'vencedor' })
      // lower candidate fonte (take from start to balance)
      const lowerFonte = lowerCandidates.shift()
      if (lowerFonte) fontes.push(lowerFonte)
  const match = { id, fase: 'finais', round: 1000 + i, region: 'S', a: null, b: null, vencedor: null, fontes, tipo: 'semi' }
      jogos.push(match)
      semiMatches.push(match)
    }

    // final between winners of the two semis
    const finalId = gid()
    const finalMatch = { id: finalId, fase: 'finais', round: 2000, region: 'F', a: null, b: null, vencedor: null, fontes: [{ type: 'from', ref: semiMatches[0].id, path: 'vencedor' }, { type: 'from', ref: semiMatches[1].id, path: 'vencedor' }], tipo: 'final' }
    jogos.push(finalMatch)
    // third place: losers of the two semis
    const thirdId = gid()
    const thirdMatch = { id: thirdId, fase: 'finais', round: 2001, region: 'F', a: null, b: null, vencedor: null, fontes: [{ type: 'from', ref: semiMatches[0].id, path: 'perdedor' }, { type: 'from', ref: semiMatches[1].id, path: 'perdedor' }], tipo: 'third-place' }
  jogos.push(thirdMatch)
  } else {
    // fallback: classic grand final between upper-winner and lower-winner
    const grandFinalId = gid()
    const grandFinal = { id: grandFinalId, fase: 'class', round: 1000, region: 'G', a: null, b: null, vencedor: null, fontes: [{ type: 'upper-winner' }, { type: 'lower-winner' }], tipo: 'grand-final' }
    jogos.push(grandFinal)
  }

  return jogos
}