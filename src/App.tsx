/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameSettings,
  Player,
  PlayerColor,
  Token,
  GameEventMessage,
} from './types/ludo';
import {
  canTokenMove,
  getMovableTokens,
  getDestinationCoordinate,
  getCapturedOpponentTokens,
  isSafeCell,
  getTokenCoordinate,
} from './utils/ludoBoard';
import { chooseBotMove } from './utils/botAI';
import { sound } from './utils/audio';
import { LudoBoard } from './components/LudoBoard';
import { PlayerCard } from './components/PlayerCard';
import { RulesModal } from './components/RulesModal';
import { StatsDrawer } from './components/StatsDrawer';
import { WinnerModal } from './components/WinnerModal';
import { LobbyModal } from './components/LobbyModal';
import { ChatEmojiModal } from './components/ChatEmojiModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { Volume2, VolumeX, HelpCircle, BarChart3, RotateCcw } from 'lucide-react';

const DEFAULT_SETTINGS: GameSettings = {
  mode: 'classic',
  playerCount: 4,
  botDifficulty: 'medium',
  soundEnabled: true,
  hapticsEnabled: true,
  fastAnimations: false,
  threeConsecutiveSixRule: true,
  blockingRule: true,
};

// Initial Player Profiles matching Ludo King screenshot
const INITIAL_PLAYERS_DATA: Omit<Player, 'tokens' | 'hasWon' | 'rank' | 'stats'>[] = [
  {
    id: 'p1',
    name: 'Aravind',
    color: 'red',
    type: 'bot',
    country: 'India',
    flag: '🇮🇳',
    coins: 17450,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aravind',
  },
  {
    id: 'p2',
    name: 'Surya Reddy',
    color: 'green',
    type: 'bot',
    country: 'India',
    flag: '🇮🇳',
    coins: 1917875,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Surya',
  },
  {
    id: 'p3',
    name: 'Queen B',
    color: 'yellow',
    type: 'bot',
    country: 'USA',
    flag: '🇺🇸',
    coins: 604735,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=QueenB',
  },
  {
    id: 'p4',
    name: 'Rohanjakhade',
    color: 'blue',
    type: 'human',
    country: 'Global',
    flag: '🌐',
    coins: 12395,
    gems: 798,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan',
  },
];

function createInitialTokens(color: PlayerColor, tokenCount: number): Token[] {
  return Array.from({ length: tokenCount }).map((_, id) => ({
    id,
    color,
    step: -1,
    isFinished: false,
  }));
}

function initializePlayers(playerCount: 2 | 3 | 4, mode: 'classic' | '2player' | 'teams' | 'quick'): Player[] {
  const tokenCount = mode === 'quick' ? 2 : 4;

  let activeData = INITIAL_PLAYERS_DATA.slice(0, playerCount);
  if (mode === '2player') {
    activeData = [INITIAL_PLAYERS_DATA[3], INITIAL_PLAYERS_DATA[1]]; // Blue vs Green (opposites)
  }

  return activeData.map((data) => {
    const isTeamMode = mode === 'teams';
    const isTeamBlueGreen = data.color === 'blue' || data.color === 'green';

    return {
      ...data,
      tokens: createInitialTokens(data.color, tokenCount),
      hasWon: false,
      rank: null,
      teamId: isTeamMode ? (isTeamBlueGreen ? 'team_blue_green' : 'team_red_yellow') : undefined,
      teamName: isTeamMode ? (isTeamBlueGreen ? 'Blue+Green' : 'Red+Yellow') : undefined,
      stats: {
        rolls: 0,
        sixes: 0,
        captures: 0,
        tokensFinished: 0,
      },
      chatBubble: null,
    };
  });
}

