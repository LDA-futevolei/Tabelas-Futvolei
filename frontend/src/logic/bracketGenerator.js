import { isPowerOfTwo, nextPowerOfTwo, pairwise, gid, resetIds } from './utils.js'

export function gerarClassificatoria(duplas) {
  const n = duplas.length
  const P = isPowerOfTwo(n) ? n : nextPowerOfTwo(n)

  // build seedSlots using a bracket seeding order to distribute byes
  const ids = duplas.map(d => d.id)
  const seedSlots = new Array(P).fill(null)
  // generate seed positions order: start [1,2] and expand
  let positions = [1, 2]
  while (positions.length < P) {
    const size = positions.length * 2
    positions = positions.flatMap(x => [x, size + 1 - x])
  }
  for (let i = 0; i < ids.length; i++) {
    const pos = positions[i] - 1
    seedSlots[pos] = ids[i]
  }

  resetIds(1)
  const jogos = []

  // build rounds: round 0 is pairs (seedSlots[i], seedSlots[P-1-i]) for i in [0, P/2)
  const rounds = []
  const first = []
  for (let i = 0; i < P / 2; i++) {
    first.push([seedSlots[i], seedSlots[P - 1 - i]])
  }
  rounds.push(first)

  // subsequent rounds reference previous matches by indices
  let prev = rounds[0]
  while (prev.length > 1) {
    const next = new Array(Math.ceil(prev.length / 2)).fill(null).map((_, i) => ({ leftIndex: 2 * i, rightIndex: 2 * i + 1 }))
    rounds.push(next)
    prev = next
  }

  // create matches round-by-round
  const createdByRound = []
  for (let r = 0; r < rounds.length; r++) {
    const roundDef = rounds[r]
    createdByRound[r] = []
    for (let i = 0; i < roundDef.length; i++) {
      if (r === 0) {
        let [a, b] = roundDef[i]
        if (a != null && b != null && a === b) b = null
        const id = gid()
        let vencedor = null
        if (a != null && b == null) vencedor = a
        if (b != null && a == null) vencedor = b
        const fontes = [a !== null ? { type: 'seed', id: a } : null, b !== null ? { type: 'seed', id: b } : null].filter(Boolean)
        const region = i < Math.floor(roundDef.length / 2) ? 'L' : 'R'
  const match = { id, fase: 'class', round: r + 1, region, a, b, vencedor, fontes, tipo: 'upper', skipRender: (vencedor != null) || (a == null && b == null) }
        jogos.push(match)
        createdByRound[r].push(match)
      } else {
        const { leftIndex, rightIndex } = roundDef[i]
        const srcA = createdByRound[r - 1][leftIndex]
        const srcB = createdByRound[r - 1][rightIndex]
        const id = gid()
        const fontes = []
        if (srcA) fontes.push({ type: 'from', ref: srcA.id, path: 'vencedor' })
        if (srcB) fontes.push({ type: 'from', ref: srcB.id, path: 'vencedor' })
        let vencedor = null
        if (srcA && !srcB) vencedor = srcA.vencedor ?? srcA.a ?? null
        if (srcB && !srcA) vencedor = srcB.vencedor ?? srcB.a ?? null
        const region = i < Math.floor(roundDef.length / 2) ? 'L' : 'R'
  const match = { id, fase: 'class', round: r + 1, region, a: null, b: null, vencedor, fontes, tipo: 'upper', skipRender: (!srcA && !srcB) || !!(srcA && !srcB) || !!(srcB && !srcA) }
        jogos.push(match)
        createdByRound[r].push(match)
      }
    }
  }

  const regFinalUpper = gid()
  jogos.push({ id: regFinalUpper, fase: 'class', round: 999, region: 'L', a: null, b: null, vencedor: null, fontes: [{ type: 'upper-winner', region: 'L' }], tipo: 'upper-final' })
  const regFinalLower = gid()
  jogos.push({ id: regFinalLower, fase: 'class', round: 999, region: 'R', a: null, b: null, vencedor: null, fontes: [{ type: 'upper-winner', region: 'R' }], tipo: 'upper-final' })

  function buildLowerForRegion(region) {
    const upperMatches = jogos.filter(j => j.region === region && j.tipo === 'upper').sort((a, b) => (a.round - b.round) || (a.id - b.id))
    if (upperMatches.length === 0) return []

    let sources = upperMatches.map(m => ({ type: 'from', ref: m.id, path: 'perdedor' }))
    const lowerMatches = []
    let lr = 1

    while (sources.length > 0) {
      const pairs = pairwise(sources)
      if (pairs.length === 0) break
      const thisRound = []
      for (const [sa, sb] of pairs) {
        const id = gid()
        const fontes = []
        if (sa) fontes.push(sa)
        if (sb) fontes.push(sb)
        const match = { id, fase: 'class', round: lr, region, a: null, b: null, vencedor: null, fontes, tipo: 'lower' }
        lowerMatches.push(match)
        thisRound.push(match)
      }

      sources = thisRound.map(m => ({ type: 'from', ref: m.id, path: 'vencedor' }))
      lr++
      if (thisRound.length === 1 && thisRound[0].fontes.length <= 1) break
    }

    if (lowerMatches.length > 0) {
      const lowerFinalId = gid()
      jogos.push({ id: lowerFinalId, fase: 'class', round: 998, region, a: null, b: null, vencedor: null, fontes: [{ type: 'lower-winner', region }], tipo: 'lower-final' })
    }

    for (const lm of lowerMatches) jogos.push(lm)
    return lowerMatches
  }

  buildLowerForRegion('L')
  buildLowerForRegion('R')

  return jogos
}