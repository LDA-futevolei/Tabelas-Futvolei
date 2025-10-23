import { gerarClassificatoria } from './src/logic/bracketGenerator.js'

const n = 16
const duplas = Array.from({length: n}, (_, i) => ({ id: i+1 }))
for (const opt of [{}, {prelim:true}, {spread:true}, {ladder:false}]){
  const jogos = gerarClassificatoria(duplas, opt)
  const lower = jogos.filter(j => j.tipo === 'lower')
  const byR = [...new Set(lower.map(j => j.round))].sort((a,b)=>a-b)
  const counts = byR.map(r => lower.filter(j => j.round===r).length)
  console.log('opt=', opt, 'rounds=', byR, 'counts=', counts)
}
