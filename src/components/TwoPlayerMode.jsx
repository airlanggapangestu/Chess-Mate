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
const TIME_PRESETS = [
  { id: "1+0", label: "Bullet", time: 60 * 1000, inc: 0, display: "1 min" },
  { id: "3+0", label: "Blitz", time: 180 * 1000, inc: 0, display: "3 min" },
  {
    id: "3+2",
    label: "Blitz",
    time: 180 * 1000,
    inc: 2 * 1000,
    display: "3 | 2",
  },
  { id: "5+0", label: "Blitz", time: 300 * 1000, inc: 0, display: "5 min" },
  { id: "10+0", label: "Rapid", time: 600 * 1000, inc: 0, display: "10 min" },
  {
    id: "10+5",
    label: "Rapid",
    time: 600 * 1000,
    inc: 5 * 1000,
    display: "10 | 5",
  },
  {
    id: "15+10",
    label: "Rapid",
    time: 900 * 1000,
    inc: 10 * 1000,
    display: "15 | 10",
  },
  {
    id: "30+0",
    label: "Classical",
    time: 1800 * 1000,
    inc: 0,
    display: "30 min",
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
export default function TwoPlayerMode({
  visible,
  playSound,
  onMovesChange,
  onActiveChange,
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
    return <SetupScreen onStart={setConfig} />;
  }

  return (
    <GameScreen
      config={config}
      visible={visible}
      playSound={playSound}
      onMovesChange={onMovesChange}
      onExit={() => setConfig(null)}
    />
  );
}

/* ============================================
   SETUP SCREEN
============================================ */
function SetupScreen({ onStart }) {
  const [selectedId, setSelectedId] = useState("10+0");

  const handleStart = () => {
    const preset = TIME_PRESETS.find((p) => p.id === selectedId);
    onStart(preset);
  };

  return (
    <div className="w-full h-full overflow-y-auto scroll-custom">
      <div className="max-w-3xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm shrink-0">
            <Icon name="group" className="text-2xl" filled />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-on-surface">2 Player</h1>
            <p className="text-sm text-secondary mt-0.5">
              Play with a friend on the same device
            </p>
          </div>
        </div>

        {/* Time control */}
        <section className="mb-8">
          <SectionLabel icon="schedule" label="Time Control" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TIME_PRESETS.map((t) => {
              const active = selectedId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
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

        {/* Info */}
        <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-4 mb-6 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-fixed/40 flex items-center justify-center shrink-0">
            <Icon name="info" className="text-primary text-lg" filled />
          </div>
          <div className="text-[13px] text-on-surface-variant leading-relaxed">
            <p className="m-0">
              <b className="text-on-surface">How it works:</b> White moves
              first. Clock starts ticking when the first move is made. If a
              player runs out of time, they lose. Fischer increment adds time
              after each move.
            </p>
          </div>
        </div>

        {/* Start */}
        <button
          onClick={handleStart}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl
            bg-primary text-on-primary font-bold text-base
            transition-all cursor-pointer
            hover:opacity-90 active:scale-[0.99] shadow-md"
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
function GameScreen({ config, visible, playSound, onExit, onMovesChange }) {
  const [game, setGame] = useState(() => new Chess());
  const [position, setPosition] = useState(START_FEN);
  const [gameOver, setGameOver] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [drawOffer, setDrawOffer] = useState(null);
  const [confirmResign, setConfirmResign] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [boardFlipped, setBoardFlipped] = useState(false);

  const busyRef = useRef(false);
  const activeColor = game.turn();
  const running = gameStarted && !gameOver && visible;

  const clock = useChessClock({
    initialMs: config.time,
    incrementMs: config.inc,
    running,
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

  const boardOrientation = boardFlipped ? "black" : "white";
  const topColor = boardOrientation === "white" ? "b" : "w";
  const bottomColor = boardOrientation === "white" ? "w" : "b";

  /* TIMEOUT */
  useEffect(() => {
    if (!gameStarted || gameOver || !visible) return;
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
    gameStarted,
    gameOver,
    visible,
    playSound,
  ]);

  /* MOVE */
  const handleMove = useCallback(
    (from, to) => {
      if (busyRef.current || gameOver) return false;

      const g = new Chess(game.fen());
      try {
        const move = g.move({ from, to, promotion: "q" });
        if (!move) {
          playSound("illegal");
          return false;
        }

        busyRef.current = true;
        playSound(detectSoundType(move, g));
        clock.addIncrement(move.color);

        if (!gameStarted) setGameStarted(true);

        setGame(g);
        setPosition(g.fen());
        setMoveHistory((prev) => [
          ...prev,
          { san: move.san, color: move.color },
        ]);

        if (drawOffer) setDrawOffer(null);

        if (g.isGameOver()) {
          setGameOver({
            reason: "board",
            winner: null,
            statusText: getBoardStatus(g),
          });
          playSound("gameover");
        }

        busyRef.current = false;
        return true;
      } catch {
        playSound("illegal");
        busyRef.current = false;
        return false;
      }
    },
    [game, gameOver, gameStarted, playSound, clock, drawOffer],
  );

  /* ACTIONS */
  const handleResignConfirm = () => {
    const color = confirmResign;
    setConfirmResign(null);
    setGameOver({ reason: "resign", winner: color === "w" ? "b" : "w" });
    playSound("gameover");
  };

  const handleDrawOffer = () => setDrawOffer(activeColor);
  const handleAcceptDraw = () => {
    setDrawOffer(null);
    setGameOver({ reason: "agreement", winner: null });
    playSound("gameover");
  };
  const handleDeclineDraw = () => setDrawOffer(null);

  const handleNewGame = () => {
    const g = new Chess();
    setGame(g);
    setPosition(g.fen());
    setGameOver(null);
    setGameStarted(false);
    setDrawOffer(null);
    setConfirmResign(null);
    setMoveHistory([]);
    clock.reset();
  };

  /* STATUS */
  const statusText = gameOver
    ? "Game over"
    : !gameStarted
      ? "White to move — clock starts on first move"
      : activeColor === "w"
        ? "White to move"
        : "Black to move";

  const isActive = !gameOver && gameStarted;

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
                    2 Player
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed/60 text-on-primary-fixed-variant text-xs font-semibold">
                    <Icon name="group" className="text-[14px]" filled />
                    Local Match
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-medium">
                    <Icon name="timer" className="text-[13px]" />
                    {config.display}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <span className="relative flex h-2 w-2">
                    {isActive && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    )}
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 ${
                        isActive ? "bg-primary" : "bg-secondary"
                      }`}
                    />
                  </span>
                  <span
                    className={`font-semibold ${
                      isActive ? "text-primary" : "text-secondary"
                    }`}
                  >
                    {statusText}
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
                name={topColor === "w" ? "White" : "Black"}
                ms={topColor === "w" ? clock.whiteMs : clock.blackMs}
                active={isActive && activeColor === topColor}
              />

              <div className="w-full flex justify-center py-1">
                <div className="relative w-full max-w-[580px] aspect-square rounded-2xl p-3 bg-surface-container-highest shadow-md">
                  <div className="w-full h-full rounded-xl overflow-hidden shadow-inner">
                    <ChessBoard
                      game={game}
                      position={position}
                      onMove={handleMove}
                      arrows={[]}
                      disabled={!!gameOver}
                      boardOrientation={boardOrientation}
                    />
                  </div>
                </div>
              </div>

              <PlayerBar
                color={bottomColor}
                name={bottomColor === "w" ? "White" : "Black"}
                ms={bottomColor === "w" ? clock.whiteMs : clock.blackMs}
                active={isActive && activeColor === bottomColor}
              />
            </div>

            {/* Action bar */}
            <div className="bg-surface-container-low rounded-xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmResign(activeColor)}
                  disabled={!gameStarted || !!gameOver}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-error-container/40 hover:bg-error-container text-error text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Icon name="flag" className="text-base" />
                  Resign
                </button>
                <button
                  onClick={handleDrawOffer}
                  disabled={!gameStarted || !!gameOver || !!drawOffer}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Icon name="handshake" className="text-base" />
                  Offer Draw
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBoardFlipped((f) => !f)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs font-semibold transition-all cursor-pointer"
                >
                  <Icon name="swap_vert" className="text-base" />
                  Flip
                </button>
                <button
                  onClick={handleNewGame}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-90 shadow-sm transition-all cursor-pointer"
                >
                  <Icon name="add" className="text-base" />
                  New Game
                </button>
              </div>
            </div>
          </div>

          {/* ============ RIGHT PANEL ============ */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Match Details */}
            <div className="bg-surface-container-low rounded-xl p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="info" className="text-primary text-lg" filled />
                  <h2 className="text-base font-bold text-on-surface">
                    Match Details
                  </h2>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-primary-fixed/60 text-on-primary-fixed-variant"
                      : "bg-surface-container-high text-secondary"
                  }`}
                >
                  {isActive ? "Playing" : gameOver ? "Finished" : "Ready"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container p-3 rounded-lg flex flex-col">
                  <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider">
                    Time Control
                  </span>
                  <span className="font-bold text-sm text-on-surface mt-0.5">
                    {config.label}
                  </span>
                  <span className="text-[10px] text-secondary">
                    {config.display}
                  </span>
                </div>
                <div className="bg-surface-container p-3 rounded-lg flex flex-col">
                  <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider">
                    Increment
                  </span>
                  <span className="font-bold text-sm text-on-surface mt-0.5">
                    {config.inc > 0 ? `+${config.inc / 1000}s` : "None"}
                  </span>
                  <span className="text-[10px] text-secondary">Fischer</span>
                </div>
              </div>

              {/* Live clocks */}
              <div className="bg-surface-container p-3 rounded-lg flex flex-col gap-2">
                <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider">
                  Live Clocks
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-on-surface-variant">
                    White
                  </span>
                  <span
                    className={`font-mono font-bold tabular-nums text-sm ${
                      isActive && activeColor === "w"
                        ? "text-primary"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {formatTime(clock.whiteMs)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-on-surface-variant">
                    Black
                  </span>
                  <span
                    className={`font-mono font-bold tabular-nums text-sm ${
                      isActive && activeColor === "b"
                        ? "text-primary"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {formatTime(clock.blackMs)}
                  </span>
                </div>
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

      {/* Draw offer banner */}
      {drawOffer && !gameOver && (
        <DrawOfferBanner
          from={drawOffer}
          onAccept={handleAcceptDraw}
          onDecline={handleDeclineDraw}
        />
      )}

      {/* Resign Modal */}
      {confirmResign && (
        <Modal onClose={() => setConfirmResign(null)}>
          <div className="w-12 h-12 rounded-xl bg-error-container/50 text-error flex items-center justify-center mb-4">
            <Icon name="flag" className="text-2xl" />
          </div>
          <h4 className="text-lg font-bold text-on-surface">
            Resign this game?
          </h4>
          <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
            {confirmResign === "w" ? "White" : "Black"} will resign and the
            opponent wins.
          </p>
          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              onClick={() => setConfirmResign(null)}
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
function PlayerBar({ color, name, ms, active }) {
  const critical = ms < 10000;
  const low = ms < 30000;

  return (
    <div className="flex items-center justify-between px-2 py-1">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-inner ${
              color === "w"
                ? "bg-surface-container-lowest border border-outline-variant/40"
                : "bg-surface-container-highest"
            }`}
          >
            <span
              className={`text-2xl font-bold leading-none ${
                color === "w" ? "text-[#2e3230]" : "text-[#f5f0e8]"
              }`}
            >
              {color === "w" ? "♙" : "♟"}
            </span>
          </div>
          {active && (
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-surface-container-low bg-primary" />
          )}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-on-surface">{name}</span>
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
            <span>Local Player</span>
          </div>
        </div>
      </div>

      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
          active
            ? critical
              ? "bg-error text-on-error shadow-md"
              : low
                ? "bg-tertiary-container text-on-tertiary-container shadow-md"
                : "bg-primary text-on-primary shadow-md"
            : "bg-surface-container-high text-on-surface"
        }`}
      >
        <Icon
          name={active ? "hourglass_bottom" : "schedule"}
          className={`text-sm ${active && critical ? "animate-pulse" : ""}`}
          filled={active}
        />
        <span className="font-mono text-lg font-bold tracking-wider tabular-nums">
          {formatTime(ms ?? 0)}
        </span>
      </div>
    </div>
  );
}

/* ============================================
   DRAW OFFER BANNER
============================================ */
function DrawOfferBanner({ from, onAccept, onDecline }) {
  const fromName = from === "w" ? "White" : "Black";
  const toName = from === "w" ? "Black" : "White";

  return (
    <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4 pointer-events-none">
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl px-4 py-3 flex items-center gap-3 max-w-[480px] w-full pointer-events-auto">
        <div className="w-9 h-9 rounded-lg bg-primary-fixed/40 flex items-center justify-center shrink-0">
          <Icon name="handshake" className="text-primary text-lg" filled />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-on-surface m-0">
            {fromName} offers a draw
          </p>
          <p className="text-[11px] text-secondary m-0 mt-0.5">
            {toName}, accept or decline?
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onDecline}
            className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   GAME OVER MODAL
============================================ */
function GameOverModal({ gameOver, onNewGame, onBack }) {
  const { reason, winner, statusText } = gameOver;

  let title = "Game Over";
  let subtitle = "";
  let icon = "emoji_events";
  let iconBg = "bg-primary-fixed/60 text-primary";

  if (reason === "timeout") {
    title = `${winner === "w" ? "White" : "Black"} wins`;
    subtitle = "Opponent ran out of time";
    icon = "schedule";
    iconBg = "bg-tertiary-fixed/60 text-tertiary";
  } else if (reason === "resign") {
    title = `${winner === "w" ? "White" : "Black"} wins`;
    subtitle = "Opponent resigned";
    icon = "flag";
    iconBg = "bg-error-container/50 text-error";
  } else if (reason === "agreement") {
    title = "Draw";
    subtitle = "By agreement";
    icon = "handshake";
    iconBg = "bg-tertiary-fixed/60 text-tertiary";
  } else if (reason === "board") {
    if (statusText?.includes("Draw")) {
      title = "Draw";
      subtitle = statusText;
      icon = "handshake";
      iconBg = "bg-tertiary-fixed/60 text-tertiary";
    } else {
      title = statusText || "Game Over";
      subtitle = "Checkmate";
      icon = "emoji_events";
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
