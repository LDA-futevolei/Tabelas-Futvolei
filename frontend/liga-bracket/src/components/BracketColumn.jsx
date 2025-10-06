import React from "react";
import MatchCard from "./MatchCard";

export default function BracketColumn({ rounds, title, onMatchClick, side }) {
  return (
    <div
      className={`flex flex-col flex-1 items-${
        side === "right" ? "end" : "start"
      } text-center`}
    >
      {rounds.map((round, rIndex) => (
        <div key={rIndex} className="mb-8">
          <h3 className="font-semibold text-pink-400 mb-2 uppercase tracking-wide">
            {title} - Round {rIndex + 1}
          </h3>
          {round.map((match) => (
            <MatchCard key={match.id} match={match} onClick={onMatchClick} />
          ))}
        </div>
      ))}
    </div>
  );
}
