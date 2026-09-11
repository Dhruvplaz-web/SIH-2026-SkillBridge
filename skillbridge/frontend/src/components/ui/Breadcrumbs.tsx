import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  customCrumbs?: Array<{ label: string; path?: string }>;
  className?: string;
}

export function Breadcrumbs({ customCrumbs, className = '' }: BreadcrumbsProps) {
  const location = useLocation();

  const generateCrumbs = () => {
    if (customCrumbs) return customCrumbs;

    const segments = location.pathname.split('/').filter(Boolean);
    const crumbs: Array<{ label: string; path?: string }> = [
      { label: 'Home', path: '/' }
    ];

    let currentPath = '';
    segments.forEach((seg, index) => {
      currentPath += `/${seg}`;
      const isLast = index === segments.length - 1;
      
      const formatted = seg
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());

      crumbs.push({
        label: formatted,
        path: isLast ? undefined : currentPath
      });
    });

    return crumbs;
  };

  const crumbs = generateCrumbs();

  // JSON-LD BreadcrumbList Schema
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': crumb.label,
      'item': crumb.path ? `https://skillsetu.gov.in${crumb.path}` : undefined
    }))
  };

  return (
    <nav aria-label="Breadcrumb" className={`text-xs ${className}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      <ol className="flex items-center gap-1.5 flex-wrap text-gray-500">
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />}
              {idx === 0 && <Home className="w-3.5 h-3.5 text-gray-400 mr-0.5" />}
              {crumb.path && !isLast ? (
                <Link
                  to={crumb.path}
                  className="hover:text-teal-600 transition-colors font-medium text-gray-600"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-semibold text-gray-900" aria-current="page">
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
