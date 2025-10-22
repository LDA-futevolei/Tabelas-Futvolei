import { gid } from './utils.js'

// Monta a fase finais com fallback inteligente:
// - Se houver 2 marcadores de upper-final (L/R) e 2 de lower-final (L/R): gera 2 semis (L e R), final e 3º
// - Caso contrário (apenas 1 upper-final e 1 lower-final): gera apenas a final direta entre eles
export function montarFinais(jogosClass) {
  const uppers = jogosClass.filter(j => j.tipo === 'upper-final')
  const lowers = jogosClass.filter(j => j.tipo === 'lower-final')

  // Tenta parear por região (L/R) quando possível
  const Lupper = uppers.find(j => j.region === 'L') || uppers[0] || null
  const Rupper = uppers.find(j => j.region === 'R') || (uppers.length > 1 ? uppers[1] : null)
  const Llower = lowers.find(j => j.region === 'L') || lowers[0] || null
  const Rlower = lowers.find(j => j.region === 'R') || (lowers.length > 1 ? lowers[1] : null)

  const hasTwoSemis = !!(Lupper && Llower && Rupper && Rlower)

  if (hasTwoSemis) {
    const semi1 = {
      id: gid(),
      fase: 'finais',
      round: 1,
      region: 'L',
      a: null,
      b: null,
      vencedor: null,
      fontes: [
        { type: 'from', ref: Lupper.id, path: 'vencedor' },
        { type: 'from', ref: Llower.id, path: 'vencedor' }
      ],
      tipo: 'semi'
    }

    const semi2 = {
      id: gid(),
      fase: 'finais',
      round: 1,
      region: 'R',
      a: null,
      b: null,
      vencedor: null,
      fontes: [
        { type: 'from', ref: Rupper.id, path: 'vencedor' },
        { type: 'from', ref: Rlower.id, path: 'vencedor' }
      ],
      tipo: 'semi'
    }

    const final = {
      id: gid(),
      fase: 'finais',
      round: 2,
      region: 'C',
      a: null,
      b: null,
      vencedor: null,
      fontes: [
        { type: 'from', ref: semi1.id, path: 'vencedor' },
        { type: 'from', ref: semi2.id, path: 'vencedor' }
      ],
      tipo: 'final'
    }

    const terceiro = {
      id: gid(),
      fase: 'finais',
      round: 2,
      region: 'C',
      a: null,
      b: null,
      vencedor: null,
      fontes: [
        { type: 'from', ref: semi1.id, path: 'perdedor' },
        { type: 'from', ref: semi2.id, path: 'perdedor' }
      ],
      tipo: 'third-place'
    }
    return [semi1, semi2, final, terceiro]
  }

  // Fallback avançado: sintetizar semis usando os jogos das últimas rodadas disponíveis
  // Regra: sempre 1 da upper x 1 da lower por lado (L/R) quando possível
  const byTipo = (t) => jogosClass.filter(j => j.tipo === t)
  const pickRoundWithAtLeast = (arr, min) => {
    const byRound = arr.reduce((acc, j) => { (acc[j.round] ||= []).push(j); return acc }, {})
    const rounds = Object.keys(byRound).map(Number).sort((a,b) => a-b)
    // pegar a maior rodada com pelo menos 'min' jogos
    for (let i = rounds.length - 1; i >= 0; i--) {
      const r = rounds[i]
      if ((byRound[r] || []).length >= min) return { round: r, matches: byRound[r] }
    }
    return { round: null, matches: [] }
  }
  const preferLR = (arr) => {
    const L = arr.find(j => j.region === 'L') || arr[0] || null
    const R = arr.find(j => j.region === 'R') || (arr.length > 1 ? arr[1] : null)
    return { L, R }
  }

  const uppersAll = byTipo('upper')
  const lowersAll = byTipo('lower')
  // Para upper tentamos pegar a rodada com 2 jogos (semis). Se não houver, pegamos a última com >=1
  let { matches: upperCandidates } = pickRoundWithAtLeast(uppersAll, 2)
  if (upperCandidates.length < 2) {
    ({ matches: upperCandidates } = pickRoundWithAtLeast(uppersAll, 1))
  }
  // Para lower pegamos a última com >=2 jogos
  let { matches: lowerCandidates } = pickRoundWithAtLeast(lowersAll, 2)
  if (lowerCandidates.length < 2) {
    ({ matches: lowerCandidates } = pickRoundWithAtLeast(lowersAll, 1))
  }
  const up = preferLR(upperCandidates)
  const lo = preferLR(lowerCandidates)

  if (up.L && up.R && lo.L && lo.R) {
    const semi1 = {
      id: gid(), fase: 'finais', round: 1, region: 'L', a: null, b: null, vencedor: null,
      fontes: [ { type: 'from', ref: up.L.id, path: 'vencedor' }, { type: 'from', ref: lo.L.id, path: 'vencedor' } ],
      tipo: 'semi'
    }
    const semi2 = {
      id: gid(), fase: 'finais', round: 1, region: 'R', a: null, b: null, vencedor: null,
      fontes: [ { type: 'from', ref: up.R.id, path: 'vencedor' }, { type: 'from', ref: lo.R.id, path: 'vencedor' } ],
      tipo: 'semi'
    }
    const final = {
      id: gid(), fase: 'finais', round: 2, region: 'C', a: null, b: null, vencedor: null,
      fontes: [ { type: 'from', ref: semi1.id, path: 'vencedor' }, { type: 'from', ref: semi2.id, path: 'vencedor' } ],
      tipo: 'final'
    }
    const terceiro = {
      id: gid(), fase: 'finais', round: 2, region: 'C', a: null, b: null, vencedor: null,
      fontes: [ { type: 'from', ref: semi1.id, path: 'perdedor' }, { type: 'from', ref: semi2.id, path: 'perdedor' } ],
      tipo: 'third-place'
    }
    return [semi1, semi2, final, terceiro]
  }

  // Fallback mínimo: final direta entre melhor upper disponível e melhor lower disponível
  const pickFirst = (arr) => arr && arr.length > 0 ? arr[0] : null
  const anyUpper = pickFirst(uppers) || up.L || up.R || pickFirst(uppersAll)
  const anyLower = pickFirst(lowers) || lo.L || lo.R || pickFirst(lowersAll)
  if (anyUpper && anyLower) {
    const final = {
      id: gid(), fase: 'finais', round: 1, region: 'C', a: null, b: null, vencedor: null,
      fontes: [ { type: 'from', ref: anyUpper.id, path: 'vencedor' }, { type: 'from', ref: anyLower.id, path: 'vencedor' } ],
      tipo: 'final'
    }
    return [final]
  }

  // Nenhum marcador suficiente — retorna vazio
  return []
}

