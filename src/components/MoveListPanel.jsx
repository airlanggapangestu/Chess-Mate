import { useEffect, useRef } from "react";
import { CLASSIFICATION } from "../utils/moveClassification";

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
   CLASSIFICATION → Icon + Color
============================================ */
const CLS_META = {
  brilliant: { icon: "auto_awesome", color: "#26c2a3" },
  great: { icon: "thumb_up", color: "#749bbf" },
  book: { icon: "menu_book", color: "#a88865" },
  best: { icon: "star", color: "#81b64c", filled: true },
  excellent: { icon: "check_circle", color: "#81b64c", filled: true },
  good: { icon: "check_circle", color: "#95b776" },
  inaccuracy: { icon: "warning", color: "#f7c631", filled: true },
  mistake: { icon: "error", color: "#ffa459", filled: true },
  blunder: { icon: "cancel", color: "#fa412d", filled: true },
};

const SUMMARY_ORDER = [
  "brilliant",
  "great",
  "best",
  "excellent",
  "good",
  "book",
  "inaccuracy",
  "mistake",
  "blunder",
];

/* ============================================
   MAIN
============================================ */
export default function MoveListPanel({
  moveHistory,
  currentIndex,
  onGoToIndex,
  classifications = [],
}) {
  const listRef = useRef(null);

  useEffect(() => {
    const container = listRef.current;
    if (!container) return;
    const active = container.querySelector('[data-active="true"]');
    if (!active) return;
    if (!container.contains(active)) return;

    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;
    const activeTop = active.offsetTop - container.offsetTop;
    const activeBottom = activeTop + active.offsetHeight;

    if (activeBottom > containerBottom) {
      container.scrollTop = activeBottom - container.clientHeight;
    } else if (activeTop < containerTop) {
      container.scrollTop = activeTop;
    }
  }, [currentIndex]);

  /* Group moves */
  const grouped = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    grouped.push({
      num: Math.floor(i / 2) + 1,
      white: { san: moveHistory[i]?.san, idx: i, data: moveHistory[i] },
      black: moveHistory[i + 1]
        ? { san: moveHistory[i + 1].san, idx: i + 1, data: moveHistory[i + 1] }
        : null,
    });
  }

  const totalMoves = moveHistory.length;
  const lastMoveIdx = totalMoves - 1;

  /* Classification summary */
  const counts = {};
  for (const c of classifications) {
    if (c) counts[c.type] = (counts[c.type] || 0) + 1;
  }
  const hasAnalysis = Object.keys(counts).length > 0;

  return (
    <div className="bg-surface-container-low rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* ============ HEADER ============ */}
      <div className="shrink-0 px-5 py-4 border-b border-surface-container-high">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Icon name="list_alt" className="text-sm text-secondary" />
            <h3 className="text-sm font-bold text-on-surface">Move Notation</h3>
          </div>
          <span className="text-xs text-secondary font-medium tabular-nums">
            {totalMoves} {totalMoves === 1 ? "move" : "moves"}
          </span>
        </div>

        {/* Classification summary */}
        {hasAnalysis && (
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            {SUMMARY_ORDER.map((key) => {
              const n = counts[key];
              if (!n) return null;
              const cls = CLASSIFICATION[key];
              const meta = CLS_META[key];
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-container text-[10px] font-bold tabular-nums"
                  style={{ color: meta.color }}
                  title={cls.label}
                >
                  <Icon
                    name={meta.icon}
                    className="text-[12px]"
                    filled={meta.filled}
                  />
                  {n}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* ============ MOVE LIST — 12 col grid ============ */}
      <div
        ref={listRef}
        className="scroll-custom flex-1 min-h-[140px] max-h-[50vh] overflow-y-auto px-3 py-2"
      >
        {grouped.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-1 text-xs">
            {/* Header */}
            <div className="grid grid-cols-12 py-1 px-2 text-[11px] font-bold text-secondary uppercase bg-surface-container/50 rounded">
              <span className="col-span-2">#</span>
              <span className="col-span-5">White</span>
              <span className="col-span-5">Black</span>
            </div>

            {/* Rows */}
            {grouped.map((row) => {
              const whiteIsActive = row.white?.idx === currentIndex - 1;
              const blackIsActive = row.black?.idx === currentIndex - 1;
              const isLastRow =
                row.num === Math.floor((totalMoves - 1) / 2) + 1;

              return (
                <div
                  key={row.num}
                  className={`grid grid-cols-12 py-1 px-2 rounded items-center font-mono transition-colors ${
                    isLastRow
                      ? "bg-primary-fixed/40 text-on-primary-fixed-variant"
                      : "hover:bg-surface-container"
                  }`}
                >
                  <span className="col-span-2 text-secondary font-sans text-[11px] font-medium tabular-nums">
                    {row.num}.
                  </span>

                  {/* White */}
                  {row.white ? (
                    <MoveCell
                      move={row.white}
                      classification={classifications[row.white.idx]}
                      active={whiteIsActive}
                      isLast={!blackIsActive && row.black?.idx === lastMoveIdx}
                      onGoToIndex={onGoToIndex}
                    />
                  ) : (
                    <span className="col-span-5" />
                  )}

                  {/* Black */}
                  {row.black ? (
                    <MoveCell
                      move={row.black}
                      classification={classifications[row.black.idx]}
                      active={blackIsActive}
                      isLast={row.black.idx === lastMoveIdx}
                      onGoToIndex={onGoToIndex}
                    />
                  ) : (
                    <span className="col-span-5" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============ FOOTER ============ */}
      <div className="shrink-0 px-4 py-3 border-t border-surface-container-high bg-surface-container/50">
        <div className="flex items-center justify-center gap-3 text-[10px] text-secondary">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container text-[9px] font-mono font-bold text-on-surface-variant">
              ←
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container text-[9px] font-mono font-bold text-on-surface-variant">
              →
            </kbd>
          </span>
          <span className="w-px h-3 bg-outline-variant/50" />
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container text-[9px] font-mono font-bold text-on-surface-variant">
              Home
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container text-[9px] font-mono font-bold text-on-surface-variant">
              End
            </kbd>
          </span>
          <span className="w-px h-3 bg-outline-variant/50" />
          <span className="flex items-center gap-1">
            <Icon name="keyboard" className="text-[11px]" />
            Navigate
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   MOVE CELL — 5-col span, matches notation style
============================================ */
function MoveCell({ move, classification, active, isLast, onGoToIndex }) {
  const meta = classification ? CLS_META[classification.type] : null;

  return (
    <button
      data-active={active}
      onClick={() => onGoToIndex(move.idx + 1)}
      className={`col-span-5 font-medium text-left flex items-center gap-1 px-1 rounded transition-colors cursor-pointer ${
        active ? "text-primary" : "text-on-surface hover:text-primary"
      }`}
      title={`Jump to move ${move.idx + 1}: ${move.san}`}
    >
      {meta && (
        <span
          className="shrink-0 flex items-center"
          style={{ color: active ? "inherit" : meta.color }}
          title={`${CLASSIFICATION[classification.type].label}${
            classification.cpl ? ` (${classification.cpl} cp)` : ""
          }`}
        >
          <Icon name={meta.icon} className="text-[13px]" filled={meta.filled} />
        </span>
      )}

      <span className="truncate">{move.san}</span>

      {isLast && !active && (
        <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
      )}
    </button>
  );
}

/* ============================================
   EMPTY STATE
============================================ */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="relative mb-3">
        <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center">
          <Icon name="list_alt" className="text-xl text-secondary/60" />
        </div>
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary-fixed border-2 border-surface-container-low flex items-center justify-center">
          <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
        </span>
      </div>
      <p className="text-xs font-semibold text-on-surface mb-0.5">
        No moves yet
      </p>
      <p className="text-[11px] text-secondary leading-relaxed max-w-[180px]">
        Make a move on the board to start recording history.
      </p>
    </div>
  );
}
