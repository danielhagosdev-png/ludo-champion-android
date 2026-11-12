import React from 'react';
import { Player, PlayerColor, Token } from '../types/ludo';
import {
  getTokenCoordinate,
  STAR_COORDS,
  COLOR_THEMES,
  getBlockAtCoordinate,
} from '../utils/ludoBoard';
import { Trophy, Star, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

interface LudoBoardProps {
  players: Player[];
  activePlayerIndex: number;
  movableTokenIds: number[];
  onTokenClick: (tokenId: number, tokenColor?: PlayerColor) => void;
  isMoving: boolean;
  destinationPreview: { row: number; col: number; tokenId: number } | null;
}

export const LudoBoard: React.FC<LudoBoardProps> = ({
  players,
  activePlayerIndex,
  movableTokenIds,
  onTokenClick,
  isMoving,
  destinationPreview,
}) => {
  const activePlayer = players[activePlayerIndex];
  const activePlayerAllHome = activePlayer ? activePlayer.tokens.every((t) => t.isFinished) : false;

  // Map tokens to coordinates for quick lookup
  const tokenPositionMap = new Map<string, { player: Player; token: Token; isMovable: boolean }[]>();

  players.forEach((player, pIdx) => {
    player.tokens.forEach((token) => {
      const coord = getTokenCoordinate(token);
      const key = `${coord.row}-${coord.col}`;
      
      const isPlayerTurn = pIdx === activePlayerIndex;
      const isTeammateTurn = Boolean(
        !isPlayerTurn &&
        activePlayer?.teamId &&
        player.teamId === activePlayer.teamId &&
        activePlayerAllHome
      );

      const isMovable: boolean = Boolean(
        (isPlayerTurn || isTeammateTurn) &&
        movableTokenIds.includes(token.id) &&
        !isMoving
      );

      if (!tokenPositionMap.has(key)) {
        tokenPositionMap.set(key, []);
      }
      tokenPositionMap.get(key)!.push({ player, token, isMovable });
    });
  });

  const isStarSquare = (r: number, c: number) => {
    return STAR_COORDS.some((sc) => sc.row === r && sc.col === c);
  };

  // Render a 3D pin-style pawn token
  const renderPawnToken = (
    player: Player,
    token: Token,
    isMovable: boolean,
    sizeClasses = 'w-6 h-7 sm:w-7 sm:h-8',
    stackOffset = 0
  ) => {
    const theme = COLOR_THEMES[player.color];

    return (
      <motion.button
        key={`${player.color}-${token.id}`}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (isMovable) {
            onTokenClick(token.id, player.color);
          }
        }}
        disabled={!isMovable}
        whileHover={isMovable ? { scale: 1.25, zIndex: 40 } : {}}
        whileTap={isMovable ? { scale: 0.95 } : {}}
        initial={{ scale: 1.2, y: -6 }}
        animate={{
          scale: 1,
          y: isMovable ? [0, -5, 0] : 0,
        }}
        transition={{
          y: isMovable
            ? { repeat: Infinity, duration: 1.0, ease: 'easeInOut' }
            : { duration: 0.2 },
        }}
        className={`relative flex flex-col items-center justify-center select-none ${sizeClasses} ${
          isMovable
            ? 'animate-token-movable cursor-pointer z-30 drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]'
            : 'cursor-default drop-shadow-md'
        }`}
        style={{
          marginLeft: stackOffset > 0 ? `-${stackOffset * 5}px` : undefined,
        }}
      >
        {/* Map-pin pawn SVG */}
        <svg viewBox="0 0 32 40" className="w-full h-full filter drop-shadow">
          <defs>
            <radialGradient id={`grad-${player.color}-${token.id}`} cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor={theme.primaryLight} />
              <stop offset="60%" stopColor={theme.primary} />
              <stop offset="100%" stopColor={theme.primaryDark} />
            </radialGradient>
            <linearGradient id="silver-rim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>

          {/* Soft contact shadow at base */}
          <ellipse cx="16" cy="37" rx="11" ry="3" fill="#000000" opacity="0.4" />

          {/* Metallic base ring */}
          <ellipse cx="16" cy="34" rx="10" ry="3.5" fill="url(#silver-rim)" stroke="#1e293b" strokeWidth="0.8" />
          <ellipse cx="16" cy="33.5" rx="8" ry="2.5" fill={theme.primaryDark} />

          {/* Main Pin Body */}
          <path
            d="M8,16 C8,26 16,33 16,33 C16,33 24,26 24,16 C24,9 20,4 16,4 C12,4 8,9 8,16 Z"
            fill={`url(#grad-${player.color}-${token.id})`}
            stroke="#ffffff"
            strokeWidth="1.2"
          />

          {/* Glossy Head Cap */}
          <circle cx="16" cy="14" r="5" fill="#ffffff" opacity="0.9" />
          <circle cx="16" cy="14" r="3.5" fill={theme.primary} />
          <circle cx="14.5" cy="12.5" r="1.2" fill="#ffffff" />
        </svg>
      </motion.button>
    );
  };

  // Render Yard Quadrant (Corner Base)
  const renderYard = (color: PlayerColor, title: string) => {
    const theme = COLOR_THEMES[color];
    const player = players.find((p) => p.color === color);
    const tokensInYard = player ? player.tokens.filter((t) => t.step === -1) : [];
    const isPlayerActive = activePlayer?.color === color;

    return (
      <div
        className={`relative w-full h-full p-2 rounded-2xl flex flex-col justify-center items-center shadow-lg transition-all duration-300 ${
          isPlayerActive ? 'ring-2 ring-white/90 shadow-2xl' : ''
        }`}
        style={{
          background: `linear-gradient(135deg, ${theme.primaryLight} 0%, ${theme.primary} 60%, ${theme.primaryDark} 100%)`,
        }}
      >
        {/* White Inner Home Arena with 4 circular token nests */}
        <div className="w-[85%] h-[85%] bg-white rounded-2xl shadow-inner border-2 border-slate-300 flex items-center justify-center p-2">
          <div className="grid grid-cols-2 grid-rows-2 gap-2 sm:gap-3 place-items-center w-full h-full">
            {[0, 1, 2, 3].map((slotIdx) => {
              const tokenAtSlot = tokensInYard.find((t) => t.id === slotIdx);
              const isMovable =
                tokenAtSlot &&
                activePlayer?.color === color &&
                movableTokenIds.includes(tokenAtSlot.id) &&
                !isMoving;

              return (
                <div
                  key={slotIdx}
                  className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-inner relative"
                  style={{
                    backgroundColor: theme.bgLight,
                    border: `2px solid ${theme.border}`,
                  }}
                >
                  {tokenAtSlot && player && (
                    renderPawnToken(player, tokenAtSlot, !!isMovable, 'w-6 h-7 sm:w-7 sm:h-8')
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render a single track square (r, c)
  const renderTrackCell = (r: number, c: number) => {
    const key = `${r}-${c}`;
    const tokensHere = tokenPositionMap.get(key) || [];
    const isStar = isStarSquare(r, c);

    // Starting squares
    const isRedStart = r === 6 && c === 1;
    const isGreenStart = r === 1 && c === 8;
    const isYellowStart = r === 8 && c === 13;
    const isBlueStart = r === 13 && c === 6;

    // Home columns
    const isRedHomePath = r === 7 && c >= 1 && c <= 5;
    const isGreenHomePath = c === 7 && r >= 1 && r <= 5;
    const isYellowHomePath = r === 7 && c >= 9 && c <= 13;
    const isBlueHomePath = c === 7 && r >= 9 && r <= 13;

    // Check for Block (2+ tokens of same color)
    const blockCheck = getBlockAtCoordinate({ row: r, col: c }, players);

    // Determine cell background styling
    let cellBg = 'bg-white';
    let cellBorder = 'border-slate-300';
    let cellGlow = '';

    if (isRedStart || isRedHomePath) {
      cellBg = 'bg-[#e11d48] text-white';
      cellBorder = 'border-rose-600';
    } else if (isGreenStart || isGreenHomePath) {
      cellBg = 'bg-[#10b981] text-white';
      cellBorder = 'border-emerald-600';
    } else if (isYellowStart || isYellowHomePath) {
      cellBg = 'bg-[#f59e0b] text-slate-950';
      cellBorder = 'border-amber-600';
    } else if (isBlueStart || isBlueHomePath) {
      cellBg = 'bg-[#0284c7] text-white';
      cellBorder = 'border-sky-600';
    } else if (isStar) {
      cellBg = 'bg-slate-50';
      cellBorder = 'border-slate-300';
    }

    // Destination preview highlight
    const isDestination =
      destinationPreview &&
      destinationPreview.row === r &&
      destinationPreview.col === c;

    if (isDestination) {
      cellGlow = 'ring-2 ring-emerald-500 ring-offset-1 z-20';
    }

    return (
      <div
        key={key}
        className={`relative border flex items-center justify-center transition-colors select-none ${cellBg} ${cellBorder} ${cellGlow}`}
      >
        {/* Star Icon for safe squares */}
        {(isStar || isRedStart || isGreenStart || isYellowStart || isBlueStart) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80">
            <Star
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                isStar
                  ? 'stroke-slate-500 fill-none'
                  : 'fill-white/80 stroke-white/90'
              }`}
            />
          </div>
        )}

        {/* Home Entrance Arrows */}
        {r === 7 && c === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-0 h-0 border-y-[5px] border-y-transparent border-l-[8px] border-l-rose-500" />
          </div>
        )}
        {r === 0 && c === 7 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-0 h-0 border-x-[5px] border-x-transparent border-t-[8px] border-t-emerald-500" />
          </div>
        )}
        {r === 7 && c === 14 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-0 h-0 border-y-[5px] border-y-transparent border-r-[8px] border-r-amber-500" />
          </div>
        )}
        {r === 14 && c === 7 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-0 h-0 border-x-[5px] border-x-transparent border-b-[8px] border-b-sky-500" />
          </div>
        )}

        {/* Blockade Shield Badge if blocked */}
        {blockCheck.isBlocked && (
          <div className="absolute -top-1.5 -right-1.5 z-30 p-0.5 rounded-full bg-slate-900 border border-amber-400 text-amber-300 shadow">
            <ShieldAlert className="w-2.5 h-2.5" />
          </div>
        )}

        {/* Tokens occupying this square */}
        {tokensHere.length > 0 && (
          <div className="relative z-10 flex items-center justify-center w-full h-full">
            {tokensHere.length === 1 ? (
              renderPawnToken(
                tokensHere[0].player,
                tokensHere[0].token,
                tokensHere[0].isMovable,
                'w-5 h-6 sm:w-6 sm:h-7'
              )
            ) : (
              // Multiple tokens (Blockade or shared star square)
              <div className="relative flex items-center justify-center">
                {tokensHere.map((item, idx) => (
                  <div key={idx} style={{ zIndex: 10 + idx }}>
                    {renderPawnToken(
                      item.player,
                      item.token,
                      item.isMovable,
                      'w-4 h-5 sm:w-5 sm:h-6',
                      idx
                    )}
                  </div>
                ))}
                <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-slate-950 text-[8px] font-black text-amber-300 border border-amber-400/80 pointer-events-none z-30 shadow">
                  {tokensHere.length}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Center Home Finishing Triangles (rows 6..8, cols 6..8)
  const renderCenterArea = () => {
    const finishedByColor: Record<PlayerColor, number> = {
      red: players.find((p) => p.color === 'red')?.tokens.filter((t) => t.isFinished).length || 0,
      green: players.find((p) => p.color === 'green')?.tokens.filter((t) => t.isFinished).length || 0,
      yellow: players.find((p) => p.color === 'yellow')?.tokens.filter((t) => t.isFinished).length || 0,
      blue: players.find((p) => p.color === 'blue')?.tokens.filter((t) => t.isFinished).length || 0,
    };

    return (
      <div className="relative w-full h-full bg-slate-900 border border-slate-600 overflow-hidden flex items-center justify-center shadow-inner">
        {/* SVG Triangles meeting in center */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          {/* Top Triangle: Green */}
          <polygon points="0,0 100,0 50,50" fill={COLOR_THEMES.green.primary} stroke="#059669" strokeWidth="1" />
          {/* Right Triangle: Yellow */}
          <polygon points="100,0 100,100 50,50" fill={COLOR_THEMES.yellow.primary} stroke="#d97706" strokeWidth="1" />
          {/* Bottom Triangle: Blue */}
          <polygon points="100,100 0,100 50,50" fill={COLOR_THEMES.blue.primary} stroke="#0284c7" strokeWidth="1" />
          {/* Left Triangle: Red */}
          <polygon points="0,100 0,0 50,50" fill={COLOR_THEMES.red.primary} stroke="#be123c" strokeWidth="1" />
        </svg>

        {/* Finished counts inside triangles */}
        <span className="absolute top-1 inset-x-0 text-center text-[9px] font-black text-white drop-shadow">
          {finishedByColor.green > 0 ? `✓${finishedByColor.green}` : ''}
        </span>
        <span className="absolute right-1 inset-y-0 flex items-center text-[9px] font-black text-slate-950 drop-shadow">
          {finishedByColor.yellow > 0 ? `✓${finishedByColor.yellow}` : ''}
        </span>
        <span className="absolute bottom-1 inset-x-0 text-center text-[9px] font-black text-white drop-shadow">
          {finishedByColor.blue > 0 ? `✓${finishedByColor.blue}` : ''}
        </span>
        <span className="absolute left-1 inset-y-0 flex items-center text-[9px] font-black text-white drop-shadow">
          {finishedByColor.red > 0 ? `✓${finishedByColor.red}` : ''}
        </span>

        {/* Center Golden Trophy */}
        <div className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 border-2 border-white shadow-lg flex items-center justify-center">
          <Trophy className="w-4 h-4 text-slate-900" />
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-square mx-auto p-1.5 sm:p-2 rounded-2xl bg-white border-4 border-[#07244c] shadow-2xl flex flex-col justify-center">
      {/* 15x15 Ludo Board Grid */}
      <div className="w-full h-full grid grid-cols-15 grid-rows-15 rounded-xl overflow-hidden bg-white border border-slate-400">
        {/* Quadrant 1: Red Yard (Top-Left, 6x6) */}
        <div className="col-span-6 row-span-6">
          {renderYard('red', 'Red')}
        </div>

        {/* Top Arm Track (cols 6..8, rows 0..5) */}
        <div className="col-span-3 row-span-6 grid grid-cols-3 grid-rows-6">
          {Array.from({ length: 6 }).flatMap((_, r) =>
            [6, 7, 8].map((c) => renderTrackCell(r, c))
          )}
        </div>

        {/* Quadrant 2: Green Yard (Top-Right, 6x6) */}
        <div className="col-span-6 row-span-6">
          {renderYard('green', 'Green')}
        </div>

        {/* Left Arm Track (cols 0..5, rows 6..8) */}
        <div className="col-span-6 row-span-3 grid grid-cols-6 grid-rows-3">
          {[6, 7, 8].flatMap((r) =>
            Array.from({ length: 6 }).map((_, c) => renderTrackCell(r, c))
          )}
        </div>

        {/* Center Triangular Home (cols 6..8, rows 6..8, 3x3) */}
        <div className="col-span-3 row-span-3">
          {renderCenterArea()}
        </div>

        {/* Right Arm Track (cols 9..14, rows 6..8) */}
        <div className="col-span-6 row-span-3 grid grid-cols-6 grid-rows-3">
          {[6, 7, 8].flatMap((r) =>
            [9, 10, 11, 12, 13, 14].map((c) => renderTrackCell(r, c))
          )}
        </div>

        {/* Quadrant 3: Blue Yard (Bottom-Left, 6x6) */}
        <div className="col-span-6 row-span-6">
          {renderYard('blue', 'Blue')}
        </div>

        {/* Bottom Arm Track (cols 6..8, rows 9..14) */}
        <div className="col-span-3 row-span-6 grid grid-cols-3 grid-rows-6">
          {[9, 10, 11, 12, 13, 14].flatMap((r) =>
            [6, 7, 8].map((c) => renderTrackCell(r, c))
          )}
        </div>

        {/* Quadrant 4: Yellow Yard (Bottom-Right, 6x6) */}
        <div className="col-span-6 row-span-6">
          {renderYard('yellow', 'Yellow')}
        </div>
      </div>
    </div>
  );
};
