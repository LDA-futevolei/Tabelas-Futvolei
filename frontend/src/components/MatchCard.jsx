export default function MatchCard({ match, onClick }) {
    return (
        <div
            onClick={() => onClick(match)}
            className="cursor-pointer border border-pink-500 bg-gray-900 text-white p-3 mb-3 rounded-2xl shadow hover:bg-pink-800/20 transition  w-full max-w-[220px] sm:max-w-[240px] md:max-w-[260px]"
        >
            <div className="flex justify-between items-center">
                <span className="truncate">
                    {match.teamA} {match.winner === match.teamA && "🏆"}
                </span>
                <span className="font-mono text-pink-400">{match.scoreA}</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-700 mt-1 pt-1">
                <span className="truncate">
                    {match.teamB} {match.winner === match.teamB && "🏆"}
                </span>
                <span className="font-mono text-pink-400">{match.scoreB}</span>
            </div>
        </div>
    );
}
