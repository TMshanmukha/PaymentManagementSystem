import { useState } from 'react';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Select } from '../../components/Select.jsx';
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
  const [studentType, setStudentType] = useState('');

  return (
    <div>
      <PageHeader title="Reports" description="Financial reports and collection summaries" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-200 pb-3 no-print">
        <div className="flex gap-1 overflow-x-auto whitespace-nowrap">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-3.5 ${
                tab === t.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab !== 'accountant' && (
          <Select
            value={studentType}
            onChange={(e) => setStudentType(e.target.value)}
            options={[
              { value: '', label: 'All Types' },
              { value: 'SCHOOL', label: 'School Only' },
              { value: 'TUITION', label: 'Tuition Only' },
            ]}
            className="w-full sm:w-44"
          />
        )}
      </div>

      {tab === 'daily' && <DailyReportTab studentType={studentType} />}
      {tab === 'monthly' && <MonthlyReportTab studentType={studentType} />}
      {tab === 'range' && <DateRangeReportTab studentType={studentType} />}
      {tab === 'accountant' && <AccountantReportTab />}
    </div>
  );
}
