import React, { useState } from "react";
import CardJogo from "./CardJogo";
import ModalPlacar from "./ModalPlacar";

export default function ColunaFase({ lado, fases }) {
  const [matchSelecionado, setMatchSelecionado] = useState(null);

  return (
    <div className="flex flex-col items-center gap-8">
      {fases.map((fase, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <h3 className="font-semibold text-pink-400 mb-2 uppercase tracking-wide text-center">
            {fase.nome}
          </h3>
          {fase.jogos.map((jogo) => (
            <CardJogo
              key={jogo.id}
              jogo={jogo}
              onClick={() => setMatchSelecionado(jogo)}
            />
          ))}
        </div>
      ))}

      {matchSelecionado && (
        <ModalPlacar
          jogo={matchSelecionado}
          onClose={() => setMatchSelecionado(null)}
          lado={lado}
        />
      )}
    </div>
  );
}
