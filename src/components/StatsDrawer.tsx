import React from 'react';
import { Player } from '../types/ludo';
import { COLOR_THEMES } from '../utils/ludoBoard';
import { X, Dices, Swords, Trophy, BarChart2 } from 'lucide-react';

interface StatsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  rollHistory: number[];
  totalTurns: number;
}

export const StatsDrawer: React.FC<StatsDrawerProps> = ({
  isOpen,
  onClose,
  players,
  rollHistory,
  totalTurns,
}) => {
  if (!isOpen) return null;

  // Calculate dice distribution (1..6)
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  rollHistory.forEach((val) => {
    if (val >= 1 && val <= 6) {
      distribution[val] = (distribution[val] || 0) + 1;
    }
  });

  const totalRolls = rollHistory.length;
  const maxRollCount = Math.max(...Object.values(distribution), 1);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-6 text-slate-100 flex flex-col max-h-[85vh]">
        {/* Grab handle on mobile */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Match Statistics</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{totalTurns} total turns</span>
                <span>·</span>
                <span>{totalRolls} dice rolls</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* Player Breakdown */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Player Performance
            </h3>
            <div className="space-y-2">
              {players.map((player) => {
                const theme = COLOR_THEMES[player.color];
                return (
                  <div
                    key={player.id}
                    className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <div>
                        <span className="text-sm font-bold text-white flex items-center gap-1.5">
                          {player.name}
                          {player.type === 'bot' && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-slate-700 text-slate-300 font-normal">
                              BOT
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Dices className="w-3 h-3 text-amber-400" />
                            {player.stats.sixes} sixes
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Swords className="w-3 h-3 text-rose-400" />
                            {player.stats.captures} captures
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-emerald-400 flex items-center justify-end gap-1">
                        <Trophy className="w-3.5 h-3.5" />
                        {player.stats.tokensFinished} / {player.tokens.length}
                      </span>
                      <span className="text-[10px] text-slate-500 block">finished</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dice Distribution Histogram */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Dice Frequency
            </h3>
            <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
              <div className="grid grid-cols-6 gap-2 text-center">
                {[1, 2, 3, 4, 5, 6].map((num) => {
                  const count = distribution[num] || 0;
                  const pct = totalRolls > 0 ? Math.round((count / totalRolls) * 100) : 0;
                  const barHeight = Math.max(Math.round((count / maxRollCount) * 48), 4);

                  return (
                    <div key={num} className="flex flex-col items-center justify-end">
                      <span className="text-[10px] font-mono text-slate-400 mb-1">
                        {count}
                      </span>
                      <div className="w-full h-12 bg-slate-900 rounded-lg flex items-end justify-center p-1">
                        <div
                          className={`w-full rounded-md transition-all duration-500 ${
                            num === 6 ? 'bg-amber-500' : 'bg-blue-500/80'
                          }`}
                          style={{ height: `${barHeight}px` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-white mt-1.5">{num}</span>
                      <span className="text-[9px] text-slate-500">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-white text-sm transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
