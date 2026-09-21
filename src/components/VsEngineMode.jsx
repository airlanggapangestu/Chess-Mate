import { useState, useEffect, useRef, useCallback } from "react";
import { Chess } from "chess.js";
import ChessBoard from "./ChessBoard";
import { useChessClock } from "../hooks/useChessClock";

const START_FEN = new Chess().fen();

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
   CONFIG
============================================ */
const DIFFICULTIES = [
  { id: "easy", label: "Easy", skill: 0, depth: 3, elo: 800, stars: 1 },
  { id: "medium", label: "Medium", skill: 5, depth: 6, elo: 1500, stars: 3 },
  { id: "hard", label: "Hard", skill: 12, depth: 10, elo: 2000, stars: 4 },
  { id: "expert", label: "Expert", skill: 20, depth: 14, elo: 2400, stars: 5 },
];

const SIDES = [
  { id: "white", label: "White", color: "w", icon: "♙" },
  { id: "black", label: "Black", color: "b", icon: "♟" },
  { id: "random", label: "Random", color: null, icon: "🎲" },
];

const TIME_PRESETS = [
  { id: "unlimited", label: "Unlimited", time: 0, inc: 0, display: "∞" },
  { id: "5+0", label: "Blitz", time: 300 * 1000, inc: 0, display: "5 min" },
  { id: "10+0", label: "Rapid", time: 600 * 1000, inc: 0, display: "10 min" },
  {
    id: "15+10",
    label: "Rapid",
    time: 900 * 1000,
    inc: 10 * 1000,
    display: "15 | 10",
  },
];

/* ============================================
   HELPERS
============================================ */
function formatTime(ms) {
  if (ms <= 0) return "0:00";
  if (ms < 10000) {
    const sec = Math.floor(ms / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    return `0:0${sec}.${tenths}`;
  }
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function detectSoundType(move, g) {
  if (!move) return "move";
  if (g.isGameOver()) return "gameover";
  if (g.isCheck()) return "check";
  if (move.promotion) return "promote";
  if (
    move.piece === "k" &&
    Math.abs(move.from.charCodeAt(0) - move.to.charCodeAt(0)) === 2
  )
    return "castle";
  if (move.captured) return "capture";
  return "move";
}

function getBoardStatus(g) {
  if (g.isCheckmate()) return g.turn() === "w" ? "Black wins" : "White wins";
  if (g.isStalemate()) return "Stalemate — Draw";
  if (g.isThreefoldRepetition()) return "Threefold repetition — Draw";
  if (g.isInsufficientMaterial()) return "Insufficient material — Draw";
  if (g.isDraw()) return "Draw";
  return "Game over";
}

/* ============================================
   MAIN
============================================ */
export default function VsEngineMode({
  visible,
  playSound,
  onMovesChange,
  onActiveChange,
  getEngineMove,
  engineReady,
}) {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    onActiveChange?.(!!config);
  }, [config, onActiveChange]);

  useEffect(
    () => () => {
      onActiveChange?.(false);
    },
    [],
  );

  if (!config) {
    return <SetupScreen onStart={setConfig} engineReady={engineReady} />;
  }

  return (
    <GameScreen
      config={config}
      visible={visible}
      playSound={playSound}
      onMovesChange={onMovesChange}
      getEngineMove={getEngineMove}
      engineReady={engineReady}
      onExit={() => setConfig(null)}
    />
  );
}

