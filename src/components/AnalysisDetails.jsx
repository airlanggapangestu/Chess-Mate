import { detectOpening } from "../utils/openings";

/* ============================================
   ICON
============================================ */
function Icon({ name, className = "", filled = false }) {
  return (
    <span
      className={`material-symbols-outlined ${filled ? "filled" : ""} ${className}`}
    >
      {name}
    </span>
  );
}

/* ============================================
   ANALYSIS DETAILS — opening info card
============================================ */
export default function AnalysisDetails({
  moveHistory,
  currentIndex,
  totalMoves,
}) {
  const sanMoves = moveHistory.map((m) => m.san);
  const opening = detectOpening(sanMoves);

  const openingName = opening ? opening.name : "Starting Position";
  const openingEco = opening ? opening.eco : "—";
  const hasOpening = !!opening;

  return (
    <div className="bg-surface-container-low rounded-xl p-5 shadow-sm flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="menu_book" className="text-primary text-lg" filled />
          <h2 className="text-base font-bold text-on-surface">
            Opening Analysis
          </h2>
        </div>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary-fixed/60 text-on-primary-fixed-variant">
          ECO: {openingEco}
        </span>
      </div>

      {/* Opening name */}
      <div className="bg-surface-container p-3 rounded-lg flex flex-col gap-1">
        <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider">
          Identified Opening
        </span>
        <span className="font-bold text-sm text-on-surface">{openingName}</span>
        <span className="text-xs text-on-surface-variant">
          {hasOpening
            ? `Played ${opening.moves.length} ${opening.moves.length === 1 ? "move" : "moves"} of this line`
            : "Play a common opening move to detect the line"}
        </span>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface-container p-3 rounded-lg flex flex-col">
          <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider">
            Moves Played
          </span>
          <span className="font-bold text-sm text-on-surface mt-0.5 tabular-nums">
            {totalMoves}
          </span>
          <span className="text-[10px] text-secondary">
            {Math.ceil(totalMoves / 2)} full{" "}
            {Math.ceil(totalMoves / 2) === 1 ? "move" : "moves"}
          </span>
        </div>
        <div className="bg-surface-container p-3 rounded-lg flex flex-col">
          <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider">
            Current Position
          </span>
          <span className="font-bold text-sm text-on-surface mt-0.5 tabular-nums">
            {currentIndex} / {totalMoves}
          </span>
          <span className="text-[10px] text-secondary">
            {currentIndex === totalMoves ? "Latest move" : "Historical"}
          </span>
        </div>
      </div>
    </div>
  );
}
