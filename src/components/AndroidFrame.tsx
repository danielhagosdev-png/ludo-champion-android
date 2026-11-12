import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  HelpCircle,
  BarChart3,
  Smartphone,
  Maximize2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { sound } from '../utils/audio';

interface AndroidFrameProps {
  children: React.ReactNode;
  onOpenRules: () => void;
  onOpenStats: () => void;
  onRestartGame: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  onOpenRules,
  onOpenStats,
  onRestartGame,
  soundEnabled,
  onToggleSound,
}) => {
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('12:00');

  // Keep simulated Android clock in sync
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start md:justify-center p-0 md:p-4 transition-colors">
      {/* Top Floating Utility Bar on Desktop */}
      <div className="hidden md:flex items-center justify-between w-full max-w-4xl px-4 py-2 mb-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">Ludo Champion</span>
          <span>·</span>
          <span>Android PWA Edition</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDeviceFrameMode(!deviceFrameMode)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            {deviceFrameMode ? (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Edge-to-Edge View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android Phone View</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Container: Android Phone Simulation or Full Responsive Canvas */}
      <div
        className={`w-full transition-all duration-300 flex flex-col ${
          deviceFrameMode
            ? 'max-w-[420px] rounded-[44px] border-[10px] border-slate-800 shadow-2xl overflow-hidden bg-slate-950 ring-1 ring-slate-700 my-auto'
            : 'max-w-2xl md:max-w-4xl min-h-screen md:min-h-0 md:rounded-3xl md:border md:border-slate-800 bg-slate-950 shadow-2xl'
        }`}
      >
        {/* Android Status Bar (when frame mode is active or always on top) */}
        <div className="h-7 px-6 flex items-center justify-between text-[11px] font-semibold text-slate-400 bg-slate-950 select-none shrink-0 border-b border-slate-900">
          <span>{currentTime}</span>
          {/* Centered Camera Punch-hole in Phone Frame Mode */}
          {deviceFrameMode && (
            <div className="w-4 h-4 rounded-full bg-black border border-slate-800 shadow-inner -mt-1" />
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] tracking-tighter">5G</span>
            {/* Wi-Fi & Battery SVG icons */}
            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
              <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4zm0 2.22c3.98 0 7.6 1.55 10.3 4.1L12 18.5 1.7 10.32C4.4 7.77 8.02 6.22 12 6.22z" />
            </svg>
            <div className="w-4 h-2.5 rounded-[2px] border border-slate-400 flex items-center p-0.5">
              <div className="w-2.5 h-1.5 rounded-[1px] bg-slate-200" />
            </div>
          </div>
        </div>

        {/* Android Top App Bar */}
        <header className="h-14 px-4 flex items-center justify-between bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shrink-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-500 via-amber-500 to-emerald-500 p-0.5 flex items-center justify-center shadow">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                Ludo Champion
              </h1>
            </div>
          </div>

          {/* Quick Action Affordances */}
          <div className="flex items-center gap-1 sm:gap-2">
            <PWAInstallButton />

            <button
              onClick={() => {
                sound.playClick();
                onToggleSound();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-95"
              title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenStats();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-95"
              title="Game Statistics"
            >
              <BarChart3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenRules();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-95"
              title="Rules Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onRestartGame();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-95"
              title="New Match"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col p-2 sm:p-4">
          {children}
        </main>

        {/* Android Gesture Navigation Pill at Bottom */}
        <div className="h-6 flex items-center justify-center bg-slate-950 shrink-0 border-t border-slate-900">
          <div className="w-32 h-1 bg-slate-700/60 rounded-full" />
        </div>
      </div>
    </div>
  );
};
