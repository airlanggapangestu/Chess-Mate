import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Chess } from "chess.js";
import ChessBoard from "./ChessBoard";
import { PUZZLES } from "../data/puzzles";

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

const STATUS = {
  PLAYING: "playing",
  WRONG: "wrong",
  SOLVED: "solved",
};

function uciFromMove(move) {
  return move.from + move.to + (move.promotion || "");
}

function detectSound(move, g) {
  if (g.isCheckmate()) return "gameover";
  if (g.isCheck()) return "check";
  if (move.captured) return "capture";
  return "move";
}

/* ============================================
   MAIN
============================================ */
export default function PuzzleMode({ visible, playSound, onActiveChange }) {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [game, setGame] = useState(() => new Chess(PUZZLES[0].fen));
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState(STATUS.PLAYING);
  const [hintSquare, setHintSquare] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [wrongFlash, setWrongFlash] = useState(false);

  const puzzle = PUZZLES[puzzleIdx];
  const totalPuzzles = PUZZLES.length;

  const timerRef = useRef(null);

  useEffect(() => {
    onActiveChange?.(true);
    return () => onActiveChange?.(false);
  }, [onActiveChange]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  /* ============================================
     LOAD PUZZLE
  ============================================ */
  const loadPuzzle = useCallback((idx) => {
    const p = PUZZLES[idx];
    if (!p) return;
    clearTimeout(timerRef.current);
    setPuzzleIdx(idx);
    setGame(new Chess(p.fen));
    setStep(0);
    setStatus(STATUS.PLAYING);
    setHintSquare(null);
    setMoveHistory([]);
    setWrongFlash(false);
  }, []);

  /* ============================================
     OPPONENT MOVE
  ============================================ */
  const playOpponentMove = useCallback(
    (currentGame, nextStep) => {
      const uci = puzzle.solution[nextStep];
      if (!uci) return;

      const from = uci.substring(0, 2);
      const to = uci.substring(2, 4);
      const promo = uci.length > 4 ? uci.substring(4, 5) : "q";

      const g = new Chess(currentGame.fen());
      const move = g.move({ from, to, promotion: promo });
      if (!move) return;

      playSound(detectSound(move, g));
      setGame(g);
      setMoveHistory((prev) => [...prev, { san: move.san, color: move.color }]);

      const afterStep = nextStep + 1;
      setStep(afterStep);

      if (afterStep >= puzzle.solution.length) {
        timerRef.current = setTimeout(() => {
          setStatus(STATUS.SOLVED);
          playSound("gameover");
        }, 350);
      }
    },
    [puzzle, playSound],
  );

  /* ============================================
     USER MOVE
  ============================================ */
  const handleMove = useCallback(
    (from, to) => {
      if (status !== STATUS.PLAYING) return false;
      if (game.turn() !== "w") return false;

      const g = new Chess(game.fen());
      let move;
      try {
        move = g.move({ from, to, promotion: "q" });
      } catch {
        return false;
      }
      if (!move) return false;

      const uci = uciFromMove(move);
      const expected = puzzle.solution[step];

      if (uci !== expected) {
        playSound("illegal");
        setStatus(STATUS.WRONG);
        setWrongFlash(true);
        timerRef.current = setTimeout(() => {
          setStatus(STATUS.PLAYING);
          setWrongFlash(false);
        }, 700);
        return false;
      }

      playSound(detectSound(move, g));
      setGame(g);
      setMoveHistory((prev) => [...prev, { san: move.san, color: "w" }]);
      setHintSquare(null);

      const nextStep = step + 1;

      if (nextStep >= puzzle.solution.length) {
        setStep(nextStep);
        timerRef.current = setTimeout(() => {
          setStatus(STATUS.SOLVED);
          playSound("gameover");
        }, 350);
        return true;
      }

      setStep(nextStep);
      timerRef.current = setTimeout(() => {
        playOpponentMove(g, nextStep);
      }, 500);
      return true;
    },
    [game, step, puzzle, status, playSound, playOpponentMove],
  );

  /* ============================================
     CONTROLS
  ============================================ */
  const handleReset = () => loadPuzzle(puzzleIdx);

  const handleHint = () => {
    if (status !== STATUS.PLAYING) return;
    const next = puzzle.solution[step];
    if (!next) return;
    setHintSquare(next.substring(0, 2));
    playSound("nav");
  };

  const handleShowSolution = () => {
    if (status === STATUS.SOLVED) return;
    clearTimeout(timerRef.current);

    const g = new Chess(game.fen());
    let idx = step;

    const playNext = () => {
      if (idx >= puzzle.solution.length) {
        setStatus(STATUS.SOLVED);
        playSound("gameover");
        return;
      }
      const uci = puzzle.solution[idx];
      const from = uci.substring(0, 2);
      const to = uci.substring(2, 4);
      const promo = uci.length > 4 ? uci.substring(4, 5) : "q";

      const move = g.move({ from, to, promotion: promo });
      if (!move) {
        setStatus(STATUS.SOLVED);
        return;
      }

      playSound(detectSound(move, g));
      setGame(new Chess(g.fen()));
      setMoveHistory((prev) => [...prev, { san: move.san, color: move.color }]);

      idx += 1;
      setStep(idx);
      timerRef.current = setTimeout(playNext, 450);
    };

    playNext();
  };

  const handlePrev = () => {
    if (puzzleIdx > 0) loadPuzzle(puzzleIdx - 1);
  };

  const handleNext = () => {
    if (puzzleIdx < totalPuzzles - 1) {
      loadPuzzle(puzzleIdx + 1);
    } else {
      loadPuzzle(0);
    }
  };

  /* ============================================
     STATUS
  ============================================ */
  const statusText = useMemo(() => {
    if (status === STATUS.WRONG) return "Not quite — try again";
    if (status === STATUS.SOLVED) return "Puzzle solved!";
    return "White to move";
  }, [status]);

  const hintStyles = useMemo(() => {
    if (!hintSquare) return {};
    return {
      [hintSquare]: {
        backgroundColor: "rgba(74, 124, 89, 0.4)",
        boxShadow: "inset 0 0 0 4px rgba(74, 124, 89, 0.8)",
      },
    };
  }, [hintSquare]);

  /* ============================================
     RENDER
  ============================================ */
  return (
    <div className="w-full h-full overflow-y-auto scroll-custom">
      <div className="px-8 py-8 max-[700px]:px-4 max-[700px]:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ============ LEFT / MAIN ============ */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* Header banner */}
            <div className="bg-surface-container-low rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-on-surface tracking-tight">
                    {puzzle.theme}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-container/30 text-on-tertiary-container text-xs font-semibold">
                    <Icon name="extension" className="text-[14px]" filled />
                    Puzzle
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-medium">
                    <Icon name="star" className="text-[13px]" filled />
                    {puzzle.rating}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <span className="relative flex h-2 w-2">
                    {status === STATUS.PLAYING && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    )}
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 ${
                        status === STATUS.WRONG
                          ? "bg-error"
                          : status === STATUS.SOLVED
                            ? "bg-primary"
                            : "bg-primary"
                      }`}
                    />
                  </span>
                  <span
                    className={`font-semibold ${
                      status === STATUS.WRONG
                        ? "text-error"
                        : status === STATUS.SOLVED
                          ? "text-primary"
                          : "text-primary"
                    }`}
                  >
                    {statusText}
                  </span>
                  <span className="text-outline">•</span>
                  <span className="text-secondary">
                    Puzzle {puzzleIdx + 1} of {totalPuzzles}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleReset}
                  className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  title="Reset puzzle"
                >
                  <Icon name="refresh" className="text-lg" />
                </button>
              </div>
            </div>

            {/* Board container */}
            <div className="bg-surface-container-low rounded-xl p-5 sm:p-6 shadow-sm flex flex-col gap-4">
              {/* Indicator */}
              <div className="flex items-center justify-between px-2 py-1">
                <div className="flex items-center gap-2 text-xs text-secondary">
                  <Icon
                    name={
                      status === STATUS.SOLVED
                        ? "emoji_events"
                        : status === STATUS.WRONG
                          ? "error"
                          : "lightbulb"
                    }
                    className={`text-base ${
                      status === STATUS.SOLVED
                        ? "text-primary"
                        : status === STATUS.WRONG
                          ? "text-error"
                          : "text-primary"
                    }`}
                    filled
                  />
                  <span className="font-semibold text-on-surface-variant">
                    {status === STATUS.SOLVED
                      ? "Solved — try another puzzle"
                      : status === STATUS.WRONG
                        ? "Wrong move — try again"
                        : "Find the best move for White"}
                  </span>
                </div>
              </div>

              {/* Board */}
              <div
                className={`w-full flex justify-center py-1 ${
                  wrongFlash ? "animate-shake" : ""
                }`}
              >
                <div className="relative w-full max-w-[580px] aspect-square rounded-2xl p-3 bg-surface-container-highest shadow-md">
                  <div className="w-full h-full rounded-xl overflow-hidden shadow-inner relative">
                    <ChessBoard
                      game={game}
                      position={game.fen()}
                      onMove={handleMove}
                      arrows={[]}
                      disabled={status !== STATUS.PLAYING}
                      boardOrientation="white"
                      extraSquareStyles={hintStyles}
                    />

                    {/* Solved overlay */}
                    {status === STATUS.SOLVED && (
                      <div className="absolute inset-0 bg-primary/15 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                        <div className="bg-surface-container-lowest border-2 border-primary rounded-2xl px-6 py-4 flex items-center gap-3 shadow-xl">
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <Icon
                              name="emoji_events"
                              className="text-on-primary text-2xl"
                              filled
                            />
                          </div>
                          <div>
                            <div className="text-base font-bold text-on-surface">
                              Solved!
                            </div>
                            <div className="text-xs text-secondary">
                              {puzzle.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Puzzle navigation */}
            <div className="bg-surface-container-low rounded-xl p-3 shadow-sm flex items-center justify-between gap-3">
              <button
                onClick={handlePrev}
                disabled={puzzleIdx === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="Previous puzzle"
              >
                <Icon name="chevron_left" className="text-base" />
                Prev
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPuzzles }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => loadPuzzle(i)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      i === puzzleIdx
                        ? "w-6 bg-primary"
                        : "w-1.5 bg-outline-variant/60 hover:bg-outline-variant"
                    }`}
                    title={`Puzzle ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs font-semibold transition-all cursor-pointer"
                title="Next puzzle"
              >
                Next
                <Icon name="chevron_right" className="text-base" />
              </button>
            </div>

            {/* Action bar */}
            <div className="bg-surface-container-low rounded-xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleHint}
                  disabled={status !== STATUS.PLAYING}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Show hint"
                >
                  <Icon name="lightbulb" className="text-base" />
                  Hint
                </button>
                <button
                  onClick={handleShowSolution}
                  disabled={status === STATUS.SOLVED}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Show full solution"
                >
                  <Icon name="visibility" className="text-base" />
                  Solution
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-90 shadow-sm transition-all cursor-pointer"
                >
                  <Icon name="refresh" className="text-base" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* ============ RIGHT PANEL ============ */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Puzzle Details */}
            <div className="bg-surface-container-low rounded-xl p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon
                    name="psychology"
                    className="text-primary text-lg"
                    filled
                  />
                  <h2 className="text-base font-bold text-on-surface">
                    Puzzle Details
                  </h2>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-tertiary-container/40 text-on-tertiary-container">
                  {puzzle.theme}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container p-3 rounded-lg flex flex-col">
                  <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider">
                    Rating
                  </span>
                  <span className="font-bold text-sm text-on-surface mt-0.5 tabular-nums">
                    {puzzle.rating}
                  </span>
                  <span className="text-[10px] text-secondary">Difficulty</span>
                </div>
                <div className="bg-surface-container p-3 rounded-lg flex flex-col">
                  <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider">
                    Progress
                  </span>
                  <span className="font-bold text-sm text-on-surface mt-0.5 tabular-nums">
                    {puzzleIdx + 1} / {totalPuzzles}
                  </span>
                  <span className="text-[10px] text-secondary">Puzzles</span>
                </div>
              </div>

              <div className="bg-surface-container p-3 rounded-lg flex flex-col gap-1">
                <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider">
                  Objective
                </span>
                <span className="font-bold text-sm text-on-surface">
                  {puzzle.description}
                </span>
                <span className="text-xs text-on-surface-variant">
                  Solution length: {Math.ceil(puzzle.solution.length / 2)}{" "}
                  {Math.ceil(puzzle.solution.length / 2) === 1
                    ? "move"
                    : "moves"}
                </span>
              </div>

              <div className="bg-surface-container p-3 rounded-lg flex flex-col gap-1">
                <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider">
                  Status
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      status === STATUS.SOLVED
                        ? "bg-primary"
                        : status === STATUS.WRONG
                          ? "bg-error"
                          : "bg-tertiary"
                    }`}
                  />
                  <span className="font-bold text-sm text-on-surface">
                    {status === STATUS.SOLVED
                      ? "Solved"
                      : status === STATUS.WRONG
                        ? "Wrong Move"
                        : "In Progress"}
                  </span>
                </div>
                <span className="text-[10px] text-secondary">
                  {step} of {puzzle.solution.length} steps played
                </span>
              </div>
            </div>

            {/* Move Notation */}
            <div className="bg-surface-container-low rounded-xl p-5 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon name="list_alt" className="text-sm text-secondary" />
                  <h3 className="text-sm font-bold text-on-surface">
                    Move Notation
                  </h3>
                </div>
                <span className="text-xs text-secondary font-medium">
                  {moveHistory.length} moves
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto scroll-custom flex flex-col gap-1 text-xs">
                <div className="grid grid-cols-12 py-1 px-2 text-[11px] font-bold text-secondary uppercase bg-surface-container/50 rounded">
                  <span className="col-span-2">#</span>
                  <span className="col-span-5">White</span>
                  <span className="col-span-5">Black</span>
                </div>
                {moveHistory.length === 0 ? (
                  <div className="text-center text-secondary text-xs py-6">
                    No moves yet — find the winning line
                  </div>
                ) : (
                  Array.from({ length: Math.ceil(moveHistory.length / 2) }).map(
                    (_, i) => {
                      const w = moveHistory[i * 2];
                      const b = moveHistory[i * 2 + 1];
                      const isLast =
                        i === Math.floor((moveHistory.length - 1) / 2);
                      return (
                        <div
                          key={i}
                          className={`grid grid-cols-12 py-1 px-2 rounded items-center font-mono ${
                            isLast
                              ? "bg-primary-fixed/40 text-on-primary-fixed-variant font-bold"
                              : "hover:bg-surface-container"
                          } transition-colors`}
                        >
                          <span className="col-span-2 text-secondary font-sans text-[11px]">
                            {i + 1}.
                          </span>
                          <span className="col-span-5 font-medium">
                            {w?.san || ""}
                          </span>
                          <span className="col-span-5 font-medium text-on-surface-variant">
                            {b?.san || ""}
                          </span>
                        </div>
                      );
                    },
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
