import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useMobileNav } from '../../context/MobileNavContext';
import clsx from 'clsx';

export function AppLayout() {
  const { collapsed } = useMobileNav();
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main
        className={clsx(
          "flex-1 overflow-y-auto w-full min-w-0 transition-all duration-300 ml-0",
          collapsed ? "lg:ml-16" : "lg:ml-60"
        )}
        id="main-content"
      >
        <Outlet />
      </main>
    </div>
  );
}
