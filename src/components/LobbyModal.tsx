import React, { useState } from 'react';
import { GameSettings, GameMode, Player, PlayerColor, PlayerType } from '../types/ludo';
import { COLOR_THEMES } from '../utils/ludoBoard';
import { sound } from '../utils/audio';
import { User, Bot, Play, Zap, Users, Swords, ShieldCheck, X } from 'lucide-react';
import { Wordmark } from './Wordmark';

interface LobbyModalProps {
  isOpen: boolean;
  onStartGame: (settings: GameSettings, configuredPlayers: Partial<Player>[]) => void;
  initialSettings: GameSettings;
  onClose: () => void;
}

export const LobbyModal: React.FC<LobbyModalProps> = ({
  isOpen,
  onStartGame,
  initialSettings,
  onClose,
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>(initialSettings.mode || 'classic');
  const [twoPlayerPair, setTwoPlayerPair] = useState<'blue_green' | 'red_yellow'>('blue_green');
  const [botDifficulty, setBotDifficulty] = useState(initialSettings.botDifficulty);

  const [slots, setSlots] = useState<
    { color: PlayerColor; name: string; type: PlayerType }[]
  >([
    { color: 'red', name: 'Ruby', type: 'bot' },
    { color: 'green', name: 'Jade', type: 'bot' },
    { color: 'yellow', name: 'Amber', type: 'bot' },
    { color: 'blue', name: 'You', type: 'human' },
  ]);

  if (!isOpen) return null;

  const handleSlotTypeToggle = (index: number) => {
    sound.playClick();
    setSlots((prev) => {
      const next = [...prev];
      const newType = next[index].type === 'human' ? 'bot' : 'human';
      next[index] = {
        ...next[index],
        type: newType,
        name:
          newType === 'bot'
            ? `Bot ${['Alpha', 'Bravo', 'Charlie', 'Delta'][index]}`
            : `Player ${index + 1}`,
      };
      return next;
    });
  };

  const handleNameChange = (index: number, newName: string) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], name: newName };
      return next;
    });
  };

  const handleStart = () => {
    sound.playClick();

    let configuredPlayers: Partial<Player>[] = [];
    let count: 2 | 3 | 4 = 4;

    if (selectedMode === '2player') {
      count = 2;
      if (twoPlayerPair === 'blue_green') {
        const blueSlot = slots.find((s) => s.color === 'blue') || slots[3];
        const greenSlot = slots.find((s) => s.color === 'green') || slots[1];
        configuredPlayers = [blueSlot, greenSlot];
      } else {
        const redSlot = slots.find((s) => s.color === 'red') || slots[0];
        const yellowSlot = slots.find((s) => s.color === 'yellow') || slots[2];
        configuredPlayers = [redSlot, yellowSlot];
      }
    } else if (selectedMode === 'teams') {
      count = 4;
      configuredPlayers = slots.map((s) => {
        const isTeamBlueGreen = s.color === 'blue' || s.color === 'green';
        return {
          ...s,
          teamId: isTeamBlueGreen ? 'team_blue_green' : 'team_red_yellow',
          teamName: isTeamBlueGreen ? 'Blue+Green' : 'Red+Yellow',
        };
      });
    } else {
      // Classic or Quick
      count = 4;
      configuredPlayers = [...slots];
    }

    onStartGame(
      {
        ...initialSettings,
        playerCount: count,
        mode: selectedMode,
        botDifficulty,
      },
      configuredPlayers
    );
  };

  // Quick preset shortcuts
  const applyPreset = (preset: 'vsBots' | 'passPlay') => {
    sound.playClick();
    if (preset === 'vsBots') {
      setSlots([
        { color: 'red', name: 'Ruby', type: 'bot' },
        { color: 'green', name: 'Jade', type: 'bot' },
        { color: 'yellow', name: 'Amber', type: 'bot' },
        { color: 'blue', name: 'You', type: 'human' },
      ]);
    } else {
      setSlots([
        { color: 'red', name: 'Player 1', type: 'human' },
        { color: 'green', name: 'Player 2', type: 'human' },
        { color: 'yellow', name: 'Player 3', type: 'human' },
        { color: 'blue', name: 'Player 4', type: 'human' },
      ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 sheet-backdrop">
      <div className="w-full max-w-md sheet p-4 sm:p-6 text-ivory flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 shrink-0">
          <div>
            <Wordmark size="lg" />
            <p className="text-sm text-mist mt-1">Set up your match</p>
          </div>
          <button onClick={onClose} className="icon-btn" aria-label="Close and return to the board">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pb-3 shrink-0">
          <button onClick={() => applyPreset('vsBots')} className="btn btn-quiet !min-h-9 !text-xs">
            Me against bots
          </button>
          <button onClick={() => applyPreset('passPlay')} className="btn btn-quiet !min-h-9 !text-xs">
            Pass and play
          </button>
        </div>

        {/* Scrollable Configuration */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 text-xs sm:text-sm">
          {/* Game Mode Selector */}
          <div>
            <label className="field-label">
              Game mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {/* 4-Player Classic */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedMode('classic');
                }}
                aria-pressed={selectedMode === 'classic'}
                className="choice p-3 text-left flex items-start gap-2"
              >
                <div className="p-1.5 rounded-chip bg-felt-600 text-ivory shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-ivory block text-xs">Classic</span>
                  <span className="text-[10px] text-mist">Four players, everyone for themselves</span>
                </div>
              </button>

              {/* 2-Player Head-to-Head */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedMode('2player');
                }}
                aria-pressed={selectedMode === '2player'}
                className="choice p-3 text-left flex items-start gap-2"
              >
                <div className="p-1.5 rounded-chip bg-felt-600 text-ivory shrink-0">
                  <Swords className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-ivory block text-xs">One on one</span>
                  <span className="text-[10px] text-mist">Two players across the board</span>
                </div>
              </button>

              {/* Team Up Mode (2 vs 2) */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedMode('teams');
                }}
                aria-pressed={selectedMode === 'teams'}
                className="choice p-3 text-left flex items-start gap-2"
              >
                <div className="p-1.5 rounded-chip bg-felt-600 text-ivory shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-ivory block text-xs">Team up</span>
                  <span className="text-[10px] text-mist">Two against two</span>
                </div>
              </button>

              {/* Quick Match */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedMode('quick');
                }}
                aria-pressed={selectedMode === 'quick'}
                className="choice p-3 text-left flex items-start gap-2"
              >
                <div className="p-1.5 rounded-chip bg-felt-600 text-ivory shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-ivory block text-xs">Quick</span>
                  <span className="text-[10px] text-mist">Two tokens each</span>
                </div>
              </button>
            </div>
          </div>

          {/* If 2-Player mode, choose opposite color pair */}
          {selectedMode === '2player' && (
            <div className="p-3 rounded-2xl bg-felt-700/40 border border-felt-700">
              <label className="field-label">
                Colours
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTwoPlayerPair('blue_green')}
                  aria-pressed={twoPlayerPair === 'blue_green'}
                  className="choice py-2 px-2 text-xs font-bold"
                >
                  Blue vs Green
                </button>
                <button
                  type="button"
                  onClick={() => setTwoPlayerPair('red_yellow')}
                  aria-pressed={twoPlayerPair === 'red_yellow'}
                  className="choice py-2 px-2 text-xs font-bold"
                >
                  Red vs Yellow
                </button>
              </div>
            </div>
          )}

          {/* If Team Up mode, explain team synergy */}
          {selectedMode === 'teams' && (
            <div className="p-3 rounded-2xl bg-ivory/10 border border-ivory/30 text-xs text-ivory leading-relaxed">
              <strong>Team Up (2v2) Rules:</strong>
              <div className="mt-1 space-y-0.5 text-[11px] text-mist">
                • <strong>Team 1:</strong> Blue + Green &nbsp;|&nbsp; <strong>Team 2:</strong> Red + Yellow<br />
                • Both partners must bring all tokens home to win!<br />
                • You cannot capture your teammate; together you can form <strong>Team Blocks</strong>!
              </div>
            </div>
          )}

          {/* Bot Difficulty */}
          <div>
            <label className="field-label">
              Bot difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setBotDifficulty(diff);
                  }}
                  aria-pressed={botDifficulty === diff}
                  className="choice py-2 text-xs font-semibold capitalize"
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Player Lineup */}
          <div>
            <label className="field-label">
              Players
            </label>
            <div className="space-y-1.5">
              {slots.map((slot, idx) => {
                const theme = COLOR_THEMES[slot.color];
                const isIncluded =
                  selectedMode !== '2player' ||
                  (twoPlayerPair === 'blue_green'
                    ? slot.color === 'blue' || slot.color === 'green'
                    : slot.color === 'red' || slot.color === 'yellow');

                if (!isIncluded) return null;

                return (
                  <div
                    key={slot.color}
                    className="p-2 rounded-xl bg-felt-700/40 border border-felt-700 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <input
                        type="text"
                        value={slot.name}
                        onChange={(e) => handleNameChange(idx, e.target.value)}
                        className="bg-transparent text-xs font-semibold text-ivory focus:outline-none focus:ring-1 focus:ring-ivory/60 rounded px-1 py-0.5 truncate flex-1"
                        maxLength={16}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSlotTypeToggle(idx)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold border transition shrink-0 ${
                        slot.type === 'human'
                          ? 'bg-ivory border-ivory text-ink'
                          : 'bg-transparent border-felt-600 text-mist'
                      }`}
                    >
                      {slot.type === 'human' ? (
                        <>
                          <User className="w-3 h-3" />
                          <span>Human</span>
                        </>
                      ) : (
                        <>
                          <Bot className="w-3 h-3" />
                          <span>Bot</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 shrink-0">
          <button onClick={handleStart} className="btn btn-primary w-full">
            <Play className="w-4 h-4 fill-ink" />
            Start match
          </button>
        </div>
      </div>
    </div>
  );
};
