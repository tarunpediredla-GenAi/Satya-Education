import React from 'react';
import { BookItem } from '../types';

interface BookCoverArtProps {
  book: BookItem;
  className?: string;
  compact?: boolean;
}

const THEME_PALETTES: Record<
  BookItem['coverTheme'],
  { bg: string; spine: string; border: string; accent: string; text: string; muted: string }
> = {
  navy: {
    bg: 'bg-[#0B192C]',
    spine: 'bg-[#07101E]',
    border: 'border-[#C59B27]/40',
    accent: '#C59B27',
    text: 'text-[#FAF8F5]',
    muted: 'text-[#C59B27]',
  },
  teal: {
    bg: 'bg-[#0B4F4F]',
    spine: 'bg-[#073636]',
    border: 'border-[#E6C775]/40',
    accent: '#E6C775',
    text: 'text-[#FAF8F5]',
    muted: 'text-[#E6C775]',
  },
  ivory: {
    bg: 'bg-[#F3EDE0]',
    spine: 'bg-[#E2D9C5]',
    border: 'border-[#0B192C]/25',
    accent: '#0B192C',
    text: 'text-[#0B192C]',
    muted: 'text-[#0D6E6E]',
  },
  gold: {
    bg: 'bg-[#231B10]',
    spine: 'bg-[#171109]',
    border: 'border-[#D4AF37]/50',
    accent: '#D4AF37',
    text: 'text-[#FAF8F5]',
    muted: 'text-[#D4AF37]',
  },
  slate: {
    bg: 'bg-[#16202E]',
    spine: 'bg-[#0E151F]',
    border: 'border-[#5EEAD4]/35',
    accent: '#5EEAD4',
    text: 'text-[#FAF8F5]',
    muted: 'text-[#5EEAD4]',
  },
  burgundy: {
    bg: 'bg-[#381420]',
    spine: 'bg-[#260C15]',
    border: 'border-[#E2B86B]/45',
    accent: '#E2B86B',
    text: 'text-[#FAF8F5]',
    muted: 'text-[#E2B86B]',
  },
};

function MotifIllustration({ motif, color }: { motif: BookItem['coverMotif']; color: string }) {
  switch (motif) {
    case 'circuit':
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full opacity-85" fill="none" stroke={color} strokeWidth="1.2">
          <circle cx="60" cy="60" r="38" strokeDasharray="3 3" />
          <circle cx="60" cy="60" r="22" />
          <path d="M60 10 V38 M60 82 V110 M10 60 H38 M82 60 H110" />
          <path d="M32 32 L45 45 M75 75 L88 88 M88 32 L75 45 M45 75 L32 88" />
          <circle cx="60" cy="60" r="5" fill={color} />
          <circle cx="60" cy="10" r="3" fill={color} />
          <circle cx="60" cy="110" r="3" fill={color} />
          <circle cx="10" cy="60" r="3" fill={color} />
          <circle cx="110" cy="60" r="3" fill={color} />
        </svg>
      );
    case 'architecture':
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full opacity-85" fill="none" stroke={color} strokeWidth="1.2">
          <rect x="22" y="22" width="76" height="76" />
          <rect x="36" y="36" width="48" height="48" />
          <line x1="22" y1="22" x2="98" y2="98" />
          <line x1="98" y1="22" x2="22" y2="98" />
          <circle cx="60" cy="60" r="14" />
        </svg>
      );
    case 'neural':
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full opacity-85" fill="none" stroke={color} strokeWidth="1.2">
          <path d="M25 35 L60 25 L95 40 L85 80 L60 95 L30 75 Z" />
          <path d="M25 35 L85 80 M60 25 L60 95 M95 40 L30 75" strokeOpacity="0.6" />
          <circle cx="25" cy="35" r="4" fill={color} />
          <circle cx="60" cy="25" r="4" fill={color} />
          <circle cx="95" cy="40" r="4" fill={color} />
          <circle cx="85" cy="80" r="4" fill={color} />
          <circle cx="60" cy="95" r="4" fill={color} />
          <circle cx="30" cy="75" r="4" fill={color} />
          <circle cx="60" cy="60" r="6" fill={color} />
        </svg>
      );
    case 'database':
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full opacity-85" fill="none" stroke={color} strokeWidth="1.2">
          <ellipse cx="60" cy="32" rx="32" ry="11" />
          <path d="M28 32 V86 C28 92 42 97 60 97 C78 97 92 92 92 86 V32" />
          <path d="M28 50 C28 56 42 61 60 61 C78 61 92 56 92 50" />
          <path d="M28 68 C28 74 42 79 60 79 C78 79 92 74 92 68" />
        </svg>
      );
    case 'banyan':
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full opacity-85" fill="none" stroke={color} strokeWidth="1.2">
          <circle cx="60" cy="54" r="34" strokeDasharray="2 3" />
          <path d="M60 95 V52" strokeWidth="2" />
          <path d="M60 66 C45 56 36 44 38 32 C48 24 72 24 82 32 C84 44 75 56 60 66 Z" />
          <path d="M46 54 V88 M74 54 V88" strokeOpacity="0.65" />
          <path d="M35 95 H85" />
        </svg>
      );
    case 'constellation':
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full opacity-85" fill="none" stroke={color} strokeWidth="1.2">
          <circle cx="60" cy="60" r="42" strokeOpacity="0.4" />
          <path d="M60 14 L71 45 L104 45 L77 64 L87 96 L60 77 L33 96 L43 64 L16 45 L49 45 Z" />
          <circle cx="60" cy="60" r="4" fill={color} />
        </svg>
      );
    case 'compass':
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full opacity-85" fill="none" stroke={color} strokeWidth="1.2">
          <circle cx="60" cy="60" r="40" />
          <circle cx="60" cy="60" r="34" strokeDasharray="2 4" />
          <polygon points="60,22 68,52 98,60 68,68 60,98 52,68 22,60 52,52" />
          <circle cx="60" cy="60" r="3.5" fill={color} />
        </svg>
      );
    case 'scroll':
    default:
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full opacity-85" fill="none" stroke={color} strokeWidth="1.2">
          <rect x="30" y="22" width="60" height="76" rx="4" />
          <line x1="42" y1="40" x2="78" y2="40" />
          <line x1="42" y1="52" x2="78" y2="52" />
          <line x1="42" y1="64" x2="78" y2="64" />
          <line x1="42" y1="76" x2="64" y2="76" />
        </svg>
      );
  }
}

