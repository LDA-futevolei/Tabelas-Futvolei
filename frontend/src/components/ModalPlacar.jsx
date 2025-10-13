import React from "react";

export default function ModalPlacar({ jogo, onClose }) {
  if (!jogo) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-gray-900 border border-pink-500 p-6 rounded-2xl shadow-lg w-80 text-center text-white">
        <h3 className="text-pink-400 font-bold mb-4">Jogo {jogo.id}</h3>
        <p className="mb-2">{jogo.duplaA}</p>
        <p className="mb-2">vs</p>
        <p className="mb-2">{jogo.duplaB}</p>
        <button
          onClick={onClose}
          className="mt-6 bg-pink-600 hover:bg-pink-700 text-white px-4 py-1 rounded"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
