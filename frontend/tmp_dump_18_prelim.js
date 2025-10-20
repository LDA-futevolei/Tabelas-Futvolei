import { gerarClassificatoria } from './src/logic/bracketGenerator.js'

function makeDuplas(n){
	return Array.from({length: n}, (_, i) => ({ id: i+1, nome: `P${i+1}`}))
}

const n = 18
const duplas = makeDuplas(n)
const jogos = gerarClassificatoria(duplas, { prelim: true, spread: false })
console.log(`Total jogos: ${jogos.length}`)
for (const j of jogos) {
  console.log(`id=${j.id} tipo=${j.tipo} fase=${j.fase} round=${j.round} a=${JSON.stringify(j.a)} b=${JSON.stringify(j.b)} fontes=${JSON.stringify(j.fontes)}`)
}
