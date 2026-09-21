import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Chess } from "chess.js";
import { ThemeProvider } from "./context/ThemeContext";

import { useStockfish } from "./hooks/useStockfish";
import { useChessSound } from "./hooks/useChessSound";
import { classifyMove } from "./utils/moveClassification";

import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import WelcomePreview from "./components/WelcomePreview";
import AnalysisBoard from "./components/AnalysisBoard";
import AnalysisDetails from "./components/AnalysisDetails";
import MoveListPanel from "./components/MoveListPanel";
import SettingsPanel from "./components/SettingsPanel";
import TwoPlayerMode from "./components/TwoPlayerMode";
import VsEngineMode from "./components/VsEngineMode";
import PuzzleMode from "./components/PuzzleMode";

const INITIAL_FEN = new Chess().fen();
const ARROW_COLORS = { best: "#00aa00", second: "#1d9bf0" };
const HINT_DEPTH = 12;

/* ============================================
   HELPERS
============================================ */
function getGameStatus(g) {
  if (g.isCheckmate()) return g.turn() === "w" ? "Black wins" : "White wins";
  if (g.isStalemate()) return "Stalemate — Draw";
  if (g.isThreefoldRepetition()) return "Threefold repetition — Draw";
  if (g.isInsufficientMaterial()) return "Insufficient material — Draw";
  if (g.isDraw()) return "Draw";
  return "Game over";
}

function detectSoundType(move, gameAfterMove) {
  if (!move) return "move";
  if (gameAfterMove.isGameOver()) return "gameover";
  if (gameAfterMove.isCheck()) return "check";
  if (move.promotion) return "promote";
  if (
    move.piece === "k" &&
    Math.abs(move.from.charCodeAt(0) - move.to.charCodeAt(0)) === 2
  )
    return "castle";
  if (move.captured) return "capture";
  return "move";
}

const clampScore = (s) => Math.max(-2000, Math.min(2000, s));