/* ============================================
   SETUP SCREEN
============================================ */
function SetupScreen({ onStart, engineReady }) {
  const [difficultyId, setDifficultyId] = useState("medium");
  const [sideId, setSideId] = useState("white");
  const [timeId, setTimeId] = useState("10+0");

  const handleStart = () => {
    const difficulty = DIFFICULTIES.find((d) => d.id === difficultyId);
    const timePreset = TIME_PRESETS.find((t) => t.id === timeId);
    const side = SIDES.find((s) => s.id === sideId);
    let playerColor = side.color;
    if (playerColor === null) playerColor = Math.random() < 0.5 ? "w" : "b";
    onStart({ difficulty, timePreset, playerColor });
  };

  return (
    <div className="w-full h-full overflow-y-auto scroll-custom">
      <div className="max-w-3xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm shrink-0">
            <Icon name="memory" className="text-2xl" filled />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-on-surface">
              Play vs Engine
            </h1>
            <p className="text-sm text-secondary mt-0.5">
              Challenge Stockfish at your level
            </p>
          </div>
        </div>

        {/* Difficulty */}
        <section className="mb-8">
          <SectionLabel icon="smart_toy" label="Difficulty" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DIFFICULTIES.map((d) => {
              const active = difficultyId === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setDifficultyId(d.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                    active
                      ? "border-primary bg-primary-fixed/30 shadow-sm"
                      : "border-transparent bg-surface-container-low hover:bg-surface-container"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        active ? "text-primary" : "text-secondary"
                      }`}
                    >
                      {d.label}
                    </span>
                    {active && (
                      <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Icon
                          name="check"
                          className="text-on-primary text-[14px]"
                        />
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-base font-bold ${
                      active ? "text-primary" : "text-on-surface"
                    }`}
                  >
                    {"★".repeat(d.stars)}
                    <span className="text-secondary/40">
                      {"★".repeat(5 - d.stars)}
                    </span>
                  </div>
                  <div className="text-[11px] text-secondary mt-1">
                    ~{d.elo} Elo
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Play as */}
        <section className="mb-8">
          <SectionLabel icon="person" label="Play as" />
          <div className="grid grid-cols-3 gap-3">
            {SIDES.map((s) => {
              const active = sideId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSideId(s.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-center ${
                    active
                      ? "border-primary bg-primary-fixed/30 shadow-sm"
                      : "border-transparent bg-surface-container-low hover:bg-surface-container"
                  }`}
                >
                  <div
                    className={`text-2xl mb-1 ${
                      active ? "text-primary" : "text-on-surface"
                    }`}
                  >
                    {s.icon}
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      active ? "text-primary" : "text-on-surface"
                    }`}
                  >
                    {s.label}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Time */}
        <section className="mb-8">
          <SectionLabel icon="schedule" label="Time Control" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TIME_PRESETS.map((t) => {
              const active = timeId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTimeId(t.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                    active
                      ? "border-primary bg-primary-fixed/30 shadow-sm"
                      : "border-transparent bg-surface-container-low hover:bg-surface-container"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        active ? "text-primary" : "text-secondary"
                      }`}
                    >
                      {t.label}
                    </span>
                    {active && (
                      <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Icon
                          name="check"
                          className="text-on-primary text-[14px]"
                        />
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-xl font-bold tabular-nums ${
                      active ? "text-primary" : "text-on-surface"
                    }`}
                  >
                    {t.display}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Start */}
        <button
          onClick={handleStart}
          disabled={!engineReady}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl
            bg-primary text-on-primary font-bold text-base
            transition-all cursor-pointer
            hover:opacity-90 active:scale-[0.99] shadow-md
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name="play_arrow" filled />
          Start Game
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon name={icon} className="text-lg text-primary" />
      <h2 className="text-base font-bold text-on-surface">{label}</h2>
    </div>
  );
}

/* ============================================
   GAME SCREEN
============================================ */
function GameScreen({
  config,
  visible,
  playSound,
  onExit,
  onMovesChange,
  getEngineMove,
  engineReady,
}) {
  const { difficulty, timePreset, playerColor } = config;
  const engineColor = playerColor === "w" ? "b" : "w";

  const [game, setGame] = useState(() => new Chess());
  const [position, setPosition] = useState(START_FEN);
  const [gameOver, setGameOver] = useState(null);
  const [confirmResign, setConfirmResign] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [boardFlipped, setBoardFlipped] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);

  const engineMoveRef = useRef(false);
  const activeColor = game.turn();
  const hasClock = timePreset.time > 0;

  const clock = useChessClock({
    initialMs: timePreset.time || 1,
    incrementMs: timePreset.inc,
    running: hasClock && visible && !gameOver,
    activeColor,
  });

  useEffect(() => {
    onMovesChange?.(moveHistory);
  }, [moveHistory, onMovesChange]);

  useEffect(
    () => () => {
      onMovesChange?.([]);
    },
    [],
  );

  const playerOrientation = playerColor === "w" ? "white" : "black";
  const boardOrientation = boardFlipped
    ? playerOrientation === "white"
      ? "black"
      : "white"
    : playerOrientation;

  const topColor = boardOrientation === "white" ? "b" : "w";
  const bottomColor = boardOrientation === "white" ? "w" : "b";

  /* TIMEOUT */
  useEffect(() => {
    if (!hasClock || gameOver || !visible) return;
    if (activeColor === "w" && clock.whiteMs <= 0) {
      setGameOver({ reason: "timeout", winner: "b" });
      playSound("gameover");
    } else if (activeColor === "b" && clock.blackMs <= 0) {
      setGameOver({ reason: "timeout", winner: "w" });
      playSound("gameover");
    }
  }, [
    clock.whiteMs,
    clock.blackMs,
    activeColor,
    gameOver,
    visible,
    hasClock,
    playSound,
  ]);

  /* PLAYER MOVE */
  const handleMove = useCallback(
    (from, to) => {
      if (gameOver || thinking) return false;
      if (activeColor !== playerColor) return false;

      const g = new Chess(game.fen());
      try {
        const move = g.move({ from, to, promotion: "q" });
        if (!move) {
          playSound("illegal");
          return false;
        }
        playSound(detectSoundType(move, g));
        if (hasClock) clock.addIncrement(move.color);

        setGame(g);
        setPosition(g.fen());
        setMoveHistory((prev) => [
          ...prev,
          { san: move.san, color: move.color },
        ]);

        if (g.isGameOver()) {
          setGameOver({
            reason: "board",
            winner: null,
            statusText: getBoardStatus(g),
          });
          playSound("gameover");
        }
        return true;
      } catch {
        playSound("illegal");
        return false;
      }
    },
    [
      game,
      gameOver,
      thinking,
      activeColor,
      playerColor,
      playSound,
      hasClock,
      clock,
    ],
  );

  /* ENGINE MOVE */
  const makeEngineMove = useCallback(async () => {
    if (!getEngineMove || !engineReady) return;
    if (gameOver) return;
    if (engineMoveRef.current) return;

    engineMoveRef.current = true;
    setThinking(true);

    try {
      const fen = game.fen();
      const uci = await getEngineMove(fen, {
        depth: difficulty.depth,
        skill: difficulty.skill,
      });
      if (!uci) return;

      const g = new Chess(fen);
      const from = uci.substring(0, 2);
      const to = uci.substring(2, 4);
      const promotion = uci.length > 4 ? uci.substring(4, 5) : "q";

      const move = g.move({ from, to, promotion });
      if (!move) return;

      playSound(detectSoundType(move, g));
      if (hasClock) clock.addIncrement(move.color);

      setGame(g);
      setPosition(g.fen());
      setMoveHistory((prev) => [...prev, { san: move.san, color: move.color }]);

      if (g.isGameOver()) {
        setGameOver({
          reason: "board",
          winner: null,
          statusText: getBoardStatus(g),
        });
        playSound("gameover");
      }
    } catch (err) {
      console.error("Engine error:", err);
    } finally {
      engineMoveRef.current = false;
      setThinking(false);
    }
  }, [
    game,
    gameOver,
    difficulty,
    getEngineMove,
    engineReady,
    playSound,
    hasClock,
    clock,
  ]);

  useEffect(() => {
    if (!visible) return;
    if (gameOver) return;
    if (thinking) return;
    if (activeColor !== engineColor) return;
    makeEngineMove();
  }, [visible, gameOver, thinking, activeColor, engineColor, makeEngineMove]);

  /* ACTIONS */
  const handleNewGame = () => {
    const g = new Chess();
    setGame(g);
    setPosition(g.fen());
    setGameOver(null);
    setConfirmResign(false);
    setMoveHistory([]);
    clock.reset();
  };

  const handleResignConfirm = () => {
    setConfirmResign(false);
    setGameOver({ reason: "resign", winner: engineColor });
    playSound("gameover");
  };

  /* STATUS */
  const statusText = gameOver
    ? "Game over"
    : thinking
      ? "Engine is thinking..."
      : activeColor === playerColor
        ? "Your turn to move"
        : "Engine's turn";

  const isPlayerTurn = !gameOver && !thinking && activeColor === playerColor;

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
                    Play vs Engine
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-container/30 text-on-tertiary-container text-xs font-semibold">
                    <Icon name="smart_toy" className="text-[14px]" />
                    {difficulty.label} · ~{difficulty.elo} Elo
                    <span className="text-tertiary font-bold ml-0.5">
                      {"★".repeat(difficulty.stars)}
                    </span>
                  </span>
                  {hasClock && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-medium">
                      <Icon name="timer" className="text-[13px]" />
                      {timePreset.display}
                    </span>
                  )}
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
                    {statusText}
                  </span>
                  <span className="text-outline">•</span>
                  <span className="text-secondary">
                    Stockfish depth {difficulty.depth} plies
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setBoardFlipped((f) => !f)}
                  className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  title="Flip board"
                >
                  <Icon name="swap_vert" className="text-lg" />
                </button>
                <button
                  onClick={onExit}
                  className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  title="Back to setup"
                >
                  <Icon name="settings" className="text-lg" />
                </button>
              </div>
            </div>

            {/* Board container */}
            <div className="bg-surface-container-low rounded-xl p-5 sm:p-6 shadow-sm flex flex-col gap-4">
              <PlayerBar
                color={topColor}
                isEngine={topColor === engineColor}
                difficulty={difficulty}
                ms={
                  hasClock
                    ? topColor === "w"
                      ? clock.whiteMs
                      : clock.blackMs
                    : null
                }
                active={!gameOver && activeColor === topColor}
                hasClock={hasClock}
                thinking={thinking}
              />

              <div className="w-full flex justify-center py-1">
                <div className="relative w-full max-w-[580px] aspect-square rounded-2xl p-3 bg-surface-container-highest shadow-md">
                  <div className="w-full h-full rounded-xl overflow-hidden shadow-inner">
                    <ChessBoard
                      game={game}
                      position={position}
                      onMove={handleMove}
                      arrows={[]}
                      disabled={
                        !!gameOver || thinking || activeColor !== playerColor
                      }
                      boardOrientation={boardOrientation}
                    />
                  </div>
                </div>
              </div>

              <PlayerBar
                color={bottomColor}
                isEngine={bottomColor === engineColor}
                difficulty={difficulty}
                ms={
                  hasClock
                    ? bottomColor === "w"
                      ? clock.whiteMs
                      : clock.blackMs
                    : null
                }
                active={!gameOver && activeColor === bottomColor}
                hasClock={hasClock}
              />
            </div>

            {/* Action bar */}
            <div className="bg-surface-container-low rounded-xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmResign(true)}
                  disabled={!!gameOver}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-error-container/40 hover:bg-error-container text-error text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Icon name="flag" className="text-base" />
                  Resign
                </button>
                <button
                  onClick={() => setBoardFlipped((f) => !f)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs font-semibold transition-all cursor-pointer"
                >
                  <Icon name="swap_vert" className="text-base" />
                  Flip
                </button>
              </div>
              <button
                onClick={handleNewGame}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-90 shadow-sm transition-all cursor-pointer"
              >
                <Icon name="add" className="text-base" />
                New Game
              </button>
            </div>
          </div>

          {/* ============ RIGHT PANEL ============ */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Match Details */}
            <div className="bg-surface-container-low rounded-xl p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="psychology" className="text-primary text-lg" />
                  <h2 className="text-base font-bold text-on-surface">
                    Engine Match Details
                  </h2>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary-fixed/60 text-on-primary-fixed-variant">
                  Live UCI
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container p-3 rounded-lg flex flex-col">
                  <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider">
                    Difficulty
                  </span>
                  <span className="font-bold text-sm text-on-surface mt-0.5">
                    {difficulty.label}
                  </span>
                  <span className="text-[10px] text-secondary">
                    Est. Elo ~{difficulty.elo}
                  </span>
                </div>
                <div className="bg-surface-container p-3 rounded-lg flex flex-col">
                  <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider">
                    Search Depth
                  </span>
                  <span className="font-bold text-sm text-on-surface mt-0.5">
                    {difficulty.depth} Plies
                  </span>
                  <span className="text-[10px] text-secondary">
                    Skill {difficulty.skill}
                  </span>
                </div>
              </div>

              <div className="bg-surface-container p-3 rounded-lg flex flex-col gap-1">
                <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider">
                  Time Control
                </span>
                <span className="font-bold text-sm text-on-surface">
                  {timePreset.label}
                </span>
                <span className="text-xs text-on-surface-variant">
                  {hasClock
                    ? `${timePreset.display}${timePreset.inc > 0 ? ` · +${timePreset.inc / 1000}s increment` : ""}`
                    : "No time limit"}
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
                    No moves yet
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

      {/* Resign Modal */}
      {confirmResign && (
        <Modal onClose={() => setConfirmResign(false)}>
          <div className="w-12 h-12 rounded-xl bg-error-container/50 text-error flex items-center justify-center mb-4">
            <Icon name="flag" className="text-2xl" />
          </div>
          <h4 className="text-lg font-bold text-on-surface">
            Resign this game?
          </h4>
          <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
            Surrendering will award a win to Stockfish Engine ({difficulty.elo})
            and record the match in your history.
          </p>
          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              onClick={() => setConfirmResign(false)}
              className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Keep Playing
            </button>
            <button
              onClick={handleResignConfirm}
              className="px-4 py-2 rounded-xl bg-error text-on-error text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Yes, Resign
            </button>
          </div>
        </Modal>
      )}

      {/* Game Over Modal */}
      {gameOver && (
        <GameOverModal
          gameOver={gameOver}
          playerColor={playerColor}
          onNewGame={handleNewGame}
          onBack={onExit}
        />
      )}
    </div>
  );
}

