import React from 'react';
import clsx from 'clsx';

interface MatchScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function MatchScoreRing({ score, size = 'md' }: MatchScoreRingProps) {
  const sizes = { sm: { outer: 52, stroke: 4 }, md: { outer: 72, stroke: 5 }, lg: { outer: 96, stroke: 6 } };
  const { outer, stroke } = sizes[size];
  const radius = (outer - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 75 ? '#2A9D8F' : score >= 50 ? '#E9A23B' : '#C94C4C';
  const textSize = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: outer, height: outer }}>
      <svg width={outer} height={outer} className="-rotate-90">
        <circle cx={outer / 2} cy={outer / 2} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={stroke} />
        <circle
          cx={outer / 2} cy={outer / 2} r={radius} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={clsx('font-bold', textSize)} style={{ color }}>{score}%</span>
      </div>
    </div>
  );
}
