import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Navbar } from './Navbar.jsx';
import { useAuth } from '../hooks/useAuth.js';

export function DashboardLayout({ title }) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen flex bg-slate-50">
      <Sidebar role={user?.role} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* VEDAVYAS Header Banner */}
        <div className="bg-gradient-to-r from-stone-950 via-[#160f0d] to-stone-950 border-b border-[#f05a3e]/20 py-3 flex flex-col items-center justify-center shrink-0 shadow-sm relative overflow-hidden no-print">
          {/* Subtle glow layer */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(240,90,62,0.08)_0%,transparent_70%)] pointer-events-none" />
          <h2 className="text-white text-base sm:text-lg font-extrabold tracking-[0.45em] font-sans pl-[0.45em] drop-shadow-md select-none">
            VEDAVYAS
          </h2>
          <p className="text-[#f05a3e] text-[9px] sm:text-[10px] font-bold tracking-[0.2em] pl-[0.2em] mt-1.5 uppercase select-none drop-shadow-sm">
            Educational Institution
          </p>
        </div>
        <Navbar title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
