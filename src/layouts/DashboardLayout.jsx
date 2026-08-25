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
        <div className="bg-gradient-to-r from-stone-950 via-[#190f0c] to-stone-950 border-b border-[#f05a3e]/20 py-4 flex flex-col items-center justify-center shrink-0 shadow-md relative overflow-hidden no-print">
          {/* Subtle glow layer */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(240,90,62,0.12)_0%,transparent_75%)] pointer-events-none" />
          <div className="w-[220px] sm:w-[270px] select-none flex flex-col items-center">
            <h2 className="text-white text-2xl sm:text-3xl font-black flex justify-between w-full font-sans drop-shadow-md leading-none">
              {"VEDAVYAS".split('').map((char, idx) => (
                <span key={idx}>{char}</span>
              ))}
            </h2>
            <p className="text-[#f05a3e] text-[8px] sm:text-[9.5px] font-black flex justify-between w-full mt-2 uppercase drop-shadow-sm opacity-95 leading-none">
              {"EDUCATIONAL INSTITUTION".split('').map((char, idx) => (
                <span key={idx}>{char === ' ' ? '\u00A0' : char}</span>
              ))}
            </p>
          </div>
        </div>
        <Navbar title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
