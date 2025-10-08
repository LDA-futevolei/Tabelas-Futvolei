import React from "react";
import CardJogo from "./CardJogo";

export default function SecaoFinais({ final }) {
  if (!final) return null;
  return (
    <div className="flex flex-col items-center gap-8">
      <h3 className="font-semibold text-pink-400 mb-2 uppercase tracking-wide text-center">
        Final
      </h3>
      <CardJogo jogo={final} onClick={() => {}} />
    </div>
  );
}
