import { PlayerColor, PlayerType } from '../types/ludo';

// Bundled avatars as inline SVG data URIs, so they work offline with no network calls.

const PALETTE: Record<PlayerColor, { bg: string; face: string; dark: string }> = {
  red: { bg: '#fb7185', face: '#ffe4e6', dark: '#9f1239' },
  green: { bg: '#34d399', face: '#d1fae5', dark: '#065f46' },
  yellow: { bg: '#fbbf24', face: '#fef3c7', dark: '#92400e' },
  blue: { bg: '#38bdf8', face: '#e0f2fe', dark: '#075985' },
};

const botSvg = (c: { bg: string; face: string; dark: string }) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="${c.bg}"/>
  <line x1="32" y1="8" x2="32" y2="16" stroke="${c.dark}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="32" cy="7" r="3.5" fill="${c.dark}"/>
  <rect x="12" y="16" width="40" height="32" rx="10" fill="${c.face}" stroke="${c.dark}" stroke-width="3"/>
  <rect x="7" y="27" width="5" height="10" rx="2" fill="${c.dark}"/>
  <rect x="52" y="27" width="5" height="10" rx="2" fill="${c.dark}"/>
  <circle cx="24" cy="30" r="5" fill="${c.dark}"/>
  <circle cx="40" cy="30" r="5" fill="${c.dark}"/>
  <circle cx="25.5" cy="28.5" r="1.6" fill="#fff"/>
  <circle cx="41.5" cy="28.5" r="1.6" fill="#fff"/>
  <rect x="23" y="39" width="18" height="4" rx="2" fill="${c.dark}"/>
  <rect x="20" y="50" width="24" height="14" rx="4" fill="${c.dark}"/>
</svg>`;

const humanSvg = (c: { bg: string; face: string; dark: string }) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="${c.bg}"/>
  <path d="M10 64c2-14 11-21 22-21s20 7 22 21z" fill="${c.dark}"/>
  <circle cx="32" cy="27" r="13" fill="${c.face}"/>
  <path d="M19 25c0-9 6-14 13-14s13 5 13 14c-4-4-9-6-13-6s-9 2-13 6z" fill="${c.dark}"/>
  <circle cx="27" cy="29" r="1.8" fill="${c.dark}"/>
  <circle cx="37" cy="29" r="1.8" fill="${c.dark}"/>
  <path d="M27.5 34c2.5 2.5 6.5 2.5 9 0" stroke="${c.dark}" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`;

export function localAvatar(color: PlayerColor, type: PlayerType): string {
  const c = PALETTE[color];
  const svg = type === 'bot' ? botSvg(c) : humanSvg(c);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}