/* ============================================
   PLAYER BAR
============================================ */
function PlayerBar({
  color,
  isEngine,
  difficulty,
  ms,
  active,
  hasClock,
  thinking,
}) {
  const critical = hasClock && ms !== null && ms < 10000;
  const low = hasClock && ms !== null && ms < 30000;

  return (
    <div className="flex items-center justify-between px-2 py-1">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-inner ${
              isEngine
                ? "bg-surface-variant text-tertiary"
                : "bg-primary text-on-primary shadow-sm"
            }`}
          >
            {isEngine ? (
              <Icon name="precision_manufacturing" className="text-2xl" />
            ) : (
              <Icon name="person" className="text-2xl" filled />
            )}
          </div>
          {active && (
            <div
              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-surface-container-low ${
                isEngine ? "bg-tertiary" : "bg-primary"
              }`}
            />
          )}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-on-surface">
              {isEngine ? `Stockfish · ${difficulty.label}` : "You (Guest)"}
            </span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded font-bold ${
                color === "w"
                  ? "bg-primary-fixed text-on-primary-fixed-variant"
                  : "bg-surface-container-highest text-secondary"
              }`}
            >
              {color === "w" ? "WHITE" : "BLACK"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-secondary mt-0.5">
            <span>{isEngine ? `Rating ${difficulty.elo}` : "Rating 1200"}</span>
          </div>
        </div>
      </div>

      {hasClock && (
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            active
              ? "bg-primary text-on-primary shadow-md"
              : "bg-surface-container-high text-on-surface"
          }`}
        >
          {thinking && isEngine ? (
            <Icon name="hourglass_bottom" className="text-sm animate-pulse" />
          ) : (
            <Icon name="schedule" className="text-sm" />
          )}
          <span
            className={`text-lg font-bold tracking-wider tabular-nums ${
              active && critical ? "animate-pulse" : ""
            }`}
          >
            {formatTime(ms ?? 0)}
          </span>
        </div>
      )}
    </div>
  );
}

