import { gerarClassificatoria } from './src/logic/bracketGenerator.js'

// Gera uma chave com prelims (n=18) e simula vencedores na primeira rodada do upper
function makeDuplas(n){ return Array.from({length:n}, (_,i)=>({id:i+1})) }
const duplas = makeDuplas(18)
let jogos = gerarClassificatoria(duplas, { prelim: true })

// Marca vencedores dos dois jogos de prelim (ids 1 e 2)
jogos = jogos.map(j => j.id === 1 ? { ...j, vencedor: 15 } : j)
jogos = jogos.map(j => j.id === 2 ? { ...j, vencedor: 16 } : j)

// Agora marque vencedores de alguns jogos do upper round=2 para forçar perdedores a descerem
const winnersRound2 = jogos.filter(j => j.tipo==='upper' && j.round===2)
// Para simplificar, vamos dizer que sempre vence o menor id entre a e b (quando ambos existem)
const byId = new Map(jogos.map(j=>[j.id,j]))
for (const m of winnersRound2){
  const a = (m.a ?? (m.fontes?.[0]?.type==='from' ? byId.get(m.fontes[0].ref)?.vencedor : m.a))
  const b = (m.b ?? (m.fontes?.[1]?.type==='from' ? byId.get(m.fontes[1].ref)?.vencedor : m.b))
  const va = Number(a||0), vb = Number(b||0)
  const win = (va && vb) ? Math.min(va,vb) : (va||vb||null)
  if (win!=null){
    const idx = jogos.findIndex(j=>j.id===m.id)
    jogos[idx] = { ...m, vencedor: win }
  }
}

// Propaga perdedores para os jogos com fontes=perdedor
const map = new Map(jogos.map(j=>[j.id,j]))
for (const tgt of jogos){
  if (!Array.isArray(tgt.fontes)) continue
  for (let fi=0; fi<tgt.fontes.length; fi++){
    const f = tgt.fontes[fi]
    if (!f || f.type!=='from') continue
    const src = map.get(f.ref)
    if (!src || src.vencedor==null) continue
    if (f.path==='perdedor'){
      // tentar resolver lados efetivos do src
      let sa = src.a, sb = src.b
      if ((sa==null || sb==null) && Array.isArray(src.fontes)){
        for (let k=0;k<src.fontes.length;k++){
          const sf = src.fontes[k]
          if (sf.type==='seed' && sf.id!=null){
            if (k===0 && sa==null) sa = sf.id; else if (k===1 && sb==null) sb = sf.id; else if (sa==null) sa = sf.id; else if (sb==null) sb = sf.id;
          } else if (sf.type==='from'){
            const sm = map.get(sf.ref)
            if (!sm) continue
            if (sf.path==='vencedor' && sm.vencedor!=null){
              if (k===0 && sa==null) sa = sm.vencedor; else if (k===1 && sb==null) sb = sm.vencedor; else if (sa==null) sa=sm.vencedor; else if (sb==null) sb=sm.vencedor;
            }
          }
        }
      }
      if (sa!=null && sb!=null){
        const loser = (src.vencedor===sa)? sb : sa
        if (fi===0){ if (tgt.a==null) tgt.a = loser } else if (fi===1){ if (tgt.b==null) tgt.b = loser } else { if (tgt.a==null) tgt.a = loser; else if (tgt.b==null) tgt.b = loser }
      }
    }
    if (f.path==='vencedor'){
      if (fi===0){ if (tgt.a==null) tgt.a = src.vencedor } else if (fi===1){ if (tgt.b==null) tgt.b = src.vencedor } else { if (tgt.a==null) tgt.a = src.vencedor; else if (tgt.b==null) tgt.b = src.vencedor }
    }
  }
}

const lower = jogos.filter(j=>j.tipo==='lower').sort((a,b)=> a.round-b.round || a.id-b.id)
console.log('Lower apos propagacao (primeiros 6):')
for (const j of lower.slice(0,6)){
  console.log({id:j.id, round:j.round, a:j.a, b:j.b, fontes:j.fontes})
}
