export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export type PlayerType = 'human' | 'bot';

export type GameMode = 'classic' | '2player' | 'teams' | 'quick';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export type TeamId = 'team_blue_green' | 'team_red_yellow';

export type GamePhase = 'PLAYING' | 'MATCH_OVER';

export interface Token {
  id: number; // 0, 1, 2, 3
  color: PlayerColor;
  step: number; // -1: Yard; 0..50: Main 52-cell track; 51..55: Colored home column; 56: Home finish
  isFinished: boolean;
}

export interface PlayerStats {
  rolls: number;
  sixes: number;
  captures: number;
  tokensFinished: number;
}

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  type: PlayerType;
  avatar: string; // image or avatar id
  country: string;
  flag: string;
  coins: number;
  gems?: number;
  tokens: Token[];
  hasWon: boolean;
  rank: number | null; // 1, 2, 3, 4
  stats: PlayerStats;
  chatBubble?: { text: string; expiresAt: number } | null;
  teamId?: TeamId;
  teamName?: string;
}

export interface BoardCoord {
  row: number; // 0..14
  col: number; // 0..14
}

export interface GameSettings {
  mode: GameMode; // classic (4 tokens) or quick (2 tokens)
  playerCount: 2 | 3 | 4;
  botDifficulty: BotDifficulty;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  fastAnimations: boolean;
  threeConsecutiveSixRule: boolean;
  blockingRule: boolean; // Opponents cannot land on or pass 2+ stacked tokens
}

export interface GameEventMessage {
  id: string;
  text: string;
  type: 'roll' | 'move' | 'capture' | 'safe' | 'home' | 'win' | 'six' | 'block';
  timestamp: number;
}
