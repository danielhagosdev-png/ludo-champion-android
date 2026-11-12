import React, { useEffect } from 'react';
import { Player } from '../types/ludo';
import { COLOR_THEMES } from '../utils/ludoBoard';
import { sound } from '../utils/audio';
import { Trophy, RotateCcw } from 'lucide-react';
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
          colors: ['#e23d5b', '#19a67b', '#f2a31b', '#3d7ff0', '#f6cf6a'],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sheet-backdrop">
      <div className="w-full max-w-sm sheet p-6 text-ivory flex flex-col items-center text-center">
        {/* Crest: gold is used only here, for the win */}
        <div
          className="relative w-24 h-24 rounded-full bg-gold flex items-center justify-center mb-4"
          style={{ boxShadow: `0 0 0 6px ${winnerTheme.primary}, 0 0 0 10px rgb(246 207 106 / 0.25)` }}
        >
          <Trophy className="w-11 h-11 text-ink" strokeWidth={2.2} />
        </div>

        <h2 className="font-display font-extrabold text-2xl leading-tight text-ivory">
          {isTeamMode && winningTeamName ? `${winningTeamName} win` : winner.name === 'You' ? 'You win' : `${winner.name} wins`}
        </h2>
        <p className="text-sm text-mist mt-1">
          {isTeamMode ? 'Both partners brought every token home.' : 'First to bring every token home.'}
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
                    ? 'bg-felt-700 border-gold/60 text-ivory'
                    : 'bg-felt-700/40 border-felt-700 text-mist'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 font-display font-bold text-center">
                    {idx + 1}
                  </span>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <span className="font-semibold text-ivory">
                    {player.name}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-mist">
                  <span>{player.stats.captures} captures</span>
                  <span>·</span>
                  <span className="text-jade font-bold">
                    {player.stats.tokensFinished} home
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-full flex flex-col gap-3 pt-2">
          <button
            onClick={() => {
              sound.playClick();
              onPlayAgain();
            }}
            className="btn btn-primary w-full"
          >
            <RotateCcw className="w-4 h-4" />
            Play again
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onBackToLobby();
            }}
            className="btn btn-quiet w-full"
          >
            Change players or mode
          </button>
        </div>
      </div>
    </div>
  );
};
