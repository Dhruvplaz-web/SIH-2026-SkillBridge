import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMobileNav } from '../../context/MobileNavContext';
import clsx from 'clsx';
import {
  LayoutDashboard, Star, Lightbulb, Briefcase, FileText,
  BookOpen, FolderOpen, Users, LogOut, ChevronLeft, ChevronRight,
  PlusCircle, BarChart2, Bell, MessageSquare, GraduationCap, ShieldCheck,
  Sparkles, Calendar, Handshake, Award, X
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const studentNav: NavItem[] = [
  { label: 'Dashboard', path: '/student', icon: LayoutDashboard },
  { label: 'Competency Matrix', path: '/student/skills', icon: Star },
  { label: 'Skill Assessments', path: '/student/assessment', icon: Award },
  { label: 'Career Stepper', path: '/student/recommendations', icon: Lightbulb },
  { label: 'Opportunities & Bounties', path: '/student/opportunities', icon: Briefcase },
  { label: 'Applications', path: '/student/applications', icon: FileText },
  { label: 'Learning Hub', path: '/student/learning', icon: BookOpen },
  { label: 'Verifiable Portfolio', path: '/student/portfolio', icon: FolderOpen },
  { label: 'Onboarding Wizard', path: '/student/onboarding', icon: Sparkles },
  { label: 'Mentorship', path: '/student/mentorship', icon: MessageSquare },
  { label: 'Notifications', path: '/student/notifications', icon: Bell },
];

const recruiterNav: NavItem[] = [
  { label: 'Dashboard', path: '/recruiter', icon: LayoutDashboard },
  { label: 'Applications', path: '/recruiter/applications', icon: FileText },
  { label: 'Post Opportunity', path: '/recruiter/post', icon: PlusCircle },
  { label: 'Campus Interviews', path: '/recruiter/interviews', icon: Calendar },
  { label: 'Mentorship', path: '/recruiter/mentorship', icon: MessageSquare },
  { label: 'Analytics', path: '/recruiter/analytics', icon: BarChart2 },
  { label: 'Notifications', path: '/recruiter/notifications', icon: Bell },
];

const academicianNav: NavItem[] = [
  { label: 'Dashboard', path: '/academician', icon: LayoutDashboard },
  { label: 'Corporate R&D Bids', path: '/academician/consultancies', icon: Handshake },
  { label: 'Students', path: '/academician/students', icon: GraduationCap },
  { label: 'Training Programs', path: '/academician/training', icon: BookOpen },
  { label: 'Mentorship', path: '/academician/mentorship', icon: MessageSquare },
  { label: 'Analytics', path: '/academician/analytics', icon: BarChart2 },
  { label: 'Notifications', path: '/academician/notifications', icon: Bell },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Opportunities', path: '/admin/opportunities', icon: Briefcase },
  { label: 'Applications', path: '/admin/applications', icon: FileText },
  { label: 'Training', path: '/admin/training', icon: BookOpen },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
  { label: 'Notifications', path: '/admin/notifications', icon: Bell },
];

const navByRole: Record<string, NavItem[]> = {
  STUDENT: studentNav,
  RECRUITER: recruiterNav,
  ACADEMICIAN: academicianNav,
  ADMIN: adminNav,
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useMobileNav();

  const nav = navByRole[user?.role || 'STUDENT'] || studentNav;

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate('/login');
  };

  const roleColors: Record<string, string> = {
    STUDENT: 'bg-teal-500',
    RECRUITER: 'bg-blue-600',
    ACADEMICIAN: 'bg-purple-600',
    ADMIN: 'bg-navy-900',
  };

  const roleLabels: Record<string, string> = {
    STUDENT: 'Student',
    RECRUITER: 'Recruiter',
    ACADEMICIAN: 'Academician',
    ADMIN: 'Admin',
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      <aside className={clsx(
        'fixed left-0 top-0 h-screen bg-navy-950 text-white flex flex-col transition-transform duration-300 z-50',
        mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0',
        collapsed ? 'w-64 lg:w-16' : 'w-64 lg:w-60'
      )}>
        {/* Logo & Header */}
        <div className={clsx(
          'flex items-center justify-between h-16 px-4 border-b border-white/10',
          collapsed ? 'lg:justify-center' : ''
        )}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-xs">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div className={clsx(collapsed ? 'lg:hidden' : 'block')}>
              <span className="font-bold text-white text-base tracking-tight">SkillBridge</span>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 lg:hidden transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className={clsx('px-4 py-4 border-b border-white/10', collapsed ? 'lg:hidden' : 'block')}>
          <div className="flex items-center gap-3">
            <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold', roleColors[user?.role || 'STUDENT'])}>
              {user?.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400">{roleLabels[user?.role || 'STUDENT']}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {nav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path.split('/').length <= 2}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-colors group',
                collapsed ? 'lg:justify-center' : '',
                isActive
                  ? 'bg-teal-500/20 text-teal-400'
                  : 'text-gray-400 hover:bg-white/8 hover:text-white'
              )}
            >
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" strokeWidth={1.75} />
              <span className={clsx('font-medium', collapsed ? 'lg:hidden' : 'inline')}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-white/10 p-2">
          <button
            onClick={handleLogout}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sm text-gray-400 hover:bg-white/8 hover:text-white transition-colors cursor-pointer',
              collapsed ? 'lg:justify-center' : ''
            )}
          >
            <LogOut className="w-4.5 h-4.5 flex-shrink-0" strokeWidth={1.75} />
            <span className={clsx(collapsed ? 'lg:hidden' : 'inline')}>Sign Out</span>
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={clsx(
              'hidden lg:flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sm text-gray-500 hover:bg-white/8 hover:text-white transition-colors mt-0.5 cursor-pointer',
              collapsed ? 'justify-center' : 'justify-end'
            )}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span className="text-xs">Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
