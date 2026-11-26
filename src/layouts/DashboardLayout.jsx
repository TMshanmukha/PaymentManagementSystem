import { useState, useEffect, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Navbar } from './Navbar.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { LoadingState } from '../components/LoadingState.jsx';
import { VedavyasLogo } from '../components/VedavyasLogo.jsx';

export function DashboardLayout({ title }) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Preload dashboard route chunks in the background so switching menu tabs is instantaneous
    const timer = setTimeout(() => {
      import('../pages/dashboard/DashboardPage.jsx');
      import('../pages/students/StudentsListPage.jsx');
      import('../pages/payments/PaymentsListPage.jsx');
      import('../pages/due/DuePage.jsx');
      import('../pages/expenses/ExpensesPage.jsx');
      import('../pages/dayclosing/DayClosingPage.jsx');
      import('../pages/reports/ReportsPage.jsx');
      import('../pages/users/UsersPage.jsx');
      import('../pages/auditlogs/AuditLogsPage.jsx');
      import('../pages/academicYears/AcademicYearsPage.jsx');
      import('../pages/settings/SettingsPage.jsx');
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen flex bg-slate-50">
      <Sidebar role={user?.role} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* VEDAVYAS Header Banner */}
        <div className="bg-gradient-to-r from-stone-950 via-[#190f0c] to-stone-950 border-b border-[#f05a3e]/20 py-3 flex items-center justify-center gap-3.5 sm:gap-4 shrink-0 shadow-md relative overflow-hidden no-print">
          {/* Subtle glow layer */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(240,90,62,0.12)_0%,transparent_75%)] pointer-events-none" />
          <VedavyasLogo className="w-11 h-11 sm:w-13 sm:h-13 shrink-0 drop-shadow-md relative" />
          <div className="w-[200px] sm:w-[260px] select-none flex flex-col items-center relative">
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
          <Suspense fallback={<LoadingState label="Loading page..." />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
