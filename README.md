# MasterChess AI

A responsive, free chess training workspace built with Next.js, React, Tailwind CSS, `chess.js`, and a local Stockfish 19 Lite Web Worker.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`INCEPTION_API_KEY` is optional. Without it, the coach uses a useful local response; with it, `/api/coach` sends requests server-side to Inception AI.

## Included

- Click-to-move and pointer/touch drag-and-drop chessboard input.
- Legal targets, selected/last-move highlights, capture rings, check pulse, animated move badges, sound feedback, clocks, premove-safe history traversal, and smooth post-move scrolling.
- Stockfish 19 Lite single-threaded WASM worker for engine evaluation and bot moves.
- Six distinct bot profiles with skill, repertoire, opening preferences, and style metadata.
- Puzzle trainer, opening explorer with expanded lines, middlegame lessons, tips, game review, PGN area, and AI coach chat.
- LocalStorage persistence for progress, tactical rating, and the most recent game.

Stockfish runtime assets in `public/engine` are Stockfish.js 19 Lite Single, distributed under GPLv3. Source: https://github.com/nmrugg/stockfish.js.
