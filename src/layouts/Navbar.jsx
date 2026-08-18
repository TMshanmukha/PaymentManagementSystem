import { useState } from 'react';
import { Menu, ChevronDown, LogOut, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useAcademicYear } from '../context/AcademicYearContext.jsx';
import { ROLE_LABELS } from '../config/constants.js';

export function Navbar({ title, onMenuClick }) {
  const { user, logout } = useAuth();
  const { academicYears, selectedYearId, changeSelectedYear } = useAcademicYear();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button className="lg:hidden text-slate-500" onClick={onMenuClick}>
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-base sm:text-lg font-semibold text-navy-900">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Academic Year Dropdown Selector */}
        {academicYears && academicYears.length > 0 && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 hidden sm:inline" />
            <select
              value={selectedYearId}
              onChange={(e) => changeSelectedYear(e.target.value)}
              className="text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 cursor-pointer w-28 sm:w-auto truncate"
            >
              {academicYears.map((y) => (
                <option key={y.id} value={String(y.id)}>
                  {y.year_name} {y.is_active ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-lg hover:bg-slate-50"
          >
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-slate-800 leading-tight">{user?.fullName}</p>
              <p className="text-xs text-slate-400 leading-tight">
                {user?.role === 'ADMIN' && user?.createdBy !== null && user?.createdBy !== undefined
                  ? 'Co-Admin'
                  : ROLE_LABELS[user?.role]}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-popover border border-slate-100 py-1 z-20">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-800">{user?.fullName}</p>
                <p className="text-xs text-slate-400">@{user?.username}</p>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </>
        )}
        </div>
      </div>
    </header>
  );
}
