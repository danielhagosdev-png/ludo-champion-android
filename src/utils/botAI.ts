import { Player, Token, BotDifficulty } from '../types/ludo';
import {
  canTokenMove,
  getDestinationCoordinate,
  getCapturedOpponentTokens,
  isSafeCell,
  getTokenCoordinate,
  MAIN_TRACK,
} from './ludoBoard';

/**
 * AI engine for Ludo Bots with tactical heuristics and blocking strategies
 */
export function chooseBotMove(
  botPlayer: Player,
  diceValue: number,
  allPlayers: Player[],
  difficulty: BotDifficulty = 'medium',
  blockingRuleEnabled: boolean = true
): number | null {
  const movableTokens = botPlayer.tokens.filter((t) =>
    canTokenMove(t, diceValue, allPlayers, blockingRuleEnabled)
  );
  if (movableTokens.length === 0) return null;
  if (movableTokens.length === 1) return movableTokens[0].id;

  // Easy mode: frequently picks randomly
  if (difficulty === 'easy' && Math.random() < 0.6) {
    const randomPick = movableTokens[Math.floor(Math.random() * movableTokens.length)];
    return randomPick.id;
  }

  let bestScore = -Infinity;
  let bestTokenId = movableTokens[0].id;

  for (const token of movableTokens) {
    let score = 0;
    const dest = getDestinationCoordinate(token, diceValue);
    if (!dest) continue;

    const { coord, nextStep } = dest;

    // 1. Entering Home finish (step 56) -> Massive reward!
    if (nextStep === 56) {
      score += 250;
    }

    // 2. Capturing an opponent -> Huge reward!
    const captures = getCapturedOpponentTokens(coord, botPlayer.color, allPlayers);
    if (captures.length > 0) {
      score += 180 * captures.length;
    }

    // 3. Exiting yard on a 6
    if (token.step === -1 && diceValue === 6) {
      const activeTokens = botPlayer.tokens.filter(
        (t) => t.step >= 0 && !t.isFinished
      ).length;
      if (activeTokens === 0) {
        score += 140;
      } else if (activeTokens === 1) {
        score += 100;
      } else {
        score += 70;
      }
    }

    // 4. Forming a BLOCK (Blockade trick from strategy tips!)
    if (blockingRuleEnabled && nextStep <= 50) {
      const otherTokensOnSameDest = botPlayer.tokens.filter(
        (t) => t.id !== token.id && t.step >= 0 && !t.isFinished
      );
      for (const other of otherTokensOnSameDest) {
        const otherCoord = getTokenCoordinate(other);
        if (otherCoord.row === coord.row && otherCoord.col === coord.col) {
          // Forming a block! Highly strategic protection
          score += 110;
          break;
        }
      }
    }

    // 5. Moving into colored home stretch (step >= 51) where completely safe
    if (token.step <= 50 && nextStep >= 51) {
      score += 85;
    }

    // 6. Landing on a Star/Safe square
    if (isSafeCell(coord) && nextStep <= 50) {
      score += 65;
    }

    // 7. Danger evaluation & escaping:
    if (token.step >= 0 && token.step <= 50) {
      const currentCoord = getTokenCoordinate(token);
      const isCurrentlySafe = isSafeCell(currentCoord);

      // If currently unsafe and opponents are within 1-6 steps:
      if (!isCurrentlySafe) {
        if (isTokenUnderThreat(token, allPlayers)) {
          score += 70;
        }
      }

      // Avoid moving into an opponent's ambush
      if (difficulty === 'hard' && !isSafeCell(coord) && nextStep <= 50) {
        if (isSquareThreatenedByOpponents(coord, botPlayer.color, allPlayers)) {
          score -= 40;
        }
      }
    }

    // 8. General progress towards home
    score += nextStep * 1.5;

    // Small random jitter
    score += Math.random() * 6;

    if (score > bestScore) {
      bestScore = score;
      bestTokenId = token.id;
    }
  }

  return bestTokenId;
}

function isTokenUnderThreat(token: Token, allPlayers: Player[]): boolean {
  const currentCoord = getTokenCoordinate(token);
  const currentTrackIdx = MAIN_TRACK.findIndex(
    (c) => c.row === currentCoord.row && c.col === currentCoord.col
  );
  if (currentTrackIdx === -1) return false;

  const myPlayer = allPlayers.find((p) => p.color === token.color);

  for (const player of allPlayers) {
    if (player.color === token.color) continue;
    if (myPlayer?.teamId && player.teamId === myPlayer.teamId) continue; // Teammates are friendly

    for (const oppToken of player.tokens) {
      if (oppToken.step >= 0 && oppToken.step <= 50 && !oppToken.isFinished) {
        const oppCoord = getTokenCoordinate(oppToken);
        const oppTrackIdx = MAIN_TRACK.findIndex(
          (c) => c.row === oppCoord.row && c.col === oppCoord.col
        );
        if (oppTrackIdx !== -1) {
          const dist = (currentTrackIdx - oppTrackIdx + 52) % 52;
          if (dist >= 1 && dist <= 6) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

function isSquareThreatenedByOpponents(
  coord: { row: number; col: number },
  myColor: string,
  allPlayers: Player[]
): boolean {
  const targetTrackIdx = MAIN_TRACK.findIndex(
    (c) => c.row === coord.row && c.col === coord.col
  );
  if (targetTrackIdx === -1) return false;

  const myPlayer = allPlayers.find((p) => p.color === myColor);

  for (const player of allPlayers) {
    if (player.color === myColor) continue;
    if (myPlayer?.teamId && player.teamId === myPlayer.teamId) continue; // Teammates are friendly

    for (const oppToken of player.tokens) {
      if (oppToken.step >= 0 && oppToken.step <= 50 && !oppToken.isFinished) {
        const oppCoord = getTokenCoordinate(oppToken);
        const oppTrackIdx = MAIN_TRACK.findIndex(
          (c) => c.row === oppCoord.row && c.col === oppCoord.col
        );
        if (oppTrackIdx !== -1) {
          const dist = (targetTrackIdx - oppTrackIdx + 52) % 52;
          if (dist >= 1 && dist <= 6) {
            return true;
          }
        }
      }
    }
  }
  return false;
}
