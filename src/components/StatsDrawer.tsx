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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 sheet-backdrop">
      <div className="w-full max-w-md sheet p-5 sm:p-6 text-ivory flex flex-col max-h-[85vh]">
        {/* Grab handle on mobile */}
        <div className="w-12 h-1.5 bg-felt-600 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-felt-700">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sapphire/10 text-sapphire">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ivory">Match Statistics</h2>
              <div className="flex items-center gap-2 text-xs text-mist">
                <span>{totalTurns} total turns</span>
                <span>·</span>
                <span>{totalRolls} dice rolls</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-mist hover:text-ivory hover:bg-felt-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* Player Breakdown */}
          <div>
            <h3 className="text-xs font-semibold text-mist mb-2.5">
              Player Performance
            </h3>
            <div className="space-y-2">
              {players.map((player) => {
                const theme = COLOR_THEMES[player.color];
                return (
                  <div
                    key={player.id}
                    className="p-3 rounded-2xl bg-felt-700/40 border border-felt-700 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <div>
                        <span className="text-sm font-bold text-ivory flex items-center gap-1.5">
                          {player.name}
                          {player.type === 'bot' && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-felt-600 text-mist font-normal">
                              BOT
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-3 text-xs text-mist mt-0.5">
                          <span className="flex items-center gap-1">
                            <Dices className="w-3 h-3 text-ivory" />
                            {player.stats.sixes} sixes
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Swords className="w-3 h-3 text-ruby" />
                            {player.stats.captures} captures
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-jade flex items-center justify-end gap-1">
                        <Trophy className="w-3.5 h-3.5" />
                        {player.stats.tokensFinished} / {player.tokens.length}
                      </span>
                      <span className="text-[10px] text-mist-dim block">finished</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dice Distribution Histogram */}
          <div>
            <h3 className="text-xs font-semibold text-mist mb-2.5">
              Dice Frequency
            </h3>
            <div className="p-3 rounded-2xl bg-felt-700/40 border border-felt-700">
              <div className="grid grid-cols-6 gap-2 text-center">
                {[1, 2, 3, 4, 5, 6].map((num) => {
                  const count = distribution[num] || 0;
                  const pct = totalRolls > 0 ? Math.round((count / totalRolls) * 100) : 0;
                  const barHeight = Math.max(Math.round((count / maxRollCount) * 48), 4);

                  return (
                    <div key={num} className="flex flex-col items-center justify-end">
                      <span className="text-[10px] font-mono text-mist mb-1">
                        {count}
                      </span>
                      <div className="w-full h-12 bg-felt-800 rounded-lg flex items-end justify-center p-1">
                        <div
                          className={`w-full rounded-md transition-all duration-500 ${
                            num === 6 ? 'bg-ivory' : 'bg-sapphire/80'
                          }`}
                          style={{ height: `${barHeight}px` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-ivory mt-1.5">{num}</span>
                      <span className="text-[9px] text-mist-dim">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-felt-700">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-felt-700 hover:bg-felt-600 font-semibold text-ivory text-sm transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
