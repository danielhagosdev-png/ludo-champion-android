import React, { useState } from 'react';
import { GameSettings, GameMode, Player, PlayerColor, PlayerType } from '../types/ludo';
import { COLOR_THEMES } from '../utils/ludoBoard';
import { sound } from '../utils/audio';
import { User, Bot, Play, Zap, Users, Swords, Sparkles, ShieldCheck } from 'lucide-react';

interface LobbyModalProps {
  isOpen: boolean;
  onStartGame: (settings: GameSettings, configuredPlayers: Partial<Player>[]) => void;
  initialSettings: GameSettings;
}

export const LobbyModal: React.FC<LobbyModalProps> = ({
  isOpen,
  onStartGame,
  initialSettings,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-4 sm:p-6 text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 p-0.5 flex items-center justify-center shadow">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ludo Match Setup</h2>
              <p className="text-xs text-slate-400">Choose game mode &amp; opponents</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => applyPreset('vsBots')}
              className="text-[11px] font-medium px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              vs Bots
            </button>
            <button
              onClick={() => applyPreset('passPlay')}
              className="text-[11px] font-medium px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              Pass &amp; Play
            </button>
          </div>
        </div>

        {/* Scrollable Configuration */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 text-xs sm:text-sm">
          {/* Game Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Game Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {/* 4-Player Classic */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedMode('classic');
                }}
                className={`p-2.5 rounded-2xl border text-left transition flex items-start gap-2 ${
                  selectedMode === 'classic'
                    ? 'bg-blue-500/15 border-blue-500/60 text-blue-200'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="p-1 rounded-lg bg-blue-500/20 text-blue-400 shrink-0 mt-0.5">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-white block text-xs">4-Player FFA</span>
                  <span className="text-[10px] text-slate-400">Free-for-all tournament</span>
                </div>
              </button>

              {/* 2-Player Head-to-Head */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedMode('2player');
                }}
                className={`p-2.5 rounded-2xl border text-left transition flex items-start gap-2 ${
                  selectedMode === '2player'
                    ? 'bg-rose-500/15 border-rose-500/60 text-rose-200'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="p-1 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
                  <Swords className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-white block text-xs">2-Player 1v1</span>
                  <span className="text-[10px] text-slate-400">Fast &amp; direct battle</span>
                </div>
              </button>

              {/* Team Up Mode (2 vs 2) */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedMode('teams');
                }}
                className={`p-2.5 rounded-2xl border text-left transition flex items-start gap-2 ${
                  selectedMode === 'teams'
                    ? 'bg-amber-500/15 border-amber-500/60 text-amber-200'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-white block text-xs">Team Up (2v2)</span>
                  <span className="text-[10px] text-slate-400">Blue+Green vs Red+Yellow</span>
                </div>
              </button>

              {/* Quick Match */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedMode('quick');
                }}
                className={`p-2.5 rounded-2xl border text-left transition flex items-start gap-2 ${
                  selectedMode === 'quick'
                    ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-200'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-white block text-xs">Quick Mode</span>
                  <span className="text-[10px] text-slate-400">2 tokens each · snappy</span>
                </div>
              </button>
            </div>
          </div>

          {/* If 2-Player mode, choose opposite color pair */}
          {selectedMode === '2player' && (
            <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                2-Player Opposite Colors
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTwoPlayerPair('blue_green')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition ${
                    twoPlayerPair === 'blue_green'
                      ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  Blue vs Green
                </button>
                <button
                  type="button"
                  onClick={() => setTwoPlayerPair('red_yellow')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition ${
                    twoPlayerPair === 'red_yellow'
                      ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  Red vs Yellow
                </button>
              </div>
            </div>
          )}

          {/* If Team Up mode, explain team synergy */}
          {selectedMode === 'teams' && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
              <strong>Team Up (2v2) Rules:</strong>
              <div className="mt-1 space-y-0.5 text-[11px] text-slate-300">
                • <strong>Team 1:</strong> Blue + Green &nbsp;|&nbsp; <strong>Team 2:</strong> Red + Yellow<br />
                • Both partners must bring all tokens home to win!<br />
                • You cannot capture your teammate; together you can form <strong>Team Blocks</strong>!
              </div>
            </div>
          )}

          {/* Bot Difficulty */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Bot AI Difficulty
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
                  className={`py-1.5 rounded-xl text-xs font-semibold capitalize border transition ${
                    botDifficulty === diff
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-800/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Player Lineup */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Player Lineup
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
                    className="p-2 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between gap-2"
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
                        className="bg-transparent text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-emerald-400/50 rounded px-1 py-0.5 truncate flex-1"
                        maxLength={16}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSlotTypeToggle(idx)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold border transition shrink-0 ${
                        slot.type === 'human'
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                          : 'bg-purple-500/15 border-purple-500/40 text-purple-300'
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
        <div className="pt-3 border-t border-slate-800 shrink-0">
          <button
            onClick={handleStart}
            className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-bold text-white text-sm transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-98"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start {selectedMode === '2player' ? '2-Player Match' : selectedMode === 'teams' ? 'Team Up Match' : 'Match'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
