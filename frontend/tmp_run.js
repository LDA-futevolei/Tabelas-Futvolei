import { gerarClassificatoria } from './src/logic/bracketGenerator.js'

function makeDuplas(n){
	return Array.from({length: n}, (_, i) => ({ id: i+1, nome: `P${i+1}`}))
}


const tests = [11, 18]
for(const n of tests){
  const duplas = makeDuplas(n)
  console.log(`\n--- n=${n} MODE=compact`) 
  let jogos = gerarClassificatoria(duplas, { spread: false })
  console.log(' P=', (n%2===1? n+1 : n), ' jogos=', jogos.length)
  const upper = jogos.filter(j => j.tipo === 'upper').sort((a,b)=> a.round - b.round || a.id - b.id)
  console.log(' upper sample:', upper.slice(0,8).map(j => ({id:j.id, round:j.round, a:j.a, b:j.b, skip:j.skipRender})))

  console.log(`\n--- n=${n} MODE=spread (classic)`)
  jogos = gerarClassificatoria(duplas, { spread: true })
  const Pspread = (Math.pow(2, Math.ceil(Math.log2(n))))
  console.log(' P=', Pspread, ' jogos=', jogos.length)
  const upperS = jogos.filter(j => j.tipo === 'upper').sort((a,b)=> a.round - b.round || a.id - b.id)
  console.log(' upper sample:', upperS.slice(0,8).map(j => ({id:j.id, round:j.round, a:j.a, b:j.b, skip:j.skipRender})))
}