export default function App() {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [players, setPlayers] = useState<Player[]>(() =>
    initializePlayers(DEFAULT_SETTINGS.playerCount, DEFAULT_SETTINGS.mode)
  );
  // Blue (bottom-left) starts first like the screenshot!
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(() => {
    const blueIdx = INITIAL_PLAYERS_DATA.findIndex((p) => p.color === 'blue');
    return blueIdx !== -1 ? blueIdx : 0;
  });

  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [movableTokenIds, setMovableTokenIds] = useState<number[]>([]);
  const [consecutiveSixes, setConsecutiveSixes] = useState<number>(0);
  const [extraTurnStreak, setExtraTurnStreak] = useState<number>(0);
  const [destinationPreview, setDestinationPreview] = useState<{
    row: number;
    col: number;
    tokenId: number;
  } | null>(null);

  const [totalTurns, setTotalTurns] = useState<number>(0);
  const [rollHistory, setRollHistory] = useState<number[]>([]);
  const [gameEvents, setGameEvents] = useState<GameEventMessage[]>([
    {
      id: 'init',
      text: 'Match started! Tap your dice to roll.',
      type: 'roll',
      timestamp: Date.now(),
    },
  ]);

  const [winner, setWinner] = useState<Player | null>(null);
  const [winningTeamName, setWinningTeamName] = useState<string | undefined>(undefined);
  const [matchOver, setMatchOver] = useState<boolean>(false);
  const [nextRank, setNextRank] = useState<number>(1);

  // Modals
  const [isLobbyOpen, setIsLobbyOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const botTurnTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleSound = () => {
    const nextVal = !settings.soundEnabled;
    sound.enabled = nextVal;
    setSettings((prev) => ({ ...prev, soundEnabled: nextVal }));
  };

  const addEvent = useCallback((text: string, type: GameEventMessage['type']) => {
    setGameEvents((prev) => [
      { id: Math.random().toString(), text, type, timestamp: Date.now() },
      ...prev.slice(0, 4),
    ]);
  }, []);

  const triggerChatBubble = useCallback((playerIndex: number, text: string) => {
    setPlayers((prev) =>
      prev.map((p, idx) =>
        idx === playerIndex
          ? {
              ...p,
              chatBubble: { text, expiresAt: Date.now() + 3500 },
            }
          : p
      )
    );
  }, []);

  // Cleanup expired chat bubbles
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayers((prev) =>
        prev.map((p) =>
          p.chatBubble && Date.now() > p.chatBubble.expiresAt
            ? { ...p, chatBubble: null }
            : p
        )
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const activePlayer = players[activePlayerIndex];
  const isHumanTurn = activePlayer?.type === 'human';

  // Helper: In Team Up mode, if active player finished, they help their teammate
  const getControlledPlayer = useCallback((): Player | undefined => {
    if (!activePlayer) return undefined;
    if (settings.mode === 'teams' && activePlayer.teamId && activePlayer.tokens.every((t) => t.isFinished)) {
      const teammate = players.find(
        (p) => p.teamId === activePlayer.teamId && p.id !== activePlayer.id
      );
      if (teammate && !teammate.tokens.every((t) => t.isFinished)) {
        return teammate;
      }
    }
    return activePlayer;
  }, [activePlayer, settings.mode, players]);

  // Advance turn to the next player
  const advanceTurn = useCallback((grantBonusTurn: boolean = false) => {
    setMovableTokenIds([]);
    setDestinationPreview(null);
    setDiceValue(null);

    if (grantBonusTurn) {
      setExtraTurnStreak((prev) => prev + 1);
      return;
    }

    setConsecutiveSixes(0);
    setExtraTurnStreak(0);
    setTotalTurns((prev) => prev + 1);

    setActivePlayerIndex((prevIndex) => {
      let nextIndex = (prevIndex + 1) % players.length;
      let loopCheck = 0;

      // In non-teams mode, skip players who have already won
      // In Team Up mode, finished players still roll to support their partner!
      const shouldSkip = (p: Player) => {
        if (settings.mode === 'teams') {
          // Skip only if BOTH teammates have finished!
          const teammate = players.find((mate) => mate.teamId === p.teamId && mate.id !== p.id);
          return p.hasWon && (!teammate || teammate.hasWon);
        }
        return p.hasWon;
      };

      while (shouldSkip(players[nextIndex]) && loopCheck < players.length) {
        nextIndex = (nextIndex + 1) % players.length;
        loopCheck++;
      }
      return nextIndex;
    });
  }, [players, settings.mode]);

  // Execute a token move
  const handleTokenMove = useCallback((tokenId: number, tokenColor?: PlayerColor) => {
    if (!activePlayer || diceValue === null || isMoving) return;

    // In Team Up mode, determine which player owns the moved token
    const movingPlayer = tokenColor
      ? players.find((p) => p.color === tokenColor) || activePlayer
      : getControlledPlayer() || activePlayer;

    const token = movingPlayer.tokens.find((t) => t.id === tokenId);
    if (!token || !canTokenMove(token, diceValue, players, settings.blockingRule)) return;

    setIsMoving(true);
    setMovableTokenIds([]);
    setDestinationPreview(null);

    const isExitingYard = token.step === -1;
    let nextStep = isExitingYard ? 0 : token.step + diceValue;

    if (isExitingYard) {
      sound.playTokenOut();
      addEvent(`${activePlayer.name} rolled 6 and brought a ${movingPlayer.color} token out!`, 'move');
    } else {
      sound.playTokenStep();
    }

    const dummyToken: Token = { ...token, step: nextStep };
    const destCoord = getTokenCoordinate(dummyToken);

    setTimeout(() => {
      let earnedBonusRoll = diceValue === 6;
      let playerFinishedNow = false;

      setPlayers((prevPlayers) => {
        const nextPlayers = prevPlayers.map((p) => {
          if (p.id !== movingPlayer.id) return p;

          const updatedTokens = p.tokens.map((t) => {
            if (t.id !== tokenId) return t;
            const isFinished = nextStep === 56;
            return {
              ...t,
              step: nextStep,
              isFinished,
            };
          });

          const finishedCount = updatedTokens.filter((t) => t.isFinished).length;
          const allHome = finishedCount === p.tokens.length;

          if (allHome && !p.hasWon) {
            playerFinishedNow = true;
          }

          return {
            ...p,
            tokens: updatedTokens,
            hasWon: allHome,
            rank: allHome && !p.hasWon ? nextRank : p.rank,
            stats: {
              ...p.stats,
              tokensFinished: finishedCount,
            },
          };
        });

        // 1. Check for Opponent Capture (teammates cannot capture each other)
        const captures = getCapturedOpponentTokens(destCoord, movingPlayer.color, nextPlayers);

        if (captures.length > 0) {
          sound.playCapture();
          earnedBonusRoll = true;

          captures.forEach((cap) => {
            const oppPlayer = nextPlayers[cap.playerIndex];
            addEvent(`${activePlayer.name} captured ${oppPlayer.name}'s token! 💥`, 'capture');

            if (oppPlayer.type === 'bot' && Math.random() < 0.6) {
              triggerChatBubble(cap.playerIndex, 'Oops! 😱');
            } else if (activePlayer.type === 'bot' && Math.random() < 0.6) {
              triggerChatBubble(activePlayerIndex, 'Gotcha! 😂');
            }

            nextPlayers[cap.playerIndex] = {
              ...oppPlayer,
              tokens: oppPlayer.tokens.map((t) =>
                t.id === cap.tokenId ? { ...t, step: -1, isFinished: false } : t
              ),
            };

            nextPlayers[activePlayerIndex].stats.captures += 1;
          });
        } else if (nextStep === 56) {
          // 2. Token Reached Home!
          sound.playTokenHome();
          earnedBonusRoll = true; // Rule: Token into center gives an extra roll!
          addEvent(`${movingPlayer.name}'s token reached Home! 🏆`, 'home');

          if (playerFinishedNow) {
            if (settings.mode !== 'teams') {
              addEvent(`🎉 ${movingPlayer.name} finished Rank #${nextRank}!`, 'win');
              if (nextRank === 1) {
                setWinner(nextPlayers.find((p) => p.id === movingPlayer.id) || null);
                setIsWinnerModalOpen(true);
              }
            } else {
              addEvent(`🎉 ${movingPlayer.name} brought all 4 tokens home for ${movingPlayer.teamName}!`, 'win');
            }
          }
        } else if (isSafeCell(destCoord)) {
          sound.playSafeSquare();
          addEvent(`${movingPlayer.name} landed on a Safe Star square.`, 'safe');
        }

        return nextPlayers;
      });

      setIsMoving(false);

      // Check Team Up Win Condition:
      if (settings.mode === 'teams' && movingPlayer.teamId) {
        setPlayers((currentPlayers) => {
          const teamMates = currentPlayers.filter((p) => p.teamId === movingPlayer.teamId);
          const allTeamHome = teamMates.every((p) => p.tokens.every((t) => t.isFinished));

          if (allTeamHome && !matchOver) {
            setMatchOver(true);
            setWinner(movingPlayer);
            setWinningTeamName(movingPlayer.teamName);
            setIsWinnerModalOpen(true);
            addEvent(`👑 Team ${movingPlayer.teamName} Wins the Team Up Match!`, 'win');
          }
          return currentPlayers;
        });
      } else if (playerFinishedNow) {
        // Non-team mode: assign rank and check if match ends
        const assignedRank = nextRank;
        setNextRank((prev) => prev + 1);

        const remainingActive = players.filter((p) => !p.hasWon && p.id !== movingPlayer.id);

        if (remainingActive.length <= 1) {
          setMatchOver(true);
          setPlayers((prev) =>
            prev.map((p) =>
              !p.hasWon && p.id === remainingActive[0]?.id
                ? { ...p, hasWon: true, rank: assignedRank + 1 }
                : p
            )
          );
          setIsWinnerModalOpen(true);
          return;
        }
      }

      advanceTurn(earnedBonusRoll);
    }, settings.fastAnimations ? 180 : 350);
  }, [activePlayer, diceValue, isMoving, activePlayerIndex, addEvent, settings.fastAnimations, settings.blockingRule, settings.mode, players, nextRank, triggerChatBubble, advanceTurn, getControlledPlayer, matchOver]);

  // Handle Dice Roll
  const handleRollDice = useCallback(() => {
    if (isRolling || isMoving || diceValue !== null || matchOver) return;

    // Check if active player can roll
    const controlled = getControlledPlayer();
    if (!controlled) return;

    setIsRolling(true);

    const rolled = Math.floor(Math.random() * 6) + 1;
    setRollHistory((prev) => [rolled, ...prev]);

    setTimeout(() => {
      setIsRolling(false);
      setDiceValue(rolled);

      // Rule: Three consecutive sixes forfeiture
      if (rolled === 6) {
        sound.playSixRolled();
        const nextSixStreak = consecutiveSixes + 1;
        setConsecutiveSixes(nextSixStreak);

        if (settings.threeConsecutiveSixRule && nextSixStreak >= 3) {
          addEvent(`${activePlayer.name} rolled three consecutive 6s! Third 6 cancelled.`, 'six');
          setConsecutiveSixes(0);
          advanceTurn(false);
          return;
        }

        addEvent(`${activePlayer.name} rolled a 6! +1 Extra Turn.`, 'six');
      } else {
        setConsecutiveSixes(0);
        addEvent(`${activePlayer.name} rolled a ${rolled}.`, 'roll');
      }

      // Update rolls stats
      setPlayers((prev) =>
        prev.map((p, idx) =>
          idx === activePlayerIndex
            ? {
                ...p,
                stats: {
                  ...p.stats,
                  rolls: p.stats.rolls + 1,
                  sixes: rolled === 6 ? p.stats.sixes + 1 : p.stats.sixes,
                },
              }
            : p
        )
      );

      // Check legal moves (for controlled player: own tokens or partner's in Team Up)
      const movable = getMovableTokens(controlled, rolled, players, settings.blockingRule);
      setMovableTokenIds(movable);

      if (movable.length === 0) {
        setTimeout(() => {
          advanceTurn(false);
        }, 850);
      } else if (movable.length === 1 && activePlayer.type === 'human') {
        const singleToken = controlled.tokens.find((t) => t.id === movable[0]);
        if (singleToken) {
          const dest = getDestinationCoordinate(singleToken, rolled);
          if (dest) {
            setDestinationPreview({
              row: dest.coord.row,
              col: dest.coord.col,
              tokenId: singleToken.id,
            });
          }
        }
      }
    }, 550);
  }, [isRolling, isMoving, diceValue, activePlayer, matchOver, consecutiveSixes, settings.threeConsecutiveSixRule, settings.blockingRule, players, addEvent, advanceTurn, activePlayerIndex, getControlledPlayer]);

  // Bot Turn Automation
  useEffect(() => {
    if (!activePlayer || activePlayer.type !== 'bot' || matchOver) {
      return;
    }

    const controlled = getControlledPlayer();
    if (!controlled) return;

    if (diceValue === null && !isRolling && !isMoving) {
      botTurnTimeoutRef.current = setTimeout(() => {
        handleRollDice();
      }, 700);
    } else if (diceValue !== null && !isRolling && !isMoving) {
      const movable = getMovableTokens(controlled, diceValue, players, settings.blockingRule);
      if (movable.length === 0) return;

      botTurnTimeoutRef.current = setTimeout(() => {
        const chosenTokenId = chooseBotMove(
          controlled,
          diceValue,
          players,
          settings.botDifficulty,
          settings.blockingRule
        );
        if (chosenTokenId !== null) {
          handleTokenMove(chosenTokenId, controlled.color);
        } else {
          advanceTurn(false);
        }
      }, 750);
    }

    return () => {
      if (botTurnTimeoutRef.current) {
        clearTimeout(botTurnTimeoutRef.current);
      }
    };
  }, [activePlayer, diceValue, isRolling, isMoving, matchOver, handleRollDice, handleTokenMove, players, settings.botDifficulty, settings.blockingRule, advanceTurn, getControlledPlayer]);

  // Restart match with existing settings
  const handleRestartSameMatch = () => {
    const fresh = initializePlayers(settings.playerCount, settings.mode);
    setPlayers(fresh);
    setActivePlayerIndex(0);
    setDiceValue(null);
    setIsRolling(false);
    setIsMoving(false);
    setMovableTokenIds([]);
    setConsecutiveSixes(0);
    setExtraTurnStreak(0);
    setTotalTurns(0);
    setRollHistory([]);
    setWinner(null);
    setWinningTeamName(undefined);
    setMatchOver(false);
    setNextRank(1);
    setDestinationPreview(null);
    setIsWinnerModalOpen(false);
    addEvent('Match restarted! Roll the dice.', 'roll');
  };

  // Start new game from Lobby modal
  const handleStartGame = (
    newSettings: GameSettings,
    configuredSlots: Partial<Player>[]
  ) => {
    setSettings(newSettings);
    const tokenCount = newSettings.mode === 'quick' ? 2 : 4;

    const freshPlayers: Player[] = configuredSlots.map((slot, idx) => ({
      id: `p-${idx}-${Date.now()}`,
      name: slot.name || `Player ${idx + 1}`,
      color: slot.color || 'red',
      type: slot.type || 'human',
      country: slot.country || 'India',
      flag: slot.flag || '🇮🇳',
      coins: slot.coins || 10000,
      gems: slot.gems || 100,
      avatar:
        slot.avatar ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${slot.name || idx}`,
      tokens: createInitialTokens(slot.color || 'red', tokenCount),
      hasWon: false,
      rank: null,
      teamId: slot.teamId,
      teamName: slot.teamName,
      stats: {
        rolls: 0,
        sixes: 0,
        captures: 0,
        tokensFinished: 0,
      },
      chatBubble: null,
    }));

    setPlayers(freshPlayers);
    setActivePlayerIndex(0);
    setDiceValue(null);
    setIsRolling(false);
    setIsMoving(false);
    setMovableTokenIds([]);
    setConsecutiveSixes(0);
    setExtraTurnStreak(0);
    setTotalTurns(0);
    setRollHistory([]);
    setWinner(null);
    setWinningTeamName(undefined);
    setMatchOver(false);
    setNextRank(1);
    setDestinationPreview(null);
    setIsLobbyOpen(false);
    setIsWinnerModalOpen(false);
    addEvent(`New ${newSettings.mode === '2player' ? '2-Player' : newSettings.mode === 'teams' ? 'Team Up' : 'Classic'} match initialized!`, 'roll');
  };

  // Quadrant player lookups
  const redPlayer = players.find((p) => p.color === 'red');
  const greenPlayer = players.find((p) => p.color === 'green');
  const yellowPlayer = players.find((p) => p.color === 'yellow');
  const bluePlayer = players.find((p) => p.color === 'blue');

  const redIndex = players.findIndex((p) => p.color === 'red');
  const greenIndex = players.findIndex((p) => p.color === 'green');
  const yellowIndex = players.findIndex((p) => p.color === 'yellow');
  const blueIndex = players.findIndex((p) => p.color === 'blue');

  return (
    <div className="min-h-screen bg-[#071933] text-white flex flex-col items-center justify-center p-0 sm:p-2 select-none">
      {/* Smartphone Frame Outer Shell with authentic Ludo King embossed dice background */}
      <div className="relative w-full max-w-[430px] min-h-[92vh] sm:min-h-[850px] rounded-[36px] sm:rounded-[46px] border-[8px] sm:border-[10px] border-[#0a1122] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col justify-between ludo-king-bg">
        {/* Android Teardrop Camera Notch */}
        <div className="absolute top-0 inset-x-0 h-6 z-40 flex items-center justify-center pointer-events-none">
          <div className="w-24 h-4.5 bg-[#0a1122] rounded-b-xl flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700 -mt-1" />
          </div>
        </div>

        {/* Top Header / App Utilities */}
        <div className="relative z-30 pt-4 px-3 flex items-center justify-between text-xs text-white/90 shrink-0">
          {/* Top-Left: Red/Active player coins */}
          <div className="flex items-center gap-1 bg-[#0b284f]/90 px-2 py-0.5 rounded-full border border-amber-500/30 text-[10px] font-bold text-amber-300 shadow">
            <span>🪙</span>
            <span>{(redPlayer || players[0])?.coins.toLocaleString()}</span>
          </div>

          {/* Center Title and Quick Buttons */}
          <div className="flex items-center gap-1">
            <PWAInstallButton />
            <button
              onClick={() => {
                sound.playClick();
                toggleSound();
              }}
              className="p-1 rounded-lg text-slate-300 hover:text-white bg-[#0b284f]/80 border border-slate-700 transition"
              title={settings.soundEnabled ? 'Mute' : 'Unmute'}
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setIsRulesOpen(true);
              }}
              className="p-1 rounded-lg text-slate-300 hover:text-white bg-[#0b284f]/80 border border-slate-700 transition"
              title="Official Rules & Strategies"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setIsStatsOpen(true);
              }}
              className="p-1 rounded-lg text-slate-300 hover:text-white bg-[#0b284f]/80 border border-slate-700 transition"
              title="Game Statistics"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setIsLobbyOpen(true);
              }}
              className="p-1 rounded-lg text-slate-300 hover:text-white bg-[#0b284f]/80 border border-slate-700 transition"
              title="Match Settings"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Top-Right: Green/Secondary player coins */}
          <div className="flex items-center gap-1 bg-[#0b284f]/90 px-2 py-0.5 rounded-full border border-amber-500/30 text-[10px] font-bold text-amber-300 shadow">
            <span>🪙</span>
            <span>{(greenPlayer || players[1])?.coins.toLocaleString()}</span>
          </div>
        </div>

        {/* Top Player Cards Row */}
        <div className="relative z-20 flex items-center justify-between px-2 pt-1 pb-1 shrink-0">
          {redPlayer ? (
            <PlayerCard
              player={redPlayer}
              isActive={activePlayerIndex === redIndex}
              diceValue={activePlayerIndex === redIndex ? diceValue : null}
              isRolling={isRolling}
              canRoll={activePlayerIndex === redIndex && isHumanTurn}
              onRoll={handleRollDice}
              position="top-left"
              onOpenChat={() => setIsChatOpen(true)}
            />
          ) : (
            <div className="w-[130px] sm:w-[145px]" />
          )}

          {/* Mode Pill & Game Event */}
          <div className="flex-1 px-1 text-center truncate flex flex-col items-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/15 px-2 py-0.2 rounded-full border border-amber-500/30 mb-0.5">
              {settings.mode === '2player'
                ? '⚔️ 2-Player 1v1'
                : settings.mode === 'teams'
                ? '🛡️ Team Up (2v2)'
                : settings.mode === 'quick'
                ? '⚡ Quick Mode'
                : '4-Player FFA'}
            </span>
            <span className="text-[10px] font-semibold text-slate-300 block truncate drop-shadow max-w-[140px]">
              {gameEvents[0]?.text || 'Roll the dice!'}
            </span>
          </div>

          {greenPlayer ? (
            <PlayerCard
              player={greenPlayer}
              isActive={activePlayerIndex === greenIndex}
              diceValue={activePlayerIndex === greenIndex ? diceValue : null}
              isRolling={isRolling}
              canRoll={activePlayerIndex === greenIndex && isHumanTurn}
              onRoll={handleRollDice}
              position="top-right"
              onOpenChat={() => setIsChatOpen(true)}
            />
          ) : (
            <div className="w-[130px] sm:w-[145px]" />
          )}
        </div>

        {/* Center: The Ludo Board */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-1 my-auto">
          <LudoBoard
            players={players}
            activePlayerIndex={activePlayerIndex}
            movableTokenIds={movableTokenIds}
            onTokenClick={handleTokenMove}
            isMoving={isMoving}
            destinationPreview={destinationPreview}
          />
        </div>

        {/* Bottom Player Cards Row */}
        <div className="relative z-20 flex items-center justify-between px-2 pt-1 pb-2 shrink-0">
          {bluePlayer ? (
            <PlayerCard
              player={bluePlayer}
              isActive={activePlayerIndex === blueIndex}
              diceValue={activePlayerIndex === blueIndex ? diceValue : null}
              isRolling={isRolling}
              canRoll={activePlayerIndex === blueIndex && isHumanTurn}
              onRoll={handleRollDice}
              position="bottom-left"
              onOpenChat={() => setIsChatOpen(true)}
            />
          ) : (
            <div className="w-[130px] sm:w-[145px]" />
          )}

          {/* Bottom Center Turn Hint */}
          <div className="flex-1 flex flex-col items-center justify-center px-1 text-center">
            {isHumanTurn ? (
              diceValue === null ? (
                <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 animate-pulse bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                  Tap Die to Roll
                </span>
              ) : movableTokenIds.length > 0 ? (
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-300 animate-bounce bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  Tap Token to Move
                </span>
              ) : (
                <span className="text-[10px] text-slate-400">No Legal Moves</span>
              )
            ) : (
              <span className="text-[10px] text-slate-300 animate-pulse">
                {activePlayer?.name} is thinking...
              </span>
            )}
          </div>

          {yellowPlayer ? (
            <PlayerCard
              player={yellowPlayer}
              isActive={activePlayerIndex === yellowIndex}
              diceValue={activePlayerIndex === yellowIndex ? diceValue : null}
              isRolling={isRolling}
              canRoll={activePlayerIndex === yellowIndex && isHumanTurn}
              onRoll={handleRollDice}
              position="bottom-right"
              onOpenChat={() => setIsChatOpen(true)}
            />
          ) : (
            <div className="w-[130px] sm:w-[145px]" />
          )}
        </div>

        {/* Android Gesture Bar */}
        <div className="h-4 flex items-center justify-center bg-black/40 shrink-0">
          <div className="w-28 h-1 bg-white/40 rounded-full" />
        </div>
      </div>

      {/* Modals */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      <StatsDrawer
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        players={players}
        rollHistory={rollHistory}
        totalTurns={totalTurns}
      />

      <WinnerModal
        winner={winner}
        players={players}
        isTeamMode={settings.mode === 'teams'}
        winningTeamName={winningTeamName}
        onPlayAgain={handleRestartSameMatch}
        onBackToLobby={() => {
          setIsWinnerModalOpen(false);
          setIsLobbyOpen(true);
        }}
      />

      <LobbyModal
        isOpen={isLobbyOpen}
        initialSettings={settings}
        onStartGame={handleStartGame}
      />

      <ChatEmojiModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onSendEmoji={(emojiText) => {
          const humanIdx = players.findIndex((p) => p.type === 'human');
          triggerChatBubble(humanIdx !== -1 ? humanIdx : activePlayerIndex, emojiText);
        }}
      />
    </div>
  );
}
