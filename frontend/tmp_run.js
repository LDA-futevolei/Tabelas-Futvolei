import { gerarClassificatoria } from './src/logic/bracketGenerator.js'

function makeDuplas(n){
	return Array.from({length: n}, (_, i) => ({ id: i+1, nome: `P${i+1}`}))
}

const tests = [7,9,8,10,12]
for(const n of tests){
	const duplas = makeDuplas(n)
	const jogos = gerarClassificatoria(duplas)
	console.log(`\n=== n=${n} P=${Math.pow(2, Math.ceil(Math.log2(n)))} jogos=${jogos.length}`)
	const countsByTipo = jogos.reduce((acc, j) => { acc[j.tipo] = (acc[j.tipo]||0)+1; return acc }, {})
	console.log('countsByTipo', countsByTipo)
	const upper = jogos.filter(j => j.tipo === 'upper').sort((a,b)=> a.round - b.round || a.id - b.id)
	console.log('upper sample:', upper.slice(0,6).map(j => ({id:j.id, round:j.round, region:j.region, a:j.a, b:j.b, vencedor:j.vencedor, skip:j.skipRender})))
	const dupes = jogos.filter(j => j.a != null && j.b != null && String(j.a) === String(j.b))
	if (dupes.length > 0) {
		console.log('Found duplicate-seed matches:')
		dupes.forEach(d => console.log(' -', { id: d.id, round: d.round, region: d.region, a: d.a, b: d.b }))
	} else {
		console.log('No duplicate a===b matches')
	}
}
