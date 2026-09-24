# ChessMate

A modern chess web application built with React, featuring engine analysis, tactical puzzles, and local multiplayer — all in a clean, Material Design 3-inspired interface.

[![Deploy with Vercel](https://vercel.com/button)](https://chess-mate-taupe.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?logo=github)](https://github.com/airlanggapangestu/Chess-Mate)
[![Live Demo](https://img.shields.io/badge/Live-Demo-success?logo=vercel)](https://chess-mate-taupe.vercel.app/)

---

## Live Demo

**[chess-mate.vercel.app](https://chess-mate-taupe.vercel.app/)**

Try it directly in your browser — no installation needed.

---

## Features

### Analysis Mode
Play freely from both sides with real-time engine insights.
- **Arrow hints** — Top 2 best moves shown as colored arrows (green = best, blue = alternative)
- **Move classification** — Every move auto-tagged with a rating:
  -  **Brilliant** — Sacrifice with best outcome
  -  **Great** — Best move, second-best far behind
  -  **Best** — Matches engine's top choice
  -  **Excellent** — Centipawn loss ≤ 20
  -  **Good** — Centipawn loss ≤ 50
  -  **Book** — Known opening move
  -  **Inaccuracy** — Centipawn loss ≤ 120
  -  **Mistake** — Centipawn loss ≤ 300
  -  **Blunder** — Centipawn loss > 300
- **Opening detection** — 70+ known openings (Ruy Lopez, Fried Liver, Sicilian, etc.) with ECO codes
- **Full navigation** — Jump to start, step back/forward, jump to end
- **Keyboard shortcuts** — `←` `→` `Home` `End` `F` (flip board)
- **Interactive move list** — Click any move to jump to that position

### Play vs Engine
Challenge Stockfish at 4 difficulty levels.
- **Levels**: Easy (~800 Elo) · Medium (~1500) · Hard (~2000) · Expert (~2400)
- **Play as**: White · Black · Random
- **Time control**: Unlimited · 5 min · 10 min · 15|10
- **Auto engine move** — Stockfish responds to your move automatically

### 2 Player
Local match with chess clock.
- **8 time presets** — Bullet, Blitz, Rapid, Classical
- **Fischer increment** — Time added after each move
- **Live clock** — Green / orange / red warnings as time runs low
- **Resign** with confirmation dialog
- **Draw offer** with accept/decline banner
- **Timeout detection** — Auto game-over when clock hits 0

### Puzzle
Tactical training with built-in puzzles.
- 7 puzzles with ratings (800–1200)
- **Hint** — Highlights the starting square
- **Show solution** — Auto-plays the winning line
- **Shake animation** on wrong move
- **Celebration overlay** when solved

### Settings
- **9 board themes** with live preview
- Theme saved to `localStorage`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 + Vite |
| **Styling** | Tailwind CSS v4 (`@theme` tokens) |
| **Icons** | Material Symbols + Lucide React |
| **Chess Logic** | chess.js |
| **Board UI** | react-chessboard v5 |
| **Engine** | Stockfish 18 (Web Worker) |
| **Sound** | Web Audio API (synthesized) |
| **Storage** | localStorage |
| **Hosting** | Vercel |

---

## Quick Start

### Try Online

**[Open Live Demo](https://chess-mate-taupe.vercel.app/)**

### Run Locally

```bash
# Clone the repo
git clone https://github.com/airlanggapangestu/Chess-Mate.git
cd Chess-Mate

# Install dependencies (also downloads Stockfish WASM automatically)
npm install

# Run dev server
npm run dev
