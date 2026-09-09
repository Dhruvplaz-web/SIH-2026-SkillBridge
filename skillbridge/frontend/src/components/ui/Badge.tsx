import React from 'react';
import clsx from 'clsx';

type Variant = 'blue' | 'green' | 'amber' | 'red' | 'gray' | 'teal' | 'purple';

const variants: Record<Variant, string> = {
  blue: 'bg-blue-50 text-blue-700 border border-blue-100',
  green: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  amber: 'bg-amber-50 text-amber-700 border border-amber-100',
  red: 'bg-red-50 text-red-700 border border-red-100',
  gray: 'bg-gray-100 text-gray-600',
  teal: 'bg-teal-50 text-teal-700 border border-teal-100',
  purple: 'bg-purple-50 text-purple-700 border border-purple-100',
};

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'gray', children, className }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}

export function getApplicationStatusBadge(status: string) {
  const map: Record<string, Variant> = {
    APPLIED: 'blue',
    UNDER_REVIEW: 'amber',
    SHORTLISTED: 'teal',
    REJECTED: 'red',
    SELECTED: 'green',
  };
  return map[status] || 'gray';
}

export function getOpportunityTypeBadge(type: string): Variant {
  const map: Record<string, Variant> = {
    INTERNSHIP: 'teal',
    JOB: 'blue',
    TRAINING: 'purple',
  };
  return map[type] || 'gray';
}

export function getProficiencyBadge(p: string): Variant {
  const map: Record<string, Variant> = {
    BEGINNER: 'amber',
    INTERMEDIATE: 'blue',
    ADVANCED: 'green',
  };
  return map[p] || 'gray';
}
