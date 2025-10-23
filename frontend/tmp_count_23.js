import { gerarClassificatoria } from './src/logic/bracketGenerator.js'
import { writeFileSync } from 'node:fs'

const n = 23
const duplas = Array.from({length: n}, (_, i) => ({ id: i+1 }))
const jogos = gerarClassificatoria(duplas, { prelim: true, spread: false })
const lower = jogos.filter(j => j.tipo === 'lower')
const rounds = [...new Set(lower.map(j => j.round))].sort((a,b)=>a-b)
const counts = rounds.map(r => ({ round: r, count: lower.filter(j=>j.round===r).length }))
writeFileSync('./tmp_count_23.result.json', JSON.stringify({rounds, counts}, null, 2), 'utf-8')
console.log('OK written tmp_count_23.result.json')
