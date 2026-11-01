import React from 'react';
import { CourseItem } from '../types';

interface CourseCoverArtProps {
  course: CourseItem;
  className?: string;
}

const ACCENT_MAP: Record<CourseItem['accentTheme'], { bg: string; accent: string; sub: string }> = {
  navy: {
    bg: 'bg-[#0B192C]',
    accent: '#C59B27',
    sub: 'text-[#FAF8F5]/80',
  },
  teal: {
    bg: 'bg-[#0B4F4F]',
    accent: '#5EEAD4',
    sub: 'text-[#FAF8F5]/80',
  },
  gold: {
    bg: 'bg-[#1E1912]',
    accent: '#E6C775',
    sub: 'text-[#FAF8F5]/80',
  },
  slate: {
    bg: 'bg-[#152232]',
    accent: '#93C5FD',
    sub: 'text-[#FAF8F5]/80',
  },
};

export const CourseCoverArt: React.FC<CourseCoverArtProps> = ({ course, className = '' }) => {
  const style = ACCENT_MAP[course.accentTheme] || ACCENT_MAP.navy;

  return (
    <div
      className={`relative overflow-hidden ${style.bg} text-[#FAF8F5] p-6 flex flex-col justify-between select-none ${className}`}
    >
      {course.imageUrl ? (
        <>
          <img
            src={course.imageUrl}
            alt={course.title}
            className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C] via-[#0B192C]/70 to-[#0B192C]/40 pointer-events-none" />
        </>
      ) : (
        /* Architectural Grid SVG Backdrop */
        <svg
          className="absolute inset-0 w-full h-full opacity-15 pointer-events-none"
          viewBox="0 0 400 225"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id={`grid-${course.id}`} width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke={style.accent} strokeWidth="0.7" />
            </pattern>
          </defs>
          <rect width="400" height="225" fill={`url(#grid-${course.id})`} />
          <circle cx="330" cy="112" r="75" stroke={style.accent} strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx="330" cy="112" r="45" stroke={style.accent} strokeWidth="1.2" />
          <path d="M250 112 H390 M330 35 V190" stroke={style.accent} strokeWidth="1" />
        </svg>
      )}

      {/* Top Metadata Line (Zero-Pill Unboxed Text) */}
      <div className="relative z-10 flex items-center justify-between text-xs font-mono-tabular tracking-wide">
        <span style={{ color: style.accent }}>
          {course.subject} · {course.level}
        </span>
        <span className="text-[#FAF8F5]/75">{course.duration}</span>
      </div>

      {/* Course Title */}
      <div className="relative z-10 my-4">
        <h4 className="font-serif-display text-lg sm:text-xl font-semibold leading-snug text-[#FAF8F5] line-clamp-2">
          {course.title}
        </h4>
      </div>

      {/* Bottom Instructor & Recorded Lessons Info */}
      <div className="relative z-10 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
        <span className={style.sub}>{course.instructor}</span>
        <span className="font-mono-tabular text-[#FAF8F5]/90">
          {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Recorded Classes
        </span>
      </div>
    </div>
  );
};
