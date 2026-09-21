import { useEffect, useRef, useState, useCallback } from "react";

export function useStockfish() {
  const engineRef = useRef(null);
  const readyRef = useRef(false);
  const [ready, setReady] = useState(false);
  const queueRef = useRef(Promise.resolve());

  useEffect(() => {
    const engine = new Worker("/stockfish/stockfish-18-single.js");
    engineRef.current = engine;

    engine.onmessage = (event) => {
      const message = event.data;
      if (message === "uciok") engine.postMessage("isready");
      if (message === "readyok") {
        readyRef.current = true;
        setReady(true);
      }
    };

    engine.onerror = (error) => console.error("Stockfish Error:", error);

    engine.postMessage("uci");

    return () => {
      engine.terminate();
      engineRef.current = null;
      readyRef.current = false;
    };
  }, []);

  /**
   * MultiPV analysis — used by Analysis mode.
   * @returns Promise<{ moves: string[], scores: number[] }>
   */
  const analyze = useCallback((fen, depth = 12, count = 1) => {
    const run = () =>
      new Promise((resolve) => {
        const engine = engineRef.current;
        if (!engine || !readyRef.current) {
          resolve({ moves: [], scores: [] });
          return;
        }

        const collected = {};

        const handleMessage = (event) => {
          const msg = event.data;
          if (typeof msg !== "string") return;

          const mpvMatch = msg.match(/multipv (\d+)/);
          const pvMatch = msg.match(/\bpv\s+(\S+)/);
          const cpMatch = msg.match(/score cp (-?\d+)/);
          const mateMatch = msg.match(/score mate (-?\d+)/);

          if (mpvMatch && pvMatch) {
            const idx = parseInt(mpvMatch[1], 10);
            let score = 0;
            if (cpMatch) score = parseInt(cpMatch[1], 10);
            else if (mateMatch) {
              const m = parseInt(mateMatch[1], 10);
              score = m > 0 ? 10000 - m * 10 : -10000 - m * 10;
            }
            collected[idx] = { move: pvMatch[1], score };
          }

          if (msg.startsWith("bestmove")) {
            engine.removeEventListener("message", handleMessage);
            const moves = [];
            const scores = [];
            for (let i = 1; i <= count; i++) {
              if (collected[i]) {
                moves.push(collected[i].move);
                scores.push(collected[i].score);
              } else {
                moves.push(null);
                scores.push(0);
              }
            }
            resolve({ moves, scores });
          }
        };

        engine.addEventListener("message", handleMessage);
        engine.postMessage(`setoption name MultiPV value ${count}`);
        engine.postMessage(`setoption name Skill Level value 20`);
        engine.postMessage("ucinewgame");
        engine.postMessage(`position fen ${fen}`);
        engine.postMessage(`go depth ${depth}`);
      });

    const next = queueRef.current.then(run, run);
    queueRef.current = next.catch(() => {});
    return next;
  }, []);

  /**
   * Single best move, with configurable strength — used by Vs Engine mode.
   * @returns Promise<string|null> UCI move e.g. "e2e4"
   */
  const getEngineMove = useCallback((fen, { depth = 12, skill = 20 } = {}) => {
    const run = () =>
      new Promise((resolve) => {
        const engine = engineRef.current;
        if (!engine || !readyRef.current) {
          resolve(null);
          return;
        }

        const handleMessage = (event) => {
          const msg = event.data;
          if (typeof msg === "string" && msg.startsWith("bestmove")) {
            engine.removeEventListener("message", handleMessage);
            const parts = msg.split(" ");
            const move = parts[1];
            resolve(!move || move === "(none)" ? null : move);
          }
        };

        engine.addEventListener("message", handleMessage);
        engine.postMessage(`setoption name MultiPV value 1`);
        engine.postMessage(`setoption name Skill Level value ${skill}`);
        engine.postMessage("ucinewgame");
        engine.postMessage(`position fen ${fen}`);
        engine.postMessage(`go depth ${depth}`);
      });

    const next = queueRef.current.then(run, run);
    queueRef.current = next.catch(() => {});
    return next;
  }, []);

  const getBestMoves = useCallback(
    async (fen, depth = 12, count = 2) => {
      const { moves } = await analyze(fen, depth, count);
      return moves.filter(Boolean);
    },
    [analyze],
  );

  return { ready, analyze, getBestMoves, getEngineMove };
}
