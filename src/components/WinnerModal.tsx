import React, { useEffect } from 'react';
import { Player } from '../types/ludo';
import { COLOR_THEMES } from '../utils/ludoBoard';
import { sound } from '../utils/audio';
import { Trophy, RotateCcw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WinnerModalProps {
  winner: Player | null;
  players: Player[];
  onPlayAgain: () => void;
  onBackToLobby: () => void;
  isTeamMode?: boolean;
  winningTeamName?: string;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  winner,
  players,
  onPlayAgain,
  onBackToLobby,
  isTeamMode,
  winningTeamName,
}) => {
  useEffect(() => {
    if (winner) {
      sound.playVictory();

      // Confetti burst
      try {
        confetti({
          particleCount: 140,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
        });

        const timer = setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 400);

        return () => clearTimeout(timer);
      } catch {
        // Safe fallback if canvas-confetti context isn't available
      }
    }
  }, [winner]);

  if (!winner) return null;

  const winnerTheme = COLOR_THEMES[winner.color];

  // Rank players by tokens finished and rank
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank;
    if (a.rank) return -1;
    if (b.rank) return 1;
    return b.stats.tokensFinished - a.stats.tokensFinished;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 flex flex-col items-center text-center">
        {/* Animated Trophy Banner */}
        <div className="relative mb-3">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/20 animate-bounce"
            style={{ backgroundColor: winnerTheme.primary }}
          >
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-amber-400 text-slate-950 shadow">
            <Award className="w-4 h-4" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {isTeamMode && winningTeamName
            ? `Team ${winningTeamName} Wins!`
            : `${winner.name} Wins!`}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {isTeamMode ? 'Champions of Team Up Mode' : 'Ludo Champion of the Match'}
        </p>

        {/* Leaderboard Podiums */}
        <div className="w-full my-4 space-y-2">
          {sortedPlayers.map((player, idx) => {
            const theme = COLOR_THEMES[player.color];
            const isWinner = player.id === winner.id;

            return (
              <div
                key={player.id}
                className={`p-2.5 rounded-2xl flex items-center justify-between border text-xs ${
                  isWinner
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                    : 'bg-slate-800/40 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 font-mono font-bold text-center">
                    #{idx + 1}
                  </span>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <span className="font-semibold text-white">
                    {player.name}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-400">
                  <span>{player.stats.captures} captures</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-bold">
                    {player.stats.tokensFinished} home
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2 pt-2">
          <button
            onClick={() => {
              sound.playClick();
              onPlayAgain();
            }}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-white text-sm transition shadow-lg flex items-center justify-center gap-2 active:scale-98"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onBackToLobby();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium text-slate-300 text-xs transition"
          >
            Change Match Settings
          </button>
        </div>
      </div>
    </div>
  );
};
