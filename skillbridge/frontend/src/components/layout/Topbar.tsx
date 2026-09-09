import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Languages, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMobileNav } from '../../context/MobileNavContext';
import { notificationsAPI } from '../../services/api';
import { Breadcrumbs } from './Breadcrumbs';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toggleMobile } = useMobileNav();
  const [unreadCount, setUnreadCount] = useState(0);
  const [lang, setLang] = useState(localStorage.getItem('sb_lang') || 'en');

  useEffect(() => {
    notificationsAPI.get(true).then(res => {
      setUnreadCount(res.data.unreadCount || 0);
    }).catch(() => {});
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'hi' : 'en';
    setLang(nextLang);
    localStorage.setItem('sb_lang', nextLang);
    window.dispatchEvent(new Event('languageChange'));
  };

  const notifPath = `/${user?.role?.toLowerCase()}/notifications`;

  return (
    <header className="min-h-16 py-2 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-20">
      <div className="flex items-center min-w-0">
        <button
          onClick={toggleMobile}
          className="p-1.5 -ml-1 mr-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg lg:hidden transition-colors cursor-pointer flex-shrink-0"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex flex-col justify-center min-w-0">
          <div className="hidden sm:block">
            <Breadcrumbs />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{title}</h1>
            {subtitle && <span className="text-xs text-gray-400 hidden xl:inline truncate">&bull; {subtitle}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Bilingual Hindi / English Toggle */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg border border-gray-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-gray-700 transition-all cursor-pointer shadow-2xs"
          title="Toggle Platform Language (English / हिंदी)"
        >
          <Languages className="w-3.5 h-3.5 text-teal-600" />
          <span className="hidden xs:inline">{lang === 'en' ? 'English' : 'हिंदी'}</span>
          <span className="text-[10px] text-gray-400 font-mono">[{lang === 'en' ? 'EN' : 'HI'}]</span>
        </button>

        <button
          onClick={() => navigate(notifPath)}
          className="relative p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          aria-label="View notifications"
        >
          <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-navy-900 flex items-center justify-center text-white text-xs sm:text-sm font-semibold shadow-2xs">
            {user?.name?.charAt(0)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-none">{user?.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{user?.role?.charAt(0) + user?.role?.slice(1).toLowerCase()}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
