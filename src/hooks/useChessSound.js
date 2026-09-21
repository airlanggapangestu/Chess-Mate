import { useRef, useCallback } from "react";

/* ============================================
   WOOD SOUND ENGINE
============================================ */
export function useChessSound() {
  const ctxRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctxRef.current = new AC();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  /* ============================================
     BODY RESONANCE — "gema" kayu
  ============================================ */
  const playBody = useCallback(
    ({ freq = 280, duration = 0.09, volume = 0.22 } = {}) => {
      const ctx = getCtx();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        freq * 0.75,
        ctx.currentTime + duration,
      );

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.003);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + duration,
      );

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration + 0.02);
    },
    [getCtx],
  );

  /* ============================================
     WOOD CLICK — "tok" permukaan kayu
  ============================================ */
  const playWoodClick = useCallback(
    ({ centerFreq = 2200, duration = 0.05, volume = 0.18, Q = 1.2 } = {}) => {
      const ctx = getCtx();
      if (!ctx) return;

      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize;
        const env = Math.pow(1 - t, 2.5);
        data[i] = (Math.random() * 2 - 1) * env;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = centerFreq;
      filter.Q.value = Q;

      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 400;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + duration,
      );

      source.connect(filter);
      filter.connect(hp);
      hp.connect(gain);
      gain.connect(ctx.destination);

      source.start(ctx.currentTime);
    },
    [getCtx],
  );

  /* ============================================
     WOOD MOVE
  ============================================ */
  const playWoodMove = useCallback(
    ({ baseFreq = 280, clickFreq = 2200, volume = 1 } = {}) => {
      playBody({ freq: baseFreq, duration: 0.09, volume: 0.2 * volume });
      playWoodClick({
        centerFreq: clickFreq,
        duration: 0.045,
        volume: 0.18 * volume,
        Q: 1.4,
      });
    },
    [playBody, playWoodClick],
  );

  /* ============================================
     WOOD DOUBLE
  ============================================ */
  const playWoodDouble = useCallback(
    ({ delay = 70, volume = 1 } = {}) => {
      playWoodMove({ baseFreq: 300, clickFreq: 2400, volume });
      setTimeout(
        () =>
          playWoodMove({
            baseFreq: 240,
            clickFreq: 1800,
            volume: volume * 0.9,
          }),
        delay,
      );
    },
    [playWoodMove],
  );

  /* ============================================
     WOOD THUD — capture
  ============================================ */
  const playWoodThud = useCallback(
    ({ volume = 1 } = {}) => {
      playBody({ freq: 180, duration: 0.14, volume: 0.28 * volume });
      playWoodClick({
        centerFreq: 1600,
        duration: 0.06,
        volume: 0.22 * volume,
        Q: 1.0,
      });
      setTimeout(() => {
        playBody({ freq: 120, duration: 0.1, volume: 0.15 * volume });
      }, 20);
    },
    [playBody, playWoodClick],
  );

  /* ============================================
     WOOD PROMOTE
  ============================================ */
  const playWoodPromote = useCallback(() => {
    playWoodMove({ baseFreq: 260, clickFreq: 2000 });
    setTimeout(() => playWoodMove({ baseFreq: 320, clickFreq: 2400 }), 80);
    setTimeout(() => playWoodMove({ baseFreq: 400, clickFreq: 2800 }), 160);
  }, [playWoodMove]);

  /* ============================================
     WOOD CHECK
  ============================================ */
  const playWoodCheck = useCallback(() => {
    playWoodMove({ baseFreq: 380, clickFreq: 3000, volume: 1.1 });
    setTimeout(
      () => playWoodMove({ baseFreq: 480, clickFreq: 3400, volume: 1.1 }),
      90,
    );
  }, [playWoodMove]);

  /* ============================================
     WOOD GAMEOVER
  ============================================ */
  const playWoodGameOver = useCallback(() => {
    playWoodMove({ baseFreq: 340, clickFreq: 2200 });
    setTimeout(() => playWoodMove({ baseFreq: 260, clickFreq: 1800 }), 180);
    setTimeout(() => playWoodMove({ baseFreq: 180, clickFreq: 1400 }), 360);
  }, [playWoodMove]);

  /* ============================================
     WOOD ILLEGAL
  ============================================ */
  const playWoodIllegal = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.14);
  }, [getCtx]);

  /* ============================================
     WOOD SELECT — klik bidak (halus)
  ============================================ */
  const playWoodSelect = useCallback(() => {
    playWoodMove({ baseFreq: 320, clickFreq: 2600, volume: 0.5 });
  }, [playWoodMove]);

  /* ============================================
     WOOD NAV — maju/mundur langkah (ringan & cepat)
  ============================================ */
  const playWoodNav = useCallback(() => {
    playWoodMove({ baseFreq: 380, clickFreq: 2800, volume: 0.6 });
  }, [playWoodMove]);

  /* ============================================
     PUBLIC API
  ============================================ */
  const playSound = useCallback(
    (type = "move") => {
      try {
        switch (type) {
          case "move":
            playWoodMove();
            break;
          case "capture":
            playWoodThud();
            break;
          case "castle":
            playWoodDouble();
            break;
          case "check":
            playWoodCheck();
            break;
          case "promote":
            playWoodPromote();
            break;
          case "gameover":
            playWoodGameOver();
            break;
          case "illegal":
            playWoodIllegal();
            break;
          case "select":
            playWoodSelect();
            break;
          case "nav":
            playWoodNav();
            break;
          default:
            playWoodMove();
        }
      } catch (err) {
        console.error("Sound error:", err);
      }
    },
    [
      playWoodMove,
      playWoodThud,
      playWoodDouble,
      playWoodCheck,
      playWoodPromote,
      playWoodGameOver,
      playWoodIllegal,
      playWoodSelect,
      playWoodNav,
    ],
  );

  return { playSound };
}
