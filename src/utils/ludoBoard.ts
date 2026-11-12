import { BoardCoord, PlayerColor, Token, Player } from '../types/ludo';

// 52-cell main perimeter loop coordinates on a 15x15 board
export const MAIN_TRACK: BoardCoord[] = [
  /* 0..5 (Left arm, row 6 going right) */
  { row: 6, col: 0 },
  { row: 6, col: 1 }, // 1: RED START (Safe)
  { row: 6, col: 2 },
  { row: 6, col: 3 },
  { row: 6, col: 4 },
  { row: 6, col: 5 },
  /* 6..11 (Top arm, col 6 going up) */
  { row: 5, col: 6 },
  { row: 4, col: 6 },
  { row: 3, col: 6 },
  { row: 2, col: 6 }, // 9: TOP-LEFT STAR (Safe)
  { row: 1, col: 6 },
  { row: 0, col: 6 },
  /* 12: Top turnaround */
  { row: 0, col: 7 },
  /* 13..18 (Top arm, col 8 going down) */
  { row: 0, col: 8 },
  { row: 1, col: 8 }, // 14: GREEN START (Safe)
  { row: 2, col: 8 },
  { row: 3, col: 8 },
  { row: 4, col: 8 },
  { row: 5, col: 8 },
  /* 19..24 (Right arm, row 6 going right) */
  { row: 6, col: 9 },
  { row: 6, col: 10 },
  { row: 6, col: 11 },
  { row: 6, col: 12 }, // 22: TOP-RIGHT STAR (Safe)
  { row: 6, col: 13 },
  { row: 6, col: 14 },
  /* 25: Right turnaround */
  { row: 7, col: 14 },
  /* 26..31 (Right arm, row 8 going left) */
  { row: 8, col: 14 },
  { row: 8, col: 13 }, // 27: YELLOW START (Safe)
  { row: 8, col: 12 },
  { row: 8, col: 11 },
  { row: 8, col: 10 },
  { row: 8, col: 9 },
  /* 32..37 (Bottom arm, col 8 going down) */
  { row: 9, col: 8 },
  { row: 10, col: 8 },
  { row: 11, col: 8 },
  { row: 12, col: 8 }, // 35: BOTTOM-RIGHT STAR (Safe)
  { row: 13, col: 8 },
  { row: 14, col: 8 },
  /* 38: Bottom turnaround */
  { row: 14, col: 7 },
  /* 39..44 (Bottom arm, col 6 going up) */
  { row: 14, col: 6 },
  { row: 13, col: 6 }, // 40: BLUE START (Safe)
  { row: 12, col: 6 },
  { row: 11, col: 6 },
  { row: 10, col: 6 },
  { row: 9, col: 6 },
  /* 45..50 (Left arm, row 8 going left) */
  { row: 8, col: 5 },
  { row: 8, col: 4 },
  { row: 8, col: 3 },
  { row: 8, col: 2 }, // 48: BOTTOM-LEFT STAR (Safe)
  { row: 8, col: 1 },
  { row: 8, col: 0 },
  /* 51: Left turnaround */
  { row: 7, col: 0 },
];

export const START_TRACK_INDICES: Record<PlayerColor, number> = {
  red: 1,
  green: 14,
  yellow: 27,
  blue: 40,
};

// Safe track indices on MAIN_TRACK
export const SAFE_TRACK_INDICES = new Set<number>([
  1, 9, 14, 22, 27, 35, 40, 48,
]);

// 4 Star squares (non-start safe squares)
export const STAR_COORDS: BoardCoord[] = [
  { row: 2, col: 6 },
  { row: 6, col: 12 },
  { row: 12, col: 8 },
  { row: 8, col: 2 },
];

// Home run paths (steps 51..55) and finish home triangle (step 56)
export const HOME_PATHS: Record<PlayerColor, BoardCoord[]> = {
  red: [
    { row: 7, col: 1 },
    { row: 7, col: 2 },
    { row: 7, col: 3 },
    { row: 7, col: 4 },
    { row: 7, col: 5 },
    { row: 7, col: 6 }, // Step 56: Home finish
  ],
  green: [
    { row: 1, col: 7 },
    { row: 2, col: 7 },
    { row: 3, col: 7 },
    { row: 4, col: 7 },
    { row: 5, col: 7 },
    { row: 6, col: 7 }, // Step 56: Home finish
  ],
  yellow: [
    { row: 7, col: 13 },
    { row: 7, col: 12 },
    { row: 7, col: 11 },
    { row: 7, col: 10 },
    { row: 7, col: 9 },
    { row: 7, col: 8 }, // Step 56: Home finish
  ],
  blue: [
    { row: 13, col: 7 },
    { row: 12, col: 7 },
    { row: 11, col: 7 },
    { row: 10, col: 7 },
    { row: 9, col: 7 },
    { row: 8, col: 7 }, // Step 56: Home finish
  ],
};

