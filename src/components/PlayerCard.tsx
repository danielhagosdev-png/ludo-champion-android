import React from 'react';
import { Player, PlayerColor } from '../types/ludo';
import { COLOR_THEMES } from '../utils/ludoBoard';
import { Gift, MessageCircle } from 'lucide-react';
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

  // Render dice pips inside player's card dice box
  const renderPips = (val: number) => {
    const isOne = val === 1;
    const pipColor = isOne ? theme.primary : '#1e293b';

    return (
      <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-1.5 gap-0.5 place-items-center">
        <div className="flex items-center justify-center w-full h-full">
          {[2, 3, 4, 5, 6].includes(val) && (
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pipColor }} />
          )}
        </div>
        <div />
        <div className="flex items-center justify-center w-full h-full">
          {[4, 5, 6].includes(val) && (
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pipColor }} />
          )}
        </div>

        <div className="flex items-center justify-center w-full h-full">
          {val === 6 && (
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pipColor }} />
          )}
        </div>
        <div className="flex items-center justify-center w-full h-full">
          {[1, 3, 5].includes(val) && (
            <div
              className={`rounded-full ${isOne ? 'w-2.5 h-2.5' : 'w-1.5 h-1.5'}`}
              style={{ backgroundColor: pipColor }}
            />
          )}
        </div>
        <div className="flex items-center justify-center w-full h-full">
          {val === 6 && (
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pipColor }} />
          )}
        </div>

        <div className="flex items-center justify-center w-full h-full">
          {[4, 5, 6].includes(val) && (
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pipColor }} />
          )}
        </div>
        <div />
        <div className="flex items-center justify-center w-full h-full">
          {[2, 3, 4, 5, 6].includes(val) && (
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pipColor }} />
          )}
        </div>
      </div>
    );
  };

  const isLeft = position === 'top-left' || position === 'bottom-left';

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Animated Speech Bubble if present */}
      <AnimatePresence>
        {player.chatBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -2, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.8 }}
            className="absolute -top-7 z-40 px-2 py-0.5 rounded-full bg-white text-slate-900 text-[11px] font-bold shadow-lg border border-slate-300 whitespace-nowrap flex items-center gap-1"
          >
            <span>{player.chatBubble.text}</span>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-slate-300" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player profile card with blue & yellow frame */}
      <div
        className={`relative rounded-xl p-1 sm:p-1.5 flex flex-col justify-between transition-all duration-300 ${
          isActive
            ? 'ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)] bg-gradient-to-b from-[#1b58a3] to-[#0e3b75]'
            : 'bg-gradient-to-b from-[#174684] to-[#0b2b56] opacity-95'
        } border-2 border-[#eab308] w-[130px] sm:w-[145px] shadow-xl`}
      >
        {/* Top Header: Country Flag, Name, and Team Badge */}
        <div className="flex items-center justify-between text-[9px] font-bold text-white px-1 pb-1 border-b border-white/10">
          <span className="flex items-center gap-1 truncate max-w-[80px]">
            <span>{player.flag}</span>
            <span className="truncate">{player.country}</span>
          </span>
          {player.teamName ? (
            <span
              className={`text-[8px] font-bold px-1 rounded truncate max-w-[55px] ${
                player.teamId === 'team_blue_green'
                  ? 'bg-sky-500/30 text-sky-200 border border-sky-400/40'
                  : 'bg-rose-500/30 text-rose-200 border border-rose-400/40'
              }`}
            >
              {player.teamName}
            </span>
          ) : (
            <span className="text-amber-300 text-[8px] font-mono">
              {player.type === 'bot' ? 'BOT' : 'YOU'}
            </span>
          )}
        </div>

        {/* Middle Section: Avatar Box + Dice Box */}
        <div className="flex items-center justify-between gap-1.5 my-1 px-0.5">
          {/* Avatar Container */}
          <div className="relative">
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-slate-900 overflow-hidden border-2 flex items-center justify-center shadow-inner ${
                isActive
                  ? 'border-emerald-400 ring-2 ring-emerald-400/50'
                  : 'border-slate-400/80'
              }`}
            >
              <img
                src={player.avatar}
                alt={player.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback avatar icon if image fails
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center font-bold text-xs text-white" style="background-color: ${theme.primary}">${player.name.charAt(0)}</div>`;
                  }
                }}
              />
            </div>

            {/* If player already won, show rank stamp badge */}
            {player.hasWon && (
              <div className="absolute inset-0 bg-black/60 rounded-lg flex flex-col items-center justify-center text-amber-300 font-black text-xs">
                <span>#{player.rank}</span>
                <span className="text-[7px] uppercase tracking-tighter">Rank</span>
              </div>
            )}
          </div>

          {/* Dice Box next to Avatar */}
          <div className="relative flex items-center">
            {/* Animated Golden Indicator Arrow pointing to Dice when it's this player's turn to roll */}
            {isActive && canRoll && !isRolling && diceValue === null && (
              <motion.div
                animate={{
                  x: isLeft ? [-2, -8, -2] : [2, 8, 2],
                  scale: [1, 1.1, 1],
                }}
                transition={{ repeat: Infinity, duration: 0.7, ease: 'easeInOut' }}
                className={`absolute z-30 pointer-events-none ${
                  isLeft ? '-right-7' : '-left-7'
                }`}
              >
                {/* 3D Golden Arrow pointing at dice */}
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  className={`drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] ${
                    isLeft ? 'rotate-180' : ''
                  }`}
                >
                  <defs>
                    <linearGradient id="goldArrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#b45309" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points="6,3 18,12 6,21 10,12"
                    fill="url(#goldArrowGrad)"
                    stroke="#78350f"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
            )}

            {/* Chat shortcut on the bottom-left player card */}
            {position === 'bottom-left' && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenChat();
                }}
                className="absolute -top-7 right-1 z-30 cursor-pointer hover:scale-110 active:scale-95 transition-transform flex flex-col items-center"
                title="Tap to Chat"
              >
                <div className="bg-white text-slate-800 rounded-full px-1.5 py-0.2 text-[9px] font-bold shadow-md border border-slate-300 flex items-center gap-0.5 animate-bounce">
                  <span>💬</span>
                </div>
                <div className="text-sm select-none drop-shadow">
                  🤹
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (isActive && canRoll && !isRolling) {
                  onRoll();
                }
              }}
              disabled={!isActive || !canRoll || isRolling}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-transform ${
                isActive && canRoll && !isRolling
                  ? 'cursor-pointer active:scale-95 ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                  : 'cursor-default'
              } border-2 border-amber-400 shadow-md`}
              style={{
                background: isActive
                  ? 'radial-gradient(circle, #fef08a 0%, #eab308 60%, #a16207 100%)'
                  : 'linear-gradient(135deg, #334155, #1e293b)',
              }}
            >
              {/* Inner White Die Face */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-white to-slate-100 shadow-inner border border-slate-300 flex items-center justify-center overflow-hidden">
                {isRolling && isActive ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.25 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    {renderPips(Math.floor(Math.random() * 6) + 1)}
                  </motion.div>
                ) : diceValue !== null && isActive ? (
                  renderPips(diceValue)
                ) : (
                  renderPips(6)
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Player Name Label */}
        <div className="text-center truncate px-1">
          <span className="text-[10px] sm:text-[11px] font-black text-white tracking-wide truncate block drop-shadow">
            {player.name}
          </span>
        </div>

        {/* Timer progress bar / dots */}
        <div className="flex items-center justify-center gap-1 my-0.5">
          {[0, 1, 2, 3, 4].map((dot) => (
            <div
              key={dot}
              className={`w-2 h-1 rounded-full transition-colors ${
                isActive
                  ? 'bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)]'
                  : 'bg-slate-600/70'
              }`}
            />
          ))}
        </div>

        {/* Gift & Chat buttons */}
        <div className="flex items-center justify-between pt-0.5 px-0.5">
          <button
            type="button"
            onClick={onOpenChat}
            className="p-1 rounded-md bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/30 transition flex items-center justify-center"
            title="Send Emoji / Chat"
          >
            <MessageCircle className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={onOpenChat}
            className="p-1 rounded-md bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/30 transition flex items-center justify-center"
            title="Send Gift"
          >
            <Gift className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Bottom Coins Counter */}
      <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-amber-300 drop-shadow">
        <span>🪙</span>
        <span>{player.coins.toLocaleString()}</span>
        {player.gems !== undefined && (
          <>
            <span className="ml-1">💎</span>
            <span className="text-sky-300">{player.gems}</span>
          </>
        )}
      </div>
    </div>
  );
};
