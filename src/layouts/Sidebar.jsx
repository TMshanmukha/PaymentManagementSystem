import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Receipt, FileText, AlertCircle, Wallet,
  BarChart3, ClipboardCheck, UserCog, ScrollText, Settings, GraduationCap, X, Calendar,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';
import { ROLES } from '../config/constants.js';

function itemsForRole(role) {
  const base = role === ROLES.ADMIN ? '/admin' : role === ROLES.SCHOOL_ACCOUNTANT ? '/school' : '/tuition';

  const items = [
    { to: `${base}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
    { to: `${base}/students`, label: 'Students', icon: Users },
    { to: `${base}/payments`, label: 'Payments', icon: Receipt },
    { to: `${base}/due`, label: 'Due', icon: AlertCircle },
  ];

  if (role === ROLES.ADMIN) {
    items.push(
      { to: `${base}/expenses`, label: 'Expenses', icon: Wallet },
      { to: `${base}/reports`, label: 'Reports', icon: BarChart3 }
    );
  }

  items.push(
    { to: `${base}/day-closing`, label: 'Day Closing', icon: ClipboardCheck }
  );

  if (role === ROLES.ADMIN) {
    items.push(
      { to: `${base}/users`, label: 'Users', icon: UserCog },
      { to: `${base}/audit-logs`, label: 'Audit Logs', icon: ScrollText },
      { to: `${base}/academic-years`, label: 'Academic Years', icon: Calendar },
      { to: `${base}/settings`, label: 'Settings', icon: Settings }
    );
  }
  return items;
}

export function Sidebar({ role, mobileOpen, onCloseMobile }) {
  const items = itemsForRole(role);
  const { institutionName, appSubtitle } = useSettings();

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-5 border-b border-navy-800/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-white leading-tight truncate text-sm sm:text-base">{institutionName}</p>
            <p className="text-[11px] text-slate-400 leading-tight truncate mt-0.5">{appSubtitle}</p>
          </div>
        </div>
        <button className="lg:hidden text-slate-400 hover:text-white shrink-0 ml-2 p-1" onClick={onCloseMobile}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-navy-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-4.5 h-4.5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-navy-900 shrink-0">
        {content}
      </aside>

      {/* Mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/60" onClick={onCloseMobile} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-navy-900">{content}</aside>
        </div>
      )}
    </>
  );
}
