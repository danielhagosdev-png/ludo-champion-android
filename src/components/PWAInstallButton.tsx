import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-transform active:scale-95"
        title="Install Ludo as Android App"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 text-left shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white">Install Ludo Champion</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                To install on your mobile device:
                <br />
                1. Tap the <strong className="text-white">Share</strong> button in Safari toolbar.
                <br />
                2. Select <strong className="text-white">Add to Home Screen</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-semibold text-white text-sm transition"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
