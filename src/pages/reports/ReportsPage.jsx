import { useState } from 'react';
import { PageHeader } from '../../components/PageHeader.jsx';
import { DailyReportTab } from './DailyReportTab.jsx';
import { MonthlyReportTab } from './MonthlyReportTab.jsx';
import { DateRangeReportTab } from './DateRangeReportTab.jsx';
import { AccountantReportTab } from './AccountantReportTab.jsx';

const TABS = [
  { id: 'daily', label: 'Daily' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'range', label: 'Date Range' },
  { id: 'accountant', label: 'Accountant' },
];

export default function ReportsPage() {
  const [tab, setTab] = useState('daily');

  return (
    <div>
      <PageHeader title="Reports" description="Financial reports and collection summaries" />

      <div className="flex gap-1 mb-6 border-b border-slate-200 no-print overflow-x-auto whitespace-nowrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'daily' && <DailyReportTab />}
      {tab === 'monthly' && <MonthlyReportTab />}
      {tab === 'range' && <DateRangeReportTab />}
      {tab === 'accountant' && <AccountantReportTab />}
    </div>
  );
}
