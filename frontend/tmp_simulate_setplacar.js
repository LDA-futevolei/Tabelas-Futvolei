import { gerarClassificatoria } from './src/logic/bracketGenerator.js'

function makeDuplas(n){ return Array.from({length:n}, (_,i)=>({id:i+1})) }
const duplas = makeDuplas(18)
let jogos = gerarClassificatoria(duplas, { prelim: true })
console.log('initial upper sample:', jogos.filter(j=>j.tipo==='upper').slice(0,8).map(j=>({id:j.id, round:j.round, a:j.a, b:j.b, fontes:j.fontes})))
// simulate setting score for prelim matches id=1 and id=2 winners
// winner of id=1 -> seed15 vs 18, assume winner is 15
jogos = jogos.map(j => j.id === 1 ? {...j, vencedor:15} : j)
// winner of id=2 -> seed16
jogos = jogos.map(j => j.id === 2 ? {...j, vencedor:16} : j)
// manually run a simple propagation similar to store behavior
const jogosById = new Map(jogos.map(j=>[j.id,j]))
for (const j of jogos) {
  if (!Array.isArray(j.fontes)) continue
  for (let fi=0; fi<j.fontes.length; fi++){
    const f = j.fontes[fi]
    if (!f || f.type!=='from') continue
    const src = jogosById.get(f.ref)
    if (!src) continue
    if (f.path==='vencedor' && src.vencedor!=null){
      if (fi===0) j.a = j.a==null?src.vencedor:j.a
      else if (fi===1) j.b = j.b==null?src.vencedor:j.b
    }
    if (f.path==='perdedor' && src.vencedor!=null){
      const loser = src.a===src.vencedor?src.b:src.a
      if (fi===0) j.a = j.a==null?loser:j.a
      else if (fi===1) j.b = j.b==null?loser:j.b
    }
  }
}
console.log('after propagation upper sample:', jogos.filter(j=>j.tipo==='upper').slice(0,8).map(j=>({id:j.id, round:j.round, a:j.a, b:j.b, fontes:j.fontes})))
