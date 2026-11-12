import { GameEventMessage, GameSettings, Player } from '../types/ludo';

// Keeps the current match in localStorage so a refresh or closed tab doesn't lose it.

const STORAGE_KEY = 'ludo-champion:match:v1';

export interface SavedMatch {
  version: 1;
  settings: GameSettings;
  players: Player[];
  activePlayerIndex: number;
  diceValue: number | null;
  consecutiveSixes: number;
  extraTurnStreak: number;
  totalTurns: number;
  rollHistory: number[];
  gameEvents: GameEventMessage[];
  winner: Player | null;
  winningTeamName?: string;
  matchOver: boolean;
  nextRank: number;
}

export function loadSavedMatch(): SavedMatch | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedMatch;
    const valid =
      data?.version === 1 &&
      Array.isArray(data.players) &&
      data.players.length >= 2 &&
      data.players.every((p) => Array.isArray(p.tokens)) &&
      data.activePlayerIndex >= 0 &&
      data.activePlayerIndex < data.players.length;
    return valid ? data : null;
  } catch {
    return null;
  }
}

export function saveMatch(match: SavedMatch): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(match));
  } catch {
    // Storage full or blocked (private mode); the game still works without saving
  }
}
