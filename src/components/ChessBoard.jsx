import { useState } from "react";
import { Chessboard } from "react-chessboard";
import { useBoardTheme } from "../context/ThemeContext";

export default function ChessBoard({
  game,
  position,
  onMove,
  arrows = [],
  disabled,
  boardOrientation = "white",
  extraSquareStyles = {},
}) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const { theme } = useBoardTheme();

  const handleSquareClick = ({ square }) => {
    if (disabled || !square) return;
    const chessPiece = game.get(square);

    if (!selectedSquare) {
      if (!chessPiece) return;
      if (chessPiece.color !== game.turn()) return;
      const moves = game.moves({ square, verbose: true });
      if (moves.length === 0) return;
      setSelectedSquare(square);
      setLegalMoves(moves);
      return;
    }

    if (chessPiece && chessPiece.color === game.turn()) {
      const moves = game.moves({ square, verbose: true });
      setSelectedSquare(square);
      setLegalMoves(moves);
      return;
    }

    const selectedMove = legalMoves.find((move) => move.to === square);
    if (!selectedMove) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    const sourceSquare = selectedSquare;
    setSelectedSquare(null);
    setLegalMoves([]);
    onMove(sourceSquare, square);
  };

  const handlePieceDrop = ({ sourceSquare, targetSquare }) => {
    if (disabled || !sourceSquare || !targetSquare) return false;
    const success = onMove(sourceSquare, targetSquare);
    setSelectedSquare(null);
    setLegalMoves([]);
    return success;
  };

  /* ---------- SQUARE STYLES ---------- */
  const squareStyles = { ...extraSquareStyles };

  if (selectedSquare) {
    squareStyles[selectedSquare] = {
      backgroundColor: "rgba(255, 215, 0, 0.65)",
      boxShadow: "inset 0 0 0 4px rgba(255, 255, 0, 0.25)",
    };
  }

  legalMoves.forEach((move) => {
    if (squareStyles[move.to]) return; // jangan timpa hint
    const targetPiece = game.get(move.to);
    if (!targetPiece) {
      squareStyles[move.to] = {
        background:
          "radial-gradient(circle, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.45) 18%, transparent 20%)",
      };
    } else {
      squareStyles[move.to] = {
        boxShadow: "inset 0 0 0 5px rgba(0, 0, 0, 0.35)",
      };
    }
  });

  return (
    <div className="board-wrapper">
      <Chessboard
        options={{
          position,
          boardOrientation,
          allowDragging: !disabled,
          onPieceDrop: handlePieceDrop,
          onSquareClick: handleSquareClick,
          squareStyles,
          arrows,
          animationDuration: 0,
          boardStyle: {
            width: "100%",
            height: "100%",
            borderRadius: "8px",
            overflow: "hidden",
          },
          lightSquareStyle: { backgroundColor: theme.light },
          darkSquareStyle: { backgroundColor: theme.dark },
        }}
      />
    </div>
  );
}
