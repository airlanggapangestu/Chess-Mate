import { Chess } from "chess.js";

/**
 * Move classification.
 *
 *   Brilliant  — sacrifice + best move + still winning
 *   Great      — best move, and second-best is ≥ 200 cp worse
 *   Book       — common opening moves in first 10 plies
 *   Best       — matches engine's top move
 *   Excellent  — CPL ≤ 20
 *   Good       — CPL ≤ 50
 *   Inaccuracy — CPL ≤ 120
 *   Mistake    — CPL ≤ 300
 *   Blunder    — CPL > 300
 */

export const CLASSIFICATION = {
  brilliant: { id: "brilliant", label: "Brilliant", color: "#26c2a3" },
  great: { id: "great", label: "Great", color: "#749bbf" },
  book: { id: "book", label: "Book", color: "#a88865" },
  best: { id: "best", label: "Best", color: "#81b64c" },
  excellent: { id: "excellent", label: "Excellent", color: "#81b64c" },
  good: { id: "good", label: "Good", color: "#95b776" },
  inaccuracy: { id: "inaccuracy", label: "Inaccuracy", color: "#f7c631" },
  mistake: { id: "mistake", label: "Mistake", color: "#ffa459" },
  blunder: { id: "blunder", label: "Blunder", color: "#fa412d" },
};

// Common opening moves (SAN). Only applied within the first few plies.
const BOOK_OPENINGS = new Set([
  "e4",
  "d4",
  "Nf3",
  "c4",
  "g3",
  "b3",
  "f4",
  "Nc3",
  "e5",
  "d5",
  "Nf6",
  "c5",
  "c6",
  "e6",
  "g6",
  "d6",
]);

/* ============================================
   BRILLIANT DETECTION
   Sacrifice a piece (not pawn) AND still winning.
============================================ */
function detectBrilliant({ move, bestScore, fenAfter }) {
  if (!move || !fenAfter) return false;

  // Must lead to a good position for the mover
  if (bestScore < 0) return false;

  try {
    const g = new Chess(fenAfter);
    const toSquare = move.to;
    const movedPiece = g.get(toSquare);
    if (!movedPiece) return false;

    // Skip pawn sacrifices (chess.com only counts piece sacs as brilliant)
    if (movedPiece.type === "p") return false;

    // The piece must be capturable by opponent on its new square
    const oppMoves = g.moves({ verbose: true });
    const canBeCaptured = oppMoves.some((m) => m.to === toSquare && m.captured);
    if (!canBeCaptured) return false;

    // Skip plain equal trades — needs to be a genuine sacrifice.
    // Heuristic: if the move itself was a capture of equal-value piece,
    // it's probably an exchange, not a brilliant sac.
    if (move.captured && move.piece === move.captured) return false;

    return true;
  } catch {
    return false;
  }
}

/* ============================================
   MAIN CLASSIFIER
============================================ */
export function classifyMove({
  cpl,
  isBestMove,
  san,
  moveIndex,
  move,
  fenAfter,
  bestScore,
  secondBestScore,
}) {
  // Book
  if (moveIndex < 10 && BOOK_OPENINGS.has(san)) return "book";

  // Brilliant — highest priority for best moves that sac material
  if (
    isBestMove &&
    bestScore !== undefined &&
    detectBrilliant({ move, bestScore, fenAfter })
  ) {
    return "brilliant";
  }

  // Great — best move, but second-best is significantly worse
  if (
    isBestMove &&
    bestScore !== undefined &&
    secondBestScore !== undefined &&
    bestScore - secondBestScore >= 200
  ) {
    return "great";
  }

  // Regular buckets
  if (isBestMove) return "best";
  if (cpl <= 20) return "excellent";
  if (cpl <= 50) return "good";
  if (cpl <= 120) return "inaccuracy";
  if (cpl <= 300) return "mistake";
  return "blunder";
}
