import { gerarClassificatoria as gen } from './src/logic/bracketGenerator.js'
function makeDuplas(n){ return Array.from({length:n}, (_,i)=>({id:i+1})) }
const duplas = makeDuplas(18)
for (const opt of [{}, {spread:true}, {prelim:true}]){
  const jogos = gen(duplas, opt)
  console.log('\nMODE', JSON.stringify(opt), 'P=', opt.spread? Math.pow(2, Math.ceil(Math.log2(18))) : (opt.prelim? Math.pow(2, Math.floor(Math.log2(18))) : (18%2?19:18)), 'jogos=', jogos.length)
  console.log(' first upper:', jogos.filter(j=>j.tipo==='upper').slice(0,4).map(j=>({id:j.id, round:j.round, a:j.a, b:j.b, fontes:j.fontes})))
}
