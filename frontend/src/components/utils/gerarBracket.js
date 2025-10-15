export function gerarBracket(numDuplas) {
  const jogosUpper = [];
  const jogosLower = [];

  // primeira rodada
  const round1 = [];
  for (let i = 1; i <= numDuplas; i += 2) {
    round1.push({
      id: i,
      duplaA: `Dupla ${i}`,
      duplaB: `Dupla ${i + 1}`,
      vencedor: null,
      perdedor: null,
    });
  }
  jogosUpper.push({ nome: "Fase 1", jogos: round1 });

  // gera as rodadas seguintes reduzindo pela metade até a final
  let qtd = numDuplas / 2;
  let contador = numDuplas + 1;
  while (qtd >= 1) {
    const jogos = [];
    for (let j = 0; j < qtd; j++) {
      jogos.push({
        id: contador++,
        duplaA: `Vencedor Jogo ${contador - qtd * 2 + j * 2 + 1}`,
        duplaB: `Vencedor Jogo ${contador - qtd * 2 + j * 2 + 2}`,
        vencedor: null,
        perdedor: null,
      });
    }
    jogosUpper.push({ nome: `Fase ${jogosUpper.length + 1}`, jogos });
    qtd = qtd / 2;
  }

  // bracket de perdedores (espelho)
  const lowerCount = numDuplas / 2;
  for (let i = 0; i < lowerCount; i++) {
    jogosLower.push({
      nome: `Lower ${i + 1}`,
      jogos: [
        {
          id: contador++,
          duplaA: `Perdedor Jogo ${i * 2 + 1}`,
          duplaB: `Perdedor Jogo ${i * 2 + 2}`,
        },
      ],
    });
  }

  return {
    upper: jogosUpper,
    lower: jogosLower,
    final: {
      id: contador,
      duplaA: "Vencedor Upper",
      duplaB: "Vencedor Lower",
    },
  };
}