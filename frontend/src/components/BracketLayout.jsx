import BracketColumn from "./BracketColumn";
import FinalsSection from "./FinalsSection";

export default function BracketLayout({ bracket, onMatchClick }) {
    return (
        <div className="overflow-x-auto">
            <div className="flex justify-center items-start gap-8 min-w-max">
                <div className="flex flex-col">
                    <BracketColumn
                        rounds={bracket.upper}
                        title="Upper Bracket"
                        onMatchClick={onMatchClick}
                    />
                </div>

                <div className="flex flex-col justify-center">
                    <FinalsSection />
                </div>

                <div className="flex flex-col">
                    <BracketColumn
                        rounds={bracket.lower}
                        title="Lower Bracket"
                        onMatchClick={onMatchClick}
                        invert
                    />
                </div>
            </div>
        </div>
    );
}
