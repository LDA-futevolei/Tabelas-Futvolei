export function checkIfReadyForFinals(jogos) {
  const jogosRestantes = jogos.filter(j => !j.vencedor);
  return jogosRestantes.length === 0;
}
