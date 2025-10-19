import { gerarClassificatoria } from './src/logic/bracketGenerator.js'

const n = 7
const duplas = Array.from({length: n}, (_, i) => ({ id: i+1, nome: `P${i+1}`}))
const jogos = gerarClassificatoria(duplas)
console.log('Total jogos:', jogos.length)

// consider visible matches only
const visible = jogos.filter(j => !j.skipRender && j.tipo === 'upper')
console.log('Visible upper matches:', visible.length)

const occurrences = new Map()
for (const j of visible) {
  if (j.a != null) occurrences.set(j.a, (occurrences.get(j.a)||0)+1)
  if (j.b != null) occurrences.set(j.b, (occurrences.get(j.b)||0)+1)
}

const dupes = Array.from(occurrences.entries()).filter(([id, cnt]) => cnt > 1)
if (dupes.length === 0) console.log('No visible duplicates among seeds')
else {
  console.log('Visible duplicates:')
  dupes.forEach(([id, cnt]) => console.log(' -', id, 'count', cnt))
}

console.log('\nVisible matches list:')
visible.forEach(j => console.log({id:j.id, round:j.round, a:j.a, b:j.b, vencedor:j.vencedor}))
