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
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-jade hover:bg-jade text-ivory shadow-sm transition-transform active:scale-95"
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
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-felt-700 hover:bg-felt-600 text-ivory border border-felt-600 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-felt-800 border border-felt-700 p-6 text-left shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-ivory">Install Ludo Champion</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-mist hover:text-ivory"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-mist leading-relaxed mb-4">
                To install on your mobile device:
                <br />
                1. Tap the <strong className="text-ivory">Share</strong> button in Safari toolbar.
                <br />
                2. Select <strong className="text-ivory">Add to Home Screen</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-jade hover:bg-jade font-semibold text-ivory text-sm transition"
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
