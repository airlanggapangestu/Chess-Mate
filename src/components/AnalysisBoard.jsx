import ChessBoard from "./ChessBoard";

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
   ANALYSIS BOARD
============================================ */
export default function AnalysisBoard({
  game,
  position,
  onMove,
  arrows,
  ready,
  analyzing,
  gameOver,
  status,
  currentIndex,
  totalMoves,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onGoToStart,
  onGoToEnd,
  onReset,
  boardOrientation,
  onFlip,
}) {
  /* ---------- STATUS ---------- */
  const turnLabel = gameOver
    ? status
    : game.turn() === "w"
      ? "White to move"
      : "Black to move";

  const engineLabel = !ready
    ? "Loading engine..."
    : analyzing
      ? "Analyzing..."
      : "Ready";

  const moveLabel =
    totalMoves > 0 ? `${currentIndex} / ${totalMoves}` : "0 / 0";

  const isPlayerTurn = !gameOver;

  return (
    <div className="flex flex-col gap-5">
      {/* ============ HEADER BANNER ============ */}
      <div className="bg-surface-container-low rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">
              Analysis
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed/60 text-on-primary-fixed-variant text-xs font-semibold">
              <Icon name="insights" className="text-[14px]" filled />
              Engine Insights
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                ready
                  ? analyzing
                    ? "bg-tertiary-container/30 text-on-tertiary-container"
                    : "bg-surface-container-high text-on-surface-variant"
                  : "bg-surface-container-high text-secondary"
              }`}
            >
              <Icon
                name={analyzing ? "hourglass_top" : "check_circle"}
                className={`text-[13px] ${analyzing ? "animate-pulse" : ""}`}
                filled={!analyzing}
              />
              {engineLabel}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="relative flex h-2 w-2">
              {isPlayerTurn && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isPlayerTurn ? "bg-primary" : "bg-secondary"
                }`}
              />
            </span>
            <span
              className={`font-semibold ${
                isPlayerTurn ? "text-primary" : "text-secondary"
              }`}
            >
              {turnLabel}
            </span>
            <span className="text-outline">•</span>
            <span className="text-secondary">Auto-analyzed with arrows</span>
          </div>
        </div>
      </div>

      {/* ============ BOARD CONTAINER ============ */}
      <div className="bg-surface-container-low rounded-xl p-5 sm:p-6 shadow-sm flex flex-col gap-4">
        {/* Top indicator */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2 text-xs text-secondary">
            <Icon
              name={analyzing ? "hourglass_top" : "lightbulb"}
              className={`text-base ${
                analyzing ? "text-tertiary animate-pulse" : "text-primary"
              }`}
              filled={!analyzing}
            />
            <span className="font-semibold text-on-surface-variant">
              {analyzing
                ? "Analyzing position..."
                : gameOver
                  ? "Game ended"
                  : "Best moves shown as arrows"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-medium text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-full bg-[#00aa00]" />
              Best
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-full bg-[#1d9bf0]" />
              Alternative
            </span>
          </div>
        </div>

        {/* Board */}
        <div className="w-full flex justify-center py-1">
          <div className="relative w-full max-w-[580px] aspect-square rounded-2xl p-3 bg-surface-container-highest shadow-md">
            <div className="w-full h-full rounded-xl overflow-hidden shadow-inner">
              <ChessBoard
                game={game}
                position={position}
                onMove={onMove}
                arrows={arrows}
                disabled={false}
                boardOrientation={boardOrientation}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============ NAVIGATION BAR (primary) ============ */}
      <div className="bg-surface-container-low rounded-xl p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Move counter */}
        <div className="flex items-center gap-2 text-xs text-secondary">
          <Icon name="format_list_numbered" className="text-base" />
          <span className="font-semibold text-on-surface-variant">
            Position
          </span>
          <span className="font-mono font-bold text-on-surface bg-surface-container px-2 py-0.5 rounded-md tabular-nums">
            {moveLabel}
          </span>
        </div>

        {/* Nav buttons */}
        <div className="flex items-center gap-1">
          <NavButton
            icon="first_page"
            onClick={onGoToStart}
            disabled={!canUndo}
            title="To start (Home)"
          />
          <NavButton
            icon="chevron_left"
            onClick={onUndo}
            disabled={!canUndo}
            title="Back (←)"
            accent
          />
          <div className="mx-1 w-px h-6 bg-outline-variant/50" />
          <NavButton
            icon="chevron_right"
            onClick={onRedo}
            disabled={!canRedo}
            title="Forward (→)"
            accent
          />
          <NavButton
            icon="last_page"
            onClick={onGoToEnd}
            disabled={!canRedo}
            title="To end (End)"
          />
        </div>
      </div>

      {/* ============ ACTION BAR (flip + reset) ============ */}
      <div className="bg-surface-container-low rounded-xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onFlip}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs font-semibold transition-all cursor-pointer"
            title="Flip board"
          >
            <Icon name="swap_vert" className="text-base" />
            Flip
          </button>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-90 shadow-sm transition-all cursor-pointer"
          title="New game"
        >
          <Icon name="add" className="text-base" />
          New Game
        </button>
      </div>
    </div>
  );
}

/* ============================================
   NAV BUTTON
============================================ */
function NavButton({ icon, onClick, disabled, title, accent }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
        disabled
          ? "text-secondary/30 cursor-not-allowed"
          : accent
            ? "bg-primary text-on-primary shadow-sm hover:opacity-90"
            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
      }`}
    >
      <Icon name={icon} className="text-xl" />
    </button>
  );
}
