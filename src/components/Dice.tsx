import React, { useState, useEffect } from 'react';
import { PlayerColor } from '../types/ludo';
import { COLOR_THEMES } from '../utils/ludoBoard';
import { sound } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';

interface DiceProps {
  value: number | null;
  isRolling: boolean;
  disabled: boolean;
  activeColor: PlayerColor;
  onRoll: () => void;
  canRoll: boolean;
  extraTurnStreak: number;
}

export const Dice: React.FC<DiceProps> = ({
  value,
  isRolling,
  disabled,
  activeColor,
  onRoll,
  canRoll,
  extraTurnStreak,
}) => {
  const [internalDisplayVal, setInternalDisplayVal] = useState<number>(value || 1);
  const [spinAngle, setSpinAngle] = useState({ x: 0, y: 0, r: 0 });

  // During rolling animation, rapidly cycle faces and spin
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRolling) {
      sound.playDiceRoll();
      setSpinAngle({
        x: Math.floor(Math.random() * 4 + 2) * 360,
        y: Math.floor(Math.random() * 4 + 2) * 360,
        r: Math.floor(Math.random() * 360),
      });

      interval = setInterval(() => {
        setInternalDisplayVal(Math.floor(Math.random() * 6) + 1);
      }, 70);
    } else if (value !== null) {
      setInternalDisplayVal(value);
      setSpinAngle({ x: 0, y: 0, r: 0 });
    }
    return () => clearInterval(interval);
  }, [isRolling, value]);

  const theme = COLOR_THEMES[activeColor];

  const handleClick = () => {
    if (!disabled && canRoll && !isRolling) {
      onRoll();
    }
  };

  // Render pips for a standard die face
  const renderPips = (val: number) => {
    const isOne = val === 1;
    const pipColor = isOne ? theme.primary : '#1e293b';

    return (
      <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-2.5 gap-1 place-items-center">
        {/* Row 1 */}
        <div className="flex items-center justify-center w-full h-full">
          {[2, 3, 4, 5, 6].includes(val) && (
            <div
              className="w-2.5 h-2.5 rounded-full shadow-inner"
              style={{ backgroundColor: pipColor }}
            />
          )}
        </div>
        <div className="flex items-center justify-center w-full h-full" />
        <div className="flex items-center justify-center w-full h-full">
          {[4, 5, 6].includes(val) && (
            <div
              className="w-2.5 h-2.5 rounded-full shadow-inner"
              style={{ backgroundColor: pipColor }}
            />
          )}
        </div>

        {/* Row 2 */}
        <div className="flex items-center justify-center w-full h-full">
          {val === 6 && (
            <div
              className="w-2.5 h-2.5 rounded-full shadow-inner"
              style={{ backgroundColor: pipColor }}
            />
          )}
        </div>
        <div className="flex items-center justify-center w-full h-full">
          {[1, 3, 5].includes(val) && (
            <div
              className={`rounded-full shadow-inner ${isOne ? 'w-4 h-4' : 'w-2.5 h-2.5'}`}
              style={{ backgroundColor: pipColor }}
            />
          )}
        </div>
        <div className="flex items-center justify-center w-full h-full">
          {val === 6 && (
            <div
              className="w-2.5 h-2.5 rounded-full shadow-inner"
              style={{ backgroundColor: pipColor }}
            />
          )}
        </div>

        {/* Row 3 */}
        <div className="flex items-center justify-center w-full h-full">
          {[4, 5, 6].includes(val) && (
            <div
              className="w-2.5 h-2.5 rounded-full shadow-inner"
              style={{ backgroundColor: pipColor }}
            />
          )}
        </div>
        <div className="flex items-center justify-center w-full h-full" />
        <div className="flex items-center justify-center w-full h-full">
          {[2, 3, 4, 5, 6].includes(val) && (
            <div
              className="w-2.5 h-2.5 rounded-full shadow-inner"
              style={{ backgroundColor: pipColor }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Turn indicator glow ring */}
      <AnimatePresence>
        {canRoll && !disabled && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.14, 1], opacity: [0.6, 0.9, 0.6] }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="absolute -inset-2 rounded-2xl pointer-events-none blur-sm"
            style={{ backgroundColor: theme.primary }}
          />
        )}
      </AnimatePresence>

      {/* The Dice interactive box */}
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={disabled || !canRoll || isRolling}
        whileHover={canRoll && !disabled ? { scale: 1.05 } : {}}
        whileTap={canRoll && !disabled ? { scale: 0.92 } : {}}
        animate={{
          rotate: isRolling ? [0, 90, 180, 270, 360] : 0,
          scale: isRolling ? [1, 1.1, 0.95, 1.05, 1] : 1,
        }}
        transition={{ duration: isRolling ? 0.6 : 0.2 }}
        className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-slate-200 border-2 shadow-xl flex items-center justify-center select-none ${
          canRoll && !disabled
            ? 'cursor-pointer border-white ring-2 ring-offset-2 ring-offset-slate-900'
            : 'cursor-not-allowed opacity-85 border-slate-300'
        }`}
        style={{
          boxShadow: canRoll
            ? `0 10px 25px -5px ${theme.shadow}, 0 4px 6px -2px rgba(0, 0, 0, 0.3)`
            : '0 4px 10px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Subtle 3D top shine */}
        <div className="absolute top-0.5 inset-x-1.5 h-3 rounded-t-xl bg-white/70 pointer-events-none" />

        {/* Die Face */}
        {renderPips(internalDisplayVal)}
      </motion.button>

      {/* Dice Value / Extra Turn Banner */}
      <div className="h-6 mt-1 flex items-center justify-center">
        {extraTurnStreak > 0 && !isRolling && (
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 whitespace-nowrap"
          >
            Extra Roll!
          </motion.span>
        )}
        {canRoll && !isRolling && extraTurnStreak === 0 && (
          <span className="text-[11px] font-medium text-slate-300 tracking-wide animate-pulse">
            TAP TO ROLL
          </span>
        )}
      </div>
    </div>
  );
};