/* ============================================
   APP
============================================ */
export default function App() {
  const [mode, setMode] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const goHome = () => setMode(null);

  /* ---------- ANALYSIS STATE ---------- */
  const [history, setHistory] = useState([INITIAL_FEN]);
  const [moveHistory, setMoveHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [arrows, setArrows] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [boardOrientation, setBoardOrientation] = useState("white");

  /* ---------- CLASSIFICATION STATE ---------- */
  const [classifications, setClassifications] = useState([]);
  const classificationsRef = useRef([]);
  const analysisCacheRef = useRef(new Map());
  const historyRef = useRef([INITIAL_FEN]);
  const moveHistoryRef = useRef([]);

  useEffect(() => {
    classificationsRef.current = classifications;
  }, [classifications]);
  useEffect(() => {
    historyRef.current = history;
  }, [history]);
  useEffect(() => {
    moveHistoryRef.current = moveHistory;
  }, [moveHistory]);

  /* ---------- 2 PLAYER STATE ---------- */
  const [twoPlayerMoves, setTwoPlayerMoves] = useState([]);
  const [twoPlayerActive, setTwoPlayerActive] = useState(false);

  /* ---------- VS ENGINE STATE ---------- */
  const [vsEngineMoves, setVsEngineMoves] = useState([]);
  const [vsEngineActive, setVsEngineActive] = useState(false);

  const { ready, analyze, getEngineMove } = useStockfish();
  const { playSound } = useChessSound();
  const requestIdRef = useRef(0);

  const position = history[currentIndex];
  const game = useMemo(() => new Chess(position), [position]);
  const gameOver = game.isGameOver();
  const gameStatus = gameOver ? getGameStatus(game) : null;

  const isAnalysis = mode === "analysis";
  const isLocal = mode === "local";
  const isVsEngine = mode === "stockfish";
  const isPuzzle = mode === "puzzle";
  const isSettings = mode === "settings";

  /* ============================================
     CLASSIFY A MOVE
  ============================================ */
  const classifyMoveAt = useCallback((moveIdx) => {
    if (moveIdx < 0) return;
    if (classificationsRef.current[moveIdx]) return;

    const mh = moveHistoryRef.current;
    const h = historyRef.current;
    const move = mh[moveIdx];
    if (!move) return;

    const fenBefore = h[moveIdx];
    const fenAfter = h[moveIdx + 1];
    if (!fenBefore || !fenAfter) return;

    const before = analysisCacheRef.current.get(fenBefore);
    const after = analysisCacheRef.current.get(fenAfter);
    if (!before || !after) return;
    if (before.moves[0] == null || after.moves[0] == null) return;

    const bestMove = before.moves[0];
    const bestScore = clampScore(before.scores[0]);
    const secondBestScore =
      before.scores[1] !== undefined ? clampScore(before.scores[1]) : undefined;
    const scoreAfter = clampScore(after.scores[0]);

    const userUci =
      move.from + move.to + (move.promotion ? move.promotion : "");
    const isBestMove = userUci === bestMove;
    const cpl = Math.max(0, bestScore + scoreAfter);

    const type = classifyMove({
      cpl,
      isBestMove,
      san: move.san,
      moveIndex: moveIdx,
      move,
      fenAfter,
      bestScore,
      secondBestScore,
    });

    const next = [...classificationsRef.current];
    next[moveIdx] = { type, cpl: Math.round(cpl) };
    classificationsRef.current = next;
    setClassifications(next);
  }, []);

  /* ============================================
     FLIP BOARD
  ============================================ */
  const flipBoard = useCallback(() => {
    setBoardOrientation((o) => (o === "white" ? "black" : "white"));
    playSound("nav");
  }, [playSound]);

  /* ============================================
     AUTO HINT
  ============================================ */
  useEffect(() => {
    if (mode !== "analysis") return;
    if (!ready) return;

    const myIdx = currentIndex;
    const myRequestId = ++requestIdRef.current;
    setAnalyzing(true);

    (async () => {
      try {
        const result = await analyze(position, HINT_DEPTH, 2);
        analysisCacheRef.current.set(position, result);
        if (myIdx > 0) classifyMoveAt(myIdx - 1);

        if (myRequestId !== requestIdRef.current) return;
        if (gameOver) {
          setArrows([]);
        } else {
          const moves = result.moves.filter(Boolean);
          setArrows(
            moves.map((uci, i) => ({
              startSquare: uci.substring(0, 2),
              endSquare: uci.substring(2, 4),
              color: i === 0 ? ARROW_COLORS.best : ARROW_COLORS.second,
            })),
          );
        }
      } catch (err) {
        console.error("Analysis error:", err);
      } finally {
        if (myRequestId === requestIdRef.current) setAnalyzing(false);
      }
    })();
  }, [position, ready, analyze, gameOver, mode, currentIndex, classifyMoveAt]);

  /* ============================================
     MOVE (ANALYSIS)
  ============================================ */
  const handleMove = (sourceSquare, targetSquare) => {
    const currentFen = history[currentIndex];
    const newGame = new Chess(currentFen);

    try {
      const move = newGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (!move) {
        playSound("illegal");
        return false;
      }

      playSound(detectSoundType(move, newGame));

      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push(newGame.fen());

      const newMoveHistory = moveHistory.slice(0, currentIndex);
      newMoveHistory.push({
        san: move.san,
        color: move.color,
        from: move.from,
        to: move.to,
        promotion: move.promotion || null,
        piece: move.piece,
        captured: move.captured || null,
      });

      const truncated = classificationsRef.current.slice(0, currentIndex);
      classificationsRef.current = truncated;
      setClassifications(truncated);

      setHistory(newHistory);
      setMoveHistory(newMoveHistory);
      setCurrentIndex(currentIndex + 1);
      return true;
    } catch (error) {
      console.error("Invalid move:", error);
      playSound("illegal");
      return false;
    }
  };

  /* ============================================
     NAVIGATION
  ============================================ */
  const undo = useCallback(() => {
    setCurrentIndex((i) => {
      const next = Math.max(0, i - 1);
      if (next !== i) playSound("nav");
      return next;
    });
  }, [playSound]);

  const redo = useCallback(() => {
    setCurrentIndex((i) => {
      const next = Math.min(history.length - 1, i + 1);
      if (next !== i) playSound("nav");
      return next;
    });
  }, [history.length, playSound]);

  const goToStart = useCallback(() => {
    setCurrentIndex((i) => {
      if (i !== 0) playSound("nav");
      return 0;
    });
  }, [playSound]);

  const goToEnd = useCallback(() => {
    setCurrentIndex((i) => {
      const end = history.length - 1;
      if (i !== end) playSound("nav");
      return end;
    });
  }, [history.length, playSound]);

  const goToIndex = useCallback(
    (idx) => {
      setCurrentIndex((i) => {
        const next = Math.max(0, Math.min(idx, history.length - 1));
        if (next !== i) playSound("nav");
        return next;
      });
    },
    [history.length, playSound],
  );

  const resetGame = useCallback(() => {
    setHistory([INITIAL_FEN]);
    setMoveHistory([]);
    setCurrentIndex(0);
    setArrows([]);
    setClassifications([]);
    classificationsRef.current = [];
    requestIdRef.current++;
  }, []);

  /* ============================================
     KEYBOARD SHORTCUT
  ============================================ */
  useEffect(() => {
    if (mode !== "analysis") return;

    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        undo();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        redo();
      } else if (e.key === "Home") {
        e.preventDefault();
        goToStart();
      } else if (e.key === "End") {
        e.preventDefault();
        goToEnd();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        flipBoard();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, undo, redo, goToStart, goToEnd, flipBoard]);

  /* ============================================
     HANDLE MODE SELECT (close mobile sidebar)
  ============================================ */
  const handleSelectMode = (newMode) => {
    setMode(newMode);
    setMobileSidebarOpen(false);
  };

  /* ============================================
     RENDER
  ============================================ */
  return (
    <ThemeProvider>
      <div className="w-screen h-screen overflow-hidden bg-surface text-on-surface">
        {/* SIDEBAR */}
        <Sidebar
          activeMode={mode}
          onSelectMode={handleSelectMode}
          onLogoClick={goHome}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        {/* TOP BAR */}
        <TopBar
          engineReady={ready}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        {/* MAIN */}
        <main className="pl-72 max-[900px]:pl-0 pt-16 h-full overflow-y-auto scroll-custom">
          <div className="px-8 py-8 max-[700px]:px-4 max-[700px]:py-4">
            {/* ============================================
                ANALYSIS MODE
            ============================================ */}
            {isAnalysis && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Board */}
                <div className="lg:col-span-8">
                  <AnalysisBoard
                    game={game}
                    position={position}
                    onMove={handleMove}
                    arrows={arrows}
                    ready={ready}
                    analyzing={analyzing}
                    gameOver={gameOver}
                    status={gameStatus}
                    currentIndex={currentIndex}
                    totalMoves={history.length - 1}
                    canUndo={currentIndex > 0}
                    canRedo={currentIndex < history.length - 1}
                    onUndo={undo}
                    onRedo={redo}
                    onGoToStart={goToStart}
                    onGoToEnd={goToEnd}
                    onReset={resetGame}
                    boardOrientation={boardOrientation}
                    onFlip={flipBoard}
                  />
                </div>

                {/* Right: Opening + Move List */}
                <div className="lg:col-span-4 flex flex-col gap-5">
                  <AnalysisDetails
                    moveHistory={moveHistory}
                    currentIndex={currentIndex}
                    totalMoves={history.length - 1}
                  />
                  <MoveListPanel
                    moveHistory={moveHistory}
                    currentIndex={currentIndex}
                    onGoToIndex={goToIndex}
                    classifications={classifications}
                  />
                </div>
              </div>
            )}

            {/* ============================================
                SETTINGS
            ============================================ */}
            {isSettings && <SettingsPanel />}

            {/* ============================================
                2 PLAYER — always mounted (persist state)
            ============================================ */}
            <div
              className="absolute inset-0 pt-16 pl-72 max-[900px]:pl-0 max-[900px]:pt-16"
              style={{
                visibility: isLocal ? "visible" : "hidden",
                opacity: isLocal ? 1 : 0,
                pointerEvents: isLocal ? "auto" : "none",
                zIndex: isLocal ? 2 : -1,
              }}
              aria-hidden={!isLocal}
            >
              <TwoPlayerMode
                visible={isLocal}
                playSound={playSound}
                onMovesChange={setTwoPlayerMoves}
                onActiveChange={setTwoPlayerActive}
              />
            </div>

            {/* ============================================
                VS ENGINE — always mounted
            ============================================ */}
            <div
              className="absolute inset-0 pt-16 pl-72 max-[900px]:pl-0 max-[900px]:pt-16"
              style={{
                visibility: isVsEngine ? "visible" : "hidden",
                opacity: isVsEngine ? 1 : 0,
                pointerEvents: isVsEngine ? "auto" : "none",
                zIndex: isVsEngine ? 2 : -1,
              }}
              aria-hidden={!isVsEngine}
            >
              <VsEngineMode
                visible={isVsEngine}
                playSound={playSound}
                onMovesChange={setVsEngineMoves}
                onActiveChange={setVsEngineActive}
                getEngineMove={getEngineMove}
                engineReady={ready}
              />
            </div>

            {/* ============================================
                PUZZLE — always mounted
            ============================================ */}
            <div
              className="absolute inset-0 pt-16 pl-72 max-[900px]:pl-0 max-[900px]:pt-16"
              style={{
                visibility: isPuzzle ? "visible" : "hidden",
                opacity: isPuzzle ? 1 : 0,
                pointerEvents: isPuzzle ? "auto" : "none",
                zIndex: isPuzzle ? 2 : -1,
              }}
              aria-hidden={!isPuzzle}
            >
              <PuzzleMode
                visible={isPuzzle}
                playSound={playSound}
                onActiveChange={() => {}}
              />
            </div>

            {/* ============================================
                HOME
            ============================================ */}
            {!mode && <WelcomePreview onSelectMode={handleSelectMode} />}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
