export const estruturaDouble16 = [
  // 🏆 UPPER BRACKET – RODADA 1 (Jogos 1–8)
  { id: 1, rodada: 1, tipo: "upper", duplaA: 1, duplaB: 2, vencedorVaiPara: 13, perdedorVaiPara: 9 },
  { id: 2, rodada: 1, tipo: "upper", duplaA: 3, duplaB: 4, vencedorVaiPara: 13, perdedorVaiPara: 9 },
  { id: 3, rodada: 1, tipo: "upper", duplaA: 5, duplaB: 6, vencedorVaiPara: 14, perdedorVaiPara: 10 },
  { id: 4, rodada: 1, tipo: "upper", duplaA: 7, duplaB: 8, vencedorVaiPara: 14, perdedorVaiPara: 10 },
  { id: 5, rodada: 1, tipo: "upper", duplaA: 9, duplaB: 10, vencedorVaiPara: 15, perdedorVaiPara: 11 },
  { id: 6, rodada: 1, tipo: "upper", duplaA: 11, duplaB: 12, vencedorVaiPara: 15, perdedorVaiPara: 11 },
  { id: 7, rodada: 1, tipo: "upper", duplaA: 13, duplaB: 14, vencedorVaiPara: 16, perdedorVaiPara: 12 },
  { id: 8, rodada: 1, tipo: "upper", duplaA: 15, duplaB: 16, vencedorVaiPara: 16, perdedorVaiPara: 12 },

  // 🔻 LOWER BRACKET – RODADA 1 (Jogos 9–12)
  { id: 9,  rodada: 1, tipo: "lower", duplaA: "Perdedor Jogo 1", duplaB: "Perdedor Jogo 2", vencedorVaiPara: 17 },
  { id: 10, rodada: 1, tipo: "lower", duplaA: "Perdedor Jogo 3", duplaB: "Perdedor Jogo 4", vencedorVaiPara: 18 },
  { id: 11, rodada: 1, tipo: "lower", duplaA: "Perdedor Jogo 5", duplaB: "Perdedor Jogo 6", vencedorVaiPara: 19 },
  { id: 12, rodada: 1, tipo: "lower", duplaA: "Perdedor Jogo 7", duplaB: "Perdedor Jogo 8", vencedorVaiPara: 20 },

  // 🏆 UPPER BRACKET – RODADA 2 (Jogos 13–16)
  { id: 13, rodada: 2, tipo: "upper", duplaA: "Vencedor Jogo 1", duplaB: "Vencedor Jogo 2", vencedorVaiPara: 21, perdedorVaiPara: 17 },
  { id: 14, rodada: 2, tipo: "upper", duplaA: "Vencedor Jogo 3", duplaB: "Vencedor Jogo 4", vencedorVaiPara: 21, perdedorVaiPara: 18 },
  { id: 15, rodada: 2, tipo: "upper", duplaA: "Vencedor Jogo 5", duplaB: "Vencedor Jogo 6", vencedorVaiPara: 22, perdedorVaiPara: 19 },
  { id: 16, rodada: 2, tipo: "upper", duplaA: "Vencedor Jogo 7", duplaB: "Vencedor Jogo 8", vencedorVaiPara: 22, perdedorVaiPara: 20 },

  // 🔻 LOWER BRACKET – RODADA 2 (Jogos 17–20)
  { id: 17, rodada: 2, tipo: "lower", duplaA: "Vencedor Jogo 9",  duplaB: "Perdedor Jogo 13", vencedorVaiPara: 23 },
  { id: 18, rodada: 2, tipo: "lower", duplaA: "Vencedor Jogo 10", duplaB: "Perdedor Jogo 14", vencedorVaiPara: 23 },
  { id: 19, rodada: 2, tipo: "lower", duplaA: "Vencedor Jogo 11", duplaB: "Perdedor Jogo 15", vencedorVaiPara: 24 },
  { id: 20, rodada: 2, tipo: "lower", duplaA: "Vencedor Jogo 12", duplaB: "Perdedor Jogo 16", vencedorVaiPara: 24 },

  // 🏆 UPPER BRACKET – RODADA 3 (Jogos 21–22)
  { id: 21, rodada: 3, tipo: "upper", duplaA: "Vencedor Jogo 13", duplaB: "Vencedor Jogo 14", vencedorVaiPara: 26, perdedorVaiPara: 23 },
  { id: 22, rodada: 3, tipo: "upper", duplaA: "Vencedor Jogo 15", duplaB: "Vencedor Jogo 16", vencedorVaiPara: 27, perdedorVaiPara: 24 },

  // 🔻 LOWER BRACKET – RODADA 3 (Jogos 23–24)
  { id: 23, rodada: 3, tipo: "lower", duplaA: "Vencedor Jogo 17", duplaB: "Vencedor Jogo 18", vencedorVaiPara: 25 },
  { id: 24, rodada: 3, tipo: "lower", duplaA: "Vencedor Jogo 19", duplaB: "Vencedor Jogo 20", vencedorVaiPara: 25 },

  // 🔻 LOWER BRACKET – RODADA 4 (Jogo 25)
  { id: 25, rodada: 4, tipo: "lower", duplaA: "Vencedor Jogo 23", duplaB: "Vencedor Jogo 24", vencedorVaiPara: 28 },

  // ⚔️ SEMIFINAIS (Upper × Lower)
  { id: 26, rodada: 4, tipo: "semi", duplaA: "Vencedor Jogo 21", duplaB: "Vencedor Jogo 25", vencedorVaiPara: 28, perdedorVaiPara: 29 },
  { id: 27, rodada: 4, tipo: "semi", duplaA: "Vencedor Jogo 22", duplaB: "Vencedor Jogo 25", vencedorVaiPara: 28, perdedorVaiPara: 29 },

  // 🏆 FINAL
  { id: 28, rodada: 5, tipo: "final", duplaA: "Vencedor Jogo 26", duplaB: "Vencedor Jogo 27", vencedorVaiPara: null, perdedorVaiPara: null },

  // 🥉 3º LUGAR
  { id: 29, rodada: 5, tipo: "3lugar", duplaA: "Perdedor Jogo 26", duplaB: "Perdedor Jogo 27", vencedorVaiPara: null, perdedorVaiPara: null },
];