/* ============================================
   GAME OVER MODAL
============================================ */
function GameOverModal({ gameOver, playerColor, onNewGame, onBack }) {
  const { reason, winner, statusText } = gameOver;

  let title = "Game Over";
  let subtitle = "";
  let icon = "emoji_events";
  let iconBg = "bg-primary-fixed/60 text-primary";

  if (reason === "timeout") {
    const playerWon = winner === playerColor;
    title = playerWon ? "You win!" : "You lose";
    subtitle = playerWon ? "Engine ran out of time" : "You ran out of time";
    icon = playerWon ? "emoji_events" : "schedule";
    iconBg = playerWon
      ? "bg-primary-fixed/60 text-primary"
      : "bg-error-container/50 text-error";
  } else if (reason === "resign") {
    title = "You resigned";
    subtitle = "Engine wins";
    icon = "flag";
    iconBg = "bg-error-container/50 text-error";
  } else if (reason === "board") {
    if (statusText?.includes("Draw")) {
      title = "Draw";
      subtitle = statusText;
      icon = "handshake";
      iconBg = "bg-tertiary-fixed/60 text-tertiary";
    } else {
      const whiteWins = statusText?.toLowerCase().includes("white");
      const winnerColor = whiteWins ? "w" : "b";
      const playerWon = winnerColor === playerColor;
      title = playerWon ? "You win!" : "You lose";
      subtitle = "Checkmate";
      icon = playerWon ? "emoji_events" : "sentiment_dissatisfied";
      iconBg = playerWon
        ? "bg-primary-fixed/60 text-primary"
        : "bg-error-container/50 text-error";
    }
  }

  return (
    <Modal onClose={() => {}}>
      <div className="flex flex-col items-center text-center">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${iconBg}`}
        >
          <Icon name={icon} className="text-3xl" filled />
        </div>
        <h2 className="text-2xl font-bold text-on-surface m-0 mb-1">{title}</h2>
        {subtitle && (
          <p className="text-[13px] text-secondary m-0 mb-6">{subtitle}</p>
        )}
        <div className="flex items-center gap-2 w-full mt-2">
          <button
            onClick={onBack}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-outline-variant bg-transparent text-on-surface-variant text-sm font-medium cursor-pointer transition-colors hover:bg-surface-container"
          >
            <Icon name="settings" className="text-base" />
            Setup
          </button>
          <button
            onClick={onNewGame}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold cursor-pointer transition-opacity hover:opacity-90"
          >
            <Icon name="refresh" className="text-base" />
            Rematch
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ============================================
   MODAL WRAPPER
============================================ */
function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest max-w-sm w-full rounded-2xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
