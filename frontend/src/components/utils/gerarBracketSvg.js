export function gerarBracketSvg(numDuplas) {
  // arredonda para a próxima potência de 2
  const rounds = Math.ceil(Math.log2(numDuplas));
  const totalJogosUpper = Math.pow(2, rounds - 1);
  const bracket = { upper: [], lower: [], final: null };

  let jogoId = 1;

  // Upper Bracket
  for (let r = 0; r < rounds; r++) {
    const jogos = [];
    const jogosNestaRodada = Math.pow(2, rounds - r - 1);
    for (let i = 0; i < jogosNestaRodada; i++) {
      jogos.push({
        id: jogoId,
        duplaA: `Dupla ${jogoId * 2 - 1}`,
        duplaB: `Dupla ${jogoId * 2 <= numDuplas ? jogoId * 2 : "-"}`,
        placarA: null,
        placarB: null,
        vencedor: null,
      });
      jogoId++;
    }
    bracket.upper.push({ nome: `Fase ${r + 1}`, jogos });
  }

  // Lower Bracket placeholders (espelhados)
  let lowerJogoId = jogoId;
  const totalLowerRounds = rounds - 1;
  for (let r = 0; r < totalLowerRounds; r++) {
    const jogos = [];
    const jogosNestaRodada = Math.pow(2, r);
    for (let i = 0; i < jogosNestaRodada; i++) {
      jogos.push({
        id: lowerJogoId,
        duplaA: `Vencedor do jogo ?`,
        duplaB: `Vencedor do jogo ?`,
        placarA: null,
        placarB: null,
        vencedor: null,
      });
      lowerJogoId++;
    }
    bracket.lower.push({ nome: `Lower Round ${r + 1}`, jogos });
  }

  // Final
  bracket.final = {
    id: lowerJogoId,
    duplaA: "Vencedor Upper",
    duplaB: "Vencedor Lower",
    placarA: null,
    placarB: null,
    vencedor: null,
  };

  return bracket;
}
