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
import { localAvatar } from './utils/avatars';
import { loadSavedMatch, saveMatch } from './utils/savedMatch';
import { motion, AnimatePresence, useAnimationControls } from 'motion/react';
import { Wordmark } from './components/Wordmark';
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

// Default player profiles
const INITIAL_PLAYERS_DATA: Omit<Player, 'tokens' | 'hasWon' | 'rank' | 'stats'>[] = [
  {
    id: 'p1',
    name: 'Ruby',
    color: 'red',
    type: 'bot',
    country: 'Global',
    flag: '🌐',
    coins: 1000,
    avatar: localAvatar('red', 'bot'),
  },
  {
    id: 'p2',
    name: 'Jade',
    color: 'green',
    type: 'bot',
    country: 'Global',
    flag: '🌐',
    coins: 1000,
    avatar: localAvatar('green', 'bot'),
  },
  {
    id: 'p3',
    name: 'Amber',
    color: 'yellow',
    type: 'bot',
    country: 'Global',
    flag: '🌐',
    coins: 1000,
    avatar: localAvatar('yellow', 'bot'),
  },
  {
    id: 'p4',
    name: 'You',
    color: 'blue',
    type: 'human',
    country: 'Global',
    flag: '🌐',
    coins: 1000,
    gems: 50,
    avatar: localAvatar('blue', 'human'),
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
  // Resume the last match if one was saved in this browser
  const [restored] = useState(loadSavedMatch);

  const [settings, setSettings] = useState<GameSettings>(restored?.settings ?? DEFAULT_SETTINGS);
  const [players, setPlayers] = useState<Player[]>(() =>
    restored?.players ?? initializePlayers(DEFAULT_SETTINGS.playerCount, DEFAULT_SETTINGS.mode)
  );
  // Blue (bottom-left, the human player) starts first
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(() => {
    if (restored) return restored.activePlayerIndex;
    const blueIdx = INITIAL_PLAYERS_DATA.findIndex((p) => p.color === 'blue');
    return blueIdx !== -1 ? blueIdx : 0;
  });

  const [diceValue, setDiceValue] = useState<number | null>(restored?.diceValue ?? null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [movableTokenIds, setMovableTokenIds] = useState<number[]>([]);
  const [consecutiveSixes, setConsecutiveSixes] = useState<number>(restored?.consecutiveSixes ?? 0);
  const [extraTurnStreak, setExtraTurnStreak] = useState<number>(restored?.extraTurnStreak ?? 0);
  const [destinationPreview, setDestinationPreview] = useState<{
    row: number;
    col: number;
    tokenId: number;
  } | null>(null);

  const [totalTurns, setTotalTurns] = useState<number>(restored?.totalTurns ?? 0);
  const [rollHistory, setRollHistory] = useState<number[]>(restored?.rollHistory ?? []);
  const [gameEvents, setGameEvents] = useState<GameEventMessage[]>(() =>
    restored
      ? [
          { id: 'resume', text: 'Welcome back! Your match was restored.', type: 'roll', timestamp: Date.now() },
          ...restored.gameEvents.slice(0, 4),
        ]
      : [
          {
            id: 'init',
            text: 'Roll a 6 to bring a token out.',
            type: 'roll',
            timestamp: Date.now(),
          },
        ]
  );

  const [winner, setWinner] = useState<Player | null>(restored?.winner ?? null);
  const [winningTeamName, setWinningTeamName] = useState<string | undefined>(restored?.winningTeamName);
  const [matchOver, setMatchOver] = useState<boolean>(restored?.matchOver ?? false);
  const [nextRank, setNextRank] = useState<number>(restored?.nextRank ?? 1);

  // Modals
  // First launch opens on match setup; a restored match goes straight to the board
  const [isLobbyOpen, setIsLobbyOpen] = useState<boolean>(!restored);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState<boolean>(restored?.matchOver ?? false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const botTurnTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Capture feedback: burst on the board cell plus a short board shake
  const [captureFx, setCaptureFx] = useState<{
    key: number;
    row: number;
    col: number;
    color: PlayerColor;
  } | null>(null);
  const boardShake = useAnimationControls();

  useEffect(() => {
    if (!captureFx) return;
    const t = setTimeout(() => setCaptureFx(null), 900);
    return () => clearTimeout(t);
  }, [captureFx]);

  // Keep the sound engine in sync with settings (including restored ones)
  useEffect(() => {
    sound.enabled = settings.soundEnabled;
    sound.hapticsEnabled = settings.hapticsEnabled;
  }, [settings.soundEnabled, settings.hapticsEnabled]);

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
    }

    const dummyToken: Token = { ...token, step: nextStep };
    const destCoord = getTokenCoordinate(dummyToken);

    // Walk the token one cell at a time. Only the final cell triggers
    // captures, safe squares and home checks.
    const stepDelay = settings.fastAnimations ? 90 : 170;
    const pathSteps = isExitingYard
      ? []
      : Array.from({ length: nextStep - token.step - 1 }, (_, i) => token.step + 1 + i);

    pathSteps.forEach((step, i) => {
      setTimeout(() => {
        sound.playTokenStep();
        setPlayers((prev) =>
          prev.map((p) =>
            p.id !== movingPlayer.id
              ? p
              : { ...p, tokens: p.tokens.map((t) => (t.id === tokenId ? { ...t, step } : t)) }
          )
        );
      }, i * stepDelay);
    });

    const finalDelay = isExitingYard
      ? (settings.fastAnimations ? 180 : 350)
      : pathSteps.length * stepDelay;

    setTimeout(() => {
      if (!isExitingYard) sound.playTokenStep();
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
          setCaptureFx({
            key: Date.now(),
            row: destCoord.row,
            col: destCoord.col,
            color: nextPlayers[captures[0].playerIndex].color,
          });
          boardShake.start({
            x: [0, -7, 7, -5, 5, -2, 0],
            transition: { duration: 0.45, ease: 'easeOut' },
          });

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
    }, finalDelay);
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

  // Save the match whenever the board settles (not mid-roll or mid-move)
  useEffect(() => {
    if (isRolling || isMoving) return;
    saveMatch({
      version: 1,
      settings,
      players: players.map((p) => ({ ...p, chatBubble: null })),
      activePlayerIndex,
      diceValue,
      consecutiveSixes,
      extraTurnStreak,
      totalTurns,
      rollHistory: rollHistory.slice(0, 50),
      gameEvents,
      winner,
      winningTeamName,
      matchOver,
      nextRank,
    });
  }, [settings, players, activePlayerIndex, diceValue, consecutiveSixes, extraTurnStreak, totalTurns, rollHistory, gameEvents, winner, winningTeamName, matchOver, nextRank, isRolling, isMoving]);

  // If the page was reloaded after a human rolled but before they moved, restore that choice
  const resumedRollRef = useRef(false);
  useEffect(() => {
    if (resumedRollRef.current) return;
    resumedRollRef.current = true;
    if (!restored || restored.diceValue === null || matchOver) return;
    const controlled = getControlledPlayer();
    if (!controlled || activePlayer?.type !== 'human') return;
    const movable = getMovableTokens(controlled, restored.diceValue, players, settings.blockingRule);
    if (movable.length > 0) {
      setMovableTokenIds(movable);
    } else {
      advanceTurn(false);
    }
  }, [restored, matchOver, getControlledPlayer, activePlayer, players, settings.blockingRule, advanceTurn]);

  // Restart match with existing settings
  const handleRestartSameMatch = () => {
    const fresh = initializePlayers(settings.playerCount, settings.mode);
    setPlayers(fresh);
    setActivePlayerIndex(Math.max(0, fresh.findIndex((p) => p.type === 'human')));
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
      country: slot.country || 'Global',
      flag: slot.flag || '🌐',
      coins: slot.coins || 1000,
      gems: slot.gems || 50,
      avatar: slot.avatar || localAvatar(slot.color || 'red', slot.type || 'human'),
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
    // A human goes first when there is one
    setActivePlayerIndex(Math.max(0, freshPlayers.findIndex((p) => p.type === 'human')));
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
    addEvent('New match. Roll the dice to begin.', 'roll');
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

  const modeLabel =
    settings.mode === '2player'
      ? 'One on one'
      : settings.mode === 'teams'
      ? 'Team up'
      : settings.mode === 'quick'
      ? 'Quick'
      : 'Classic';

  const isYou = activePlayer?.name === 'You';
  const turnHint = matchOver
    ? 'Match over'
    : !isHumanTurn
    ? `${activePlayer?.name} is thinking…`
    : diceValue === null
    ? isYou
      ? 'Your turn. Tap the dice.'
      : `${activePlayer?.name}, tap the dice.`
    : movableTokenIds.length > 0
    ? 'Pick a token to move.'
    : 'No moves this turn.';

  return (
    <div className="min-h-dvh bg-felt-950 text-ivory flex flex-col items-center justify-center sm:p-4 select-none">
      {/* App surface: full screen on phones, a framed column on larger screens */}
      <div className="velvet relative w-full max-w-[430px] min-h-dvh sm:min-h-[820px] sm:rounded-sheet sm:border sm:border-felt-600 sm:shadow-float overflow-hidden flex flex-col">
        {/* Header */}
        <header className="relative z-30 flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
          <Wordmark />
          <div className="flex items-center gap-2">
            <PWAInstallButton />
            <button
              onClick={() => {
                sound.playClick();
                toggleSound();
              }}
              className="icon-btn"
              aria-label={settings.soundEnabled ? 'Mute sound' : 'Turn sound on'}
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setIsRulesOpen(true);
              }}
              className="icon-btn"
              aria-label="How to play"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setIsStatsOpen(true);
              }}
              className="icon-btn"
              aria-label="Match stats"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setIsLobbyOpen(true);
              }}
              className="icon-btn"
              aria-label="New match"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Top players */}
        <div className="relative z-20 flex items-center justify-between px-3 pt-2 shrink-0">
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
            <div className="w-[132px] sm:w-[146px]" />
          )}

          <div className="flex-1 min-w-0 px-2 text-center">
            <span className="block text-2xs font-semibold text-mist">{modeLabel}</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={gameEvents[0]?.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="block text-xs leading-snug text-ivory/90 line-clamp-3"
              >
                {gameEvents[0]?.text}
              </motion.span>
            </AnimatePresence>
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
            <div className="w-[132px] sm:w-[146px]" />
          )}
        </div>

        {/* Board */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-3 py-4">
          <motion.div animate={boardShake} className="w-full">
            <LudoBoard
              players={players}
              activePlayerIndex={activePlayerIndex}
              movableTokenIds={movableTokenIds}
              onTokenClick={handleTokenMove}
              isMoving={isMoving}
              destinationPreview={destinationPreview}
              captureFx={captureFx}
            />
          </motion.div>
        </div>

        {/* Bottom players */}
        <div className="relative z-20 flex items-center justify-between px-3 pb-5 shrink-0">
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
            <div className="w-[132px] sm:w-[146px]" />
          )}

          {/* Turn status: one message, coloured by whose turn it is */}
          <div className="flex-1 min-w-0 px-2 text-center" aria-live="polite">
            <motion.span
              key={turnHint}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`inline-block font-display font-bold text-sm leading-snug ${
                isHumanTurn && !matchOver ? 'text-ivory' : 'text-mist'
              }`}
            >
              {turnHint}
            </motion.span>
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
            <div className="w-[132px] sm:w-[146px]" />
          )}
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
        onClose={() => setIsLobbyOpen(false)}
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
