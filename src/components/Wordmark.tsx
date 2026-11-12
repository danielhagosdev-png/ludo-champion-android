import React from 'react';

// Brand mark: a faceted gem that doubles as a pawn head, set beside the name.
export const Wordmark: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'sm' }) => {
  const lg = size === 'lg';
  return (
    <div className="flex items-center gap-2">
      <svg viewBox="0 0 32 32" className={lg ? 'w-9 h-9' : 'w-6 h-6'} aria-hidden="true">
        <path d="M16 2 28 11 16 30 4 11z" fill="var(--color-ivory)" />
        <path d="M16 2 28 11H4z" fill="var(--color-ruby)" />
        <path d="M4 11h12v19z" fill="var(--color-sapphire)" />
        <path d="M28 11H16v19z" fill="var(--color-jade)" />
        <path d="M10 11 16 2l6 9-6 5z" fill="var(--color-amber)" />
      </svg>
      <span
        className={`font-display font-extrabold leading-none text-ivory ${lg ? 'text-2xl' : 'text-base'}`}
        style={{ fontStretch: '85%' }}
      >
        Ludo Champion
      </span>
    </div>
  );
};
