import { gerarClassificatoria } from './src/logic/bracketGenerator.js'

function makeDuplas(n){
	return Array.from({length: n}, (_, i) => ({ id: i+1, nome: `P${i+1}`}))
}

const tests = [11, 18]
for(const n of tests){
  const duplas = makeDuplas(n)
  console.log(`\n--- n=${n} MODE=prelim`) 
  let jogos = gerarClassificatoria(duplas, { prelim: true, spread: false })
  const P = Math.pow(2, Math.floor(Math.log2(n)))
  console.log(' target P=', P, ' jogos=', jogos.length)
  const upper = jogos.filter(j => j.tipo === 'upper').sort((a,b)=> a.round - b.round || a.id - b.id)
  console.log(' upper sample:', upper.slice(0,8).map(j => ({id:j.id, round:j.round, a:j.a, b:j.b, fontes:j.fontes, skip:j.skipRender})))
}