// Resting nest spots inside the Yard/Base (step === -1)
export const YARD_NEST_COORDS: Record<PlayerColor, BoardCoord[]> = {
  red: [
    { row: 2, col: 2 },
    { row: 2, col: 3 },
    { row: 3, col: 2 },
    { row: 3, col: 3 },
  ],
  green: [
    { row: 2, col: 11 },
    { row: 2, col: 12 },
    { row: 3, col: 11 },
    { row: 3, col: 12 },
  ],
  yellow: [
    { row: 11, col: 11 },
    { row: 11, col: 12 },
    { row: 12, col: 11 },
    { row: 12, col: 12 },
  ],
  blue: [
    { row: 11, col: 2 },
    { row: 11, col: 3 },
    { row: 12, col: 2 },
    { row: 12, col: 3 },
  ],
};

export const COLOR_THEMES: Record<PlayerColor, {
  name: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  bgLight: string;
  border: string;
  shadow: string;
  text: string;
}> = {
  red: {
    name: 'Red',
    primary: '#e11d48',
    primaryLight: '#fb7185',
    primaryDark: '#9f1239',
    bgLight: 'rgba(225, 29, 72, 0.18)',
    border: '#be123c',
    shadow: 'rgba(225, 29, 72, 0.5)',
    text: 'text-rose-500',
  },
  green: {
    name: 'Green',
    primary: '#10b981',
    primaryLight: '#34d399',
    primaryDark: '#047857',
    bgLight: 'rgba(16, 185, 129, 0.18)',
    border: '#059669',
    shadow: 'rgba(16, 185, 129, 0.5)',
    text: 'text-emerald-500',
  },
  yellow: {
    name: 'Yellow',
    primary: '#f59e0b',
    primaryLight: '#fbbf24',
    primaryDark: '#b45309',
    bgLight: 'rgba(245, 158, 11, 0.18)',
    border: '#d97706',
    shadow: 'rgba(245, 158, 11, 0.5)',
    text: 'text-amber-500',
  },
  blue: {
    name: 'Blue',
    primary: '#0284c7',
    primaryLight: '#38bdf8',
    primaryDark: '#0369a1',
    bgLight: 'rgba(2, 132, 199, 0.18)',
    border: '#0284c7',
    shadow: 'rgba(2, 132, 199, 0.5)',
    text: 'text-sky-500',
  },
};

/**
 * Get board grid coordinate for a token
 */
export function getTokenCoordinate(token: Token): BoardCoord {
  if (token.step === -1) {
    const nestCoords = YARD_NEST_COORDS[token.color];
    return nestCoords[token.id] || nestCoords[0];
  }

  if (token.step <= 50) {
    const trackIndex = (START_TRACK_INDICES[token.color] + token.step) % 52;
    return MAIN_TRACK[trackIndex];
  }

  const homeIndex = Math.min(token.step - 51, 5);
  return HOME_PATHS[token.color][homeIndex];
}

/**
 * Check if a coordinate is a safe square
 */
