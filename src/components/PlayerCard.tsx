import React from 'react';
import { Player } from '../types/ludo';
import { COLOR_THEMES } from '../utils/ludoBoard';
import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
  diceValue: number | null;
  isRolling: boolean;
  canRoll: boolean;
  onRoll: () => void;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onOpenChat: () => void;
}

// Which of the 9 grid slots hold a pip for each face
const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const DieFace: React.FC<{ value: number; accent: string }> = ({ value, accent }) => (
  <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-[18%] place-items-center">
    {Array.from({ length: 9 }).map((_, slot) => (
      <span
        key={slot}
        className={`rounded-full ${value === 1 ? 'w-[130%] h-[130%]' : 'w-[78%] h-[78%]'}`}
        style={{
          backgroundColor: PIPS[value]?.includes(slot)
            ? value === 1
              ? accent
              : 'var(--color-ink)'
            : 'transparent',
        }}
      />
    ))}
  </div>
);

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isActive,
  diceValue,
  isRolling,
  canRoll,
  onRoll,
  position,
  onOpenChat,
}) => {
  const theme = COLOR_THEMES[player.color];
  const isTop = position.startsWith('top');
  const readyToRoll = isActive && canRoll && !isRolling && diceValue === null;
  const shownValue = isActive && diceValue !== null ? diceValue : 6;
  const role = player.teamName ?? (player.type === 'bot' ? 'Bot' : 'Player');

  return (
    <div className="relative flex flex-col items-center select-none">
      <AnimatePresence>
        {player.chatBubble && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute z-40 px-3 py-1 rounded-full bg-ivory text-ink text-xs font-bold shadow-raised whitespace-nowrap ${
              isTop ? '-bottom-8' : '-top-8'
            }`}
          >
            {player.chatBubble.text}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{ y: isActive ? -2 : 0, opacity: isActive ? 1 : 0.72 }}
        transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative w-[132px] sm:w-[146px] rounded-card bg-felt-800 p-2 shadow-raised"
        style={{
          border: `1.5px solid ${isActive ? theme.primary : 'var(--color-felt-600)'}`,
          boxShadow: isActive ? `0 0 0 3px ${theme.bgLight}, var(--shadow-raised)` : undefined,
        }}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Avatar */}
          <div
            className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0"
            style={{ boxShadow: `0 0 0 2px ${theme.primary}` }}
          >
            <img src={player.avatar} alt="" className="w-full h-full object-cover" />
            {player.hasWon && (
              <div className="absolute inset-0 bg-ink/75 flex items-center justify-center font-display font-extrabold text-sm text-gold">
                #{player.rank}
              </div>
            )}
          </div>

          {/* Dice */}
          <motion.button
            type="button"
            onClick={() => readyToRoll && onRoll()}
            disabled={!readyToRoll}
            aria-label={readyToRoll ? `Roll the dice for ${player.name}` : `${player.name}'s dice`}
            whileTap={readyToRoll ? { scale: 0.9, y: 2 } : undefined}
            className={`w-12 h-12 rounded-xl bg-ivory shrink-0 ${
              readyToRoll ? 'animate-beckon cursor-pointer' : isActive ? '' : 'opacity-40'
            }`}
            style={{ boxShadow: readyToRoll ? undefined : 'var(--shadow-ledge)' }}
          >
            <motion.div
              className="w-full h-full"
              animate={isRolling && isActive ? { rotate: [0, 180, 360], scale: [1, 0.85, 1] } : { rotate: 0, scale: 1 }}
              transition={isRolling && isActive ? { repeat: Infinity, duration: 0.3, ease: 'linear' } : { duration: 0.2 }}
            >
              <DieFace
                value={isRolling && isActive ? Math.floor(Math.random() * 6) + 1 : shownValue}
                accent={theme.primary}
              />
            </motion.div>
          </motion.button>
        </div>

        <div className="mt-2 flex items-end justify-between gap-1">
          <div className="min-w-0">
            <span className="block font-display font-bold text-sm leading-tight text-ivory truncate">
              {player.name}
            </span>
            <span className="block text-2xs leading-tight text-mist truncate">{role}</span>
          </div>

          {/* Tokens brought home */}
          <div
            className="flex items-center gap-[3px] shrink-0 pb-0.5"
            aria-label={`${player.tokens.filter((t) => t.isFinished).length} of ${player.tokens.length} tokens home`}
          >
            {player.tokens.map((t) => (
              <span
                key={t.id}
                className="w-2 h-2 rounded-full transition-colors duration-300"
                style={{
                  backgroundColor: t.isFinished ? theme.primary : 'transparent',
                  boxShadow: `inset 0 0 0 1.5px ${t.isFinished ? theme.primary : 'var(--color-felt-600)'}`,
                }}
              />
            ))}
          </div>
        </div>

        {player.type === 'human' && (
          <button
            type="button"
            onClick={onOpenChat}
            aria-label="Send a reaction"
            className={`absolute right-2 flex items-center justify-center w-7 h-7 rounded-full bg-felt-700 text-mist border border-felt-600 hover:text-ivory active:scale-90 transition ${
              isTop ? '-bottom-3.5' : '-top-3.5'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </button>
        )}
      </motion.div>
    </div>
  );
};
