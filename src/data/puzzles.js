/**
 * Puzzle database.
 * Each puzzle: user is to move. `solution` is an array of UCI moves
 * alternating between user and opponent (user first).
 */

export const PUZZLES = [
  {
    id: 1,
    fen: "7k/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    solution: ["e1e8"],
    rating: 800,
    theme: "Back-rank mate",
    description: "White to move. Deliver mate in 1.",
  },
  {
    id: 2,
    fen: "7k/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1",
    solution: ["a1a8"],
    rating: 850,
    theme: "Back-rank mate",
    description: "White to move. Find the checkmate.",
  },
  {
    id: 3,
    fen: "7k/6pp/8/8/8/8/8/4R1K1 w - - 0 1",
    solution: ["e1e8"],
    rating: 900,
    theme: "Back-rank mate",
    description: "White to move. Mate in 1.",
  },
  {
    id: 4,
    fen: "7k/8/6K1/8/8/8/8/7Q w - - 0 1",
    solution: ["h1h7"],
    rating: 950,
    theme: "Queen mate",
    description: "White to move. King + Queen mate.",
  },
  {
    id: 5,
    fen: "7k/8/6K1/8/8/8/8/Q7 w - - 0 1",
    solution: ["a1a8"],
    rating: 1000,
    theme: "Queen mate",
    description: "White to move. Mate in 1.",
  },
  {
    id: 6,
    fen: "6k1/R6R/8/8/8/8/8/8 w - - 0 1",
    solution: ["a7a8"],
    rating: 1100,
    theme: "Ladder mate",
    description: "White to move. Two rooks finish it.",
  },
  {
    id: 7,
    fen: "r2qk3/8/8/1N6/8/8/8/4K3 w - - 0 1",
    solution: ["b5c7", "e8f8", "c7a8"],
    rating: 1200,
    theme: "Fork",
    description: "White to move. Win material with a fork.",
  },
];