export function isSafeCell(coord: BoardCoord): boolean {
  const trackIdx = MAIN_TRACK.findIndex(
    (c) => c.row === coord.row && c.col === coord.col
  );
  if (trackIdx !== -1 && SAFE_TRACK_INDICES.has(trackIdx)) {
    return true;
  }

  for (const color of ['red', 'green', 'yellow', 'blue'] as PlayerColor[]) {
    if (HOME_PATHS[color].some((c) => c.row === coord.row && c.col === coord.col)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a BLOCK has formed on a specific board coordinate
 * In FFA mode: 2+ tokens of same color form a block.
 * In Team Up mode: 2+ tokens of the same team form a team block!
 */
export function getBlockAtCoordinate(
  coord: BoardCoord,
  players: Player[]
): { isBlocked: boolean; color?: PlayerColor; teamId?: string; count: number } {
  // Safe stars or home columns do not act as impassable blockades
  if (isSafeCell(coord)) {
    return { isBlocked: false, count: 0 };
  }

  // Check by team first if any players have teamId
  const teamCounts: Record<string, number> = {};
  const colorCounts: Record<string, number> = {};

  for (const player of players) {
    for (const token of player.tokens) {
      if (token.step >= 0 && token.step <= 50 && !token.isFinished) {
        const tokenCoord = getTokenCoordinate(token);
        if (tokenCoord.row === coord.row && tokenCoord.col === coord.col) {
          colorCounts[player.color] = (colorCounts[player.color] || 0) + 1;
          if (player.teamId) {
            teamCounts[player.teamId] = (teamCounts[player.teamId] || 0) + 1;
          }
        }
      }
    }
  }

  // Check team blocks
  for (const [teamId, count] of Object.entries(teamCounts)) {
    if (count >= 2) {
      return { isBlocked: true, teamId, count };
    }
  }

  // Check individual color blocks
  for (const [color, count] of Object.entries(colorCounts)) {
    if (count >= 2) {
      return { isBlocked: true, color: color as PlayerColor, count };
    }
  }

  return { isBlocked: false, count: 0 };
}

/**
 * Check if an opponent block obstructs this token's path or landing
 */
export function isMoveBlockedByOpponent(
  token: Token,
  diceValue: number,
  players: Player[],
  blockingRuleEnabled: boolean = true
): boolean {
  if (!blockingRuleEnabled) return false;

  const movingPlayer = players.find((p) => p.color === token.color);

  const isBlockHostile = (block: { isBlocked: boolean; color?: PlayerColor; teamId?: string }) => {
    if (!block.isBlocked) return false;
    if (movingPlayer?.teamId && block.teamId) {
      return block.teamId !== movingPlayer.teamId;
    }
    return block.color !== token.color;
  };

  // 1. If token is in yard, check if starting square has an opponent block
  if (token.step === -1) {
    const startIdx = START_TRACK_INDICES[token.color];
    const startCoord = MAIN_TRACK[startIdx];
    const block = getBlockAtCoordinate(startCoord, players);
    return isBlockHostile(block);
  }

  // 2. If token is on the main track, check every square along the path up to diceValue
  for (let s = 1; s <= diceValue; s++) {
    const targetStep = token.step + s;

    // Once in home stretch, opponent blocks don't exist
    if (targetStep > 50) break;

    const trackIndex = (START_TRACK_INDICES[token.color] + targetStep) % 52;
    const pathCoord = MAIN_TRACK[trackIndex];
    const block = getBlockAtCoordinate(pathCoord, players);

    if (isBlockHostile(block)) {
      // Impassable! Opponent block halts movement
      return true;
    }
  }

  return false;
}

/**
 * Check if a token can make a legal move with the given rolled dice
 */
export function canTokenMove(
  token: Token,
  diceValue: number,
  players: Player[] = [],
  blockingRuleEnabled: boolean = true
): boolean {
  if (token.isFinished) return false;

  // In yard: only can exit on a 6
  if (token.step === -1) {
    if (diceValue !== 6) return false;
    // Check if start square is blocked by opponents
    if (blockingRuleEnabled && players.length > 0) {
      const startCoord = MAIN_TRACK[START_TRACK_INDICES[token.color]];
      const block = getBlockAtCoordinate(startCoord, players);
      if (block.isBlocked && block.color !== token.color) {
        return false;
      }
    }
    return true;
  }

  // On track: cannot exceed step 56 (Home) - exact roll required!
  if (token.step + diceValue > 56) {
    return false;
  }

  // Check if an opponent blockade blocks path or landing
  if (blockingRuleEnabled && players.length > 0) {
    if (isMoveBlockedByOpponent(token, diceValue, players, blockingRuleEnabled)) {
      return false;
    }
  }

  return true;
}

/**
 * Returns list of token IDs for a player that can move
 */
export function getMovableTokens(
  player: Player,
  diceValue: number,
  players: Player[] = [],
  blockingRuleEnabled: boolean = true
): number[] {
  if (player.hasWon) return [];
  const movable: number[] = [];

  player.tokens.forEach((token) => {
    if (canTokenMove(token, diceValue, players, blockingRuleEnabled)) {
      movable.push(token.id);
    }
  });

  return movable;
}

/**
 * Predict destination coordinate for a token if moved by diceValue
 */
export function getDestinationCoordinate(
  token: Token,
  diceValue: number
): { coord: BoardCoord; nextStep: number } | null {
  let nextStep: number;
  if (token.step === -1) {
    nextStep = 0;
  } else {
    nextStep = token.step + diceValue;
  }

  if (nextStep > 56) return null;

  const dummyToken: Token = { ...token, step: nextStep };
  return {
    coord: getTokenCoordinate(dummyToken),
    nextStep,
  };
}

/**
 * Check for capture at a given board position
 * Returns opponent tokens that would be captured (if cell is not safe and from opponent)
 */
export function getCapturedOpponentTokens(
  targetCoord: BoardCoord,
  movingPlayerColor: PlayerColor,
  players: Player[]
): { playerIndex: number; tokenId: number; color: PlayerColor }[] {
  if (isSafeCell(targetCoord)) {
    return [];
  }

  const movingPlayer = players.find((p) => p.color === movingPlayerColor);
  const captures: { playerIndex: number; tokenId: number; color: PlayerColor }[] = [];

  players.forEach((player, pIdx) => {
    if (player.color === movingPlayerColor) return;
    // In Team Up mode: you cannot capture your own teammate's tokens!
    if (movingPlayer?.teamId && player.teamId === movingPlayer.teamId) return;

    player.tokens.forEach((token) => {
      if (token.step !== -1 && !token.isFinished) {
        const tokenCoord = getTokenCoordinate(token);
        if (tokenCoord.row === targetCoord.row && tokenCoord.col === targetCoord.col) {
          captures.push({
            playerIndex: pIdx,
            tokenId: token.id,
            color: player.color,
          });
        }
      }
    });
  });

  return captures;
}
