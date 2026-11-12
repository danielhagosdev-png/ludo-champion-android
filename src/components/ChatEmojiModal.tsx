import React from 'react';
import { X, Smile, MessageSquare } from 'lucide-react';
import { sound } from '../utils/audio';

interface ChatEmojiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendEmoji: (text: string) => void;
}

const QUICK_MESSAGES = [
  'Good Luck! 🍀',
  'Watch this! 🎲',
  'Oops! 😅',
  'Hahaha! 😂',
  'Well Played! 👏',
  'Hurry up! ⏰',
  'Gotcha! 💥',
  'GG! 🏆',
];

const EMOJIS = ['👑', '🎲', '💥', '🔥', '😎', '🤣', '🥳', '😱', '🤫', '🥺', '👍', '🎯'];

export const ChatEmojiModal: React.FC<ChatEmojiModalProps> = ({
  isOpen,
  onClose,
  onSendEmoji,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xs rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-4 text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <Smile className="w-4 h-4 text-amber-400" />
            <span>Send Quick Reaction</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Emojis Grid */}
        <div className="my-3">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Express
          </span>
          <div className="grid grid-cols-4 gap-2">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  sound.playClick();
                  onSendEmoji(emoji);
                  onClose();
                }}
                className="w-11 h-11 text-xl rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex items-center justify-center transition active:scale-90"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Phrases */}
        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-blue-400" /> Quick Messages
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK_MESSAGES.map((msg) => (
              <button
                key={msg}
                onClick={() => {
                  sound.playClick();
                  onSendEmoji(msg);
                  onClose();
                }}
                className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-left transition truncate"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
