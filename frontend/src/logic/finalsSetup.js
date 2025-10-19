export function montarFinais(jogosClass) {
  
  const Lupper = jogosClass.find(j => j.tipo === 'upper-final' && j.region === 'L')
  const Llower = jogosClass.find(j => j.tipo === 'lower-final' && j.region === 'L')
  const Rupper = jogosClass.find(j => j.tipo === 'upper-final' && j.region === 'R')
  const Rlower = jogosClass.find(j => j.tipo === 'lower-final' && j.region === 'R')

  const semi1 = {
    id: 1001,
    fase: 'finais',
    round: 1,
    region: 'L',
    a: null,
    b: null,
    vencedor: null,
    fontes: [
      { type: 'from', ref: Lupper?.id, path: 'vencedor' },
      { type: 'from', ref: Llower?.id, path: 'vencedor' }
    ],
    tipo: 'semi'
  }

  const semi2 = {
    id: 1002,
    fase: 'finais',
    round: 1,
    region: 'R',
    a: null,
    b: null,
    vencedor: null,
    fontes: [
      { type: 'from', ref: Rupper?.id, path: 'vencedor' },
      { type: 'from', ref: Rlower?.id, path: 'vencedor' }
    ],
    tipo: 'semi'
  }

  const final = {
    id: 1003,
    fase: 'finais',
    round: 2,
    region: 'C',
    a: null,
    b: null,
    vencedor: null,
    fontes: [
      { type: 'from', ref: semi1.id, path: 'vencedor' },
      { type: 'from', ref: semi2.id, path: 'vencedor' }
    ],
    tipo: 'final'
  }

  const terceiro = {
    id: 1004,
    fase: 'finais',
    round: 2,
    region: 'C',
    a: null,
    b: null,
    vencedor: null,
    fontes: [
      { type: 'from', ref: semi1.id, path: 'perdedor' },
      { type: 'from', ref: semi2.id, path: 'perdedor' }
    ],
    tipo: 'third'
  }
  return [semi1, semi2, final, terceiro]
}