export const BookCoverArt: React.FC<BookCoverArtProps> = ({ book, className = '', compact = false }) => {
  const palette = THEME_PALETTES[book.coverTheme] || THEME_PALETTES.navy;

  return (
    <div
      className={`relative select-none overflow-hidden rounded-r-lg rounded-l-sm shadow-md ${palette.bg} ${palette.text} flex ${className}`}
      aria-label={`Cover of ${book.title} by ${book.author}`}
    >
      {/* Clothbound Book Spine */}
      <div className={`w-3.5 sm:w-4 shrink-0 ${palette.spine} border-r border-white/10 flex flex-col justify-between py-3 z-10`} />

      {book.imageUrl ? (
        <div className="flex-1 relative overflow-hidden">
          <img
            src={book.imageUrl}
            alt={book.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C]/90 via-[#0B192C]/25 to-transparent p-3 flex flex-col justify-end">
            <h4
              className={`font-serif-display font-semibold text-white leading-snug line-clamp-2 ${
                compact ? 'text-xs' : 'text-sm sm:text-base'
              }`}
            >
              {book.title}
            </h4>
            <p className="text-[10px] text-white/80 truncate mt-0.5">{book.author}</p>
          </div>
        </div>
      ) : (
        /* Inner Foil Frame */
        <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between relative">
          <div className={`border ${palette.border} h-full w-full p-3 sm:p-3.5 flex flex-col justify-between relative`}>
            {/* Top Kicker */}
            <div className="flex items-center justify-between text-[10px] tracking-wider uppercase opacity-80 font-mono-tabular">
              <span className="truncate">{book.subcategory}</span>
              <span>{book.publishYear}</span>
            </div>

            {/* Title & Motif */}
            <div className="my-auto py-2 flex flex-col items-center text-center">
              <div className={compact ? 'w-12 h-12 mb-2' : 'w-16 h-16 sm:w-20 sm:h-20 mb-3'}>
                <MotifIllustration motif={book.coverMotif} color={palette.accent} />
              </div>
              <h4
                className={`font-serif-display font-semibold leading-snug line-clamp-3 ${
                  compact ? 'text-xs' : 'text-sm sm:text-base'
                }`}
              >
                {book.title}
              </h4>
            </div>

            {/* Author Footer */}
            <div className="pt-2 border-t border-current/15 text-center">
              <p className={`truncate font-medium opacity-90 ${compact ? 'text-[10px]' : 'text-[11px]'}`}>
                {book.author}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
