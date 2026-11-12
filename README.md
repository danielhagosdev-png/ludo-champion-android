# Ludo Champion

A classic Ludo board game built for phones. Play against bots, pass one phone around with friends, or team up 2 vs 2. It runs in the browser and can be installed to your home screen as an app (PWA).

## Features

- **Game modes:** Classic (4 tokens), Quick (2 tokens), 2-player head-to-head and Team Up (Blue + Green vs Red + Yellow)
- **Bots** with easy, medium and hard difficulty, mixed freely with human players
- **Local pass & play** on one device
- **Rules you can toggle:** three sixes in a row forfeits the turn, and two stacked tokens form a blockade
- **Feel:** tokens step cell by cell, 3D animated dice, sound effects and vibration on supported phones
- **Stats** for rolls, sixes, captures and finished tokens, plus a live event log
- **Installable** and works offline after the first load

## Design

The look is built on a small set of design tokens in `src/index.css`: colours (velvet surfaces, an ivory board, and one jewel colour per player: ruby, jade, amber and sapphire), a type scale, radii, shadows and motion timings. Shared pieces such as buttons, sheets and option cards are defined there too, so new screens stay consistent. Fonts are bundled, so nothing loads from the network.

## Tech stack

React 19, TypeScript, Vite, Tailwind CSS 4, Motion and vite-plugin-pwa.

## Getting started

Requires Node.js 20.19 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000. On a phone on the same Wi-Fi, use your computer's local IP address with port 3000.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Type-check with TypeScript |

## Project structure

```
src/
  App.tsx              game state, turns, moves and captures
  components/          board, dice, player cards and modals
  utils/ludoBoard.ts   board geometry and rules
  utils/botAI.ts       bot move selection
  utils/audio.ts       sound effects and haptics
  types/ludo.ts        shared types
```

