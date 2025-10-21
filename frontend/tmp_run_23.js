import { gerarClassificatoria } from './src/logic/bracketGenerator.js'

const n = 23
const duplas = Array.from({length: n}, (_, i) => ({ id: i+1 }))
const jogos = gerarClassificatoria(duplas, { prelim: true, spread: false })
const upper = jogos.filter(j => j.tipo === 'upper')
const lower = jogos.filter(j => j.tipo === 'lower')
console.log('upper rounds:', [...new Set(upper.map(j => j.round))])
console.log('lower rounds:', [...new Set(lower.map(j => j.round))])
console.log('lower by round:')
const byR = new Map()
for (const j of lower){
  if (!byR.has(j.round)) byR.set(j.round, [])
  byR.get(j.round).push(j)
}
for (const r of [...byR.keys()].sort((a,b)=>a-b)){
  const arr = byR.get(r).sort((a,b)=>a.id-b.id)
  console.log('L', r, '=>', arr.map(j=>({id:j.id, fontes:j.fontes})))
}
