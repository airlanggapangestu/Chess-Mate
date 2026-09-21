import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Chess clock hook.
 * - Tick setiap 100ms untuk akurasi
 * - Hanya berjalan saat `running` true
 * - Mengurangi waktu `activeColor` ("w" atau "b")
 * - Menyediakan `addIncrement(color)` untuk menambah waktu (Fischer increment)
 */
export function useChessClock({
  initialMs,
  incrementMs,
  running,
  activeColor,
}) {
  const [whiteMs, setWhiteMs] = useState(initialMs);
  const [blackMs, setBlackMs] = useState(initialMs);
  const lastTickRef = useRef(Date.now());

  // Reset ketika initialMs berubah
  useEffect(() => {
    setWhiteMs(initialMs);
    setBlackMs(initialMs);
    lastTickRef.current = Date.now();
  }, [initialMs]);

  // Tick
  useEffect(() => {
    if (!running) return;

    lastTickRef.current = Date.now();

    const id = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastTickRef.current;
      lastTickRef.current = now;

      if (activeColor === "w") {
        setWhiteMs((t) => Math.max(0, t - elapsed));
      } else if (activeColor === "b") {
        setBlackMs((t) => Math.max(0, t - elapsed));
      }
    }, 100);

    return () => clearInterval(id);
  }, [running, activeColor]);

  const addIncrement = useCallback(
    (color) => {
      if (incrementMs <= 0) return;
      if (color === "w") setWhiteMs((t) => t + incrementMs);
      else setBlackMs((t) => t + incrementMs);
    },
    [incrementMs],
  );

  const reset = useCallback(() => {
    setWhiteMs(initialMs);
    setBlackMs(initialMs);
    lastTickRef.current = Date.now();
  }, [initialMs]);

  return { whiteMs, blackMs, addIncrement, reset };
}
