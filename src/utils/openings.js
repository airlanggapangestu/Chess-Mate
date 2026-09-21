/**
 * Opening detection from SAN move sequence.
 * Matches the LONGEST opening whose prefix matches the played moves.
 */

const OPENINGS = [
  // ---- 1. e4 e5 ----
  { moves: ["e4", "e5"], name: "Open Game", eco: "C20" },
  { moves: ["e4", "e5", "Nf3"], name: "King's Knight Opening", eco: "C40" },
  {
    moves: ["e4", "e5", "Nf3", "Nc6"],
    name: "King's Knight Opening",
    eco: "C44",
  },
  { moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"], name: "Ruy Lopez", eco: "C60" },
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6"],
    name: "Ruy Lopez: Morphy Defense",
    eco: "C78",
  },
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6"],
    name: "Ruy Lopez: Morphy Defense, Closed",
    eco: "C88",
  },
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"],
    name: "Italian Game",
    eco: "C50",
  },
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"],
    name: "Italian Game: Giuoco Piano",
    eco: "C50",
  },
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6"],
    name: "Italian Game: Two Knights Defense",
    eco: "C55",
  },
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5"],
    name: "Two Knights: Knight Attack",
    eco: "C57",
  },
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5"],
    name: "Fried Liver Attack",
    eco: "C57",
  },
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5"],
    name: "Fried Liver Attack",
    eco: "C57",
  },
  {
    moves: [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Bc4",
      "Nf6",
      "Ng5",
      "d5",
      "exd5",
      "Nxd5",
    ],
    name: "Fried Liver Attack",
    eco: "C57",
  },
  {
    moves: [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Bc4",
      "Nf6",
      "Ng5",
      "d5",
      "exd5",
      "Nxd5",
      "Nxf7",
    ],
    name: "Fried Liver Attack",
    eco: "C57",
  },
  { moves: ["e4", "e5", "Nf3", "Nc6", "d4"], name: "Scotch Game", eco: "C45" },
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "Nc3"],
    name: "Four Knights Game",
    eco: "C47",
  },
  { moves: ["e4", "e5", "Nf3", "Nf6"], name: "Petrov Defense", eco: "C42" },
  { moves: ["e4", "e5", "Nf3", "d6"], name: "Philidor Defense", eco: "C41" },
  { moves: ["e4", "e5", "Nf3", "f5"], name: "Latvian Gambit", eco: "C40" },
  { moves: ["e4", "e5", "Bc4"], name: "Bishop's Opening", eco: "C23" },
  { moves: ["e4", "e5", "Nc3"], name: "Vienna Game", eco: "C25" },
  { moves: ["e4", "e5", "f4"], name: "King's Gambit", eco: "C30" },
  {
    moves: ["e4", "e5", "f4", "exf4"],
    name: "King's Gambit Accepted",
    eco: "C33",
  },

  // ---- 1. e4 c5 (Sicilian) ----
  { moves: ["e4", "c5"], name: "Sicilian Defense", eco: "B20" },
  { moves: ["e4", "c5", "Nf3"], name: "Sicilian Defense", eco: "B27" },
  {
    moves: ["e4", "c5", "Nf3", "d6"],
    name: "Sicilian: Old Sicilian",
    eco: "B30",
  },
  {
    moves: ["e4", "c5", "Nf3", "Nc6"],
    name: "Sicilian: Old Sicilian",
    eco: "B30",
  },
  {
    moves: ["e4", "c5", "Nf3", "e6"],
    name: "Sicilian: French Variation",
    eco: "B40",
  },
  {
    moves: ["e4", "c5", "Nf3", "e6", "d4", "cxd4"],
    name: "Sicilian: Open",
    eco: "B40",
  },
  {
    moves: ["e4", "c5", "Nf3", "d6", "d4"],
    name: "Sicilian: Open",
    eco: "B50",
  },
  {
    moves: ["e4", "c5", "d4"],
    name: "Sicilian: Smith-Morra Gambit",
    eco: "B21",
  },
  { moves: ["e4", "c5", "Nc3"], name: "Sicilian: Closed", eco: "B23" },
  { moves: ["e4", "c5", "c3"], name: "Sicilian: Alapin", eco: "B22" },

  // ---- 1. e4 e6 (French) ----
  { moves: ["e4", "e6"], name: "French Defense", eco: "C00" },
  { moves: ["e4", "e6", "d4"], name: "French Defense", eco: "C01" },
  { moves: ["e4", "e6", "d4", "d5"], name: "French Defense", eco: "C01" },
  {
    moves: ["e4", "e6", "d4", "d5", "Nc3"],
    name: "French: Paulsen Variation",
    eco: "C10",
  },
  {
    moves: ["e4", "e6", "d4", "d5", "e5"],
    name: "French: Advance Variation",
    eco: "C02",
  },
  {
    moves: ["e4", "e6", "d4", "d5", "Nd2"],
    name: "French: Tarrasch",
    eco: "C03",
  },
  {
    moves: ["e4", "e6", "d4", "d5", "exd5"],
    name: "French: Exchange Variation",
    eco: "C01",
  },

  // ---- 1. e4 c6 (Caro-Kann) ----
  { moves: ["e4", "c6"], name: "Caro-Kann Defense", eco: "B10" },
  { moves: ["e4", "c6", "d4"], name: "Caro-Kann Defense", eco: "B10" },
  { moves: ["e4", "c6", "d4", "d5"], name: "Caro-Kann Defense", eco: "B12" },
  {
    moves: ["e4", "c6", "d4", "d5", "Nc3"],
    name: "Caro-Kann: Main Line",
    eco: "B15",
  },
  {
    moves: ["e4", "c6", "d4", "d5", "e5"],
    name: "Caro-Kann: Advance",
    eco: "B12",
  },
  {
    moves: ["e4", "c6", "d4", "d5", "exd5"],
    name: "Caro-Kann: Exchange",
    eco: "B13",
  },

  // ---- Other 1. e4 ----
  { moves: ["e4", "d5"], name: "Scandinavian Defense", eco: "B01" },
  { moves: ["e4", "Nf6"], name: "Alekhine's Defense", eco: "B02" },
  { moves: ["e4", "d6"], name: "Pirc Defense", eco: "B07" },
  { moves: ["e4", "g6"], name: "Modern Defense", eco: "B06" },
  { moves: ["e4", "b6"], name: "Owen's Defense", eco: "B00" },
  { moves: ["e4", "Nc6"], name: "Nimzowitsch Defense", eco: "B00" },

  // ---- 1. d4 ----
  { moves: ["d4"], name: "Queen's Pawn Opening", eco: "A40" },
  { moves: ["d4", "d5"], name: "Closed Game", eco: "D00" },
  { moves: ["d4", "d5", "c4"], name: "Queen's Gambit", eco: "D06" },
  {
    moves: ["d4", "d5", "c4", "e6"],
    name: "Queen's Gambit Declined",
    eco: "D30",
  },
  { moves: ["d4", "d5", "c4", "c6"], name: "Slav Defense", eco: "D10" },
  {
    moves: ["d4", "d5", "c4", "dxc4"],
    name: "Queen's Gambit Accepted",
    eco: "D20",
  },
  {
    moves: ["d4", "d5", "c4", "Nf6"],
    name: "Queen's Gambit: Marshall",
    eco: "D06",
  },
  { moves: ["d4", "d5", "Nf3"], name: "Queen's Pawn Game", eco: "D02" },
  { moves: ["d4", "Nf6"], name: "Indian Game", eco: "A45" },
  { moves: ["d4", "Nf6", "c4"], name: "Indian Defense", eco: "A50" },
  { moves: ["d4", "Nf6", "c4", "e6"], name: "Indian Defense", eco: "E00" },
  {
    moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"],
    name: "Nimzo-Indian Defense",
    eco: "E20",
  },
  {
    moves: ["d4", "Nf6", "c4", "e6", "Nf3", "b6"],
    name: "Queen's Indian Defense",
    eco: "E12",
  },
  {
    moves: ["d4", "Nf6", "c4", "g6"],
    name: "King's Indian Defense",
    eco: "E60",
  },
  {
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7"],
    name: "King's Indian Defense",
    eco: "E60",
  },
  {
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "d5"],
    name: "Grünfeld Defense",
    eco: "D80",
  },
  { moves: ["d4", "Nf6", "c4", "c5"], name: "Benoni Defense", eco: "A43" },
  { moves: ["d4", "f5"], name: "Dutch Defense", eco: "A80" },
  { moves: ["d4", "e6"], name: "Horwitz Defense", eco: "A40" },
  { moves: ["d4", "g6"], name: "Modern Defense", eco: "A40" },

  // ---- 1. c4 ----
  { moves: ["c4"], name: "English Opening", eco: "A10" },
  { moves: ["c4", "e5"], name: "English: Reversed Sicilian", eco: "A20" },
  { moves: ["c4", "c5"], name: "English: Symmetrical", eco: "A30" },
  { moves: ["c4", "Nf6"], name: "English: Anglo-Indian", eco: "A15" },
  { moves: ["c4", "e6"], name: "English: Agincourt", eco: "A13" },

  // ---- 1. Nf3 ----
  { moves: ["Nf3"], name: "Zukertort Opening", eco: "A04" },
  { moves: ["Nf3", "d5"], name: "Réti Opening", eco: "A09" },
  { moves: ["Nf3", "Nf6"], name: "Réti Opening", eco: "A05" },

  // ---- Others ----
  { moves: ["b3"], name: "Nimzo-Larsen Attack", eco: "A01" },
  { moves: ["f4"], name: "Bird's Opening", eco: "A02" },
  { moves: ["b4"], name: "Polish Opening", eco: "A00" },
  { moves: ["g3"], name: "Hungarian Opening", eco: "A00" },
];

/**
 * @param {string[]} sanMoves - Array of SAN moves, e.g. ["e4", "e5", "Nf3"]
 * @returns {{name: string, eco: string} | null}
 */
export function detectOpening(sanMoves) {
  if (!sanMoves || sanMoves.length === 0) return null;

  let bestMatch = null;
  let bestLength = 0;

  for (const opening of OPENINGS) {
    if (opening.moves.length > sanMoves.length) continue;
    if (opening.moves.length <= bestLength) continue;

    let matches = true;
    for (let i = 0; i < opening.moves.length; i++) {
      if (opening.moves[i] !== sanMoves[i]) {
        matches = false;
        break;
      }
    }

    if (matches) {
      bestMatch = opening;
      bestLength = opening.moves.length;
    }
  }

  return bestMatch;
}
