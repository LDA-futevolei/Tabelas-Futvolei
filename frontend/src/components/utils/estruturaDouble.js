export function gerarEstruturaDouble(numDuplas) {
  const totalRodadasUpper = Math.ceil(Math.log2(numDuplas));
  const estrutura = [];
  let id = 1;

  // Upper rounds
  for (let r = 1; r <= totalRodadasUpper; r++) {
    const jogos = numDuplas / Math.pow(2, r);
    for (let i = 0; i < jogos; i++) {
      estrutura.push({
        id: id++,
        rodada: r,
        tipo: "upper",
        duplaA: r === 1 ? i * 2 + 1 : `Vencedor Jogo ${id - jogos * 2 + i * 2 - 1}`,
        duplaB: r === 1 ? i * 2 + 2 : `Vencedor Jogo ${id - jogos * 2 + i * 2}`,
      });
    }
  }

  // Lower rounds (espelho das derrotas)
  const totalRodadasLower = totalRodadasUpper - 1;
  for (let r = 1; r <= totalRodadasLower; r++) {
    const jogos = numDuplas / Math.pow(2, r + 1);
    for (let i = 0; i < jogos; i++) {
      estrutura.push({
        id: id++,
        rodada: r,
        tipo: "lower",
        duplaA: `Perdedor Jogo ${(i * 2) + 1}`,
        duplaB: `Perdedor Jogo ${(i * 2) + 2}`,
      });
    }
  }

  return estrutura;
}
